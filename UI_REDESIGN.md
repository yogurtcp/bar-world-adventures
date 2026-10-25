# Globe-focused interface

The home screen is now the world itself. A large rotatable globe fills the available screen, with three picture-led actions: play, choose a country and take a surprise trip. The permanent country card, country strip, progress counters, duplicated headings and settings toolbar have been removed from home.

Country taps open a separate full-screen view with Bar’s scene, animal, place and greeting buttons. A large yellow 64px X or Escape returns to the same world position and zoom. Closing removes the country content completely. The camera also survives reloads within the same browser tab/app window using session storage. Country ID, stamps, stars, settings and unfinished games retain the existing save key and schema. Startups open the globe, except when resuming an unfinished activity.

Selecting a country speaks its Hebrew/English name. The globe now selects on click, after pointerup, so the opening gesture cannot also trigger a picture hotspot underneath and interrupt the name with a greeting or place name. Tapping Bar repeats the country name; greetings use their explicit buttons.

The menu opens over the world and contains games, passport, country selection, installation, language, sound and settings. Game selection and the 99-stamp passport also open as popups. Search/region filters are in the country picker, which does not automatically raise the onscreen keyboard. Actual activities retain their established question, reward and narration behavior.

The full-screen country view arranges its image and controls side by side on tablets and stacks them on narrow phones. The globe is completely covered. Buttons are large and the close control stays available. Header, dock, zoom and view sizing account for device safe areas. Installation identity, scope, icons and startup-only update checks remain unchanged; updates wait while a popup is being used, and continue to preserve active questions.

Updates copy unchanged assets from earlier complete caches only after verifying each response’s SHA-256 against the new build. Changed or corrupted files are downloaded. Every asset must still be cached before activation; a failed installation removes only the incomplete new cache. This avoids downloading all pictures and voices again for a UI update. Worker-source changes also change the cache version.

Verification in Chrome:

- 17 source/model/geography/audio/PWA and Hebrew-voice tests pass after integrating the completed voice update.
- 41 UI checks cover globe size, five screen sizes, real touch input, rotation and zoom, full-screen country details, large X, complete country-content removal, Escape, camera recovery, menus, all 99 destinations, Africa filters, language/sound/settings, installation access, offline country artwork and narration when launching a game from its popup.
- 26 narration checks verify Hebrew/English names with touch and mouse, Bar taps, and explicit greeting playback.
- A regression using the actual published split-screen release (`7f9300f`) upgrades to the globe-only home in about 3.5 seconds locally. It preserves stars, stamps, language and mute, reuses unchanged media, redownloads an intentionally corrupted old image, and supports offline country details and the large close button afterward.
- The 113 game/browser assertions still pass for all five journeys, exact resume, audio decoding, rewards, offline play and a real waiting-worker upgrade.
- All 20 Hebrew/English long-prompt tablet layouts pass, and eight real pointer answers for nearby Baltic-country markers pass.

Run `npm start` and then `node scripts/check-ui.mjs` or `node scripts/check-country-narration.mjs`. `node scripts/check-legacy-upgrade.mjs` hosts its own old/new release fixture. Other regression tools are `scripts/browser-check.mjs`, `scripts/check-question-layouts.mjs` and `scripts/check-quiz-markers.mjs`. Set `BASE_URL` to preview another local port; the default is `http://127.0.0.1:4186`. Screenshots/reports are written to ignored `artifacts/`.

This change was developed in an isolated Git worktree so separate in-progress Hebrew voice-generation files were left untouched. Once that work was committed, its complete approved Hebrew voice update was merged and verified with the new UI. Physical device installation and OS-specific safe-area behavior were not tested on hardware.
