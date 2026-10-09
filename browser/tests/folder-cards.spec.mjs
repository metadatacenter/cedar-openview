import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// An open folder's cards, measured and labelled as Workspace's grid draws them, and the preview each
// artifact's card opens.

const fixture = (name) => JSON.parse(readFileSync(new URL(`../fixtures/${name}.json`, import.meta.url), 'utf8'));
const OWN = 'https://repo.metadatacenter.org/';
const FOLDER = '32fc3013-1b73-4a2a-86f7-189f73d3400c';
const ARTIFACTS = {
  template: { collection: 'templates', uuid: 'a8f75474-ca14-4726-a071-acbfa9f8c466' },
  element: { collection: 'template-elements', uuid: '5d8c2f3e-7a41-4b9c-9e62-1f0a3b7c8d24' },
  field: { collection: 'template-fields', uuid: 'bbc141a6-0e81-4cba-8651-8b61a623bd6c' },
  instance: { collection: 'template-instances', uuid: '0b6e4d1a-93f2-4c57-8a1e-6d2f7c9b4e13' },
};
const name = (kind) => fixture(kind)['schema:name'];

// A folder holding one of each kind, as the server summarizes them: a field, element or template also
// states its version and publication status.
function folder() {
  const artifacts = Object.entries(ARTIFACTS).map(([kind, { collection, uuid }]) => {
    const { 'pav:version': version, 'bibo:status': status } = fixture(kind);
    return {
      resourceType: kind,
      '@id': `${OWN}${collection}/${uuid}`,
      'schema:name': name(kind),
      ...(kind === 'instance' ? {} : { 'pav:version': version, 'bibo:status': status }),
    };
  });
  return {
    ...fixture('folder'),
    totalCount: artifacts.length + 1,
    resources: [{ resourceType: 'folder', '@id': `${OWN}folders/6f0c1e2a-4b3d-4e5f-8a9b-0c1d2e3f4a5b`, 'schema:name': 'Assays' }, ...artifacts],
  };
}

function answers(overrides = {}) {
  return {
    [`/folders/${FOLDER}`]: folder(),
    ...Object.fromEntries(Object.entries(ARTIFACTS).map(([kind, { collection, uuid }]) => [`/${collection}/${uuid}`, fixture(kind)])),
    ...overrides,
  };
}

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
