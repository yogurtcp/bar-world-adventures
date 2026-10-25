# Hebrew Kore recording migration

The selected replacement voice is **Google Chirp 3 HD Kore**,
`he-IL-Chirp3-HD-Kore`. The existing published recordings remain active until the
replacement recordings have been generated, verified and released together.

## Generate

Enable Google Cloud Text-to-Speech and billing in your Google Cloud project.
Provide `GOOGLE_CLOUD_API_KEY` (or `GOOGLE_API_KEY`) in the local process environment,
or configure Application Default Credentials with the build dependencies
`google-auth` and `requests` installed. Keep credentials outside this repository.
The browser app never receives credentials or calls Google TTS. Alternatively,
store the key in a private file outside the repository and pass its path with
`--api-key-file /private/path/to/key`; the key value is never a command argument.

```sh
python3 scripts/generate-hebrew-kore.py --dry-run
python3 scripts/generate-hebrew-kore.py
python3 scripts/test-hebrew-kore.py
```

The generator uses the app's authored Hebrew catalog, keeps its niqqud, and uses
new `audio/he/kore-*.mp3` filenames so existing cached Hila recordings cannot take
precedence. Its shared local cache at `~/.cache/bar-kore-hebrew-v1` lets the other
Bar apps reuse identical recordings without another synthesis request. Filenames
include the voice and synthesis recipe. Other languages keep their current files.
Only a complete set of recordings can replace the Hebrew manifest. A failed run
keeps partial audio for resumption and leaves the current manifest usable.
`scripts/hebrew/kore-recordings.json` records the exact input, voice and paths.

## Release together

Before deploying: decode and validate every new clip; review letter names and
ambiguous words; update the recorded-voice labels and the default voice selection
for existing installations; include the new Hebrew recordings in offline caches;
verify the normal startup upgrade preserves progress and settings. Keep the other
language generators from regenerating Hebrew with Hila. Commit the audio,
provenance and manifest together, then publish the complete app.

This preparation does not itself replace the published narrator.

References: [Kore and Hebrew support](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd),
[synthesis API](https://docs.cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize),
[authentication](https://docs.cloud.google.com/text-to-speech/docs/authentication).
