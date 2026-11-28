# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-11-28

### Added
- An "Accessibility" section in the README with the rules every change follows (WCAG 2.2 AA), and how they are tested.
- A keyboard-only screen test (`tests/screen/keyboard.spec.mjs`) with Fish Tales and Medieval Madness: loads a ROM, opens and steps through full frame images and sprites, moves a sprite, disables the checksum and unloads the ROM using only Tab, Enter, Esc and the arrow keys. It checks that focus moves into each window, stays there and comes back when it closes.
- Arrow keys in the image windows: ← and → show the previous and next image or sprite, and with Shift they step 2.
- Accessibility checks (phase C): the screen tests run axe on every view, image window and dialog against WCAG 2.2 A and AA (`tests/screen/accessibility.spec.mjs`, with `@axe-core/playwright`). Problems that are known today are listed in the test and are fixed step by step; a new problem fails the test. ESLint also checks the templates with `eslint-plugin-vuejs-accessibility`.
- `npm run test:coverage`: a report of which parts of `src/` the Vitest tests run (with `@vitest/coverage-v8`). The components are mostly covered by the screen tests, which are not part of the report.
- GitHub Actions runs `npm run check` on every push and pull request. The tests that need a ROM are skipped there.
- A git hook (`.githooks/pre-push`) that runs `npm run check` with the ROM files before a push. Turn it on with `npm run hooks:on` and off with `npm run hooks:off`.
- Screen tests with Playwright (`npm run test:screen`, also part of `npm run check`): the built app is opened in Chromium, a ROM is loaded and every view is visited, including the image windows with blend, merge and moving a sprite, all display styles, the checksum view and a reload that restores the ROM from the cache. Every DMD is read back dot by dot and compared with a facit in `tests/screen/facit/`; the image lists are also compared with what the library decodes. Uses Fish Tales, The Shadow, Medieval Madness and Cactus Canyon. Run `npx playwright install chromium` once before the first run.
- More tests (phase R): export as data array, BMP and inverted BMP (every pixel checked), the blend export, merging planes, placing sprites in a full frame image, updating and disabling the checksum, loading the last ROM from the cache, and the file name of a downloaded ROM.
- Export facit (`tests/facit/`): a fingerprint of the data array, BMP and inverted BMP export of a selection of full frame images, merged images and sprites for each ROM, compared on every `npm test`. Regenerate with `npm run test:update` after an intended change. The files hold fingerprints only, never ROM data.
- Tests with Vitest (`npm test`): the formatting and export helpers, the main store's export functions, and a smoke test that loads every ROM file through the store. ROM files are read from `WPCEDIT_ROMS` or `../js/wpcedit.js/roms` and are never committed; without them the smoke test is skipped. `npm run check` runs lint, tests and build.
- `npm run dev:local` starts the app with the source code of the WPCEdit.js library in `../js/wpcedit.js` instead of the version from npm, so changes to the library show up in the app right away.
- This changelog.
- ESLint `camelcase` rule (`npm run lint`), the same naming standard as in the WPCEdit.js library. It only warns for now, while the old names are being renamed.

### Changed
- Accessibility (phase C): everything that can be reached with Tab shows an orange focus ring when it has keyboard focus (not on mouse clicks), the checkbox included. Grey text (the sprite table headings, the titles above the small images, "Position:" and the selected value in the select fields) is lighter, #BDBDBD instead of #828282, so the contrast is at least 4.5:1. With reduced motion turned on in the system settings, the fades between views are off. The accessibility lint rules are now errors, and the axe test has no known problems left.
- Accessibility (phase C): the DMD images have a description for screen readers, with the image number and its encoding, and in the image windows also what is blended, merged or placed on top. The images in the lists include the encoding too, for example "Full frame image 17, encoding 0x0B". Each view has its own page title, for example "Sprites and fonts – WPC Edit", and after moving to another view, focus goes to the view's heading. Messages in the checksum tool and the settings are read out when they appear.
- Updated the WPCEdit.js library from 0.5.1 to 0.5.2. A sprite moved past an edge of the image window is now cut off there; before, the part past the right edge came back on the left side one row down.
- Accessibility (phase C): the image windows, the disclaimer and the warning and error dialogs are dialogs for screen readers. When one opens, focus moves into it and the page behind it can no longer be reached; Tab stays inside the window; Esc closes it (in the warnings it means Cancel, the disclaimer still needs an answer), and focus goes back to where it was. The windows are moved to the end of the page (`<Teleport>`), which does not change how they look.
- Accessibility (phase C): the buttons on the home view are links, and the images in the full frame and sprite lists are buttons, so they can be reached with Tab and opened with Enter. Every image has a name for screen readers, for example "Full frame image 17" or "Sprite 0x41 (A), table 3". To keep Tab from passing hundreds of images, only 50 are in the Tab order at first; a button that is only visible when it has focus adds 50 more. Icon buttons (previous, next, close, move) and the form fields have names. A stray "¨" above the home view buttons is removed.
- The app is now built with Vite instead of Vue CLI, which is no longer actively maintained. Start it with `npm run dev` (`npm run serve` still works) at the same address as before, http://localhost:8080/wpcedit/. The app looks and works the same. Babel and `core-js` are no longer used, and ESLint is updated from 7 to 10 (`eslint.config.mjs`).
- `package-lock.json` now downloads all packages from the npm registry; most of them pointed to the mirror `registry.npmmirror.com`.
- Updated the WPCEdit.js library from 0.4.4 to 0.5.1. No change in how the app uses it.
- The plasma display is faster: it is only rendered when the image changes instead of 60 times per second, the filters are created once, and the PIXI app is no longer made reactive by Vue.

### Removed
- `node_modules/`, `dist/` and `.DS_Store` are no longer tracked in git; a `.gitignore` now keeps them out. Run `npm install` after cloning. The app is still deployed from the `gh-pages` branch.
- Five unused duplicate icons (`checksum 2.svg`, `fullframe 2.svg`, `hex 2.svg`, `settings 2.svg`, `sprites 2.svg`).
- Unused dependencies: `fabric`, `intersection-observer`, `vue-intersection-observer`, `vue-observe-visibility`, `pinia-plugin-persist`, `@pixi/filter-bloom`, `worker-plugin`, `sass` and `sass-loader`.

### Fixed
- "Export blend plane" did nothing for full frame images when exporting as BMP or data array, because of a misspelled method name (`blendImge`).
- Exporting an image as BMP or as a data array mirrored (and for inverted BMP, inverted) the bits of the image shown in the app, so the display could be wrong after an export. The export now works on a copy.
- Memory leak in the plasma display style: every time the large DMD view was redrawn (for example when stepping to the next image), 4,096 new dot sprites were added to the stage without removing the old ones. The dots are now created once and only change texture when the image changes.
- `register-service-worker` is now a direct dependency. The app imports it, but only got it through WPCEdit.js 0.4.4, and the library no longer includes it from 0.5.0.

[Unreleased]: https://github.com/permartinson/wpcedit/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/permartinson/wpcedit/releases/tag/v0.2.0
