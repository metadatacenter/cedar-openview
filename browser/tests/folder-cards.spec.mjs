import { test, expect } from '@playwright/test';
import { ARTIFACTS, FOLDER, artifactAnswers as answers, fixture } from './scenarios.mjs';

// An open folder's cards, measured and labelled as Workspace's grid draws them, and the preview each
// artifact's card opens.

const name = (kind) => fixture(kind)['schema:name'];

// The open API answers each path it is given, and every other external request is refused.
async function openApi(page, answered) {
  await page.route((url) => url.host !== new URL(test.info().project.use.baseURL).host, (route) => route.abort());
  await page.route('https://open.metadatacenter.org/**', (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);
    const answer = path in answered ? answered[path] : 404;
    return route.fulfill(typeof answer === 'number' ? { status: answer, json: {} } : { json: answer });
  });
}

const card = (page, kind) => page.locator('.resource').filter({ has: page.getByRole('link', { name: name(kind), exact: true }) });
const preview = (page) => page.locator('dialog.artifact-preview');

test('folder browsing defers the editor and repeated previews reuse one download', async ({ page }) => {
  const downloads = [];
  page.on('request', request => {
    if (/cedar-embeddable-editor.*\.js/.test(request.url())) downloads.push(request.url());
  });
  await openApi(page, answers());
  await page.goto(`/folders/${FOLDER}`);
  const trigger = page.getByRole('button', { name: `Preview ${name('template')}`, exact: true });
  await expect(trigger).toBeVisible();
  expect(downloads).toEqual([]);
  for (let attempt = 0; attempt < 2; attempt++) {
    await trigger.click();
    await expect(preview(page)).not.toHaveClass(/is-preparing/);
    await expect(preview(page).getByRole('alert')).toHaveCount(0);
    await preview(page).getByRole('button', { name: 'Close preview' }).click();
  }
  expect(downloads).toHaveLength(1);
  expect(downloads[0]).toContain('cedar-embeddable-editor.host-fonts.js');
});

test('a failed editor download uses the preview error and a later preview can retry', async ({ page }) => {
  await openApi(page, answers());
  const bundle = '**/cedar-embeddable-editor.host-fonts.js';
  await page.route(bundle, route => route.abort());
  await page.goto(`/folders/${FOLDER}`);
  const trigger = page.getByRole('button', { name: `Preview ${name('template')}`, exact: true });
  await trigger.click();
  await expect(preview(page).getByRole('alert')).toBeVisible();
  await preview(page).getByRole('button', { name: 'Close preview' }).click();
  await page.unroute(bundle);
  await trigger.click();
  await expect(preview(page)).not.toHaveClass(/is-preparing/);
  await expect(preview(page).getByRole('alert')).toHaveCount(0);
});

test('a versioned card states its version and status beside its icon', async ({ page }) => {
  await openApi(page, answers());
  await page.goto(`/folders/${FOLDER}`);
  await expect(card(page, 'template').locator('.resource-release')).toHaveText('2.0.0 · Draft');
  await expect(card(page, 'element').locator('.resource-release')).toHaveText('1.0.0 · Published');
  await expect(card(page, 'field').locator('.resource-release')).toHaveText('0.0.1 · Draft');
  await expect(card(page, 'instance').locator('.resource-release')).toHaveCount(0);
});

test('a card the server gives no version shows none', async ({ page }) => {
  await openApi(page, { [`/folders/${FOLDER}`]: fixture('folder') });
  await page.goto(`/folders/${FOLDER}`);
  await expect(page.locator('.resource').first()).toBeVisible();
  await expect(page.locator('.resource-release')).toHaveCount(0);
});

test('every artifact card offers a preview, and a folder card none', async ({ page }) => {
  await openApi(page, answers());
  await page.goto(`/folders/${FOLDER}`);
  for (const kind of Object.keys(ARTIFACTS))
    await expect(card(page, kind).getByRole('button', { name: `Preview ${name(kind)}`, exact: true })).toBeVisible();
  await expect(page.locator('.resource').filter({ hasText: 'Assays' }).getByRole('button')).toHaveCount(0);
});

// The listing leaves a column empty on either side once the page is wide enough to keep three columns of cards.
for (const [width, margins] of [[1440, true], [760, false]])
  test(`the listing ${margins ? 'leaves a card column empty on either side' : 'fills the page'} at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openApi(page, { [`/folders/${FOLDER}`]: fixture('folder') });
    await page.goto(`/folders/${FOLDER}`);
    await expect(page.locator('.resource').first()).toBeVisible();
    const { left, right, column } = await page.evaluate(() => {
      const page = document.querySelector('.folder');
      const style = getComputedStyle(page);
      const content = page.getBoundingClientRect();
      const list = document.querySelector('.resources').getBoundingClientRect();
      const card = document.querySelector('.resource').getBoundingClientRect();
      return {
        left: list.left - content.left - parseFloat(style.paddingLeft),
        right: content.right - parseFloat(style.paddingRight) - list.right,
        column: card.width + parseFloat(style.columnGap),
      };
    });
    expect(left).toBeCloseTo(margins ? column : 0, 0);
    expect(right).toBeCloseTo(margins ? column : 0, 0);
  });

for (const kind of Object.keys(ARTIFACTS))
  test(`the ${kind} preview draws the ${kind}, lets a visitor try it, and closes back to its card`, async ({ page }) => {
    await openApi(page, answers());
    await page.goto(`/folders/${FOLDER}`);
    const trigger = page.getByRole('button', { name: `Preview ${name(kind)}`, exact: true });
    await trigger.click();
    const dialog = preview(page);
    await expect(dialog).not.toHaveClass(/is-preparing/);
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(name(kind));
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    await expect(dialog.locator(kind === 'field' ? 'cedar-embeddable-field' : 'cedar-embeddable-editor')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close preview' })).toBeFocused();

    await dialog.getByRole('button', { name: 'Try out' }).click();
    await expect(dialog).not.toHaveClass(/is-preparing/);
    await expect(dialog.getByText('Try it out — nothing is saved.', { exact: false })).toBeVisible();
    await dialog.getByRole('button', { name: 'Back to preview' }).click();
    await expect(dialog).not.toHaveClass(/is-preparing/);
    await expect(dialog.getByRole('button', { name: 'Try out' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

test('the preview of an instance whose template is not open says so', async ({ page }) => {
  await openApi(page, answers({ [`/templates/${ARTIFACTS.template.uuid}`]: 401 }));
  await page.goto(`/folders/${FOLDER}`);
  await page.getByRole('button', { name: `Preview ${name('instance')}`, exact: true }).click();
  await expect(preview(page).getByRole('alert')).toHaveText(
    'This metadata is open for viewing, but its template is not, so it cannot be shown.');
  await expect(preview(page).getByRole('button', { name: 'Try out' })).toHaveCount(0);
});

test('a preview that cannot be read says so', async ({ page }) => {
  await openApi(page, answers({ [`/templates/${ARTIFACTS.template.uuid}`]: 500 }));
  await page.goto(`/folders/${FOLDER}`);
  await page.getByRole('button', { name: `Preview ${name('template')}`, exact: true }).click();
  await expect(preview(page).getByRole('alert')).toHaveText('This preview could not be loaded. Close it and try again.');
  await preview(page).getByRole('button', { name: 'Close preview' }).click();
  await expect(preview(page)).toHaveCount(0);
});
