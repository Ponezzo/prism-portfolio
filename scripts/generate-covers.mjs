import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const projects = JSON.parse(fs.readFileSync(path.join(root, 'content/projects.json'), 'utf8'));
const dir = path.join(root, 'assets/covers');
fs.mkdirSync(dir, { recursive: true });

const hues = [320, 260, 200, 160, 40, 300, 220, 180, 280];
projects.forEach((p, i) => {
  const h = hues[i % hues.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${h},90%,65%)"/>
      <stop offset="50%" stop-color="hsl(${(h + 80) % 360},85%,60%)"/>
      <stop offset="100%" stop-color="hsl(${(h + 160) % 360},80%,55%)"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="#07070b"/>
  <circle cx="520" cy="300" r="220" fill="url(#g)" opacity="0.85"/>
  <text x="48" y="540" fill="#f2f2f7" font-family="Arial,sans-serif" font-size="28" opacity="0.8">${p.title}</text>
</svg>`;
  fs.writeFileSync(path.join(dir, `${p.id}.svg`), svg);
});
console.log('Generated', projects.length, 'covers');
