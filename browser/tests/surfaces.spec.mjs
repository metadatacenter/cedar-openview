import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test, expect } from '@playwright/test';
import { surfaceCases, checkSurface } from './surface-contracts.generated.mjs';
import { scenarios } from './scenarios.mjs';

const registry = JSON.parse(readFileSync(new URL('../../.ui-surfaces.json', import.meta.url), 'utf8'));

for (const { surface, state, width, title } of surfaceCases(registry, scenarios))
  test(title, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await scenarios[surface.scenario](page);
    await expect(page.locator('.main__footer')).toBeVisible();
    await checkSurface(page, surface, state, expect, testInfo);
    if (surface.id === 'openview.folder')
      await testInfo.attach('folder appearance', { body: await page.screenshot(), contentType: 'image/png' });
  });

test('body text contract detects local line-height drift', async ({ page }, testInfo) => {
  await scenarios['folder-label'](page);
  const surface = registry.surfaces.find((entry) => entry.id === 'openview.resource-name');
  await checkSurface(page, surface, 'open', expect, testInfo);
  await page.locator(surface.selector).evaluate((element) => { element.style.lineHeight = '22px'; });
  await assert.rejects(() => checkSurface(page, surface, 'open', expect, testInfo), /line-height must use/);
});

test('header motion follows the shared curve and reduced-motion preference', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await scenarios['folder-page'](page);
  const surface = registry.surfaces.find((entry) => entry.id === 'openview.header-motion');
  await checkSurface(page, surface, 'open', expect, testInfo);
  const header = page.locator(surface.selector);
  await header.evaluate((element) => { element.style.animationTimingFunction = 'ease-in-out'; });
  await assert.rejects(() => checkSurface(page, surface, 'open', expect, testInfo), /animation-timing-function must use/);
  await header.evaluate((element) => { element.style.removeProperty('animation-timing-function'); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => header.evaluate((element) => parseFloat(getComputedStyle(element).animationDuration))).toBeLessThanOrEqual(0.001);
  await expect.poll(() => header.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(0.001);
});

// The metadatacenter.org control is a link, so it says where it goes. It opens in a new tab, as the
// button it replaced did, and draws as that button did, with no underline.
test('the header links to metadatacenter.org', async ({ page }) => {
  await scenarios['folder-page'](page);
  const link = page.locator('.button-container').getByRole('link', { name: 'metadatacenter.org', exact: true });
  await expect(link).toHaveAttribute('href', 'http://metadatacenter.org');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(page.getByRole('button', { name: 'metadatacenter.org' })).toHaveCount(0);
  for (const state of ['rest', 'hover']) {
    if (state === 'hover') await link.hover();
    expect(await link.evaluate((element) => getComputedStyle(element).textDecorationLine), state).toBe('none');
  }
});

// The tree in the wordmark and the end of the metadatacenter.org link stand the same distance in
// from their edges, whether the header holds them on one line or on two.
for (const width of [1280, 600])
  test(`the header insets the wordmark and the link equally at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await scenarios['folder-page'](page);
    const insets = await page.evaluate(() => {
      // The image carries clear space left of the tree, so the tree's first column is found in its pixels.
      const image = document.querySelector('.cedar__logo img');
      const canvas = Object.assign(document.createElement('canvas'), {
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const inked = (column) =>
        Array.from({ length: canvas.height }, (_, row) => (row * canvas.width + column) * 4).some(
          (index) => data[index + 3] > 16 && data[index] < 240,
        );
      let column = 0;
      while (!inked(column)) column++;
      const box = image.getBoundingClientRect();
      const label = document.createRange();
      label.selectNodeContents(document.querySelector('.button-container .mdc-button__label'));
      return {
        tree: box.left + (column * box.width) / canvas.width,
        link: innerWidth - label.getBoundingClientRect().right,
      };
    });
    expect(Math.abs(insets.tree - insets.link)).toBeLessThanOrEqual(1);
    expect(insets.link).toBeCloseTo(24, 0);
  });
