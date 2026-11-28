# WPC Edit
## To run the app, go to https://permartinson.github.io/wpcedit

A web app for accessing contents of WPC Pinball ROM files. Built on the WPCEdit.js library and the Vue.js framework.

The app is configured as a PWA, which means it may be used as a desktop app if the browser supports it (see for example https://support.google.com/chrome_webstore/answer/3060053?hl=en).  

This is an updated version of Garrett Lee's original WPC Edit software, now built as a web app instead of the original Windows-only app. The user interface has been completely revised and now offers a complete overview of the DMD graphics. The user does no longer have to step through all frames to get to a specific one. The app also includes a checksum editor.

## Development

Requires Node.js 22.12 or later.

```
npm install
npx playwright install chromium  # once, the browser for the screen tests
npm run dev      # start the app at http://localhost:8080/wpcedit/
npm run dev:local  # the same, with the library source in ../js/wpcedit.js
npm run lint
npm test         # tests; the ROM tests use ROM files in ../js/wpcedit.js/roms
npm run test:update  # regenerate the export facit after an intended change
npm run test:screen  # screen tests in Chromium (needs npm run build first)
npm run test:screen:update  # regenerate the screen facit after an intended change
npm run test:coverage  # which parts of src/ the Vitest tests run (report in coverage/)
npm run check    # lint, tests, build and screen tests; exit code 0 = OK
npm run build    # build the app to dist/
npm run preview  # serve the built app
```

`npm run check` also runs on GitHub for every push and pull request (`.github/workflows/check.yml`). The tests that need a ROM are skipped there, because the ROM files are not on GitHub.

To run `npm run check` with your ROM files before every push, turn on the git hook in `.githooks/` once with `npm run hooks:on`. Turn it off again with `npm run hooks:off`.

ROM files are copyrighted and are never committed. The tests read them from the folder in `WPCEDIT_ROMS`, or from `../js/wpcedit.js/roms`. Tests that need a ROM are shown as skipped when it is missing.

## Accessibility

The app aims at [WCAG 2.2](https://www.w3.org/TR/WCAG22/) level AA. `npm run check` stops on most problems, but some things only a person can check. For every change:

- **Keyboard:** everything works with Tab, Shift+Tab, Enter, Space and Esc. Use `<button>` for actions and `<router-link>`/`<a>` for navigation, never a clickable `<div>`. Focus is always visible (the orange `:focus-visible` ring in `App.vue`), and Tab never gets stuck.
- **Names:** every button, link and field has a name a screen reader can read: visible text, a `<label>`, or `aria-label` when there is only an icon. Icons are `aria-hidden`. DMD images have `role="img"` and a description.
- **Windows and dialogs:** use `BaseModal` or `AlertDialog`. They move focus in and back, keep Tab inside, close with Esc and make the page behind inert.
- **Contrast:** text at least 4.5:1 against its background, large text and borders of controls at least 3:1. On the dark backgrounds, use `--grey8` or lighter for text.
- **Messages** that appear after an action have `role="status"` (or `role="alert"` for errors), so they are read out.
- **Motion:** animations respect `prefers-reduced-motion`.
- **Tests:** a new view, window or dialog is added to `tests/screen/accessibility.spec.mjs` (axe) and, if it has new controls, to `tests/screen/keyboard.spec.mjs`. Keep `knownViolations` empty; the lint rules from `eslint-plugin-vuejs-accessibility` are errors.
- **Before a release:** try the app with VoiceOver (Cmd-F5 on a Mac) in Safari: tab through each view, open a window, and check that what is read out makes sense.

## Feature wishlist

- Include a hex editor
- Include a string table parser

## Known issues

- BMP export does not work with some sprite dimensions. All sprites are now exported as full 128x32 frames.
- Sprite table adress propery is not fully working, seems to generate the same address for all tables.

## WPCEdit.js

- This project is built upon my Javascript library WPCEdit.js, which is port of the original WPC Edit app. The repository for the library is here: https://github.com/permartinson/wpcedit.js
