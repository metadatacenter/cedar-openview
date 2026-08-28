const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(
  __dirname,
  '../dist/cedar-openview/node_modules/cedar-embeddable-editor/cedar-embeddable-editor.js'
);

// The published CEE bundle contains its unreachable development-host module as
// well as the production custom element. Keep those dormant defaults out of the
// OpenView production payload until CEE splits the two entry points.
const replacements = new Map([
  ['https://terminology.metadatacenter.orgx/', 'https://terminology.metadatacenter.org/'],
  ['https://bridge.metadatacenter.orgx/', 'https://bridge.metadatacenter.org/']
]);

let bundle = fs.readFileSync(bundlePath, 'utf8');
for (const [developmentUrl, productionUrl] of replacements) {
  bundle = bundle.replaceAll(developmentUrl, productionUrl);
}
fs.writeFileSync(bundlePath, bundle);
