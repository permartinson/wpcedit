# WPC Edit
## To run the app, go to https://permartinson.github.io/wpcedit

A web app for accessing contents of WPC Pinball ROM files. Built on the WPCEdit.js library and the Vue.js framework.

The app is configured as a PWA, which means it may be used as a desktop app if the browser supports it (see for example https://support.google.com/chrome_webstore/answer/3060053?hl=en).  

This is an updated version of Garrett Lee's original WPC Edit software, now built as a web app instead of the original Windows-only app. The user interface has been completely revised and now offers a complete overview of the DMD graphics. The user does no longer have to step through all frames to get to a specific one. The app also includes a checksum editor.

## Feature wishlist

- Include a hex editor
- Include a string table parser

## Known issues

- BMP export does not work with some sprite dimensions. All sprites are now exported as full 128x32 frames.
- Sprite table adress propery is not fully working, seems to generate the same address for all tables.

## WPCEdit.js

- This project is built upon my Javascript library WPCEdit.js, which is port of the original WPC Edit app. The repository for the library is here: https://github.com/permartinson/wpcedit.js
