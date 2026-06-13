/**
 * Figma → GitHub sync helper
 *
 * When you edit colors/text in Figma, tell Cursor:
 *   "Figma 토큰/텍스트 변경사항 GitHub에 적용해줘"
 *
 * The agent will:
 * 1. Read Figma Variables from the linked file (design/tokens.json → meta.figmaFileKey)
 * 2. Update design/tokens.json and/or content/*.json
 * 3. Run: npm run apply:tokens
 * 4. Commit/push if you ask
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tokensPath = path.join(root, 'design/tokens.json');
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

export function updateTokens(partial) {
  const next = structuredClone(tokens);
  Object.assign(next.color, partial.color || {});
  Object.assign(next.gradient, partial.gradient || {});
  Object.assign(next.radius, partial.radius || {});
  Object.assign(next.font, partial.font || {});
  Object.assign(next.effect, partial.effect || {});
  fs.writeFileSync(tokensPath, JSON.stringify(next, null, 2) + '\n');
}

export function updateSiteContent(partial) {
  const sitePath = path.join(root, 'content/site.json');
  const site = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
  fs.writeFileSync(sitePath, JSON.stringify({ ...site, ...partial }, null, 2) + '\n');
}

export function updateProjects(projects) {
  const projectsPath = path.join(root, 'content/projects.json');
  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2) + '\n');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  console.log('figma-sync module loaded. Use via agent or import updateTokens().');
}
