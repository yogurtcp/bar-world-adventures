"""Offline generator regressions; fake MP3 bytes stay in temporary test directories."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('kore', Path(__file__).with_name('generate-hebrew-kore.py'))
kore = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kore)
FAKE_MP3 = b'ID3' + b'\0' * 1200


class KoreGeneratorTests(unittest.TestCase):
    def fixture(self, root):
        manifest_path = root / 'src/core/audio-manifest.js'
        manifest_path.parent.mkdir(parents=True)
        manifest_path.write_text('old manifest remains usable')
        manifest = {'he': {'old': 'audio/he/old.mp3'}, 'en': {'hello': 'audio/en/hello.mp3'}}
        return manifest_path, manifest

    def test_request_keeps_vowels_and_voice_changes_cannot_reuse_hila_filenames(self):
        text = 'שִׂין'
        request = kore.request_body(text)
        self.assertEqual(request['voice']['name'], 'he-IL-Chirp3-HD-Kore')
        self.assertEqual(request['voice']['languageCode'], 'he-IL')
        self.assertEqual(request['input']['text'], kore.unicodedata.normalize('NFC', text))
        self.assertIn('\u05c2', request['input']['text'])
        self.assertNotEqual(kore.clip_path('שִׂין'), kore.clip_path('שִׁין'))
        self.assertEqual(kore.clip_path(text), kore.clip_path(kore.unicodedata.normalize('NFD', text)))
        self.assertTrue(kore.clip_path(text).startswith('audio/he/kore-'))
        self.assertNotIn('speakingRate', request['audioConfig'])

    def test_complete_generation_changes_only_hebrew_and_reuses_across_apps(self):
        with tempfile.TemporaryDirectory() as folder:
            folder = Path(folder)
            root, cache = folder / 'app', folder / 'cache'
            manifest_path, manifest = self.fixture(root)
            texts = ['אָלֶף', 'שִׂין']
            calls = []
            class Client:
                def synthesize(self, text):
                    calls.append(text)
                    return FAKE_MP3
            with patch.object(kore, 'load_catalog', return_value=texts), patch.object(kore, 'load_manifest', return_value=(manifest_path, manifest)):
                kore.generate(root, cache, Client)
            self.assertCountEqual(calls, texts)
            self.assertEqual(manifest['en'], {'hello': 'audio/en/hello.mp3'})
            for text in texts:
                self.assertEqual(manifest['he'][text], kore.clip_path(text))
                self.assertTrue(kore.valid_mp3(root / kore.clip_path(text)))
            provenance = json.loads((root / 'scripts/hebrew/kore-recordings.json').read_text())
            self.assertEqual(provenance['voice'], kore.VOICE)
            other = folder / 'other'
            second_path, second_manifest = self.fixture(other)
            def no_auth():
                self.fail('A complete shared cache must work without credentials or extra billing')
            with patch.object(kore, 'load_catalog', return_value=texts), patch.object(kore, 'load_manifest', return_value=(second_path, second_manifest)):
                kore.generate(other, cache, no_auth)
            self.assertEqual(second_manifest['he'], manifest['he'])
            self.assertEqual(len(calls), 2)

    def test_failed_generation_leaves_live_manifest_and_provenance_unchanged(self):
        for invalid in [True, False]:
            with self.subTest(invalid_audio=invalid), tempfile.TemporaryDirectory() as folder:
                root = Path(folder)
                manifest_path, manifest = self.fixture(root)
                record = root / 'scripts/hebrew/kore-recordings.json'
                record.parent.mkdir(parents=True)
                record.write_text('old provenance')
                class BrokenClient:
                    def synthesize(self, text):
                        if invalid:
                            return b'<html>not MP3</html>'
                        raise RuntimeError('Google TTS HTTP 403')
                with patch.object(kore, 'load_catalog', return_value=['אָלֶף']), patch.object(kore, 'load_manifest', return_value=(manifest_path, manifest)):
                    with self.assertRaises(RuntimeError):
                        kore.generate(root, root / 'cache', BrokenClient)
                self.assertEqual(manifest_path.read_text(), 'old manifest remains usable')
                self.assertEqual(record.read_text(), 'old provenance')
                self.assertEqual(manifest['he'], {'old': 'audio/he/old.mp3'})

    def test_missing_credentials_is_actionable_and_does_not_expose_secrets(self):
        with patch.dict(kore.os.environ, {}, clear=True), patch.dict('sys.modules', {'google.auth': None}):
            with self.assertRaisesRegex(RuntimeError, 'Google TTS access is missing'):
                kore.GoogleTTS()


if __name__ == '__main__':
    unittest.main()
