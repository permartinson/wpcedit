# Screen facit files

Each file holds fingerprints of what the app draws in its DMDs for one ROM, view by view (see `../app.spec.mjs`). Every DMD is read back as 128 x 32 dots with four brightness levels, so the fingerprints are the same on every computer. Files are named after the first 10 characters of the ROM's SHA-1, like the other facit files. They hold fingerprints only, never ROM data or screenshots.

| Facit file | ROM |
|---|---|
| `ab323980b9.txt` | Fish Tales, fshtl_5 (1992, WPC Fliptronics) |
| `37c01f8c6e.txt` | The Shadow, cpu-u6l2 (1994, WPC DCS) |
| `3922df00e7.txt` | Medieval Madness, mm_g11.1_0 (1997, WPC-95) |
| `adaf6b07d2.txt` | Cactus Canyon, cc_g11.1_3 (1998, WPC-95) |

The facit is made with the "Orange dots" display style, which can be read back exactly. The plasma display is compared with it separately, and may differ in a few dots because of its glow.

## When a test fails

The diff shows which line changed, for example `fullframe window blend sub 2` (the third DMD in the full frame window, with blend turned on). A screenshot of the page is saved in `test-results/` (ignored by git).

- If the change was **not** intended, the code change broke something.
- If the change **was** intended, run `npm run test:screen:update`, check the diff in git, and explain the change in the pull request and in `CHANGELOG.md`.

A ROM without a facit file gets one written the first time the tests run.
