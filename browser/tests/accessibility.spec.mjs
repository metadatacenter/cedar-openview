/** Safari on macOS uses Option-Tab to include every control with its default keyboard settings. */
function tabKey(page, key = 'Tab') {
  return process.platform === 'darwin' && page.context().browser()?.browserType().name() === 'webkit'
    ? `Alt+${key}`
    : key;
}

import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { surfaceCases } from './surface-contracts.generated.mjs';
import { EMBEDDED, artifactFolder, fixture, preview, scenarios, views } from './scenarios.mjs';

/**
 * Automated WCAG checks over OpenView's states.
 *
 * The rules are every rule axe-core tags for WCAG 2.0, 2.1 and 2.2 at levels A and AA, as in
 * Workspace's, the designer's, the term picker's and CEE's gates. A rule engine cannot decide focus
 * order or where focus returns, so folder-cards.spec.mjs asserts the preview's focus handling.
 */
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * WCAG 2.1's Label in Name, criterion 2.5.3: a control's accessible name contains the text it shows,
 * so that speech input reaches it by its visible label. axe-core's rule for it is experimental, and
 * a tag selection leaves experimental rules out, so the scan enables it by name beside the tags.
 */
const LABEL_IN_NAME = 'label-content-name-mismatch';

const registry = JSON.parse(readFileSync(new URL('../../.ui-surfaces.json', import.meta.url), 'utf8'));
const name = (kind) => fixture(kind)['schema:name'];
const narrow = (open) => async (page) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await open(page);
};

/**
 * Each state the gate scans. Every scenario the surface registry opens is scanned at the widths its
 * surfaces are checked at, and the rest are the dialogs, cards and controls the other specs reach.
 */
const states = {};
for (const { surface, width } of surfaceCases(registry, scenarios)) {
  const state = `${surface.scenario} at ${width}`;
  if (state in states) continue;
  states[state] = async (page) => {
    await page.setViewportSize({ width, height: 1000 });
    await scenarios[surface.scenario](page);
  };
}
Object.assign(states, views, {
  'narrow artifact folder': narrow(views['artifact folder']),
  'narrow try out': narrow(views['try out']),
});

/**
 * One control of each kind, found in the state that shows it. Each is scanned once with the pointer
 * resting on it and once focused from the keyboard, since both change how it is drawn and both can
 * open its tooltip.
 */
const controls = {
  'card link': [artifactFolder, (page) => page.getByRole('link', { name: name('template'), exact: true })],
  'preview button': [artifactFolder, (page) => page.getByRole('button', { name: `Preview ${name('template')}`, exact: true })],
  'wordmark link': [scenarios['folder-page'], (page) => page.locator('.cedar__logo a')],
  'header link': [scenarios['folder-page'], (page) => page.getByRole('link', { name: 'metadatacenter.org', exact: true })],
  'footer link': [scenarios['folder-page'], (page) => page.getByRole('link', { name: 'Visit the CEDAR website', exact: true })],
  'login button': [scenarios['unauthorized-page'], (page) => page.getByRole('button', { name: /^Login to CEDAR/ })],
  'try out button': [scenarios['artifact-preview'], (page) => preview(page).getByRole('button', { name: 'Try out', exact: true })],
  'close button': [scenarios['artifact-preview'], (page) => preview(page).locator('.dialog-heading').getByRole('button', { name: 'Close preview', exact: true })],
};

/**
 * A control with a Material tooltip shows it when hovered or focused from the keyboard. Focus moving
 * in can leave the previous control's tooltip closing, so the scan waits until only this one is open.
 */
async function expectTooltip(page, control) {
  if (!(await control.evaluate((element) => element.classList.contains('mat-mdc-tooltip-trigger')))) return;
  await expect(page.locator('.mat-mdc-tooltip')).toHaveCount(1);
  await expect(page.locator('.mat-mdc-tooltip.mat-mdc-tooltip-show')).toBeVisible();
}

