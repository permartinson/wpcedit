/**
 * Keyboard-only test: the app is used with Tab, Shift+Tab, Enter, Space,
 * Esc and the arrow keys only, never the mouse (WCAG 2.1.1 Keyboard,
 * 2.1.2 No Keyboard Trap, 2.4.3 Focus Order). The ROM file itself is put in
 * the file field by the test, since the system file dialog is outside the app.
 *
 * Runs with Fish Tales and Medieval Madness if they are there. ROM files are
 * never committed. They are read from WPCEDIT_ROMS or ../js/wpcedit.js/roms.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const romFolder = resolve(process.env.WPCEDIT_ROMS ?? join(import.meta.dirname, '../../../js/wpcedit.js/roms'));
const romFiles = existsSync(romFolder) ? readdirSync(romFolder).filter((name) => /\.rom$/i.test(name)).sort() : [];
const sha1 = (data) => createHash('sha1').update(data).digest('hex');
const games = { ab323980b9: 'Fish Tales', '3922df00e7': 'Medieval Madness' };

// The name of the element that has focus, as a screen reader would read it
async function focusedName(page) {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!element || element === document.body) return '';
    const labelledBy = element.getAttribute('aria-labelledby');
    return (
      element.getAttribute('aria-label') ??
      (labelledBy && document.getElementById(labelledBy)?.textContent) ??
      element.textContent
    ).trim().replace(/\s+/g, ' ');
  });
}

// Press Tab until the element with this name has focus
async function tabTo(page, name, { max = 80, key = 'Tab' } = {}) {
  const seen = [];
  for (let i = 0; i < max; i++) {
    await page.keyboard.press(key);
    const focused = await focusedName(page);
    if (typeof name === 'string' ? focused === name : name.test(focused)) return;
    seen.push(focused);
  }
  throw new Error(`"${name}" not reached with ${key}. Focus went through:\n${seen.join('\n')}`);
}

async function viewHasLoaded(page, title) {
  await expect(page).toHaveTitle(`${title} – WPC Edit`);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.waitForFunction(() => document.getAnimations().length === 0);
}

// Tab around a whole round in an open window: focus must stay inside it
async function focusStaysInWindow(page) {
  const window = page.locator('[role=dialog]');
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    expect(await window.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await window.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
}

for (const [id, game] of Object.entries(games)) {
  const romName = romFiles.find((name) => sha1(readFileSync(join(romFolder, name))).startsWith(id));

  test(`${game} can be used with the keyboard only`, async ({ page }) => {
    test.skip(!romName, `${game} not found in ${romFolder}`);
    const title = page.locator('.modal-container h2, .modal-container [id$=-window-title]').first();

    // 1. The file field on the home view
    await page.goto('./');
    await expect(page).toHaveTitle('Load ROM – WPC Edit');
    await tabTo(page, 'Choose a WPC Pinball game ROM file');
    await page.locator('input[type=file]').setInputFiles(join(romFolder, romName));

    // 2. The disclaimer: focus is inside it, Esc does not close it
    const agree = page.getByRole('button', { name: 'I understand and agree' });
    await expect(agree).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(agree).toBeVisible();
    await tabTo(page, 'I understand and agree');
    await page.keyboard.press('Enter');
    await expect(page).toHaveTitle('Home – WPC Edit');

    // 3. Full frame graphics
    await tabTo(page, 'Full frame graphics');
    await page.keyboard.press('Enter');
    await viewHasLoaded(page, 'Full frame graphics');

    // 4. Image 2 opens with Enter, focus moves into the window
    await tabTo(page, /^Full frame image 2,/);
    await page.keyboard.press('Enter');
    await expect(page.locator('[role=dialog]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close' })).toBeFocused();
    await expect(page.locator('#app')).toHaveAttribute('inert', '');

    // 5. Tab around: focus never leaves the window
    await focusStaysInWindow(page);

    // 6. Arrow keys step through the images, Esc closes
    const before = await title.textContent();
    await page.keyboard.press('ArrowRight');
    await expect(title).not.toHaveText(before);
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(title).toHaveText(before);
    await page.keyboard.press('Escape');
    await expect(page.locator('[role=dialog]')).toBeHidden();
    expect(await focusedName(page)).toMatch(/^Full frame image 2,/);

    // Back to the home view with the Back button
    await tabTo(page, 'Back', { key: 'Shift+Tab' });
    await page.keyboard.press('Enter');
    await viewHasLoaded(page, 'Home');

    // 7. Sprites: open one, step with the arrows, move it with the buttons
    await tabTo(page, 'Sprites and fonts');
    await page.keyboard.press('Enter');
    await viewHasLoaded(page, 'Sprites and fonts');
    await tabTo(page, /^Sprite 0x[0-9A-F]{2}.*, table 0$/);
    await page.keyboard.press('Enter');
    await expect(page.locator('[role=dialog]')).toBeVisible();
    await focusStaysInWindow(page);
    const sprite = await title.textContent();
    await page.keyboard.press('ArrowRight');
    await expect(title).not.toHaveText(sprite);
    await page.keyboard.press('ArrowLeft');
    await expect(title).toHaveText(sprite);
    const position = page.locator('.modal-container .position-container').first();
    const positionBefore = await position.textContent();
    await tabTo(page, /^Move .*right$/);
    await page.keyboard.press('Enter');
    await expect(position).not.toHaveText(positionBefore);
    await page.keyboard.press('Escape');
    await expect(page.locator('[role=dialog]')).toBeHidden();

    // 8. Change the ROM (disable the checksum), then unload it
    await tabTo(page, 'Back', { key: 'Shift+Tab' });
    await page.keyboard.press('Enter');
    await viewHasLoaded(page, 'Home');
    await tabTo(page, 'Checksum tool');
    await page.keyboard.press('Enter');
    await viewHasLoaded(page, 'Checksum tool');
    await tabTo(page, 'Disable checksum');
    await page.keyboard.press('Enter');
    await expect(page.getByText('The checksum is now disabled.')).toBeVisible();
    await tabTo(page, 'Unload ROM');
    await page.keyboard.press('Enter');
    const warning = page.locator('[role=alertdialog]');
    await expect(warning).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(warning).toBeHidden();
    expect(await focusedName(page)).toBe('Unload ROM');
    await page.keyboard.press('Enter');
    await expect(warning).toBeVisible();
    await tabTo(page, 'Unload ROM');
    await page.keyboard.press('Enter');
    await expect(page).toHaveTitle('Load ROM – WPC Edit');
  });
}
