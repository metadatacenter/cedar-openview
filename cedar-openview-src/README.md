# Cedar Open Metadata Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.1.3.

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4220/`. The app will automatically reload if you change any of the source files.

## Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running Unit Tests

Run `ng test` to execute the unit tests with Vitest in headless Chromium.

## Running Browser Tests

The browser tests in `../browser` drive the built application in Chromium with Playwright. Run
`ng build` here, then `npm install` and `npm test` in `../browser`.

`accessibility.spec.mjs` is the accessibility gate. It scans with axe-core every scenario the surface
registry opens, at 1440 and 375 pixels wide, and the states the other browser tests reach: the
folder of one artifact of each kind, the error cards, the artifact preview with its alerts and its
try-out mode, and each kind of control hovered and focused from the keyboard. It runs every rule
axe-core tags for WCAG 2.0, 2.1 and 2.2 at levels A and AA, and Label in Name by name. The embedded
editor and its field element are left out, because CEE's own gate scans them. A result axe cannot
decide fails unless the spec settles it by measurement, and a finding that needs a visible change
fails unless the spec records it as an exception. An exception that no longer matches fails too.

`layout-resilience.spec.mjs` runs the shared layout checks that the design tokens generate into
`layout-resilience.generated.mjs` over the same states, less the widths and pointer states. They
measure reflow at 320 CSS px, a 640 by 400 viewport for 200% zoom, WCAG text spacing, and the
contrast of placeholders, field boundaries, icons, focus indicators and selection marks. The
embedded editor is left out again, and findings that need a visible change are recorded in the
spec's `EXCEPTIONS` in the same way. `cedarcli check design-tokens --sync-surfaces` rewrites the
generated copy, which is never edited by hand.

## Further Help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
