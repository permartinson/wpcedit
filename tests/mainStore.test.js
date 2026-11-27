import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useMainStore } from '../src/stores/mainStore.js';
import { romFolder, romFiles, readRom } from './romFiles.js';

// The store caches the ROM in IndexedDB. The tests keep it in memory instead.
vi.mock('../src/stores/idb.js', () => {
  const values = new Map();
  return {
    get: async (key) => values.get(key),
    set: async (key, value) => { values.set(key, value); },
  };
});

describe('main store', () => {
  let store;

  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    store = useMainStore();
  });

  it('starts without a ROM', () => {
    expect(store.romIsLoaded).toBe(false);
    expect(store.fileName).toBe('');
  });

  it('exports an image as a data array without changing the image', () => {
    const image = Uint8Array.from([0x01, 0x80, 0xf0]);
    expect(store.exportAsDataArray(image)).toBe('0x80,0x01,0x0F,');
    expect(Array.from(image)).toEqual([0x01, 0x80, 0xf0]);
  });

  it('exports an image as BMP without changing the image', () => {
    const image = new Uint8Array(16 * 32);
    image[0] = 0x01;
    const copy = Uint8Array.from(image);
    const first = store.exportAs1bitBmp(image, false, 128, 32);
    const inverted = store.exportAs1bitBmp(image, true, 128, 32);
    expect(image).toEqual(copy);
    expect(store.exportAs1bitBmp(image, false, 128, 32)).toBe(first);
    expect(inverted).not.toBe(first);
  });

  it('reports an error for a file that is not a WPC ROM', () => {
    const result = store.loadRom(new Uint8Array(1000), 'not-a-rom.bin');
    expect(result.error).toBeTruthy();
    expect(store.romIsLoaded).toBe(false);
  });

  // Smoke test: load each ROM through the store, the way the app does it.
  // Shown as skipped when there are no ROM files.
  describe('with ROM files', () => {
    if (romFiles.length === 0) {
      it.skip(`loads ROM files (none found in ${romFolder})`, () => {});
      return;
    }
    it.each(romFiles)('loads %s', (name) => {
      const result = store.loadRom(readRom(name), name);
      expect(result.error).toBeFalsy();
      expect(store.romIsLoaded).toBe(true);
      expect(store.fileName).toBe(name);
      expect(store.checksumIsValid).toBe(true);
      expect(store.storedChecksum).toBe(store.calculatedChecksum);
      expect(store.maxFullFrameIndex).toBeGreaterThan(0);

      const fullFrame = store.getFullFrameImageAt(0);
      expect(fullFrame.image).toHaveLength(512); // 128 x 32 pixels, 1 bit each

      const tables = Object.keys(store.spriteTableMap);
      expect(tables.length).toBeGreaterThan(0);

      store.unloadRom();
      expect(store.romIsLoaded).toBe(false);
      expect(store.currentRomData).toBeNull();
    });
  });
});
