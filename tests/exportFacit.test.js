/**
 * Facit tests for the export ("golden master").
 *
 * For every ROM file, a selection of full frame images, merged images and
 * sprites is exported as a data array, a BMP and an inverted BMP, the same
 * way the app does it. A fingerprint of each export is compared with a saved
 * facit file in tests/facit/. If an export changes, the test fails and the
 * diff shows which image it was.
 *
 * Facit files are named after the first 10 characters of the ROM's SHA-1,
 * like in the library. They hold fingerprints only, never ROM data.
 *
 * To regenerate the facit after an intended change: npm run test:update
 */
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useMainStore } from '../src/stores/mainStore.js';
import { romFolder, romFiles, readRom } from './romFiles.js';

vi.mock('../src/stores/idb.js', () => ({ get: async () => undefined, set: async () => {} }));

const facitFolder = join(import.meta.dirname, 'facit');

function fingerprint(data) {
  return createHash('sha1').update(data).digest('hex').slice(0, 12);
}

// The three exports of one image, as in the export menu of the app.
// dataSource is what the data array export uses, fullFrame what the BMP uses.
function exportLine(store, label, dataSource, fullFrame) {
  const data = fingerprint(store.exportAsDataArray(dataSource));
  const bmp = fingerprint(store.exportAs1bitBmp(fullFrame, false, 128, 32));
  const inverted = fingerprint(store.exportAs1bitBmp(fullFrame, true, 128, 32));
  return `${label}: data ${data}  bmp ${bmp}  bmp-inverted ${inverted}`;
}

function describeExports(store) {
  const lines = [];
  const lastIndex = store.maxFullFrameIndex - 1;
  const middle = Math.floor(lastIndex / 2);

  // Full frame images
  lines.push('# Full frame images');
  for (const index of [...new Set([0, 1, middle, lastIndex])]) {
    const image = Uint8Array.from(store.getFullFrameImageAt(index).image);
    lines.push(exportLine(store, `fullframe ${index}`, image, image));
  }

  // Merged images, as with "Merge" in the full frame window (without in-betweening)
  lines.push('', '# Merged images');
  for (const index of [...new Set([0, middle])]) {
    const image1 = Uint8Array.from(store.getFullFrameImageAt(index).image);
    const merged = store.mergePlanes(image1, store.getFullFrameImageAt(index + 1));
    lines.push(exportLine(store, `merged ${index}+${index + 1}`, merged, merged));
  }

  // Sprites: the data array is the sprite itself, the BMP is the sprite
  // centered in a full frame image, like in the sprite window
  lines.push('', '# Sprites (table/index)');
  store.spriteTableMap.forEach((indices, table) => {
    for (const index of [...new Set([indices[0], indices[indices.length - 1]])]) {
      if (index === undefined) {
        continue;
      }
      const sprite = Uint8Array.from(store.getSpriteAt(table, index).image);
      const centered = Uint8Array.from(store.getSpriteCentered(table, index));
      lines.push(exportLine(store, `sprite ${table}/${index}`, sprite, centered));
    }
  });

  return lines.join('\n') + '\n';
}

describe('export facit', () => {
  if (romFiles.length === 0) {
    it.skip(`no ROM files found in ${romFolder}`, () => {});
    return;
  }

  it.each(romFiles)('%s', async (name) => {
    setActivePinia(createPinia());
    const store = useMainStore();
    const data = readRom(name);
    const id = createHash('sha1').update(data).digest('hex').slice(0, 10);
    expect(store.loadRom(data, name).error).toBeFalsy();
    await expect(describeExports(store)).toMatchFileSnapshot(join(facitFolder, `${id}.txt`));
  });
});
