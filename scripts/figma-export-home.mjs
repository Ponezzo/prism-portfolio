/**
 * Figma Plugin API script — run via use_figma MCP on file izxX8YJ16HiW3JB4sQsClp
 * Exports all sync/* named layers to JSON for merge-figma-export.mjs
 *
 * Agent workflow:
 * 1. use_figma with this file's exportCode
 * 2. Save return value to /tmp/figma-export.json
 * 3. node scripts/merge-figma-export.mjs /tmp/figma-export.json
 * 4. npm run apply:all
 */
export const exportCode = `
const PAGE_NAME = '🏠 Home (Editable)';
const page = figma.root.children.find((p) => p.name === PAGE_NAME);
if (!page) return { error: 'Page not found: ' + PAGE_NAME };

await figma.setCurrentPageAsync(page);
const master = page.findOne((n) => n.name === 'sync/master');
if (!master) return { error: 'Frame sync/master not found' };

function box(node) {
  const t = node.absoluteTransform;
  return {
    x: t[0][2],
    y: t[1][2],
    width: 'width' in node ? node.width : 0,
    height: 'height' in node ? node.height : 0,
  };
}

const content = {};
const layout = {};

for (const node of master.findAll((n) => n.name.startsWith('content/'))) {
  if (node.type === 'TEXT') content[node.name] = node.characters;
}

for (const node of master.findAll((n) => n.name.startsWith('layout/'))) {
  if ('width' in node) layout[node.name] = box(node);
}

const masterBox = box(master);

const skillFrames = master.findAll((n) => n.name.startsWith('content/skills.group.'));
const skillGroups = skillFrames.map((frame) => {
  const titleNode = frame.findOne((n) => n.name === 'title');
  const itemsNode = frame.findOne((n) => n.name === 'items');
  const items = itemsNode && itemsNode.type === 'TEXT'
    ? itemsNode.characters.split('\\n').map((s) => s.trim()).filter(Boolean)
    : [];
  return {
    id: frame.name.replace('content/skills.group.', ''),
    title: titleNode && titleNode.type === 'TEXT' ? titleNode.characters : frame.name,
    items,
  };
});

const projectNodes = master.findAll((n) => /^content\\/projects\\.\\d+\\.title$/.test(n.name));
const projects = projectNodes
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((n) => ({ title: n.characters }));

return {
  master: masterBox,
  content,
  layout,
  skillGroups: skillGroups.length ? skillGroups : undefined,
  projects: projects.length ? projects : undefined,
  exportedAt: new Date().toISOString(),
};
`;

console.log('figma-export-home: use exportCode via use_figma MCP, then merge-figma-export.mjs');
