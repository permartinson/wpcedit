// Small helpers for reading pixels in DMD images in the tests.
// A full frame image is 128 x 32 pixels, 1 bit per pixel, 16 bytes per row.
// The lowest bit of each byte is the leftmost pixel.
export const dmdWidth = 128;
export const dmdHeight = 32;
export const bytesPerRow = dmdWidth / 8;

export function pixelAt(image, x, y, rowBytes = bytesPerRow) {
  return (image[y * rowBytes + (x >> 3)] >> (x & 7)) & 1;
}

// Coordinates of all lit pixels, as "x,y" strings
export function litPixels(image, width = dmdWidth, height = dmdHeight) {
  const rowBytes = Math.ceil(width / 8);
  const lit = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixelAt(image, x, y, rowBytes)) {
        lit.push(`${x},${y}`);
      }
    }
  }
  return lit;
}

// Decodes a 1-bit BMP from the app (base64) and returns the pixel at (x, y),
// counted from the top left corner of the picture. 1 = lit (white).
export function readBmp(base64) {
  const bmp = atob(base64);
  const uint32At = (pos) => (bmp.charCodeAt(pos) | (bmp.charCodeAt(pos + 1) << 8)
    | (bmp.charCodeAt(pos + 2) << 16) | (bmp.charCodeAt(pos + 3) << 24)) >>> 0;
  const offset = uint32At(10);
  const width = uint32At(18);
  const height = uint32At(22);
  const rowBytes = Math.ceil(width / 32) * 4; // BMP rows are padded to 4 bytes
  return {
    header: bmp.slice(0, 2),
    fileSize: uint32At(2),
    length: bmp.length,
    offset,
    width,
    height,
    bitsPerPixel: bmp.charCodeAt(28),
    // BMP stores the rows from the bottom up, and the leftmost pixel in the highest bit
    pixel(x, y) {
      const pos = offset + (height - 1 - y) * rowBytes + (x >> 3);
      return (bmp.charCodeAt(pos) >> (7 - (x & 7))) & 1;
    },
  };
}
