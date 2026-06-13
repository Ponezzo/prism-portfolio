import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const versionPath = path.join(root, 'content/deploy-version.json');
const indexPath = path.join(root, 'index.html');

let version = 1;
if (fs.existsSync(versionPath)) {
  const current = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  version = Number(current.version || 0) + 1;
}

fs.writeFileSync(versionPath, `${JSON.stringify({ version }, null, 2)}\n`, 'utf8');

let indexHtml = fs.readFileSync(indexPath, 'utf8');
const badgeRe = /(<div class="deploy-version-badge" id="deploy-version-badge"[^>]*>)[^<]*(<\/div>)/;
if (badgeRe.test(indexHtml)) {
  indexHtml = indexHtml.replace(badgeRe, `$1v${version}$2`);
} else {
  indexHtml = indexHtml.replace(
    '<body>',
    `<body>\n  <div class="deploy-version-badge" id="deploy-version-badge" aria-label="Deploy version">v${version}</div>`
  );
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log(`Deploy version bumped to v${version}`);
