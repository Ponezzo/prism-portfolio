import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tokens = JSON.parse(fs.readFileSync(path.join(root, 'design/tokens.json'), 'utf8'));

const css = `/* AUTO-GENERATED from design/tokens.json — do not edit by hand */
:root {
  --color-bg: ${tokens.color.bg};
  --color-bg-elevated: ${tokens.color.bgElevated};
  --color-surface: ${tokens.color.surface};
  --color-surface-strong: ${tokens.color.surfaceStrong};
  --color-text: ${tokens.color.text};
  --color-text-muted: ${tokens.color.textMuted};
  --color-border: ${tokens.color.border};
  --color-accent: ${tokens.color.accent};
  --color-accent-hot: ${tokens.color.accentHot};
  --color-accent-pink: ${tokens.color.accentPink};
  --gradient-prism: ${tokens.gradient.prism};
  --gradient-prism-linear: ${tokens.gradient.prismLinear};
  --gradient-prism-soft: ${tokens.gradient.prismSoft};
  --gradient-glass-border: ${tokens.gradient.glassBorder};
  --radius-pill: ${tokens.radius.pill};
  --radius-card: ${tokens.radius.card};
  --radius-panel: ${tokens.radius.panel};
  --font-display: ${tokens.font.display};
  --font-body: ${tokens.font.body};
  --font-mono: ${tokens.font.mono};
  --effect-glass-blur: ${tokens.effect.glassBlur};
  --effect-glow: ${tokens.effect.glow};
}
`;

fs.writeFileSync(path.join(root, 'styles/tokens.css'), css);
console.log('Updated styles/tokens.css');
