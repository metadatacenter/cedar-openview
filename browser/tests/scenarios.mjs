import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// The pages and answers several specs open: the surface registry's scenarios, a folder holding one
// artifact of each kind, and the further states the accessibility and layout checks reach.

export const fixture = (name) => JSON.parse(readFileSync(new URL(`../fixtures/${name}.json`, import.meta.url), 'utf8'));
const folderId = 'https://repo.metadatacenter.org/folders/32fc3013-1b73-4a2a-86f7-189f73d3400c';
const templateId = 'https://repo.metadatacenter.org/templates/a8f75474-ca14-4726-a071-acbfa9f8c466';
const elementId = 'https://repo.metadatacenter.org/template-elements/5d8c2f3e-7a41-4b9c-9e62-1f0a3b7c8d24';
const fieldId = 'https://repo.metadatacenter.org/template-fields/bbc141a6-0e81-4cba-8651-8b61a623bd6c';
const instanceId = 'https://repo.metadatacenter.org/template-instances/0b6e4d1a-93f2-4c57-8a1e-6d2f7c9b4e13';
// OpenView asks the open API for an identity on its own deployment by the collection and uuid alone.
const api = (id) => id.replace('https://repo.metadatacenter.org', '');

// The suite never leaves the machine. The open API answers from fixtures, and every other
// external request, the hosted fonts included, is refused.
export async function openApi(page, answers) {
  await page.route((url) => url.host !== new URL(test.info().project.use.baseURL).host, (route) => route.abort());
  await page.route('https://open.metadatacenter.org/**', (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);
    const [, answer] = Object.entries(answers).find(([prefix]) => path.startsWith(prefix)) ?? [, 404];
    return route.fulfill(typeof answer === 'number' ? { status: answer, json: {} } : { json: answer });
  });
}

export const scenarios = {
  'folder-label': async (page) => {
    await openApi(page, { [api(folderId)]: {
      ...fixture('folder'), totalCount: 1,
      resources: [{ resourceType: 'folder', '@id': folderId, 'schema:name': 'Shared folder' }],
    } });
    await page.goto(`/folders/${encodeURIComponent(folderId)}`);
    await expect(page.locator('.resource-name')).toHaveText('Shared folder');
  },
  'folder-page': async (page) => {
    await openApi(page, { [api(folderId)]: fixture('folder') });
    await page.goto(`/folders/${encodeURIComponent(folderId)}`);
    await expect(page.locator('.resource').first()).toBeVisible();
  },
  // The preview a card opens, once the editor has drawn the artifact in it.
  'artifact-preview': async (page) => {
    await openApi(page, { [api(folderId)]: fixture('folder'), [api(templateId)]: fixture('template') });
    await page.goto(`/folders/${encodeURIComponent(folderId)}`);
    await page.getByRole('button', { name: `Preview ${fixture('template')['schema:name']}`, exact: true }).click();
    await expect(page.locator('dialog.artifact-preview')).not.toHaveClass(/is-preparing/);
  },
  'template-page': async (page) => {
    await openApi(page, { [api(templateId)]: fixture('template') });
    await page.goto(`/templates/${encodeURIComponent(templateId)}`);
    // The form's own title says the page has drawn.
    await expect(page.locator('cedar-embeddable-editor').getByRole('heading', { level: 1 })).toBeVisible();
  },
  'unauthorized-page': async (page) => {
    await openApi(page, { [api(folderId)]: 401 });
    await page.goto(`/folders/${encodeURIComponent(folderId)}`);
    await expect(page.locator('.error-card')).toBeVisible();
  },
  'not-found-page': async (page) => {
    await openApi(page, { [api(folderId)]: 404 });
    await page.goto(`/folders/${encodeURIComponent(folderId)}`);
    await expect(page.locator('.error-card')).toBeVisible();
  },
  'empty-folder-page': async (page) => {
    await openApi(page, { [api(folderId)]: { ...fixture('folder'), resources: [], totalCount: 0 } });
    await page.goto(`/folders/${encodeURIComponent(folderId)}`);
    await expect(page.locator('.empty')).toBeVisible();
  },
  // An element page titles the element and draws it as a form.
  'element-page': async (page) => {
    await openApi(page, { [api(elementId)]: fixture('element') });
    await page.goto(`/template-elements/${encodeURIComponent(elementId)}`);
    await expect(page.locator('app-artifact-heading h1')).toHaveText(fixture('element')['schema:name']);
    await expect(page.locator('cedar-embeddable-editor').getByRole('paragraph').filter({ hasText: 'The company that manufactures the instrument' })).toBeVisible();
  },
  // A field page titles the field by its label and draws the field.
  'field-page': async (page) => {
    await openApi(page, { [api(fieldId)]: fixture('field') });
    await page.goto(`/template-fields/${encodeURIComponent(fieldId)}`);
    await expect(page.locator('app-artifact-heading h1')).toHaveText(fixture('field')['skos:prefLabel']);
    await expect(page.locator('cedar-embeddable-field').getByText(fixture('field')['schema:description'])).toBeVisible();
  },
  // An open instance whose template is not open says so where the form would be.
  'template-not-open-page': async (page) => {
    await openApi(page, { [api(instanceId)]: fixture('instance'), [api(templateId)]: 401 });
    await page.goto(`/template-instances/${encodeURIComponent(instanceId)}`);
    await expect(page.locator('.error-card')).toBeVisible();
  },
  // An instance page loads the instance, then the template the instance names.
  'instance-page': async (page) => {
    await openApi(page, { [api(instanceId)]: fixture('instance'), [api(templateId)]: fixture('template') });
    await page.goto(`/template-instances/${encodeURIComponent(instanceId)}`);
    await expect(page.locator('cedar-embeddable-editor').getByRole('heading', { level: 1 })).toBeVisible();
  },
};

