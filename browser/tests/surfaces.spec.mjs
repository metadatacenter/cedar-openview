import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { surfaceCases, checkSurface } from './surface-contracts.generated.mjs';

const registry = JSON.parse(readFileSync(new URL('../../.ui-surfaces.json', import.meta.url), 'utf8'));
const fixture = (name) => JSON.parse(readFileSync(new URL(`../fixtures/${name}.json`, import.meta.url), 'utf8'));
const folderId = 'https://repo.metadatacenter.org/folders/32fc3013-1b73-4a2a-86f7-189f73d3400c';
const templateId = 'https://repo.metadatacenter.org/templates/a8f75474-ca14-4726-a071-acbfa9f8c466';
const elementId = 'https://repo.metadatacenter.org/template-elements/5d8c2f3e-7a41-4b9c-9e62-1f0a3b7c8d24';
const fieldId = 'https://repo.metadatacenter.org/template-fields/bbc141a6-0e81-4cba-8651-8b61a623bd6c';
const instanceId = 'https://repo.metadatacenter.org/template-instances/0b6e4d1a-93f2-4c57-8a1e-6d2f7c9b4e13';

// The suite never leaves the machine. The open API answers from fixtures, and every other
// external request, the hosted fonts included, is refused.
async function openApi(page, answers) {
  await page.route((url) => url.host !== new URL(test.info().project.use.baseURL).host, (route) => route.abort());
  await page.route('https://open.metadatacenter.org/**', (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);
    const [, answer] = Object.entries(answers).find(([prefix]) => path.startsWith(prefix)) ?? [, 404];
    return route.fulfill(typeof answer === 'number' ? { status: answer, json: {} } : { json: answer });
  });
}

const scenarios = {
  'folder-page': async (page) => {
    await openApi(page, { [`/folders/${folderId}`]: fixture('folder') });
    await page.goto(`/folders/${encodeURIComponent(folderId)}`);
    await expect(page.locator('.resource').first()).toBeVisible();
  },
  'template-page': async (page) => {
    await openApi(page, { [`/templates/${templateId}`]: fixture('template') });
    await page.goto(`/templates/${encodeURIComponent(templateId)}`);
    // The form's own title says the page has drawn.
    await expect(page.locator('cedar-embeddable-editor').getByRole('heading', { level: 1 })).toBeVisible();
  },
  'unauthorized-page': async (page) => {
    await openApi(page, { [`/folders/${folderId}`]: 401 });
    await page.goto(`/folders/${encodeURIComponent(folderId)}`);
    await expect(page.locator('.error-card')).toBeVisible();
  },
  'not-found-page': async (page) => {
    await openApi(page, { [`/folders/${folderId}`]: 404 });
    await page.goto(`/folders/${encodeURIComponent(folderId)}`);
    await expect(page.locator('.error-card')).toBeVisible();
  },
  'empty-folder-page': async (page) => {
    await openApi(page, { [`/folders/${folderId}`]: { ...fixture('folder'), resources: [], totalCount: 0 } });
    await page.goto(`/folders/${encodeURIComponent(folderId)}`);
    await expect(page.locator('.empty')).toBeVisible();
  },
  // An element or a field page shows the legend.
  'element-page': async (page) => {
    await openApi(page, { [`/template-elements/${elementId}`]: fixture('element') });
    await page.goto(`/template-elements/${encodeURIComponent(elementId)}`);
    await expect(page.locator('.legend')).toBeVisible();
  },
  'field-page': async (page) => {
    await openApi(page, { [`/template-fields/${fieldId}`]: fixture('field') });
    await page.goto(`/template-fields/${encodeURIComponent(fieldId)}`);
    await expect(page.locator('.legend')).toBeVisible();
  },
  // An open instance whose template is not open says so where the form would be.
  'template-not-open-page': async (page) => {
    await openApi(page, { [`/template-instances/${instanceId}`]: fixture('instance'), [`/templates/${templateId}`]: 401 });
    await page.goto(`/template-instances/${encodeURIComponent(instanceId)}`);
    await expect(page.locator('.error-card')).toBeVisible();
  },
  // An instance page loads the instance, then the template the instance names.
  'instance-page': async (page) => {
    await openApi(page, { [`/template-instances/${instanceId}`]: fixture('instance'), [`/templates/${templateId}`]: fixture('template') });
    await page.goto(`/template-instances/${encodeURIComponent(instanceId)}`);
    await expect(page.locator('cedar-embeddable-editor').getByRole('heading', { level: 1 })).toBeVisible();
  },
};

for (const { surface, state, width, title } of surfaceCases(registry, scenarios))
  test(title, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await scenarios[surface.scenario](page);
    await expect(page.locator('.main__footer')).toBeVisible();
    await checkSurface(page, surface, state, expect, testInfo);
  });
