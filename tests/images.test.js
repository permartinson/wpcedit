// Tests for what the app does with the decoded images: export as data array
// and BMP, merging of planes and placing sprites in a full frame image.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useMainStore } from '../src/stores/mainStore.js';
import { romFolder, romFiles, readRom } from './romFiles.js';
import { dmdHeight, dmdWidth, litPixels, pixelAt, readBmp } from './dmdPixels.js';

// The store caches the ROM in IndexedDB. The tests keep it in memory instead.
vi.mock('../src/stores/idb.js', () => {
  const values = new Map();
  return {
    get: async (key) => values.get(key),
    set: async (key, value) => { values.set(key, value); },
  };
});

const fullFrameBytes = (dmdWidth / 8) * dmdHeight; // 512

// A made-up plane in the format the library uses
function makePlane(width, height, image, extra = {}) {
  const size = image.length;
  return {
    width,
    height,
    image: Uint8Array.from(image),
    mask: new Uint8Array(size),
    xor: new Uint8Array(size),
    flags: new Uint8Array(size),
    xOffset: 0,
    yOffset: 0,
    type: 0,
    address: 0,
    tableAddress: 0,
    ...extra,
  };
}

// The first and last index of every sprite table, as [table, index]
function firstAndLastSprites(store) {
  const sprites = [];
  store.spriteTableMap.forEach((indices, table) => {
    if (indices.length > 0) {
      sprites.push([table, indices[0]]);
      if (indices.length > 1) {
        sprites.push([table, indices[indices.length - 1]]);
      }
    }
  });
  return sprites;
}

let store;

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  store = useMainStore();
});

describe('export as data array', () => {
  it('exports an empty and a full image', () => {
    expect(store.exportAsDataArray(new Uint8Array(3))).toBe('0x00,0x00,0x00,');
    expect(store.exportAsDataArray(new Uint8Array(3).fill(0xff))).toBe('0xFF,0xFF,0xFF,');
  });
});

describe('export as BMP', () => {
  it('writes a 128 x 32 BMP with 1 bit per pixel', () => {
    const bmp = readBmp(store.exportAs1bitBmp(new Uint8Array(fullFrameBytes), false, 128, 32));
    expect(bmp.header).toBe('BM');
    expect(bmp.width).toBe(128);
    expect(bmp.height).toBe(32);
    expect(bmp.bitsPerPixel).toBe(1);
    expect(bmp.fileSize).toBe(bmp.length);
    expect(bmp.length).toBe(bmp.offset + fullFrameBytes);
  });

  it('keeps every pixel in its place', () => {
    const image = new Uint8Array(fullFrameBytes);
    const lit = [[0, 0], [1, 0], [127, 0], [0, 31], [127, 31], [64, 16], [9, 3]];
    for (const [x, y] of lit) {
      image[y * 16 + (x >> 3)] |= 1 << (x & 7);
    }
    const bmp = readBmp(store.exportAs1bitBmp(image, false, 128, 32));
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 128; x++) {
        expect(bmp.pixel(x, y), `pixel ${x},${y}`).toBe(pixelAt(image, x, y));
      }
    }
  });

  it('inverts every pixel in the inverted BMP', () => {
    const image = new Uint8Array(fullFrameBytes);
    image[0] = 0x01;
    image[100] = 0x5a;
    const bmp = readBmp(store.exportAs1bitBmp(image, false, 128, 32));
    const inverted = readBmp(store.exportAs1bitBmp(image, true, 128, 32));
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 128; x++) {
        expect(inverted.pixel(x, y), `pixel ${x},${y}`).toBe(1 - bmp.pixel(x, y));
      }
    }
  });
});

describe('merging planes', () => {
  it('applies the mask and the xor flags of the second plane', () => {
    const image1 = Uint8Array.from([0x0a, 0xf0, 0x0f, 0x55]);
    const plane2 = makePlane(32, 1, [0x01, 0x00, 0xaa, 0x00], {
      mask: Uint8Array.from([0x00, 0xff, 0x00, 0x00]),
      flags: Uint8Array.from([0x00, 0x00, 0x0f, 0xff]),
      xor: Uint8Array.from([0x00, 0x00, 0x0f, 0xf0]),
    });
    const merged = store.mergePlanes(image1, plane2);
    // byte 0: no mask and no flags, so the second image is used
    // byte 1: masked, so the first image is kept
    // byte 2: xor flags on lit bits of the first image add nothing
    // byte 3: low bits are skipped (copied from the first image),
    //         high bits are flipped from the first image
    expect(Array.from(merged)).toEqual([0x01, 0xf0, 0xaa, 0xa5]);
    expect(Array.from(image1)).toEqual([0x0a, 0xf0, 0x0f, 0x55]);
    expect(Array.from(plane2.image)).toEqual([0x01, 0x00, 0xaa, 0x00]);
  });
});

