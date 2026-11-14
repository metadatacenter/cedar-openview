import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { surfaceCases } from './surface-contracts.generated.mjs';
import { VIEWPORTS, check } from './layout-resilience.generated.mjs';
import { EMBEDDED, scenarios, views } from './scenarios.mjs';

/**
 * Whether OpenView's pages survive a narrow window, a zoomed window and wider text, and whether their
 * placeholders, field boundaries, icons, focus indicators and selection marks can be seen.
 *
 * The checks are the shared ones the token package generates into `layout-resilience.generated.mjs`,
 * which says what WCAG asks and how each check measures it. This spec reaches each state and records
 * what OpenView excuses. A finding fails unless `EXCEPTIONS` names it, and an exception no state
 * produces fails too, so the list says exactly what remains.
 */

const registry = JSON.parse(readFileSync(new URL('../../.ui-surfaces.json', import.meta.url), 'utf8'));

/** Each state the checks measure: every scenario the surface registry opens, and the views the accessibility gate scans. */
const states = {};
for (const { surface } of surfaceCases(registry, scenarios)) states[surface.scenario] = scenarios[surface.scenario];
Object.assign(states, views);

/** OpenView is the page, so each check measures the whole of it, less the embedded editor CEE's suites measure. */
const scope = null;

/** OpenView opens no overlay beyond the preview, a dialog, which the checks already treat as covering the page. */
const overlays = [];

/** OpenView shows no selection. */
const selected = [];

/**
 * What the checks find that is left as it is, each with the visible change that would remove it.
 * Each entry gives its check, kind, selector, states and why, as `Exception` in the generated
 * declaration says.
 */
const EXCEPTIONS = [];

const CHECKS = ['reflow', 'resize', 'spacing', 'placeholder', 'boundary', 'indicators'];

for (const [state, open] of Object.entries(states))
  for (const name of CHECKS)
    test(`${state}: ${name}`, async ({ page }) => {
      // The indicators check focuses each control in turn and waits two frames for it, so its time
      // follows the frame rate. It takes five seconds on a workstation and passed thirty on a loaded
      // runner. No other check waits on frames in a loop.
      if (name === 'indicators') test.slow();
      await page.setViewportSize(VIEWPORTS[name]);
      await open(page);
      await page.mouse.move(0, 0);
      const request = { check: name, state, scope, exclude: EMBEDDED, exceptions: EXCEPTIONS };
      if (name === 'reflow' || name === 'resize') request.overlays = overlays;
      if (name === 'indicators') request.selected = selected;
      const { measured } = await check(page, expect, request);
      // Every field OpenView shows is the embedded editor's, so a placeholder of its own would be new.
      if (name === 'placeholder') expect(measured.placeholder, 'placeholders measured').toBe(0);
      // A selector that stops matching would let a check pass by measuring nothing.
      // Only reflow and resize measure whether controls can be reached.
      if (state === 'artifact folder' && ['reflow', 'resize', 'spacing'].includes(name))
        expect(measured.texts, 'texts measured').toBeGreaterThan(0);
      if (state === 'artifact folder' && ['reflow', 'resize'].includes(name))
        expect(measured.controls, 'controls measured').toBeGreaterThan(0);
      if (state === 'artifact folder' && name === 'indicators') {
        expect(measured.icon, 'icons measured').toBeGreaterThan(0);
        expect(measured.focus, 'focus indicators measured').toBeGreaterThan(0);
      }
    });
