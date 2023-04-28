# WPC Edit
A web app for accessing contents of WPC Pinball ROM files. Built on the WPCEdit.js library and the Vue.js framework.

This is an updated version of Garrett Lee's original WPC Edit software, now built as a web app instead of the original Windows-only app. The user interface has been completely revised and now offers a complete overview of the DMD graphics. The user does no longer have to step through all frames to get to a specific one. The app also includes a checksum editor.

## Feature wishlist

- Include a hex editor
- Include a string table parser

## Known issues

- BMP export does not work with some sprite dimensions. All sprites are now exported as full 128x32 frames.
- Sprite table adress propery is not fully working, seems to generate the same address for all tables.