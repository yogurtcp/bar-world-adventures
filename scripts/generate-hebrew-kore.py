"""Build Hebrew Kore MP3s, then atomically switch the catalog's Hebrew manifest.

No keys or online TTS are shipped to the app. Run --dry-run to inventory work.
Authentication: GOOGLE_CLOUD_API_KEY, GOOGLE_API_KEY, or Google ADC (google-auth).
"""
import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unicodedata
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

VOICE = 'he-IL-Chirp3-HD-Kore'
ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize'
ROOT = Path(__file__).resolve().parents[1]


def request_body(text):
    # Keep Hebrew vowel/dagesh/shin marks; no Hila-specific spelling substitutions.
    return {'input': {'text': unicodedata.normalize('NFC', text)},
            'voice': {'languageCode': 'he-IL', 'name': VOICE},
            'audioConfig': {'audioEncoding': 'MP3', 'sampleRateHertz': 24000}}


def clip_path(text):
    recipe = json.dumps(request_body(text), ensure_ascii=False, sort_keys=True)
    digest = hashlib.sha256(('kore-hebrew-v1\n' + recipe).encode()).hexdigest()[:20]
    return f'audio/he/kore-{digest}.mp3'


def valid_mp3(path):
    if not path.is_file() or path.stat().st_size < 1000:
        return False
    with path.open('rb') as stream:
        head = stream.read(3)
    return head == b'ID3' or (head[0] == 255 and head[1] & 224 == 224)


def atomic_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    handle, temporary = tempfile.mkstemp(dir=path.parent, prefix=path.name + '.', suffix='.tmp')
    try:
        os.fchmod(handle, 0o644)
        with os.fdopen(handle, 'wb') as stream:
            stream.write(data)
        os.replace(temporary, path)
    finally:
        Path(temporary).unlink(missing_ok=True)


class GoogleTTS:
    def __init__(self, api_key=None):
        self.key = api_key or os.environ.get('GOOGLE_CLOUD_API_KEY') or os.environ.get('GOOGLE_API_KEY')
        self.credentials = None
        if not self.key:
            try:
                import google.auth
                from google.auth.transport.requests import Request as AuthRequest
                self.credentials, _ = google.auth.default(scopes=['https://www.googleapis.com/auth/cloud-platform'])
                self.auth_request = AuthRequest()
            except Exception:
                raise RuntimeError('Google TTS access is missing. Set GOOGLE_CLOUD_API_KEY or configure Application Default Credentials with google-auth installed.') from None

    def synthesize(self, text):
        for attempt in range(5):
            headers = {'Content-Type': 'application/json'}
            if self.key:
                headers['x-goog-api-key'] = self.key
            else:
                self.credentials.before_request(self.auth_request, 'POST', ENDPOINT, headers)
            request = Request(ENDPOINT, json.dumps(request_body(text), ensure_ascii=False).encode(), headers=headers, method='POST')
            try:
                with urlopen(request, timeout=60) as response:
                    encoded = json.load(response)['audioContent']
                return base64.b64decode(encoded, validate=True)
            except HTTPError as error:
                if error.code not in (408, 429, 500, 502, 503, 504) or attempt == 4:
                    # Do not print request headers, URLs or credential-bearing response bodies.
                    raise RuntimeError(f'Google TTS HTTP {error.code}. Check API enablement, billing and credential permissions; the live manifest was not changed.') from None
            except (URLError, TimeoutError):
                if attempt == 4:
                    raise RuntimeError('Google TTS network request failed; the live manifest was not changed.') from None
            time.sleep(2 ** attempt)


def load_catalog(root):
    return json.loads(subprocess.check_output(['node', 'scripts/audio-catalog.js'], cwd=root))['he']


def load_manifest(root):
    path = root / 'src/core/audio-manifest.js'
    if not path.exists():
        path = root / 'src/audio-manifest.js'
    relative = './' + path.relative_to(root).as_posix()
    code = f'import {{audioManifest}} from {json.dumps(relative)};console.log(JSON.stringify(audioManifest));'
    return path, json.loads(subprocess.check_output(['node', '--input-type=module', '-e', code], cwd=root))


def generate(root, cache, client_factory=GoogleTTS, jobs=3):
    texts = load_catalog(root)
    manifest_path, manifest = load_manifest(root)
    asset_root = root / 'public' if manifest_path.parent == root / 'src' else root
    # Construct auth lazily so an entirely generated shared cache can be reused offline.
    missing = [text for text in texts if not valid_mp3(asset_root / clip_path(text)) and not valid_mp3(cache / Path(clip_path(text)).name)]
    client = client_factory() if missing else None
    # Deduplicate NFC-equivalent display keys before concurrent synthesis.
    unique = {clip_path(text): text for text in texts}

    def recording(entry):
        relative, text = entry
        target, reusable = asset_root / relative, cache / Path(relative).name
        if not valid_mp3(target):
            if not valid_mp3(reusable):
                atomic_write(reusable, client.synthesize(text))
                if not valid_mp3(reusable):
                    reusable.unlink(missing_ok=True)
                    raise RuntimeError('Google TTS returned invalid MP3 data; the live manifest was not changed.')
            target.parent.mkdir(parents=True, exist_ok=True)
            atomic_write(target, reusable.read_bytes())
        return relative

    with ThreadPoolExecutor(max_workers=jobs) as pool:
        for count, _ in enumerate(pool.map(recording, unique.items()), 1):
            if count % 25 == 0:
                print(f'Kore: {count}/{len(unique)} clips ready', flush=True)
    # Switch only after every required clip exists. Other languages are preserved exactly.
    records = {text: {'input': request_body(text)['input']['text'], 'path': clip_path(text)} for text in texts}
    metadata = {'engine': 'Google Cloud Text-to-Speech', 'voice': VOICE, 'language': 'he-IL', 'encoding': 'MP3', 'sampleRateHertz': 24000, 'records': records}
    atomic_write(root / 'scripts/hebrew/kore-recordings.json', (json.dumps(metadata, ensure_ascii=False, indent=2) + '\n').encode())
    manifest['he'] = {text: entry['path'] for text, entry in records.items()}
    source = '// Generated build-time recordings; Hebrew uses Google Kore.\nexport const audioManifest = ' + json.dumps(manifest, ensure_ascii=False, indent=2) + ';\n'
    atomic_write(manifest_path, source.encode())
    print(f'Kore complete: {len(texts)} Hebrew catalog entries; other languages preserved.', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true', help='Inventory only; no credentials or synthesis required.')
    parser.add_argument('--api-key-file', type=Path, help='Private file containing a Google TTS API key; never commit it.')
    parser.add_argument('--cache-dir', type=Path, default=Path.home() / '.cache/bar-kore-hebrew-v1')
    parser.add_argument('--jobs', type=int, choices=range(1, 6), default=3)
    args = parser.parse_args()
    if args.dry_run:
        texts = load_catalog(ROOT)
        unique = {clip_path(text): request_body(text)['input']['text'] for text in texts}
        print(json.dumps({'voice': VOICE, 'catalogEntries': len(texts), 'uniqueRecordings': len(unique), 'characters': sum(map(len, unique.values())), 'reusableRecordings': sum(valid_mp3(args.cache_dir / Path(path).name) for path in unique)}, indent=2))
        return
    try:
        api_key = None
        if args.api_key_file:
            api_key = args.api_key_file.read_text().strip()
            if not api_key:
                raise RuntimeError('The Google API key file is empty.')
        generate(ROOT, args.cache_dir, client_factory=lambda: GoogleTTS(api_key), jobs=args.jobs)
    except RuntimeError as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1) from None


if __name__ == '__main__':
    main()
