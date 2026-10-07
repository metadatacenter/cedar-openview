import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// The folder page shows its text in each language OpenView has, never the translation keys, even in
// a browser that still holds the translation files an earlier build served. Production served them
// with no cache directive, so browsers kept their copies for weeks without asking again. The copies
// here are the files as they stood before the folder page's keys were added; the English one is
// byte for byte what such a browser held.

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const fixture = (name) => read(`../fixtures/${name}.json`);
const OWN = 'https://repo.metadatacenter.org/';
const HOME = '7c1d9e2a-3b4f-4a5c-8d6e-9f0a1b2c3d4e';
const EMPTY = '2a3b4c5d-6e7f-4809-9a1b-2c3d4e5f6a7b';
const KINDS = ['folder', 'template', 'element', 'field', 'instance'];
const listing = (resources) => ({
  pathInfo: [{ 'schema:name': '/' }, { 'schema:name': 'Users' }, { 'schema:name': 'Home' }],
  resources,
  totalCount: resources.length,
});
const home = listing(KINDS.map((kind, i) => ({ '@id': `${OWN}${kind}s/${i}`, resourceType: kind, 'schema:name': `A ${kind}` })));

const LANGUAGES = {
  en: {
    title: 'CEDAR OpenView',
    path: 'Folder path',
    types: ['Folder', 'Template', 'Element', 'Field', 'Instance'],
    total: 'Total count: 5',
    empty: ['The folder is empty', 'The folder is accessible, but does not contain any artifacts or folders', 'Total count: 0'],
  },
  hu: {
    title: 'CEDAR OpenView',
    path: 'Mappa elérési útja',
    types: ['Mappa', 'Sablon', 'Elem', 'Mező', 'Példány'],
    total: 'Összesen: 5',
    empty: ['A mappa üres', 'A mappa elérhető, de nem tartalmaz sem erőforrást, sem mappát', 'Összesen: 0'],
  },
};

// Every key the application translates, as the page would show it untranslated.
const keys = (translations, prefix = '') => Object.entries(translations).flatMap(([name, value]) =>
  typeof value === 'string' ? [prefix + name] : keys(value, `${prefix}${name}.`));
const KEYS = keys(read('../../cedar-openview-src/src/app/i18n/en.json'));

async function open(page, language, folder) {
  const origin = test.info().project.use.baseURL;
  await page.route((url) => url.origin !== origin, (route) => route.abort());
  await page.route('https://open.metadatacenter.org/**', (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);
    if (path === `/folders/${HOME}`) return route.fulfill({ json: home });
    if (path === `/folders/${EMPTY}`) return route.fulfill({ json: listing([]) });
    return route.fulfill({ status: 404, json: {} });
  });
  // The browser answers each address it holds from its cache, so only those exact addresses get the old copy.
  for (const held of Object.keys(LANGUAGES))
    await page.route(new URL(`/assets/i18n/${held}.json`, origin).href, (route) =>
      route.fulfill({ json: fixture(`stale-i18n/${held}`) }));
  await page.addInitScript((choice) => localStorage.setItem('language', choice), language);
  await page.goto(`/folders/${folder}`);
}

async function expectNoKeys(page) {
  const shown = await page.evaluate(() => [
    document.title,
    document.body.innerText,
    ...[...document.querySelectorAll('*')].flatMap((element) => [...element.attributes].map((attribute) => attribute.value)),
  ].join('\n'));
  expect(KEYS.filter((key) => shown.includes(key))).toEqual([]);
}

for (const [language, text] of Object.entries(LANGUAGES)) {
  test(`folder page in ${language}, with the old translations cached`, async ({ page }) => {
    await open(page, language, HOME);
    await expect(page.locator('.resource-meta')).toHaveText(text.types);
    await expect(page.locator('.folder-path')).toHaveAttribute('aria-label', text.path);
    await expect(page.locator('.folder-count')).toHaveText(text.total);
    await expect(page).toHaveTitle(text.title);
    await expectNoKeys(page);
  });

  test(`empty folder page in ${language}, with the old translations cached`, async ({ page }) => {
    await open(page, language, EMPTY);
    await expect(page.locator('.empty p, .folder-count')).toHaveText(text.empty);
    await expect(page).toHaveTitle(text.title);
    await expectNoKeys(page);
  });
}
