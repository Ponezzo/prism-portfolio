/**
 * Merge Figma export JSON into content/home.json
 *
 * Usage (agent after use_figma export):
 *   node scripts/merge-figma-export.mjs path/to/export.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setByPath, homePath } from './apply-home.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const mapPath = path.join(root, 'design/figma-map.json');
const figmaMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const frameW = figmaMap.meta.frameWidth || 1440;

function readExportArg() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/merge-figma-export.mjs <figma-export.json>');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(path.resolve(arg), 'utf8'));
}

function layoutFromFrame(box, master) {
  if (!box || !master) return null;
  const relX = box.x - master.x;
  const relY = box.y - master.y;
  const rightPx = frameW - (relX + box.width);
  return {
    right: `${Math.max(0, Math.round(rightPx))}px`,
    top: `${Math.round((relY / master.height) * 100)}%`,
    translateY: '-50%',
    width: `${Math.round(box.width)}px`,
    height: `${Math.round(box.height)}px`,
  };
}

function layoutTagline(box, master) {
  if (!box || !master) return null;
  return {
    top: `${Math.round(box.y - master.y)}px`,
    left: `${Math.round(box.x - master.x)}px`,
    maxWidth: `${Math.round(box.width)}px`,
  };
}

const exportData = readExportArg();
const home = JSON.parse(fs.readFileSync(homePath, 'utf8'));

if (exportData.content) {
  for (const [layerName, jsonPath] of Object.entries(figmaMap.contentLayers)) {
    const val = exportData.content[layerName];
    if (val == null) continue;
    if (layerName === 'content/hero.tagline') {
      setByPath(home, 'content.hero.taglinePlain', val.replace(/\n/g, ' '));
      setByPath(home, 'content.hero.taglineHtml', val.replace(/\n/g, '<br>'));
      continue;
    }
    if (layerName === 'content/about.text') {
      setByPath(home, 'content.about.textHtml', val.replace(/\n/g, '<br>'));
      continue;
    }
    setByPath(home, jsonPath, val);
  }
}

if (exportData.layout && exportData.master) {
  const master = exportData.master;
  const prism = exportData.layout['layout/hero.prismVideo'];
  if (prism) home.layout.hero.prismVideo = layoutFromFrame(prism, master) ?? home.layout.hero.prismVideo;
  const tagline = exportData.layout['layout/hero.tagline'];
  if (tagline) home.layout.hero.tagline = layoutTagline(tagline, master) ?? home.layout.hero.tagline;
}

if (exportData.colors) {
  home.colors = { ...home.colors, ...exportData.colors };
}

if (exportData.skillGroups) {
  home.content.skills.groups = exportData.skillGroups;
}

if (exportData.projects) {
  exportData.projects.forEach((p, i) => {
    if (home.projects[i]) {
      home.projects[i].title = p.title ?? home.projects[i].title;
      home.projects[i].date = p.date ?? home.projects[i].date;
    }
  });
}

home.meta.lastSyncedFromFigma = new Date().toISOString();
fs.writeFileSync(homePath, JSON.stringify(home, null, 2) + '\n');
console.log('Merged Figma export → content/home.json');
