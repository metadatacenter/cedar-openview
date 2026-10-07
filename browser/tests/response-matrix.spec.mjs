import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// Each OpenView page against each answer the open API can give, first opened directly by each form of
// address, then reached from a folder and left again with Back and Forward. The server answers 401
// for an artifact that is not open and 404 for one that does not exist, and passes on 500 or 503 when
// a service behind it fails. A network failure reaches the page as no answer at all.

const fixture = (name) => JSON.parse(readFileSync(new URL(`../fixtures/${name}.json`, import.meta.url), 'utf8'));
const OWN = 'https://repo.metadatacenter.org/';
const OTHER = 'https://repo.metadatacenter.orgx/';
const heading = (page) => page.locator('cedar-embeddable-editor').getByRole('heading', { level: 1 });
// An element or field page states the artifact's title itself, above what the component draws.
const title = (page) => page.locator('app-artifact-heading h1');
const elementShown = (page) => page.locator('cedar-embeddable-editor').getByRole('paragraph').filter({ hasText: 'The company that manufactures the instrument' });
const fieldShown = (page) => page.locator('cedar-embeddable-field').getByText(fixture('field')['schema:description']);
const PAGES = {
  folder: { collection: 'folders', uuid: '32fc3013-1b73-4a2a-86f7-189f73d3400c', fixture: 'folder', noun: 'folder', shown: (page) => page.locator('.resource').first() },
  template: { collection: 'templates', uuid: 'a8f75474-ca14-4726-a071-acbfa9f8c466', fixture: 'template', noun: 'artifact', shown: heading },
  element: { collection: 'template-elements', uuid: '5d8c2f3e-7a41-4b9c-9e62-1f0a3b7c8d24', fixture: 'element', noun: 'artifact', shown: elementShown },
  field: { collection: 'template-fields', uuid: 'bbc141a6-0e81-4cba-8651-8b61a623bd6c', fixture: 'field', noun: 'artifact', shown: fieldShown },
  instance: { collection: 'template-instances', uuid: '0b6e4d1a-93f2-4c57-8a1e-6d2f7c9b4e13', fixture: 'instance', noun: 'artifact', shown: heading },
};
// The instance fixture is based on the template fixture, which the instance page loads second.
const TEMPLATE_PATH = `/templates/${PAGES.template.uuid}`;
// Each form gives the route's parameter and the identifier the page then asks the open API for.
const FORMS = {
  "this deployment's identity": (c, uuid) => ({ route: encodeURIComponent(`${OWN}${c}/${uuid}`), requested: uuid }),
  'a bare uuid': (_c, uuid) => ({ route: uuid, requested: uuid }),
  "another deployment's identity": (c, uuid) => ({ route: encodeURIComponent(`${OTHER}${c}/${uuid}`), requested: `${OTHER}${c}/${uuid}` }),
};
const ANSWERS = [200, 401, 404, 500, 503, 'a network failure'];

// The open API answers each path it is given, and every other external request is refused.
async function openApi(page, answers) {
  const requested = [];
  await page.route((url) => url.host !== new URL(test.info().project.use.baseURL).host, (route) => route.abort());
  await page.route('https://open.metadatacenter.org/**', (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);
    requested.push(path);
    const answer = path in answers ? answers[path] : 404;
    if (answer === 'a network failure') return route.abort('failed');
    return route.fulfill(typeof answer === 'number' ? { status: answer, json: {} } : { json: answer });
  });
  return requested;
}

// What the error card says for each answer, about the page's own resource or about an instance's template.
function failure(answer, noun, ofTemplate) {
  const title = typeof answer === 'number' ? `Error (${answer})` : 'Error';
  if (answer === 401)
    return [title, ofTemplate
      ? 'The metadata that you are trying to view is open for viewing, but the corresponding template is not.'
      : `The ${noun} that you are trying to view is not open.`];
  if (answer === 404)
    return [title, ofTemplate
      ? 'The metadata that you are trying to view is open for viewing, but the corresponding template does not exist in CEDAR.'
      : `The ${noun} that you are trying to view does not exist in CEDAR.`];
  return [title, ofTemplate
    ? 'CEDAR could not load the template of the metadata that you are trying to view. Please try again later.'
    : `CEDAR could not load the ${noun} that you are trying to view. Please try again later.`];
}

async function expectFailure(page, [title, message]) {
  const card = page.locator('.error-card');
  await expect(card).toHaveCount(1);
  await expect(card.locator('mat-card-title')).toHaveText(title);
  await expect(card.locator('mat-card-content')).toContainText(message);
}

