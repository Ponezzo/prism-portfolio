import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const homePath = path.join(root, 'content/home.json');
const tokensPath = path.join(root, 'design/tokens.json');
const home = JSON.parse(fs.readFileSync(homePath, 'utf8'));

function setByPath(obj, dotPath, value) {
  const keys = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const idx = Number(k);
    if (!Number.isNaN(idx) && String(idx) === k) {
      if (!Array.isArray(cur)) throw new Error(`Expected array at ${keys.slice(0, i).join('.')}`);
      cur = cur[idx];
    } else {
      cur[k] = cur[k] ?? {};
      cur = cur[k];
    }
  }
  const last = keys[keys.length - 1];
  const lastIdx = Number(last);
  if (!Number.isNaN(lastIdx) && String(lastIdx) === last) {
    cur[lastIdx] = value;
  } else {
    cur[last] = value;
  }
}

function layoutBlock(prefix, block) {
  if (!block) return '';
  const lines = [`  ${prefix} {`];
  for (const [key, val] of Object.entries(block)) {
    const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    if (key.startsWith('translate')) {
      lines.push(`    transform: ${block.translateX ? `translateX(${block.translateX}) ` : ''}${block.translateY ? `translateY(${block.translateY})` : ''};`.trim());
      continue;
    }
    if (key.startsWith('translate')) continue;
    lines.push(`    ${cssKey}: ${val};`);
  }
  lines.push('  }');
  return lines.join('\n');
}

function buildLayoutCss(layout) {
  const hero = layout.hero?.prismVideo ?? {};
  const tagline = layout.hero?.tagline ?? {};
  const mobileHero = layout.mobile?.hero?.prismVideo ?? {};

  const heroVideoCss = `
.prism-hero__wrap {
  position: absolute;
  right: ${hero.right ?? '3vw'};
  top: ${hero.top ?? '50%'};
  transform: translateY(${hero.translateY ?? '-50%'});
  width: ${hero.width ?? 'min(50vw, 680px)'};
  height: ${hero.height ?? 'min(78vh, 780px)'};
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.hero-tagline {
  top: ${tagline.top ?? '3rem'};
  left: ${tagline.left ?? '3rem'};
  max-width: ${tagline.maxWidth ?? '28rem'};
}`;

  const about = layout.about ?? {};
  const aboutCss = about.text
    ? `.about-text { padding-left: ${about.text.paddingLeft ?? '8rem'}; padding-right: ${about.text.paddingRight ?? '4rem'}; }`
    : '';

  const skills = layout.skills?.left;
  const skillsCss = skills
    ? `.skills-left { width: ${skills.width ?? '60%'}; padding-left: ${skills.paddingLeft ?? '8rem'}; padding-top: ${skills.paddingTop ?? '15vh'}; }`
    : '';

  const mobileCss = mobileHero.right
    ? `@media (max-width: 768px) {
  .prism-hero__wrap {
    right: ${mobileHero.right};
    top: ${mobileHero.top ?? '50%'};
    transform: translate(${mobileHero.translateX ?? '50%'}, ${mobileHero.translateY ?? '-50%'});
    width: ${mobileHero.width ?? 'min(92vw, 380px)'};
    height: ${mobileHero.height ?? 'min(50vh, 440px)'};
  }
}`
    : '';

  return `/* AUTO-GENERATED from content/home.json — edit in Figma or home.json, then npm run apply:home */
${heroVideoCss}
${aboutCss}
${skillsCss}
${mobileCss}
`;
}

function syncTokensColors(colors) {
  if (!fs.existsSync(tokensPath)) return;
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  tokens.color.bg = colors.prismBg ?? tokens.color.bg;
  tokens.color.text = colors.textPrimary ?? tokens.color.text;
  tokens.color.accent = colors.prismCyan ?? tokens.color.accent;
  tokens.color.accentHot = colors.prismCyan ?? tokens.color.accentHot;
  tokens.color.accentPink = colors.prismMagenta ?? tokens.color.accentPink;
  tokens.color.accentYellow = colors.prismYellow ?? tokens.color.accentYellow;
  tokens.gradient.prism = `linear-gradient(135deg, ${colors.prismMagenta} 0%, ${colors.prismCyan} 45%, ${colors.prismYellow} 100%)`;
  fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2) + '\n');
}

function buildPrismRootCss(colors) {
  return `:root {
  --prism-cyan: ${colors.prismCyan};
  --prism-magenta: ${colors.prismMagenta};
  --prism-yellow: ${colors.prismYellow};
  --prism-bg: ${colors.prismBg};
  --prism-text-primary: ${colors.textPrimary};
  --prism-text-muted: ${colors.textMuted};
}
`;
}

const jsOut = `/* AUTO-GENERATED from content/home.json */
window.__HOME__ = ${JSON.stringify(home, null, 2)};
`;

fs.writeFileSync(path.join(root, 'styles/home-generated.css'), buildLayoutCss(home.layout));
fs.writeFileSync(path.join(root, 'styles/home-colors.css'), buildPrismRootCss(home.colors));
fs.writeFileSync(path.join(root, 'js/home-generated.js'), jsOut);

syncTokensColors(home.colors);

console.log('Generated styles/home-generated.css');
console.log('Generated styles/home-colors.css');
console.log('Generated js/home-generated.js');
console.log('Synced design/tokens.json colors from home.json');

export { setByPath, homePath };
