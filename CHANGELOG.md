# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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

[Unreleased]: https://github.com/permartinson/wpcedit/commits/main