const direct = [];
for (const kind of Object.keys(PAGES))
  for (const form of Object.keys(FORMS))
    for (const answer of ANSWERS)
      for (const templateAnswer of kind === 'instance' && answer === 200 ? ANSWERS : [null])
        direct.push({ kind, form, answer, templateAnswer });

for (const { kind, form, answer, templateAnswer } of direct)
  test(`${kind} page by ${form}, answered ${answer}${templateAnswer ? `, its template answered ${templateAnswer}` : ''}`, async ({ page }) => {
    const { collection, uuid, noun, shown } = PAGES[kind];
    const { route, requested: id } = FORMS[form](collection, uuid);
    const path = `/${collection}/${id}`;
    const answers = { [path]: answer === 200 ? fixture(PAGES[kind].fixture) : answer };
    if (templateAnswer) answers[TEMPLATE_PATH] = templateAnswer === 200 ? fixture('template') : templateAnswer;
    const requested = await openApi(page, answers);
    await page.goto(`/${collection}/${route}`);

    const outcome = templateAnswer ?? answer;
    if (outcome === 200) {
      await expect(shown(page)).toBeVisible();
      await expect(page.locator('.error-card')).toHaveCount(0);
    } else await expectFailure(page, failure(outcome, noun, !!templateAnswer));
    // The page asks for its own resource once, and an instance's page then for its template.
    expect(requested).toEqual(templateAnswer ? [path, TEMPLATE_PATH] : [path]);
  });

// A folder holding one of each kind of resource, and a subfolder holding the template.
const HOME = { uuid: '7c1d9e2a-3b4f-4a5c-8d6e-9f0a1b2c3d4e', name: 'Home' };
const SUB = { uuid: '1e2f3a4b-5c6d-4e7f-8091-a2b3c4d5e6f7', name: 'Sub' };
const entry = (kind, resourceType = kind) => {
  const { collection, uuid } = PAGES[kind];
  const name = kind === 'folder' ? SUB.name : fixture(PAGES[kind].fixture)['schema:name'];
  return { '@id': `${OWN}${collection}/${kind === 'folder' ? SUB.uuid : uuid}`, resourceType, 'schema:name': name };
};
const listing = (trail, resources) => ({
  pathInfo: [{ 'schema:name': '/' }, { 'schema:name': 'Users' }, ...trail.map((name) => ({ 'schema:name': name }))],
  resources,
  totalCount: resources.length,
});
const home = listing([HOME.name], ['folder', 'template', 'element', 'field', 'instance'].map((kind) => entry(kind)));
const sub = listing([HOME.name, SUB.name], [entry('template')]);

async function expectFolder(page, name, count) {
  await expect(page.locator('.folder-path [aria-current="page"]')).toHaveText(name);
  await expect(page.locator('.resource')).toHaveCount(count);
  await expect(page.locator('.error-card')).toHaveCount(0);
}

const arrivals = [];
for (const kind of Object.keys(PAGES)) for (const answer of [200, 401, 500]) arrivals.push({ kind, answer });

for (const { kind, answer } of arrivals)
  test(`${kind} reached from a folder, answered ${answer}, then Back and Forward`, async ({ page }) => {
    const { collection, uuid, noun, shown } = PAGES[kind];
    const target = kind === 'folder' ? SUB.uuid : uuid;
    const answers = {
      [`/folders/${HOME.uuid}`]: home,
      [`/${collection}/${target}`]: answer !== 200 ? answer : kind === 'folder' ? sub : fixture(PAGES[kind].fixture),
      [TEMPLATE_PATH]: kind === 'template' && answer !== 200 ? answer : fixture('template'),
    };
    await openApi(page, answers);
    await page.goto(`/folders/${HOME.uuid}`);
    await expectFolder(page, HOME.name, 5);

    const arrive = async () => {
      await expect(page).toHaveURL(new RegExp(`/${collection}/${target}$`));
      if (answer !== 200) await expectFailure(page, failure(answer, noun, false));
      else if (kind === 'folder') await expectFolder(page, SUB.name, 1);
      else await expect(shown(page)).toBeVisible();
    };
    await page.getByRole('link', { name: entry(kind)['schema:name'], exact: true }).click();
    await arrive();
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`/folders/${HOME.uuid}$`));
    await expectFolder(page, HOME.name, 5);
    await page.goForward();
    await arrive();
  });

