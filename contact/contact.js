import { loadJSON, mountNav, renderFooter } from '../js/shared.js';

const site = await loadJSON('../content/site.json');
document.getElementById('page-title').textContent = site.contact.title;
document.getElementById('headline').textContent = site.contact.headline;
document.getElementById('note').textContent = site.contact.note;
document.getElementById('email').textContent = site.owner.email;
document.getElementById('email').href = `mailto:${site.owner.email}`;
document.title = `${site.contact.title} — ${site.owner.name}`;
mountNav(site.nav, 'contact');
renderFooter(site.footer);

document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Demo form — connect to your backend or Formspree later.');
});
