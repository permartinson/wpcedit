// Tests for the checksum tools and for loading the last ROM from the cache.
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

// Copies of the first full frame image and the first sprite, to check that
// they are unchanged after the checksum has been changed
function someImages(store) {
  const table = 0;
  const index = store.spriteTableMap[table][0];
  return [
    Uint8Array.from(store.getFullFrameImageAt(0).image),
    Uint8Array.from(store.getSpriteAt(table, index).image),
  ];
}

// Waits until the store has saved its values and read the cache
const settled = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('with ROM files', () => {
  if (romFiles.length === 0) {
    it.skip(`uses ROM files (none found in ${romFolder})`, () => {});
    return;
  }

  let store;

  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    store = useMainStore();
  });

  describe.each(romFiles)('%s', (name) => {
    beforeEach(() => {
      const result = store.loadRom(readRom(name), name);
      expect(result.error).toBeFalsy();
    });

    it('does nothing when the checksum is updated with the same version', () => {
      const checksum = store.storedChecksum;
      // The version input in the app shows the version byte as a number
      expect(store.updateChecksum(Number(store.versionByte))).toBe(0);
      expect(store.storedChecksum).toBe(checksum);
      expect(store.romIsAltered).toBe(false);
    });

    it('updates the checksum to a new version', () => {
      const images = someImages(store);
      const newVersion = store.versionByte === '42' ? 43 : 42;
      expect(store.updateChecksum(newVersion)).toBe(1);
      expect(store.versionByte).toBe(String(newVersion));
      expect(store.checksumIsValid).toBe(true);
      expect(store.storedChecksum).toBe(store.calculatedChecksum);
      expect(store.romIsAltered).toBe(true);
      expect(someImages(store)).toEqual(images);
    });

    it('disables the checksum', () => {
      const images = someImages(store);
      const alreadyDisabled = store.fixupBytes === '00FF';
      expect(store.disableChecksum()).toBe(alreadyDisabled ? 0 : 1);
      expect(store.romIsLoaded).toBe(true);
      expect(store.fixupBytes).toBe('00FF');
      expect(store.romIsAltered).toBe(!alreadyDisabled);
      expect(someImages(store)).toEqual(images);
    });
  });

  describe('the cache', () => {
    const name = romFiles[0];

    it('loads the last ROM again when the app starts', async () => {
      store.loadRom(readRom(name), name);
      const checksum = store.storedChecksum;
      await settled(); // let the store save the file name in localStorage

      // Start the app again: a new store, with the same localStorage
      setActivePinia(createPinia());
      const restarted = useMainStore();
      expect(restarted.currentRomData).toBeNull();
      restarted.getRomFromCache();
      await vi.waitFor(() => expect(restarted.currentRomData).not.toBeNull());
      expect(restarted.fileName).toBe(name);
      expect(restarted.storedChecksum).toBe(checksum);
      expect(restarted.checksumIsValid).toBe(true);
    });

    it('loads nothing after the ROM has been unloaded', async () => {
      store.loadRom(readRom(name), name);
      store.unloadRom();
      await settled();

      setActivePinia(createPinia());
      const restarted = useMainStore();
      restarted.getRomFromCache();
      await settled();
      expect(restarted.currentRomData).toBeNull();
      expect(restarted.romIsLoaded).toBe(false);
    });
  });
});
