/**
 * Applies content/home.json to the live DOM.
 * Regenerate with: npm run apply:home
 */
(function () {
  function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el && html != null) el.innerHTML = html;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text != null) el.textContent = text;
  }

  function applyPreloader(c) {
    setText('preloader-logo', c.logo);
    setText('preloader-luke', c.firstName);
  }

  function applyHero(hero) {
    setHtml('hero-tagline', hero.taglineHtml);
  }

  function applyAbout(about) {
    setHtml('about-text', about.textHtml);
    setText('about-sub', about.sub);
    const photo = document.querySelector('.about-photo');
    if (photo) {
      photo.src = about.photoSrc;
      photo.alt = about.photoAlt;
    }
    const info = document.querySelector('.about-btn [data-chr]');
    if (info) info.setAttribute('data-chr', about.infoLink?.label ?? 'Info');
  }

  function applySkills(skills) {
    const sub = document.querySelector('.skills-subtitle');
    const text = document.querySelector('.skills-text');
    if (sub) sub.textContent = skills.subtitle;
    if (text) text.textContent = skills.text;

    const right = document.getElementById('skills-right');
    if (!right || !Array.isArray(skills.groups)) return;

    right.innerHTML = skills.groups.map((group) => `
      <div class="skill-group${group.open ? ' open' : ''}" data-group="${group.id}">
        <div class="skill-header">
          <span class="skill-header-title">${group.title}</span>
          <span class="skill-header-icon"></span>
        </div>
        <div class="skill-body">
          <ul class="skill-body-inner">
            ${group.items.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');

    window.dispatchEvent(new CustomEvent('home-skills-updated'));
  }

  function applyProjects(projects) {
    const list = document.getElementById('projects-list');
    if (!list || !Array.isArray(projects)) return;
    list.innerHTML = projects.map((p) =>
      `<div class="proj-item" data-id="${p.id}" data-img="${p.cover}" data-date="${p.date}">${p.title}</div>`
    ).join('');
  }

  function applyFooter(footer) {
    const mail = document.querySelector('.footer-mail');
    if (mail) {
      mail.setAttribute('data-chr-footer', footer.email);
      mail.href = `mailto:${footer.email}`;
    }
    const date = document.querySelector('.footer-date');
    if (date) date.setAttribute('data-chr-footer', footer.copyright);

    const first = document.querySelector('.footer-name-luke');
    if (first) {
      first.innerHTML = `<span class="first-letter">${footer.nameFirst.charAt(0)}</span>${footer.nameFirst.slice(1)}`;
    }
    const last = document.querySelector('.footer-name-baffait');
    if (last) last.textContent = footer.nameLast;
  }

  function applyReveal(reveal) {
    setText('reveal-phrase', reveal.phrase);
  }

  function applyPreview(preview) {
    const label = document.querySelector('.proj-label');
    const cursor = document.getElementById('proj-cursor');
    if (label) label.textContent = preview.label;
    if (cursor) cursor.textContent = preview.cursor;
  }

  function boot() {
    const home = window.__HOME__;
    if (!home) {
      console.warn('[home-bindings] window.__HOME__ missing — run npm run apply:home');
      return;
    }
    const c = home.content ?? home;
    applyPreloader(c.preloader ?? home.preloader);
    applyHero(c.hero ?? home.hero);
    applyReveal(c.reveal ?? home.reveal);
    applyAbout(c.about ?? home.about);
    applyProjects(home.projects);
    applySkills(c.skills ?? home.skills);
    applyFooter(c.footer ?? home.footer);
    applyPreview(c.projectsPreview ?? home.projectsPreview);
    window.dispatchEvent(new CustomEvent('home-content-ready'));
  }

  boot();
})();
