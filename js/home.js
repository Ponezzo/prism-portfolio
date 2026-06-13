import { loadJSON, mountNav, renderFooter } from './shared.js';

const site = await loadJSON('./content/site.json');

document.getElementById('owner-name').textContent = site.owner.name;
document.getElementById('hero-title').textContent = site.home.heroTitle;
document.getElementById('hero-subtitle').textContent = site.home.heroSubtitle;
document.getElementById('cta-work').textContent = site.home.ctaWork;
document.getElementById('cta-contact').textContent = site.home.ctaContact;
document.getElementById('page-title').textContent = site.owner.name.split(' ')[0];

mountNav(site.nav, 'home');
renderFooter(site.footer);

document.title = `${site.owner.name}, ${site.home.heroTitle}`;
