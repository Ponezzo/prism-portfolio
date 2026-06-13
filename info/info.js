import { loadJSON, mountNav, renderFooter } from '../js/shared.js';

const site = await loadJSON('../content/site.json');
document.getElementById('page-title').textContent = site.info.title;
document.getElementById('bio').textContent = site.info.bio;
document.getElementById('skills').innerHTML = site.info.skills.map((s) => `<span class="tag">${s}</span>`).join('');
document.title = `${site.info.title} — ${site.owner.name}`;
mountNav(site.nav, 'info');
renderFooter(site.footer);
