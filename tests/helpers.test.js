import { describe, expect, it } from 'vitest';
import { pad, toHex } from '../src/helpers/formatting.js';
import { mirrorBits, writeBmp } from '../src/helpers/export.js';

describe('formatting', () => {
  it('pads numbers with zeros', () => {
    expect(pad(7, 4)).toBe('0007');
    expect(pad('ab', 2)).toBe('ab');
  });

  it('formats hex values', () => {
    expect(toHex(10)).toBe('0x0A');
    expect(toHex(0x3f, 4)).toBe('0x003F');
  });
});

describe('export helpers', () => {
  it('mirrors the bits of a byte', () => {
    expect(mirrorBits(0b00000001)).toBe(0b10000000);
    expect(mirrorBits(0b11010000)).toBe(0b00001011);
    expect(mirrorBits(0)).toBe(0);
    expect(mirrorBits(255)).toBe(255);
  });

  it('writes a 1-bit BMP with the right header', () => {
    const pixels = new Array(16 * 32).fill(0);
    const bmp = atob(writeBmp(pixels, 1, 128, 32));
    const uint32At = (pos) => bmp.charCodeAt(pos) | (bmp.charCodeAt(pos + 1) << 8)
      | (bmp.charCodeAt(pos + 2) << 16) | (bmp.charCodeAt(pos + 3) << 24);
    expect(bmp.slice(0, 2)).toBe('BM');
    expect(uint32At(2)).toBe(bmp.length); // file size
    expect(uint32At(18)).toBe(128); // width
    expect(uint32At(22)).toBe(32); // height
    expect(bmp.charCodeAt(28)).toBe(1); // bits per pixel
  });
});
