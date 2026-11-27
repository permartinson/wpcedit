// Tests the file name used when the ROM is downloaded.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useMainStore } from '../src/stores/mainStore.js';
import { saveDataAsFile } from '../src/helpers/export.js';

vi.mock('../src/stores/idb.js', () => ({ get: async () => undefined, set: async () => {} }));

// Catch the download instead of starting it
vi.mock('../src/helpers/export.js', async (importOriginal) => ({
  ...(await importOriginal()),
  saveDataAsFile: vi.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 27, 18, 45)); // 27 November 2026, 18:45
});

afterEach(() => {
  vi.useRealTimers();
});

it('names the downloaded ROM after the file, the time and the checksum', () => {
  const store = useMainStore();
  const data = new Uint8Array(4);
  store.fileName = 'mm_g11.1_0.rom';
  store.storedChecksum = 'ABCD';
  store.currentRomData = data;
  store.downloadRom();
  expect(saveDataAsFile).toHaveBeenCalledWith(data, 'mm_g11.1_0_202611271845_csABCD.rom', 'application/octet-stream');
});
