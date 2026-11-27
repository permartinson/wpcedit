// Reads what is drawn in the DMD canvases of the app, in the browser.
//
// Each DMD is read back as 128 x 32 dots. Every dot is turned into one of
// the four brightness levels the app draws: 0 = off, 1 = 40 % (second plane
// only), 2 = 60 % (first plane only), 3 = 100 % (both planes). The result is
// a string of 4096 digits, row by row. This makes the comparison independent
// of small differences in how browsers and graphics cards draw circles and
// glow, so the same facit works on every computer.

// Added to the page before the app starts: lets the test read WebGL canvases
// (the plasma display) after they have been drawn. Changes nothing visible.
export function keepWebGlDrawings() {
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, options) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
      options = { ...options, preserveDrawingBuffer: true };
    }
    return getContext.call(this, type, options);
  };
}

// Runs in the browser. Returns one entry per DMD canvas, in page order:
// { kind, levels, colour }. kind is plasma, main (large DMD with plain dots),
// sub (the small DMDs in the image windows) or list (the lists of images).
// colour is the colour of the brightest dot, which shows whether a small DMD
// is enabled.
export function readDmdCanvases(canvases) {
  const layouts = {
    // canvas size: dot size in pixels, margin around the dots, kind
    '1056x288': { dot: 8, margin: 16, kind: 'plasma' },
    '1024x256': { dot: 8, margin: 0, kind: 'main' },
    '512x128': { dot: 4, margin: 0, kind: 'sub' },
    '256x64': { dot: 2, margin: 0, kind: 'list' },
  };
  const result = [];
  for (const canvas of canvases) {
    const layout = layouts[`${canvas.width}x${canvas.height}`];
    if (!layout) {
      continue;
    }
    // Copy to a 2D canvas on black, so WebGL and 2D canvases are read the same way
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;
    const ctx = copy.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, copy.width, copy.height);
    ctx.drawImage(canvas, 0, 0);
    const pixels = ctx.getImageData(0, 0, copy.width, copy.height).data;
    const channel = (x, y, c) => pixels[(y * copy.width + x) * 4 + c];
    const half = Math.floor(layout.dot / 2);
    const centre = (n, margin) => margin + n * layout.dot + half;

    // The colour of the brightest dot
    let colour = [0, 0, 0];
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 128; x++) {
        const rgb = [0, 1, 2].map((c) => channel(centre(x, layout.margin), centre(y, layout.margin), c));
        if (Math.max(...rgb) > Math.max(...colour)) {
          colour = rgb;
        }
      }
    }

    let levels = '';
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 128; x++) {
        const px = centre(x, layout.margin);
        const py = centre(y, layout.margin);
        let level = 0;
        if (layout.kind === 'plasma') {
          // The glow makes the centre of a dot brighter when its neighbours
          // are lit, so the dot is compared with the gaps around it instead.
          // Green is used, because red is saturated by the glow.
          const green = channel(px, py, 1);
          const gaps = (channel(px - half, py - half, 1) + channel(px + half - 1, py - half, 1)
            + channel(px - half, py + half - 1, 1) + channel(px + half - 1, py + half - 1, 1)) / 4;
          const contrast = green - gaps;
          if (green >= 182) {
            level = 3;
          } else if (contrast >= 45) {
            level = 2;
          } else if (contrast >= 20) {
            level = 1;
          }
        } else if (layout.kind === 'main') {
          // Plain dots: the brightness is 0, 40, 60 or 100 % of the colour,
          // which is orange (220, 133, 33) or white (225, 225, 225)
          const value = Math.max(channel(px, py, 0), channel(px, py, 1), channel(px, py, 2));
          const steps = [0, 0.4, 0.6, 1];
          const ratio = value / (colour[0] > colour[1] + 20 ? 220 : 225);
          level = steps.reduce((best, step, i) => (Math.abs(ratio - step) < Math.abs(ratio - steps[best]) ? i : best), 0);
        } else {
          // The small DMDs only show one plane: a dot is on or off
          const value = Math.max(channel(px, py, 0), channel(px, py, 1), channel(px, py, 2));
          level = value > 40 ? 3 : 0;
        }
        levels += level;
      }
    }
    result.push({ kind: layout.kind, levels, colour: colour.join(',') });
  }
  return result;
}
