import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// No page reads data from its own origin at a fixed address. Production sends no cache directive
// with OpenView's files, so a browser can answer such an address for weeks from the copy an earlier
// build served, as it did with the translations. OpenView's translations and configuration are
// compiled into the bundle instead, whose name changes with its content.

const fixture = (name) => JSON.parse(readFileSync(new URL(`../fixtures/${name}.json`, import.meta.url), 'utf8'));
const TEMPLATE = '/templates/a8f75474-ca14-4726-a071-acbfa9f8c466';
const editorHeading = (page) => page.locator('cedar-embeddable-editor').getByRole('heading', { level: 1 });
const PAGES = {
  folder: {
    answers: { '/folders/32fc3013-1b73-4a2a-86f7-189f73d3400c': fixture('folder') },
    shown: (page) => page.locator('.resource').first(),
  },
  template: { answers: { [TEMPLATE]: fixture('template') }, shown: editorHeading },
  element: {
    answers: { '/template-elements/5d8c2f3e-7a41-4b9c-9e62-1f0a3b7c8d24': fixture('element') },
    shown: (page) => page.locator('cedar-embeddable-editor').getByRole('paragraph').filter({ hasText: 'The company that manufactures the instrument' }),
  },
  field: {
    answers: { '/template-fields/bbc141a6-0e81-4cba-8651-8b61a623bd6c': fixture('field') },
    shown: (page) => page.locator('cedar-embeddable-field').getByText(fixture('field')['schema:description']),
  },
  instance: {
    answers: { '/template-instances/0b6e4d1a-93f2-4c57-8a1e-6d2f7c9b4e13': fixture('instance'), [TEMPLATE]: fixture('template') },
    shown: editorHeading,
  },
};

for (const [kind, { answers, shown }] of Object.entries(PAGES))
  test(`${kind} page reads no data from a fixed address`, async ({ page }) => {
    const origin = test.info().project.use.baseURL;
    const read = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.origin === origin && url.pathname.endsWith('.json')) read.push(url.pathname);
    });
    await page.route((url) => url.origin !== origin, (route) => route.abort());
    await page.route('https://open.metadatacenter.org/**', (route) => {
      const path = decodeURIComponent(new URL(route.request().url()).pathname);
      return route.fulfill(path in answers ? { json: answers[path] } : { status: 404, json: {} });
    });
    await page.goto(Object.keys(answers)[0]);
    await expect(shown(page)).toBeVisible();
    await expect(page.locator('.error-card')).toHaveCount(0);
    expect(read).toEqual([]);
  });