describe('placing a sprite in a full frame image', () => {
  // 8 x 2 pixels: a full line on top, and the two end pixels below
  const sprite = makePlane(8, 2, [0xff, 0x81]);
  const expectedPixels = (x0, y0) => [
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((x) => [x0 + x, y0]),
    [x0, y0 + 1],
    [x0 + 7, y0 + 1],
  ];
  const asStrings = (pixels) => pixels
    .filter(([x, y]) => x < dmdWidth && y < dmdHeight)
    .map(([x, y]) => `${x},${y}`)
    .sort();

  it.each([[0, 0], [3, 5], [117, 30]])('places it at %i,%i', (x, y) => {
    const image = store.getSpriteAsFullFrame(sprite, x, y);
    expect(image).toHaveLength(fullFrameBytes);
    expect(litPixels(image).sort()).toEqual(asStrings(expectedPixels(x, y)));
  });

  // Known bug: the part of the sprite that is outside the right edge comes
  // back on the left side of the next row. To be fixed in the library in a
  // separate step. Remove .fails when it is fixed.
  it.fails('cuts the sprite off at the right edge (known bug)', () => {
    const image = store.getSpriteAsFullFrame(sprite, 125, 5);
    expect(litPixels(image).sort()).toEqual(asStrings(expectedPixels(125, 5)));
  });
});

describe('with ROM files', () => {
  if (romFiles.length === 0) {
    it.skip(`uses ROM files (none found in ${romFolder})`, () => {});
    return;
  }

  describe.each(romFiles)('%s', (name) => {
    beforeEach(() => {
      const result = store.loadRom(readRom(name), name);
      expect(result.error).toBeFalsy();
    });

    it('exports the first and last full frame image as a data array', () => {
      for (const index of [0, store.maxFullFrameIndex - 1]) {
        const image = store.getFullFrameImageAt(index).image;
        const before = Uint8Array.from(image);
        const values = store.exportAsDataArray(image).split(',');
        expect(values.pop()).toBe(''); // the text ends with a comma
        expect(values).toHaveLength(fullFrameBytes);
        for (const value of values) {
          expect(value).toMatch(/^0x[0-9A-F]{2}$/);
        }
        expect(image).toEqual(before);
      }
    });

    it('exports full frame images and sprites as BMP with every pixel in place', () => {
      const images = [Uint8Array.from(store.getFullFrameImageAt(0).image)];
      for (const [table, index] of firstAndLastSprites(store)) {
        images.push(Uint8Array.from(store.getSpriteCentered(table, index)));
      }
      for (const image of images) {
        const before = Uint8Array.from(image);
        const bmp = readBmp(store.exportAs1bitBmp(image, false, 128, 32));
        const inverted = readBmp(store.exportAs1bitBmp(image, true, 128, 32));
        for (let y = 0; y < 32; y++) {
          for (let x = 0; x < 128; x++) {
            const lit = pixelAt(image, x, y);
            if (bmp.pixel(x, y) !== lit || inverted.pixel(x, y) !== 1 - lit) {
              expect.fail(`pixel ${x},${y} is wrong in the BMP`);
            }
          }
        }
        expect(image).toEqual(before);
      }
    });

    it('exports the blend image like a normal export of the next image', () => {
      // "Export blend plane" exports the image at the next index
      const index = 0;
      const blend = Uint8Array.from(store.getFullFrameImageAt(index + 1).image);
      store.getFullFrameImageAt(index); // the main image is shown as well
      const next = Uint8Array.from(store.getFullFrameImageAt(index + 1).image);
      expect(store.exportAsDataArray(blend)).toBe(store.exportAsDataArray(next));
      expect(store.exportAs1bitBmp(blend, false, 128, 32)).toBe(store.exportAs1bitBmp(next, false, 128, 32));
      expect(store.exportAs1bitBmp(blend, true, 128, 32)).toBe(store.exportAs1bitBmp(next, true, 128, 32));
    });

    it('merges an image with the next one without changing them', () => {
      const index = Math.floor(store.maxFullFrameIndex / 2);
      const image1 = store.getFullFrameImageAt(index).image;
      const copy1 = Uint8Array.from(image1);
      const plane2 = store.getFullFrameImageAt(index + 1);
      const copy2 = Uint8Array.from(plane2.image);
      const merged = store.mergePlanes(image1, plane2);
      expect(merged).toHaveLength(fullFrameBytes);
      expect(image1).toEqual(copy1);
      expect(plane2.image).toEqual(copy2);
    });

    it('centers the first and last sprite of each table without losing pixels', () => {
      for (const [table, index] of firstAndLastSprites(store)) {
        const sprite = store.getSpriteAt(table, index);
        const spritePixels = litPixels(sprite.image, sprite.width, sprite.height).length;
        const fits = sprite.width <= dmdWidth && sprite.height <= dmdHeight;
        const centered = store.getSpriteCentered(table, index);
        expect(centered, `table ${table}, index ${index}`).toHaveLength(fullFrameBytes);
        if (fits) {
          expect(litPixels(centered).length, `table ${table}, index ${index}`).toBe(spritePixels);
        }
      }
    });
  });
});
