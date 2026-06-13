/**
 * Parses content/page-text.txt (tab-indented) and merges text into content/home.json.
 * Run: npm run apply:text
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const textPath = path.join(root, 'content/page-text.txt');
const homePath = path.join(root, 'content/home.json');

function tabDepth(line) {
  const m = line.match(/^(\t*)/);
  return m ? m[1].length : 0;
}

function lineContent(line) {
  return line.replace(/^\t+/, '').trimEnd();
}

function parsePageText(raw) {
  const sections = {};
  let current = null;
  let skillsPhase = 0;
  let currentGroup = null;

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine;
    if (!line.trim()) continue;
    if (line.trimStart().startsWith('#')) continue;

    const depth = tabDepth(line);
    const text = lineContent(line);
    if (!text) continue;

    if (depth === 0) {
      current = text;
      sections[current] = { lines: [] };
      skillsPhase = 0;
      currentGroup = null;
      continue;
    }

    if (!current) continue;
    sections[current].lines.push({ depth, text });
  }

  return sections;
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim() || 'project';
}

function takeOneTabLines(section) {
  return (section?.lines ?? []).filter((l) => l.depth === 1).map((l) => l.text);
}

function applySections(sections, home) {
  const content = home.content ?? (home.content = {});
  const existingProjects = home.projects ?? [];

  if (sections.Preloader) {
    const [logo, firstName] = takeOneTabLines(sections.Preloader);
    content.preloader = {
      ...(content.preloader ?? {}),
      ...(logo != null ? { logo } : {}),
      ...(firstName != null ? { firstName } : {}),
    };
  }

  if (sections.Hero) {
    const [tagline] = takeOneTabLines(sections.Hero);
    if (tagline != null) {
      content.hero = {
        ...(content.hero ?? {}),
        taglineHtml: tagline,
        taglinePlain: tagline.replace(/<[^>]+>/g, ''),
      };
    }
  }

  if (sections.About) {
    const [textHtml, sub] = takeOneTabLines(sections.About);
    content.about = {
      ...(content.about ?? {}),
      ...(textHtml != null ? { textHtml } : {}),
      ...(sub != null ? { sub } : {}),
    };
  }

  if (sections.Skills) {
    const skills = { subtitle: '', text: '', groups: [] };
    let phase = 0;
    let group = null;

    for (const { depth, text } of sections.Skills.lines) {
      if (depth === 1) {
        if (phase === 0) {
          skills.subtitle = text;
          phase = 1;
        } else if (phase === 1) {
          skills.text = text;
          phase = 2;
        } else {
          group = {
            id: slugify(text),
            title: text,
            items: [],
          };
          skills.groups.push(group);
        }
      } else if (depth === 2 && group) {
        group.items.push(text);
      }
    }

    content.skills = skills;
  }

  if (sections.Projects) {
    const projects = [];
    const coverById = Object.fromEntries(
      existingProjects.map((p) => [p.id, p.cover]),
    );
    let pending = null;

    for (const { depth, text } of sections.Projects.lines) {
      if (depth === 1) {
        pending = {
          id: slugify(text),
          title: text,
          date: '',
          cover: coverById[slugify(text)] ?? `assets/covers/${slugify(text)}.svg`,
        };
      } else if (depth === 2 && pending) {
        pending.date = text;
        projects.push(pending);
        pending = null;
      }
    }

    if (projects.length) home.projects = projects;
  }

  if (sections.ProjectsPreview) {
    const [label, cursor] = takeOneTabLines(sections.ProjectsPreview);
    content.projectsPreview = {
      ...(content.projectsPreview ?? {}),
      ...(label != null ? { label } : {}),
      ...(cursor != null ? { cursor } : {}),
    };
  }

  if (sections.Footer) {
    const lines = takeOneTabLines(sections.Footer);
    const patch = { ...(content.footer ?? {}) };
    if (lines.length >= 4) {
      [patch.email, patch.copyright, patch.nameFirst, patch.nameLast] = lines;
    } else if (lines.length === 2) {
      [patch.nameFirst, patch.nameLast] = lines;
    } else if (lines.length === 1) {
      patch.nameFirst = lines[0];
    }
    content.footer = patch;
  }

  return home;
}

const raw = fs.readFileSync(textPath, 'utf8');
const sections = parsePageText(raw);
const home = JSON.parse(fs.readFileSync(homePath, 'utf8'));
applySections(sections, home);
fs.writeFileSync(homePath, JSON.stringify(home, null, 2) + '\n');

console.log('Merged content/page-text.txt → content/home.json');
console.log('Next: npm run apply:home');