// A stored artifact the editor cannot read, such as a template whose child is stored under a reserved
// key, arrives with a 200 and still cannot be shown. The page says so rather than showing nothing.
function withChildKey(template, to) {
  const doc = structuredClone(template);
  const from = doc._ui.order[0];
  // Defined rather than assigned, since assigning to __proto__ would set the prototype instead.
  Object.defineProperty(doc.properties, to, { value: doc.properties[from], enumerable: true, writable: true, configurable: true });
  delete doc.properties[from];
  doc._ui.order = doc._ui.order.map((key) => (key === from ? to : key));
  return doc;
}
const UNREADABLE = 'cannot be displayed, because CEDAR cannot read it.';

for (const key of ['@foo', '__proto__'])
  test(`template page whose child is stored under ${key}`, async ({ page }) => {
    await openApi(page, { [`/templates/${PAGES.template.uuid}`]: withChildKey(fixture('template'), key) });
    await page.goto(`/templates/${PAGES.template.uuid}`);
    await expectFailure(page, ['Error', `The artifact that you are trying to view ${UNREADABLE}`]);
    await expect(heading(page)).toHaveCount(0);
  });

test('element page whose child is stored under a reserved key', async ({ page }) => {
  await openApi(page, { [`/template-elements/${PAGES.element.uuid}`]: withChildKey(fixture('element'), '@foo') });
  await page.goto(`/template-elements/${PAGES.element.uuid}`);
  await expectFailure(page, ['Error', `The artifact that you are trying to view ${UNREADABLE}`]);
  await expect(title(page)).toBeHidden();
});

// The field element has no widget for an input type it does not know, and refuses the field.
test('field page whose input type the editor does not know', async ({ page }) => {
  const field = fixture('field');
  field._ui.inputType = 'no-such-input';
  await openApi(page, { [`/template-fields/${PAGES.field.uuid}`]: field });
  await page.goto(`/template-fields/${PAGES.field.uuid}`);
  await expectFailure(page, ['Error', `The artifact that you are trying to view ${UNREADABLE}`]);
  await expect(title(page)).toBeHidden();
});

// The title gives the kind, and the version and status the artifact states, as the editor words a template's.
for (const [kind, label, provenance] of [
  ['element', 'Preparation instrument', ['Element version 1.0.0', 'Published']],
  ['field', 'Lab ID', ['Field version 0.0.1', 'Draft']],
])
  test(`${kind} page title`, async ({ page }) => {
    const { collection, uuid } = PAGES[kind];
    await openApi(page, { [`/${collection}/${uuid}`]: fixture(PAGES[kind].fixture) });
    await page.goto(`/${collection}/${uuid}`);
    await expect(title(page)).toHaveText(label);
    await expect(page.locator('app-artifact-heading .artifact-provenance span')).toHaveText(provenance);
    // The components' own headers are hidden: the editor's would call the element a template.
    await expect(page.locator('cedar-embeddable-editor, cedar-embeddable-field').getByRole('heading', { level: 1 })).toHaveCount(0);
  });

test('instance page whose template has a child stored under a reserved key', async ({ page }) => {
  await openApi(page, {
    [`/template-instances/${PAGES.instance.uuid}`]: fixture('instance'),
    [TEMPLATE_PATH]: withChildKey(fixture('template'), '@foo'),
  });
  await page.goto(`/template-instances/${PAGES.instance.uuid}`);
  await expectFailure(page, ['Error', `The artifact that you are trying to view ${UNREADABLE}`]);
});

test('a readable element page shows no refusal', async ({ page }) => {
  await openApi(page, { [`/template-elements/${PAGES.element.uuid}`]: fixture('element') });
  await page.goto(`/template-elements/${PAGES.element.uuid}`);
  await expect(elementShown(page)).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.locator('.error-card')).toHaveCount(0);
});

test('a readable field page shows no refusal', async ({ page }) => {
  await openApi(page, { [`/template-fields/${PAGES.field.uuid}`]: fixture('field') });
  await page.goto(`/template-fields/${PAGES.field.uuid}`);
  await expect(fieldShown(page)).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.locator('.error-card')).toHaveCount(0);
});

test('a readable template page shows no refusal', async ({ page }) => {
  await openApi(page, { [`/templates/${PAGES.template.uuid}`]: withChildKey(fixture('template'), 'Renamed child') });
  await page.goto(`/templates/${PAGES.template.uuid}`);
  await expect(heading(page)).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.locator('.error-card')).toHaveCount(0);
});
