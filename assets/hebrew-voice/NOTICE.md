# Hebrew narrator credits

The selected Hebrew narrator is the female BlueTTS 2.5 voice, style
`libri_female_6147`. It was generated locally; no online TTS service is called
by this app. The owner approved this voice in the published audition.

- BlueTTS engine: https://github.com/maxmelichov/BlueTTS (MIT, copyright 2025 Blue).
- Model: https://huggingface.co/notmax123/BlueTTS2.5-onnx.
- Voice reference: LibriTTS-R train-clean-100, Liberty Stump (6147), Google LLC,
  CC BY 4.0: https://creativecommons.org/licenses/by/4.0/.
- Pronunciation frontend: ReNikud / RenikudPlus, Maxim Melichov, Yakov Kolani and
  Morris Alper, CC BY 4.0: https://github.com/renikud/renikud.
- Existing game pronunciation references are used where available.
- Transformations: new Hebrew synthesis from pronunciation text, pace 0.8,
  16 steps, CFG 4.0, peak limiting and MP3 encoding. No endorsement is implied.

Exact model revisions, inputs and per-recording metadata are published in this
app's source repository under scripts/hebrew/blue-recordings.json.

## BlueTTS license

MIT License

Copyright (c) 2025 Blue

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
