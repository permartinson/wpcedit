/**
 * Accessibility checks: every view, image window and dialog of the app is
 * checked with axe (https://github.com/dequelabs/axe-core) against WCAG 2.2
 * level A and AA.
 *
 * knownViolations lists the axe rules that are known to fail today, per view.
 * The list is emptied step by step in phase C (see Claude/fas-C.md):
 * - a rule that fails but is not in the list fails the test (a new problem)
 * - a rule that is in the list but no longer fails also fails the test, so
 *   that the list is kept up to date when a problem has been fixed
 *
 * ROM files are never committed. They are read from WPCEDIT_ROMS or
 * ../js/wpcedit.js/roms, like the other tests.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const romFolder = resolve(process.env.WPCEDIT_ROMS ?? join(import.meta.dirname, '../../../js/wpcedit.js/roms'));
const romFiles = existsSync(romFolder) ? readdirSync(romFolder).filter((name) => /\.rom$/i.test(name)).sort() : [];
const sha1 = (data) => createHash('sha1').update(data).digest('hex');

// Medieval Madness if it is there, otherwise the first ROM found
const romName =
  romFiles.find((name) => sha1(readFileSync(join(romFolder, name))).startsWith('3922df00e7')) ?? romFiles[0];

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// The axe rules that fail today, per view. Phase C empties this list.
const knownViolations = {
  'home without a ROM': [],
  'disclaimer': [],
  'home with a ROM': [],
  'full frame list': [],
  'full frame window': [],
  'sprite list': ['color-contrast'],
  'sprite window': [],
  'checksum tool': [],
  'settings': [],
  'unload warning': [],
  'error dialog': [],
};

const found = {};

async function check(page, view) {
  // Wait until the fade between views has ended, or axe sees half
  // transparent text and cannot check the contrast
  await page.waitForFunction(() => document.getAnimations().length === 0);
  await page.waitForTimeout(200);
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  found[view] = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.length,
    help: violation.help,
  }));
  const ids = found[view].map((violation) => violation.id).sort();
  const known = [...knownViolations[view]].sort();
  const details = found[view].map((v) => `${v.id} (${v.impact}, ${v.nodes}×): ${v.help}`).join('\n');
  expect.soft(ids.filter((id) => !known.includes(id)), `new accessibility problems in "${view}":\n${details}`).toEqual([]);
  expect.soft(known.filter((id) => !ids.includes(id)), `fixed in "${view}", remove from knownViolations`).toEqual([]);
}

async function openFromHome(page, label) {
  await page.locator('.navigation').getByText(label).click();
  await expect(page.locator('.navigation')).toBeHidden();
}

async function backToHome(page) {
  await page.locator('.bar-container').getByText('Back').click();
  await expect(page.locator('.navigation')).toBeVisible();
}

test('every view passes axe, apart from the known problems', async ({ page }) => {
  test.skip(!romName, `no ROM files found in ${romFolder}`);

  await page.goto('./');
  await expect(page.getByText('Drop a WPC Pinball game ROM file here')).toBeVisible();
  await check(page, 'home without a ROM');

  await page.setInputFiles('input[type=file]', join(romFolder, romName));
  await expect(page.getByRole('button', { name: 'I understand and agree' })).toBeVisible();
  await check(page, 'disclaimer');
  await page.getByRole('button', { name: 'I understand and agree' }).click();
  await expect(page.locator('.navigation')).toBeVisible();
  await check(page, 'home with a ROM');

  await openFromHome(page, 'Full frame graphics');
  await expect(page.locator('.list-item-fullframe').first()).toBeVisible();
  await check(page, 'full frame list');
  await page.locator('.list-item-fullframe').first().click();
  await expect(page.locator('.modal-container')).toBeVisible();
  await check(page, 'full frame window');
  await page.locator('.modal-container .close-area button').click();
  await backToHome(page);

  await openFromHome(page, 'Sprites and fonts');
  await expect(page.locator('.list-item-sprite').first()).toBeVisible();
  await check(page, 'sprite list');
  await page.locator('.list-item-sprite').first().click();
  await expect(page.locator('.modal-container')).toBeVisible();
  await check(page, 'sprite window');
  await page.locator('.modal-container .close-area button').click();
  await backToHome(page);

  await openFromHome(page, 'Settings');
  await check(page, 'settings');
  await backToHome(page);

  // Disabling the checksum changes the ROM, so that unloading it warns
  await openFromHome(page, 'Checksum tool');
  await check(page, 'checksum tool');
  await page.getByRole('button', { name: 'Disable checksum' }).click();
  await expect(page.getByText('The checksum is now disabled.')).toBeVisible();
  await page.locator('.bar-container').getByRole('button', { name: 'Unload ROM' }).click();
  await expect(page.getByText('You have made modifications to this ROM.')).toBeVisible();
  await check(page, 'unload warning');
  await page.locator('.alert-container').getByRole('button', { name: 'Unload ROM' }).click();
  await expect(page.getByText('Drop a WPC Pinball game ROM file here')).toBeVisible();

  // A file that is not a WPC ROM gives an error
  await page.setInputFiles('input[type=file]', {
    name: 'not-a-rom.rom',
    mimeType: 'application/octet-stream',
    buffer: Buffer.alloc(1024),
  });
  await expect(page.locator('.alert-container').getByRole('button', { name: 'OK' })).toBeVisible();
  await check(page, 'error dialog');

  test.info().annotations.push({ type: 'axe', description: JSON.stringify(found) });
});

test('views have a page title, move focus to the heading and describe images', async ({ page }) => {
  test.skip(!romName, `no ROM files found in ${romFolder}`);

  await page.goto('./');
  await expect(page).toHaveTitle('Load ROM – WPC Edit');
  await page.setInputFiles('input[type=file]', join(romFolder, romName));
  await page.getByRole('button', { name: 'I understand and agree' }).click();
  await expect(page).toHaveTitle('Home – WPC Edit');

  await openFromHome(page, 'Full frame graphics');
  await expect(page).toHaveTitle('Full frame graphics – WPC Edit');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  const firstImage = page.locator('.list-item-fullframe').first();
  await expect(firstImage).toHaveAttribute('aria-label', /^Full frame image 0, encoding 0x[0-9A-F]{2}$/);
  await firstImage.click();
  await expect(page.locator('.modal-container [role=img]').first()).toHaveAttribute('aria-label', /^Image 0, encoding 0x[0-9A-F]{2}/);
  await page.keyboard.press('Escape');
  await backToHome(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();

  await openFromHome(page, 'Sprites and fonts');
  await expect(page).toHaveTitle('Sprites and fonts – WPC Edit');
  await expect(page.locator('.list-item-sprite').first()).toHaveAttribute('aria-label', /^Sprite 0x[0-9A-F]{2}.*, table \d+$/);
});
