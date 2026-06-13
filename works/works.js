import { loadJSON, mountNav, renderFooter } from '../js/shared.js';

const [site, projects] = await Promise.all([
  loadJSON('../content/site.json'),
  loadJSON('../content/projects.json'),
]);

document.getElementById('page-title').textContent = 'Work';
document.title = `Work — ${site.owner.name}`;

mountNav(site.nav, 'work');
renderFooter(site.footer);

const track = document.getElementById('works-track');
const overlay = document.getElementById('project-overlay');
const overlayContent = document.getElementById('overlay-content');
const overlayClose = document.getElementById('overlay-close');

function renderDetail(project) {
  const detail = project.detail || {};
  const links = (detail.links || [])
    .map((l) => `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`)
    .join('');
  const bullets = (detail.highlights || [])
    .map((h) => `<li>${h}</li>`)
    .join('');

  return `
    <div class="project-overlay__grid">
      <div class="project-overlay__media">
        <img src="../${project.cover}" alt="${project.title} cover">
      </div>
      <div class="project-overlay__body">
        <div class="project-card__meta">
          <span>${project.category}</span>
          <span class="project-card__year">${project.year}</span>
        </div>
        <h2 class="project-overlay__title">${project.title}</h2>
        <p class="project-overlay__desc">${detail.summary || project.desc}</p>
        ${bullets ? `<ul class="project-overlay__list">${bullets}</ul>` : ''}
        <div class="tags">${project.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
        ${links ? `<div class="project-overlay__links">${links}</div>` : ''}
      </div>
    </div>
  `;
}

function openOverlay(project) {
  overlayContent.innerHTML = renderDetail(project);
  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overlay-open');
  history.replaceState(null, '', `#${project.id}`);
}

function closeOverlay() {
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overlay-open');
  history.replaceState(null, '', location.pathname);
}

track.innerHTML = projects
  .map(
    (p) => `
  <article class="project-card" id="project-${p.id}" data-id="${p.id}" tabindex="0" role="button" aria-label="Open ${p.title}">
    <div class="project-card__media"><img src="../${p.cover}" alt="${p.title} cover"></div>
    <div class="project-card__body">
      <div class="project-card__meta"><span>${p.category}</span><span class="project-card__year">${p.year}</span></div>
      <h2 class="project-card__title">${p.title}</h2>
      <p class="project-card__desc">${p.desc}</p>
      <div class="tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
      <span class="project-card__cta">View project</span>
    </div>
  </article>
`,
  )
  .join('');

track.addEventListener('click', (e) => {
  const card = e.target.closest('.project-card');
  if (!card) return;
  const project = projects.find((p) => p.id === card.dataset.id);
  if (project) openOverlay(project);
});

track.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('.project-card');
  if (!card) return;
  e.preventDefault();
  const project = projects.find((p) => p.id === card.dataset.id);
  if (project) openOverlay(project);
});

overlayClose.addEventListener('click', closeOverlay);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeOverlay();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !overlay.hidden) closeOverlay();
});

const hash = location.hash.replace('#', '');
if (hash) {
  const project = projects.find((p) => p.id === hash);
  if (project) openOverlay(project);
}
