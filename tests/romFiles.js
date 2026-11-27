// Finds the ROM files for the tests. ROM files are copyrighted and are never
// committed. They are read from the folder in WPCEDIT_ROMS, or from the
// library's roms folder next to this app (../js/wpcedit.js/roms).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const romFolder = resolve(process.env.WPCEDIT_ROMS ?? join(import.meta.dirname, '../../js/wpcedit.js/roms'));

export const romFiles = existsSync(romFolder)
  ? readdirSync(romFolder).filter((name) => /\.rom$/i.test(name)).sort()
  : [];

export function readRom(name) {
  return new Uint8Array(readFileSync(join(romFolder, name)));
}
