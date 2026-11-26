# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- This changelog.
- ESLint `camelcase` rule (`npm run lint`), the same naming standard as in the WPCEdit.js library. It only warns for now, while the old names are being renamed.

### Changed
- Updated the WPCEdit.js library from 0.4.4 to 0.5.1. No change in how the app uses it.

### Removed
- `node_modules/`, `dist/` and `.DS_Store` are no longer tracked in git; a `.gitignore` now keeps them out. Run `npm install` after cloning. The app is still deployed from the `gh-pages` branch.
- Five unused duplicate icons (`checksum 2.svg`, `fullframe 2.svg`, `hex 2.svg`, `settings 2.svg`, `sprites 2.svg`).

[Unreleased]: https://github.com/permartinson/wpcedit/commits/main