const OWN = 'https://repo.metadatacenter.org/';
export const FOLDER = '32fc3013-1b73-4a2a-86f7-189f73d3400c';
export const ARTIFACTS = {
  template: { collection: 'templates', uuid: 'a8f75474-ca14-4726-a071-acbfa9f8c466' },
  element: { collection: 'template-elements', uuid: '5d8c2f3e-7a41-4b9c-9e62-1f0a3b7c8d24' },
  field: { collection: 'template-fields', uuid: 'bbc141a6-0e81-4cba-8651-8b61a623bd6c' },
  instance: { collection: 'template-instances', uuid: '0b6e4d1a-93f2-4c57-8a1e-6d2f7c9b4e13' },
};

// A folder holding one of each kind, as the server summarizes them: a field, element or template also
// states its version and publication status.
function artifactListing() {
  const artifacts = Object.entries(ARTIFACTS).map(([kind, { collection, uuid }]) => {
    const { 'pav:version': version, 'bibo:status': status } = fixture(kind);
    return {
      resourceType: kind,
      '@id': `${OWN}${collection}/${uuid}`,
      'schema:name': fixture(kind)['schema:name'],
      ...(kind === 'instance' ? {} : { 'pav:version': version, 'bibo:status': status }),
    };
  });
  return {
    ...fixture('folder'),
    totalCount: artifacts.length + 1,
    resources: [{ resourceType: 'folder', '@id': `${OWN}folders/6f0c1e2a-4b3d-4e5f-8a9b-0c1d2e3f4a5b`, 'schema:name': 'Assays' }, ...artifacts],
  };
}

// The open API's answer for that folder and each artifact in it, with `overrides` in their place.
export function artifactAnswers(overrides = {}) {
  return {
    [`/folders/${FOLDER}`]: artifactListing(),
    ...Object.fromEntries(Object.entries(ARTIFACTS).map(([kind, { collection, uuid }]) => [`/${collection}/${uuid}`, fixture(kind)])),
    ...overrides,
  };
}

/** The hosts whose content CEE's own suites measure: the embeddable editor and its field element. */
export const EMBEDDED = ['cedar-embeddable-editor', 'cedar-embeddable-field'];

const name = (kind) => fixture(kind)['schema:name'];
export const preview = (page) => page.locator('dialog.artifact-preview');

/** The folder of one artifact of each kind, `overrides` answered in place of those artifacts. */
export async function artifactFolder(page, overrides) {
  await openApi(page, artifactAnswers(overrides));
  await page.goto(`/folders/${FOLDER}`);
  await expect(page.locator('.resource-release').first()).toBeVisible();
}

/** The preview of `kind` from that folder, once it has stopped preparing. */
async function previewOf(page, kind, overrides) {
  await artifactFolder(page, overrides);
  await page.getByRole('button', { name: `Preview ${name(kind)}`, exact: true }).click();
  await expect(preview(page)).not.toHaveClass(/is-preparing/);
}

/**
 * The states beyond the registry's scenarios that the browser specs reach: the folder of one artifact
 * of each kind, the error cards, and the artifact preview in each of its modes.
 */
export const views = {
  'artifact folder': (page) => artifactFolder(page),
  'folder in Hungarian': async (page) => {
    await page.addInitScript(() => localStorage.setItem('language', 'hu'));
    await scenarios['folder-page'](page);
    await expect(page.locator('.folder-path')).toHaveAttribute('aria-label', 'Mappa elérési útja');
  },
  'folder that fails': async (page) => {
    await openApi(page, { [`/folders/${FOLDER}`]: 503 });
    await page.goto(`/folders/${FOLDER}`);
    await expect(page.locator('.error-card mat-card-title')).toHaveText('Error (503)');
  },
  'unreadable field': async (page) => {
    const field = fixture('field');
    field._ui.inputType = 'no-such-input';
    await openApi(page, { [`/${ARTIFACTS.field.collection}/${ARTIFACTS.field.uuid}`]: field });
    await page.goto(`/${ARTIFACTS.field.collection}/${ARTIFACTS.field.uuid}`);
    await expect(page.locator('.error-card mat-card-content')).toContainText('cannot be displayed');
  },
  // The template is never answered, so the preview stays preparing.
  'preparing preview': async (page) => {
    await artifactFolder(page);
    await page.route('https://open.metadatacenter.org/templates/**', () => {});
    await page.getByRole('button', { name: `Preview ${name('template')}`, exact: true }).click();
    await expect(preview(page).locator('.dialog-preparing-status [role="status"]')).toBeVisible();
  },
  'element preview': (page) => previewOf(page, 'element'),
  'field preview': (page) => previewOf(page, 'field'),
  'instance preview': (page) => previewOf(page, 'instance'),
  'try out': async (page) => {
    await scenarios['artifact-preview'](page);
    await preview(page).getByRole('button', { name: 'Try out', exact: true }).click();
    await expect(preview(page)).not.toHaveClass(/is-preparing/);
    await expect(preview(page).getByRole('status')).toBeVisible();
  },
  'preview of an instance whose template is not open': async (page) => {
    await previewOf(page, 'instance', { [`/templates/${ARTIFACTS.template.uuid}`]: 401 });
    await expect(preview(page).getByRole('alert')).toBeVisible();
  },
  'preview that cannot be read': async (page) => {
    await previewOf(page, 'template', { [`/templates/${ARTIFACTS.template.uuid}`]: 500 });
    await expect(preview(page).getByRole('alert')).toBeVisible();
  },
};