for (const [kind, [open, find]] of Object.entries(controls)) {
  states[`hovered ${kind}`] = async (page) => {
    await open(page);
    const control = find(page);
    await control.hover();
    await expect.poll(() => control.evaluate((element) => element.matches(':hover'))).toBe(true);
    await expectTooltip(page, control);
  };
  // Establish keyboard modality before selecting the control, without crossing the browser toolbar.
  states[`focused ${kind}`] = async (page) => {
    await open(page);
    const control = find(page);
    if (kind === 'wordmark link') {
      // The first control's previous stop is browser chrome, which Playwright cannot traverse reliably.
      await page.keyboard.press(tabKey(page, 'Tab'));
      await control.focus();
    } else {
      await control.focus();
      await page.keyboard.press(tabKey(page, 'Shift+Tab'));
      await page.keyboard.press(tabKey(page, 'Tab'));
    }
    await expect(control).toBeFocused();
    expect(await control.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
    await expectTooltip(page, control);
  };
}

/**
 * Undecided results settled by measurement. axe leaves a result undecided when it cannot compute
 * it, such as a contrast against a background it cannot see past or the size of a box its content
 * overflows. An entry settles the results of its rule, in its states, on elements matching its
 * target, and each scan measures them again, so a change to what the entry rests on fails the gate
 * instead of passing on an old reading. An entry none of its states produces fails too, so the list
 * says exactly what the gate has settled.
 *
 * An entry gives its `rule` and `states`, a `target` selector that every element it settles matches,
 * what was `measured` on the day it was written, and why that `passes`.
 */
const SETTLED = [{
  rule: 'color-contrast', browser: 'webkit',
  states: ['element-page at 1440', 'element-page at 375', 'field-page at 1440', 'field-page at 375', 'unreadable field'],
  target: '.legend-title', measured: '10.65:1',
  passes: 'The opaque legend panel is #f4f6f6 beneath #173f3e text. WebKit leaves the legend undecided; the gate measures its painted contrast against the AA threshold on every scan.',
}];

/**
 * Findings that only a visible change can fix, whether axe reports them as violations or they are
 * undecided results that measure as failures. Each is recorded here so that the gate passes until
 * that change is made. An exception none of its states produces fails, so the list shrinks as the
 * changes land.
 *
 * An entry gives its `rule` and `states`, a `target` selector the element matches, what was
 * `measured`, and the visible change it `needs`.
 */
const EXCEPTIONS = [];

/**
 * Wait for the page to stop moving, so contrast is read at full opacity.
 *
 * A fade that a click starts may not exist until two frames later, so the wait begins after two
 * frames. Chromium lists a shadow tree's animations on its root and not on the document.
 */
async function still(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const roots = [document];
    const collect = (root) => {
      for (const element of root.querySelectorAll('*'))
        if (element.shadowRoot) {
          roots.push(element.shadowRoot);
          collect(element.shadowRoot);
        }
    };
    collect(document);
    await Promise.all(
      roots
        .flatMap((root) => root.getAnimations())
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    );
  });
  await page.evaluate(() => document.fonts.ready);
}

/** axe's verdict on the page outside the embedded editor: the rules that fail, and the results it could not decide. */
async function audit(page) {
  await still(page);
  // A rule enabled by name overrides the tag selection, so one scan covers both. The builder's
  // `options` replaces every option set before it, so it comes ahead of `withTags`.
  const builder = new AxeBuilder({ page }).options({ rules: { [LABEL_IN_NAME]: { enabled: true } } }).withTags(WCAG);
  // CEE's own gate scans the embedded hosts, shadow trees included.
  for (const host of EMBEDDED) builder.exclude(host);
  const scan = await builder.analyze();
  // A builder that dropped the rule option would stop checking Label in Name and fail nothing.
  const evaluated = [scan.passes, scan.violations, scan.incomplete, scan.inapplicable].flat();
  expect(evaluated.some((result) => result.id === LABEL_IN_NAME), `${LABEL_IN_NAME} did not run`).toBe(true);
  const nodes = (results) => results.flatMap((result) => result.nodes.map((node) => ({ rule: result.id, node })));
  return { violations: nodes(scan.violations), undecided: nodes(scan.incomplete) };
}

/** The element an axe target names. Playwright's CSS engine pierces open shadow roots, so the target's selectors join into one. */
const element = (page, node) => page.locator(`css=${node.target.flat().join(' ')}`).first();
const where = (rule, node) => `${rule} ${node.target.flat().join(' ')}`;

/**
 * The lowest contrast between a text's colour and what is painted under the parts of it that show,
 * as WCAG computes it, or null when none of it shows. Two screenshots of the element, with its text
 * and with its text transparent, give where the glyphs are and the background at each. A pixel
 * counts as a glyph's only when the text changes it markedly, since an edge the glyph barely covers
 * says nothing its core does not. Glyphs something opaque covers are drawn in neither screenshot.
 */
async function textContrast(page, node) {
  const text = element(page, node);
  await text.scrollIntoViewIfNeeded();
  const box = await text.boundingBox();
  const clip = {
    x: Math.floor(box.x),
    y: Math.floor(box.y),
    width: Math.ceil(box.x + box.width) - Math.floor(box.x),
    height: Math.ceil(box.y + box.height) - Math.floor(box.y),
  };
  const shot = () => page.screenshot({ clip, animations: 'disabled', caret: 'hide', scale: 'css' });
  const color = await text.evaluate((element) => getComputedStyle(element).color);
  const shown = await shot();
  await text.evaluate((element) => {
    element.dataset.contrastProbe = element.style.cssText;
    element.style.setProperty('color', 'transparent', 'important');
    element.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
  });
  const hidden = await shot();
  await text.evaluate((element) => {
    element.style.cssText = element.dataset.contrastProbe;
    delete element.dataset.contrastProbe;
  });
  return page.evaluate(
    async ({ shown, hidden, color }) => {
      const pixels = async (png) => {
        const image = new Image();
        image.src = `data:image/png;base64,${png}`;
        await image.decode();
        const context = new OffscreenCanvas(image.width, image.height).getContext('2d');
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, image.width, image.height).data;
      };
      const probe = new OffscreenCanvas(1, 1).getContext('2d');
      probe.fillStyle = color;
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
      const luminance = (channels) =>
        channels
          .map((value) => value / 255)
          .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
          .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      const [withText, without] = await Promise.all([pixels(shown), pixels(hidden)]);
      let lowest = Infinity;
      for (let i = 0; i < withText.length; i += 4) {
        if ([0, 1, 2].every((channel) => Math.abs(withText[i + channel] - without[i + channel]) < 32)) continue;
        const background = [without[i], without[i + 1], without[i + 2]];
        const foreground = [r, g, b].map((value, channel) => (value * a + background[channel] * (255 - a)) / 255);
        const [light, dark] = [luminance(foreground), luminance(background)].sort((x, y) => y - x);
        lowest = Math.min(lowest, (light + 0.05) / (dark + 0.05));
      }
      return lowest === Infinity ? null : Math.floor(lowest * 100) / 100;
    },
    { shown: shown.toString('base64'), hidden: hidden.toString('base64'), color },
  );
}

