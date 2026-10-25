# Release verification — 2026-10-25

The first release was checked in headless Chrome using disposable test storage.

- 11 automated tests cover all 36 country records and map shapes, duplicate Natural Earth IDs (including the Australia/Ashmore regression), valid four-choice rounds, no duplicate rewards, all five complete game journeys, exact save/reload recovery, malformed-save handling, Hebrew/English catalog parity, all 554 audio files, scoped PWA metadata and startup-only update code.
- 113 browser assertions pass: real globe dragging; Israel’s first passport stamp; searchable country selection; decoding every recording; Hebrew defaults and English LTR switching; mute; wrong-answer recovery and full eight-question runs in all five modes; exact question resume; installation instructions and manifest; a real two-release service-worker update; deferred activation during active play; next-question recovery; preserved stars/settings/screen; offline launch; previously unseen offline artwork and native greeting audio; zero runtime exceptions.
- Desktop and tablet explorer layouts were captured at 1366×900, 1280×800, 1180×820, 1024×768 and 768×1024. The complete explorer fits these tablet/desktop viewports without horizontal or vertical scrolling. A 390×844 phone uses a vertical layout. Small landscape phones may also scroll.
- All 36 silhouettes were reviewed in a contact sheet, and all four generated nine-scene atlases were visually reviewed. Tiny detached islands and distant overseas areas are omitted from quiz silhouettes. The globe uses the source map geography.
- The update test builds a new release while an eight-question journey is in progress. The current question stays intact while the worker waits. Continuing activates the new release and resumes the exact next question with the same stars, language, volume and mute settings. Offline reload is then verified.

The published GitHub Pages URL was also checked in a fresh browser: all 599 release files cached under the correct subpath, all five games appeared, the language switch persisted through an offline reload, and no HTTP errors or runtime exceptions were reported. The first cold-download check exceeded its 90-second QA timeout; a fresh run completed successfully. The live-check timeout now allows three minutes for an uncached CDN download.

Generated reports and screenshots are in the ignored `artifacts/` directory. `scripts/browser-check.mjs` and `scripts/check-layout.mjs` reproduce the checks with a running local preview.

Physical Android/iPad OS installation and playback through actual device speakers were not tested here. Browser-specific install prompts, iOS home-screen storage behavior and OS audio output still depend on the device. Native-language pronunciation should receive human review; the app uses recorded synthetic voices, not pronunciation assessment.
