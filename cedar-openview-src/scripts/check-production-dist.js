const fs = require('fs');
const path = require('path');

const requestedRoots = process.argv.slice(2);
const distRoots = (requestedRoots.length > 0 ? requestedRoots : ['dist/cedar-openview'])
  .map(root => path.resolve(root));
const forbidden = Buffer.from('.orgx');
const violations = [];

function scan(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      scan(absolutePath);
    } else if (entry.isFile() && fs.readFileSync(absolutePath).includes(forbidden)) {
      violations.push(path.relative(process.cwd(), absolutePath));
    }
  }
}

const scanned = [];
for (const distRoot of distRoots) {
  // `cedarcli build frontends` builds each directory in an isolated checkout, so
  // cedar-openview-src is built without its sibling cedar-openview-dist beside
  // it. A root that is not there cannot hold a leaked hostname; CI checks out the
  // whole repository and so checks both.
  if (!fs.existsSync(distRoot)) {
    console.log(`Production asset check skipped, not present: ${path.relative(process.cwd(), distRoot)}`);
    continue;
  }
  scan(distRoot);
  scanned.push(distRoot);
}

if (scanned.length === 0) {
  console.error('Production asset check found none of the requested roots.');
  process.exit(1);
}

if (violations.length > 0) {
  console.error('Development-only .orgx hostname found in production assets:');
  for (const violation of violations) {
    console.error(`  ${violation}`);
  }
  process.exitCode = 1;
} else {
  console.log('Production asset check passed: no .orgx hostnames found.');
}