/**
 * How an undecided result of each rule is measured. A measure returns what it found and why that
 * fails, with null as the reason when it passes. A rule with no measure here cannot be settled.
 */
const measures = {
  'color-contrast': async (page, node) => {
    const ratio = await textContrast(page, node);
    if (ratio === null) return { found: 'covered', fails: null };
    const required = parseFloat(node.any[0]?.data?.expectedContrastRatio ?? '4.5');
    return { found: `${ratio.toFixed(2)}:1`, fails: ratio >= required ? null : `under ${required}:1` };
  },
  // Criterion 2.5.8 accepts a target of at least 24 by 24, or one whose 24px circle, centred on it,
  // meets no other target and no other undersized target's circle.
  'target-size': (page, node) =>
    element(page, node).evaluate((target) => {
      const own = target.getBoundingClientRect();
      const found = `${Math.round(own.width)} × ${Math.round(own.height)} px`;
      if (own.width >= 24 && own.height >= 24) return { found, fails: null };
      const x = own.x + own.width / 2;
      const y = own.y + own.height / 2;
      const targets = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex]:not([tabindex="-1"])';
      const near = [...document.querySelectorAll(targets)].filter((other) => {
        if (other === target || other.contains(target) || target.contains(other)) return false;
        if (!other.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
        const r = other.getBoundingClientRect();
        const gap = Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
        const centres = Math.hypot(r.x + r.width / 2 - x, r.y + r.height / 2 - y);
        return gap < 12 || ((r.width < 24 || r.height < 24) && centres < 24);
      });
      return { found, fails: near.length ? `its spacing circle meets ${near.length} other target(s)` : null };
    }),
};

/** Whether the element `node` names matches each selector. */
const matching = (page, node, selectors) =>
  element(page, node).evaluate((target, selectors) => selectors.map((selector) => target.matches(selector)), selectors);

/**
 * Fail on every violation, and on every undecided result that `SETTLED` does not settle or that no
 * longer measures as passing, unless `EXCEPTIONS` records it. Fail too on every entry of either list
 * that `state` should produce and does not.
 */
async function expectAccessible(page, state) {
  const { violations, undecided } = await audit(page);
  const settled = SETTLED.filter((entry) => entry.states.includes(state) &&
    (!entry.browser || entry.browser === page.context().browser()?.browserType().name()));
  const excepted = EXCEPTIONS.filter((entry) => entry.states.includes(state));
  const used = new Set();
  const failures = [];
  const except = async (rule, node, problem) => {
    const hits = await matching(page, node, excepted.map((entry) => entry.target));
    const index = excepted.findIndex((entry, i) => entry.rule === rule && hits[i]);
    if (index < 0) failures.push(`${where(rule, node)}: ${problem}`);
    else used.add(excepted[index]);
  };
  for (const { rule, node } of violations) await except(rule, node, node.failureSummary.replace(/\s+/g, ' '));
  for (const { rule, node } of undecided) {
    if (!measures[rule]) {
      await except(rule, node, `undecided, and no measure settles ${rule}`);
      continue;
    }
    const hits = await matching(page, node, settled.map((entry) => entry.target));
    const entry = settled.find((entry, i) => entry.rule === rule && hits[i]);
    const { found, fails } = await measures[rule](page, node);
    if (!entry) {
      await except(rule, node, `undecided and not settled, measured ${found}`);
      continue;
    }
    used.add(entry);
    if (fails) await except(rule, node, `measured ${found}, ${fails}`);
  }
  for (const entry of [...settled, ...excepted])
    if (!used.has(entry)) failures.push(`${entry.rule} ${entry.target}: listed for ${state}, and no longer found`);
  expect(failures, state).toEqual([]);
}

for (const [state, open] of Object.entries(states))
  test(`accessible ${state}`, async ({ page }) => {
    await open(page);
    await expectAccessible(page, state);
  });
