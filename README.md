# Bar Around the World · בר מסביב לעולם

**[Play and install](https://yogurtcp.github.io/bar-world-adventures/)** · **[Source](https://github.com/yogurtcp/bar-world-adventures)**

A separate geography and language game for Bar, matching the picture-led adventures in [Bar’s Adventures](https://github.com/yogurtcp/bar-adventures) and [Bar’s Word Adventures](https://github.com/yogurtcp/bar-word-adventures). Hebrew menus, names and narration are the default; **EN** switches the whole interface and narrator to English. Both preferences and progress survive restarts and upgrades.

Version 1.1 expands the original 36 destinations to **99**, including **32 in Africa** and **28 in Europe**. The original country IDs, save key, stamps, settings and exact unfinished journeys remain valid; installed copies receive the expansion through the normal startup update.

## Explore

Drag the toy globe with a mouse or finger, use its rotation buttons or arrow keys, or zoom in and out. Tap a colored country or one of the animal/landmark picture pins. Small countries, including **Israel**, have enlarged tap targets; all 99 destinations also appear in a country strip and searchable list. Continent filters and a surprise flight help discover new places.

Every destination has an original illustrated scene with Bar in a local-inspired travel outfit, an associated animal, and a landmark or traditional building. Tap Bar, the animal or the landmark to hear speech and playful sound effects and see reactions. The two greeting buttons play a Hebrew/English introduction followed by **hello or goodbye in the named local language**. Native text and a Latin transliteration appear together.

The passport collects one stamp for each visited country. Earned stamps and stars never expire. There is no timer or lost-star penalty.

| Region | Destinations |
| --- | --- |
| Europe (28) | France, Italy, Greece, Spain, United Kingdom, Germany, Netherlands, Switzerland, Norway, Sweden, Ukraine, Poland, Czechia, Slovakia, Hungary, Romania, Bulgaria, Serbia, Croatia, Portugal, Ireland, Austria, Finland, Belarus, Lithuania, Latvia, Estonia, Denmark |
| Asia (24) | Israel, Russia, Turkey, India, China, Japan, South Korea, Thailand, Vietnam, Indonesia, Philippines, United Arab Emirates, Kazakhstan, Mongolia, Saudi Arabia, Jordan, Lebanon, Iran, Pakistan, Bangladesh, Nepal, Malaysia, Sri Lanka, Georgia |
| Africa (32) | Egypt, Morocco, Kenya, South Africa, Madagascar, Algeria, Tunisia, Libya, Sudan, Ethiopia, Senegal, Ghana, Nigeria, Cameroon, Tanzania, Uganda, Rwanda, Democratic Republic of the Congo, Angola, Zambia, Zimbabwe, Botswana, Namibia, Mali, Niger, Chad, Mauritania, Somalia, South Sudan, Mozambique, Republic of the Congo, Central African Republic |
| Americas (13) | United States, Canada, Mexico, Brazil, Argentina, Peru, Chile, Colombia, Ecuador, Bolivia, Costa Rica, Cuba, Jamaica |
| Oceania | Australia, New Zealand |

Regions are browsing groups: Russia and Turkey span continents. The illustrated clothing is a playful travel costume rather than a claim about what every resident wears. Animals and landmarks are examples associated with a place, not exclusive or necessarily official national symbols. Madagascar’s card teaches French, one of its official languages; South Africa and New Zealand teach English; Switzerland teaches German. Rwanda’s card presents English, one of its [official languages](https://www.gov.rw/about); other countries may likewise present a widely used official language. The card explicitly says it presents **a** language and that countries can have several languages. Native greetings are the deliberate exception to the Hebrew/English narration rule.

## Play

Five activities are available immediately:

1. **Find the country:** hear a Hebrew/English country name, then select the country on the globe.
2. **Shape explorer:** match a silhouette to a country on the globe.
3. **Whose shape is it?** Choose a country name for a silhouette.
4. **Pick the shape:** hear a country name and select its silhouette.
5. **Animal friends:** choose the country where Bar met the pictured animal.

Each journey has eight distinct destinations and four choices per question. The globe games have four numbered markers; nearby markers separate with connecting lines to their real locations. The numbered jump buttons rotate to a marker without answering. A hint highlights the target. Animal questions exclude distractors that have the same animal as the target country. Wrong answers invite another try without losing stars; correct answers earn one star once, even after a reload. Continue explicitly to the next question. The final screen celebrates the journey and offers the passport, another journey or the explorer.

An unfinished journey saves its exact shuffled questions, option order, answer state and hints. **Continue your journey** resumes it from the games screen. Reloading during a journey also resumes it. Starting another activity replaces the unfinished journey but keeps every earned stamp and star.

## Install, offline play and updates

Tap **Install** in the top bar. Chrome/Edge use the native prompt when available; otherwise the app gives browser-specific instructions. On iPad/iPhone, use Safari → Share → Add to Home Screen → Add. Keep “Open as Web App” enabled if offered. Installed apps launch in their own standalone window and hide the installation button. OS/browser support varies; see [PWA installation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing).

The first successful service-worker download caches the **whole game**: globe geometry, all 99 scenes, every one of the 1368 recorded clips, icons and app code. The explorer shows a ready-for-offline message when complete. Let that initial download finish while online. An interrupted download leaves the last complete release usable and retries on a later online launch. No network TTS, accounts, ads or external runtime assets are used.

Online startups check once for a newer published release. There is no recurring, focus, foreground or reconnection polling. A downloaded update activates at startup before interaction, or at the next safe navigation/question boundary when already playing. Exact question state, passport, stars, sound, motion and interface language persist through the automatic reload. App-specific cache names and manifest scope isolate this game from Bar’s other apps. Upgrades never clear local saves. An app cannot download new versions while closed.

Saves live under `bar-world-v1` in this browser/app’s local storage. Browser/OS storage environments can differ, particularly on iOS; saves do not sync between devices or separate profiles. Muting, volume and gentle motion are available in settings, and the OS reduced-motion preference is respected.

The explorer fits desktop and tablet landscape/portrait viewports. Small phones use a vertically stacked explorer so touch targets and the country scene remain readable.

## Develop and publish

Node 18+ and npm:

```sh
npm ci
npm test
npm run build
npm start
```

Open `http://127.0.0.1:4186`. The build bundles geographic data and JavaScript locally, fingerprints the app bundle/styles, and generates an atomic versioned service worker. Relative URLs support both root hosting and `/bar-world-adventures/`.

```sh
npm run deploy
```

This runs tests and a fresh build, then publishes `dist/` to the `gh-pages` branch and configures GitHub Pages. Source lives on `main`. GitHub CLI authentication is required for publishing. No workflow-token scope or server is needed.

Development checks:

```sh
node scripts/check-layout.mjs
node scripts/browser-check.mjs
node scripts/check-live.mjs
```

These use Playwright with the locally installed Chrome (`CHROME_PATH` overrides its location for the functional check), a running local server, disposable browser storage, and ignored `artifacts/` reports/screenshots. The original-to-expanded release check is `node scripts/check-expansion-upgrade.mjs`; prepare its baseline from commit `be9a456` under `artifacts/original-release/` and build that checkout first. It verifies every new country card plus old passport/settings/journey preservation. `node scripts/check-question-layouts.mjs` checks long country and animal prompts in both interface languages. `node scripts/check-quiz-markers.mjs` verifies real taps on tightly clustered Baltic-country markers.

The functional check temporarily builds a second release to verify a real service-worker upgrade, then restores the normal build. It does not touch user saves. Physical-device OS installation remains a separate manual check.

## Artwork, audio and map sources

- **Generated artwork:** eleven original 3×3 scene atlases made with the built-in imagegen tool, using the established generated Bar character as reference. Final scenes: [`public/assets/countries/`](public/assets/countries/). Original atlases: [`art-source/atlases/`](art-source/atlases/). Exact original prompts: [`TRAVEL_SCENES.md`](art-source/TRAVEL_SCENES.md). Expansion prompts: [`EXPANSION_V2_PROMPTS.md`](art-source/EXPANSION_V2_PROMPTS.md) and [`AFRICA_SAHEL_V2_PROMPT.md`](art-source/AFRICA_SAHEL_V2_PROMPT.md). [`atlas-catalog.json`](art-source/atlas-catalog.json) maps every scene to its ISO code. The original family photograph is not copied or published.
- **Art extraction and icons:** `python3 scripts/prepare-art.py` requires Pillow. It crops atlas cells without retouching and creates globe-and-Bar PNG installation icons. The maskable icon keeps important artwork inside its safe zone.
- **Recorded voices:** build-time `edge-tts==7.3.1`, Hebrew Hila and English Aria, with appropriate native-language voices for greetings. Existing exact-match recordings are reused where available. Regenerate with `python scripts/generate-audio.py` in an environment containing edge-tts. Runtime uses local MP3 files only. Recordings are synthetic; native-speaker review is recommended for language-teaching material.
- **Map geometry:** [world-atlas](https://github.com/topojson/world-atlas) packages [Natural Earth](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/) public-domain geography. Shapes use actual country polygons, with tiny detached islands and distant overseas territories omitted for recognizable quiz silhouettes. Shapes are normalized individually, not shown at comparative scale. The globe retains the source map’s administrative geography; this is a learning map, not a statement about disputed boundaries.
- **Greeting references:** [Japan National Tourism Organization](https://www.japan.travel/en/plan/japanese-language/) and standard everyday native greetings. The language label identifies the exact language selected, rather than implying one language per country.

New animal references include [Virunga National Park’s okapi information](https://virunga.org/wildlife/mammals/okapi/) and [San Diego Zoo Safari Park](https://sdzsafaripark.org/animals/okapi).

Third-party code license notices are in [`THIRD_PARTY.md`](THIRD_PARTY.md).
