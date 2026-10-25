# Globe-focused interface

The home screen is now the world itself. A large rotatable globe fills the available screen, with three picture-led actions: play, choose a country and take a surprise trip. The permanent country card, country strip, progress counters, duplicated headings and settings toolbar have been removed from home.

Country taps open a modal with Bar’s scene, animal, place and greeting buttons. Close, Escape or the backdrop returns to the same world position and zoom. The camera also survives reloads within the same browser tab/app window using session storage. Country ID, stamps, stars, settings and unfinished games retain the existing save key and schema.

The menu opens over the world and contains games, passport, country selection, installation, language, sound and settings. Game selection and the 99-stamp passport also open as popups. Search/region filters are in the country picker, which does not automatically raise the onscreen keyboard. Actual activities retain their established question, reward and narration behavior.

Country popups use a side-by-side layout on tablets and a stacked layout on narrow phones. Buttons are large and the close control stays available. Header, dock, zoom and popup sizing account for device safe areas. Installation identity, scope, icons and startup-only update checks remain unchanged; updates wait while a popup is being used, and continue to preserve active questions.

Verification in Chrome:

- 17 source/model/geography/audio/PWA and Hebrew-voice tests pass after integrating the completed voice update.
- 38 new UI checks cover globe size, five screen sizes, real touch input, rotation and zoom, popups, Escape, camera recovery, menus, all 99 destinations, Africa filters, language/sound/settings, installation access, offline country artwork and narration when launching a game from its popup.
- The 113 game/browser assertions still pass for all five journeys, exact resume, audio decoding, rewards, offline play and a real waiting-worker upgrade.
- All 20 Hebrew/English long-prompt tablet layouts pass, and eight real pointer answers for nearby Baltic-country markers pass.
- The published GitHub Pages release `b1c917dc2db772cc` passes the live check: 99 countries, five games, all 2,114 offline files, preserved English selection after offline reload, country artwork offline, and no runtime or HTTP errors.

Run `npm start` and then `node scripts/check-ui.mjs`. Other regression tools are `scripts/browser-check.mjs`, `scripts/check-question-layouts.mjs` and `scripts/check-quiz-markers.mjs`. Set `BASE_URL` to preview another local port; the default is `http://127.0.0.1:4186`. Screenshots/reports are written to ignored `artifacts/`.

This change was developed in an isolated Git worktree so separate in-progress Hebrew voice-generation files were left untouched. Once that work was committed, its complete approved Hebrew voice update was merged and verified with the new UI. Physical device installation and OS-specific safe-area behavior were not tested on hardware.
