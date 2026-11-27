/**
 * Screen tests: the app is started in a real browser, a ROM is loaded and
 * every view is opened. What is drawn in each DMD is read back dot by dot
 * (see dmdReader.mjs) and compared with a saved facit in facit/, as
 * fingerprints. The full frame and sprite lists are also compared with what
 * the WPCEdit.js library decodes, dot by dot.
 *
 * ROM files are never committed. They are read from WPCEDIT_ROMS or
 * ../js/wpcedit.js/roms, like the other tests. ROMs that are missing are
 * shown as skipped.
 *
 * To regenerate the facit after an intended change: npm run test:screen:update
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { WPCEdit } from 'wpcedit';
import { keepWebGlDrawings, readDmdCanvases } from './dmdReader.mjs';

// The same ROM folder as in ../romFiles.js (which Playwright cannot load,
// because this package is not an ES module package)
const romFolder = resolve(process.env.WPCEDIT_ROMS ?? join(import.meta.dirname, '../../../js/wpcedit.js/roms'));
const romFiles = existsSync(romFolder) ? readdirSync(romFolder).filter((name) => /\.rom$/i.test(name)).sort() : [];
const readRom = (name) => new Uint8Array(readFileSync(join(romFolder, name)));

// ROMs from different WPC generations, found by the first 10 characters of
// their SHA-1 so the files can be named anything. Add a line to test another.
const screenRoms = {
  ab323980b9: 'Fish Tales (fshtl_5), 1992, WPC Fliptronics',
  '37c01f8c6e': 'The Shadow (cpu-u6l2), 1994, WPC DCS',
  '3922df00e7': 'Medieval Madness (mm_g11.1_0), 1997, WPC-95',
  adaf6b07d2: 'Cactus Canyon (cc_g11.1_3), 1998, WPC-95',
};

// Messages in the browser console that are not errors in the app
const ignoredConsoleMessages = [
  // Chromium warns about an unload handler added by a library
  /Permissions policy violation: unload is not allowed/,
];

const sha1 = (data) => createHash('sha1').update(data).digest('hex');
const fingerprint = (dmd) => sha1(`${dmd.kind};${dmd.colour};${dmd.levels}`).slice(0, 12);

const romsById = new Map(romFiles.map((name) => [sha1(readRom(name)).slice(0, 10), name]));

// The plasma display is read back with some uncertainty, because of its
// glow. It may differ from the plain display styles in this many dots.
const plasmaTolerance = 40;

const differentDots = (a, b) => [...a].filter((level, i) => level !== b[i]).length;

// The dots of a decoded image as levels: 3 where a pixel is lit, else 0
function expectedLevels(image) {
  let levels = '';
  for (let i = 0; i < 128 * 32; i++) {
    levels += ((image[i >> 3] >> (i % 128) % 8) & 1) * 3;
  }
  return levels;
}

// Starts the app in a new page and collects console errors
async function openApp(page) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !ignoredConsoleMessages.some((pattern) => pattern.test(message.text()))) {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.addInitScript(keepWebGlDrawings);
  await page.goto('./');
  return errors;
}

async function loadRom(page, name) {
  await page.setInputFiles('input[type=file]', join(romFolder, name));
  // The disclaimer is shown the first time a ROM is loaded
  await page.getByRole('button', { name: 'I understand and agree' }).click();
  await expect(page.locator('.navigation')).toBeVisible();
}

// Reads all DMDs in a part of the page, after the app has drawn them
async function readDmds(page, selector = 'body') {
  // The plasma display loads its dot images in the background
  await page.waitForTimeout(500);
  return page.evaluate(readDmdCanvases, await page.$$(`${selector} canvas`));
}

async function openFromHome(page, label) {
  await page.locator('.navigation').getByText(label).click();
}

async function setDisplayStyle(page, style) {
  await openFromHome(page, 'Settings');
  await page.selectOption('select[name=dmdstyle]', style);
  await backToHome(page);
}

async function backToHome(page) {
  await page.locator('.bar-container').getByText('Back').click();
  await expect(page.locator('.navigation')).toBeVisible();
}

test('home without a ROM', async ({ page }) => {
  const errors = await openApp(page);
  await expect(page.getByText('Drop a WPC Pinball game ROM file here')).toBeVisible();
  await expect(page.locator('.bar-title')).toHaveText('Load ROM');
  expect(errors).toEqual([]);
});

for (const [id, description] of Object.entries(screenRoms)) {
  test(description, async ({ page }) => {
    const name = romsById.get(id);
    test.skip(!name, `ROM not found in ${romFolder}`);

    const data = readRom(name);
    WPCEdit.init();
    WPCEdit.setRom(data);
    const facit = [`# ${description}`];
    const record = (label, dmds) => {
      dmds.forEach((dmd, n) => facit.push(`${label} ${dmd.kind} ${n}: ${fingerprint(dmd)}`));
    };

    let firstSprite = 0;
    const errors = await openApp(page);

    await test.step('load the ROM', async () => {
      await loadRom(page, name);
      await expect(page.getByText(name)).toBeVisible();
      await expect(page.locator('.bar-title')).toHaveText('Home');
      // The plain orange dots can be read back exactly, the plasma display
      // cannot. The facit is therefore made with orange dots, and the
      // plasma display is compared with them in "display styles" below.
      await setDisplayStyle(page, '1');
    });

    await test.step('full frame images', async () => {
      await openFromHome(page, 'Full frame graphics');
      const dmds = await readDmds(page, '.fullframe-list');
      expect(dmds.length).toBeGreaterThan(0);
      dmds.forEach((dmd, index) => {
        const image = WPCEdit.fullFrameImage.getPlaneAt(index).image;
        expect(dmd.levels, `full frame image ${index}`).toBe(expectedLevels(image));
      });
      record('fullframe list', dmds);
    });

    await test.step('full frame window', async () => {
      await page.locator('.list-item-fullframe').first().click();
      const modal = '.modal-container';
      await expect(page.locator(modal)).toBeVisible();
      record('fullframe window', await readDmds(page, modal));
      await page.locator(modal).getByText('Blend with index 1').click();
      record('fullframe window blend', await readDmds(page, modal));
      await page.locator(modal).getByText('Blend with index 1').click();
      await page.locator(modal).getByText(/Apply index \d+ on top/).first().click();
      record('fullframe window merge', await readDmds(page, modal));
      await page.locator(modal).getByText(/Apply index \d+ on top/).first().click();
      // Step to the next image, then close the window with the close button
      await page.locator(`${modal} .step-buttons button`).nth(1).click();
      await expect(page.locator(modal).getByText('This plane, index 1')).toBeVisible();
      record('fullframe window next', await readDmds(page, modal));
      await page.locator(`${modal} .close-area button`).click();
      await expect(page.locator(modal)).toBeHidden();
      await backToHome(page);
    });

    await test.step('sprites', async () => {
      await openFromHome(page, 'Sprites and fonts');
      const dmds = await readDmds(page, '.scroll-area');
      expect(dmds.length).toBeGreaterThan(0);
      record('sprite list', dmds);
      // The first sprite that is not empty, so that moving it shows
      firstSprite = dmds.findIndex((dmd) => dmd.levels.includes('3'));
      expect(firstSprite).toBeGreaterThanOrEqual(0);
    });

    await test.step('sprite window', async () => {
      await page.locator('.list-item-sprite').nth(firstSprite).click();
      const modal = '.modal-container';
      await expect(page.locator(modal)).toBeVisible();
      const sprite = await readDmds(page, modal);
      record('sprite window', sprite);
      // Move the sprite one step to the right
      await page.locator(`${modal} button.right`).first().click();
      const moved = await readDmds(page, modal);
      expect(moved[0].levels, 'the sprite has moved').not.toBe(sprite[0].levels);
      record('sprite window moved', moved);
      // Clicking outside the window closes it
      await page.locator('.modal-mask').click({ position: { x: 5, y: 5 } });
      await expect(page.locator(modal)).toBeHidden();
      await backToHome(page);
    });

    await test.step('checksum', async () => {
      await openFromHome(page, 'Checksum tool');
      const stored = WPCEdit.checksum.stored.toString(16).padStart(4, '0').toUpperCase();
      await expect(page.getByText(stored, { exact: true }).first()).toBeVisible();
      await backToHome(page);
    });

    await test.step('display styles', async () => {
      const levelsByStyle = {};
      for (const style of ['2', '3', '4', '0', '1']) {
        await setDisplayStyle(page, style);
        await openFromHome(page, 'Full frame graphics');
        await page.locator('.list-item-fullframe').first().click();
        const [dmd] = await readDmds(page, '.modal-container');
        levelsByStyle[style] = dmd.levels;
        if (style !== '0') {
          record(`fullframe window style ${style}`, [dmd]);
        }
        await page.locator('.modal-mask').click({ position: { x: 5, y: 5 } });
        await backToHome(page);
      }
      // Every display style shows the same dots, only drawn differently
      for (const style of ['2', '3', '4']) {
        expect(levelsByStyle[style], `display style ${style}`).toBe(levelsByStyle['1']);
      }
      const plasmaDifference = differentDots(levelsByStyle['0'], levelsByStyle['1']);
      test.info().annotations.push({ type: 'plasma', description: `${plasmaDifference} of 4096 dots read differently` });
      expect(plasmaDifference, 'dots that differ in the plasma display').toBeLessThanOrEqual(plasmaTolerance);
    });

    await test.step('restart with the ROM from the cache', async () => {
      await page.reload();
      await expect(page.locator('.navigation')).toBeVisible();
      await expect(page.getByText(name)).toBeVisible();
    });

    expect(errors, 'errors in the browser console').toEqual([]);
    expect(facit.join('\n') + '\n').toMatchSnapshot(`${id}.txt`);
  });
}

test('every display style draws the preview image in the settings', async ({ page }) => {
  const name = romsById.values().next().value;
  test.skip(!name, `no ROM files found in ${romFolder}`);
  // The preview image is built into the settings view
  const source = readFileSync(join(import.meta.dirname, '../../src/views/SettingsView.vue'), 'utf8');
  const [plane0, plane1] = [...source.matchAll(/Uint8Array\.from\(\[([\s\S]*?)\]\)/g)]
    .map((match) => match[1].split(',').map((value) => value.trim()).filter(Boolean).map(Number));
  let expected = '';
  for (let i = 0; i < 128 * 32; i++) {
    const bit = (plane, n) => (plane[n >> 3] >> (n % 128) % 8) & 1;
    expected += bit(plane0, i) * 2 + bit(plane1, i);
  }

  const errors = await openApp(page);
  await loadRom(page, name);
  await openFromHome(page, 'Settings');
  for (const style of ['0', '1', '2', '3', '4']) {
    await page.selectOption('select[name=dmdstyle]', style);
    await page.waitForTimeout(1000);
    const [dmd] = await readDmds(page, '.settings-container');
    if (style === '0') {
      expect(differentDots(dmd.levels, expected), 'dots that differ in the plasma display').toBeLessThanOrEqual(plasmaTolerance);
    } else {
      expect(dmd.levels, `display style ${style}`).toBe(expected);
    }
  }
  expect(errors).toEqual([]);
});
