# Free Hebrew narration: approved female BlueTTS voice

All Hebrew recordings use **BlueTTS 2.5**, voice **libri_female_6147**, selected
by the owner from the published audition. Synthesis uses the same settings as
that sample: 16 steps, CFG 4.0, speed 0.8, base seed 20261025. Invalid
or silent clips retry with deterministic alternate seeds; each recording logs
its actual seed. The app ships static
MP3s and never calls an online TTS service. No account, API key, subscription or
metered synthesis charge is involved.

## Pronunciation and provenance

Existing reviewed game pronunciations are retained in `hebrew/blue-pronunciations.json`.
Other input uses local ReNikudPlus int8 with `niqqud="use"`, so supplied Hebrew
vowel marks constrain its pronunciation. Ambiguous unpointed words are predicted
in sentence context. `hebrew/blue-recordings.json` records the exact text, IPA,
pronunciation method, voice, model revisions, duration, signal peak and audio path
for every active line. Native-speaker review remains useful for proper names.

The cache recipe includes the voice and model versions. New `audio/he/blue-*.mp3`
URLs cannot be shadowed by older Hila recordings. A complete set is generated and
decoded before manifests change. Previous voice URLs remain available while an
active older question waits for the normal safe update boundary. Other languages,
app identities, saves and settings are retained. The two apps with a device-voice
selector default existing installations to the approved recorded voice once;
parents can still choose a device voice afterward.

Hebrew speech is bundled in each complete offline release. Online startup is the
only automatic update check; an app cannot download updates while closed.

## Reproduce locally

Use Python 3.12+ with the versions in `requirements-hebrew-blue.txt`, a BlueTTS
checkout, the pinned `notmax123/BlueTTS2.5-onnx` bundle, and the pinned
`notmax123/RenikudPlus` `model_int8.onnx`. The revision IDs are in
`hebrew/blue-recordings.json`. Put each Hugging Face revision ID in a `revision.txt`
file next to its downloaded model. Large models are build tools and are not
committed or downloaded by the browser app.

```sh
python3 scripts/generate-hebrew-blue.py --engine-path /path/to/BlueTTS --model-dir /path/to/blue-model --g2p-model /path/to/renikud/model_int8.onnx
npm test
```

The default shared cache is `~/.cache/bar-hebrew-blue-female-v1`. Repeated
`--project /path/to/app` arguments generate several apps in one run, reusing
identical texts. The pronunciation and synthesis phases run in separate
interpreters to limit memory. Interrupted runs resume from completed clips.
Generate all changed recordings before running the other-language generator.

## Upstream credits

- [BlueTTS](https://github.com/maxmelichov/BlueTTS): MIT, copyright 2025 Blue.
- [BlueTTS 2.5 model and voice provenance](https://huggingface.co/notmax123/BlueTTS2.5-onnx).
- Voice style `libri_female_6147`: LibriTTS-R train-clean-100, Liberty Stump;
  Google LLC, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- [ReNikud](https://github.com/renikud/renikud), Maxim Melichov, Yakov Kolani,
  Morris Alper: CC BY 4.0; local Hebrew grapheme-to-phoneme frontend.

The voice reference is used to synthesize new Hebrew text, with pace adjustment,
peak limiting and MP3 encoding. These transformations do not imply endorsement.
The upstream MIT license is reproduced in `hebrew/BLUETTS_LICENSE.txt`.

[Hear the approved female voice](https://yogurtcp.github.io/bar-word-adventures/voice-preview.html).
