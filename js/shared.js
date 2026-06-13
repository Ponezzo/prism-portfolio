export async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

export function mountNav(navItems, page) {
  const dock = document.getElementById('nav-dock');
  if (!dock) return;
  const prefix = page === 'home' ? '' : '../';
  dock.innerHTML = navItems
    .map((item) => {
      const href = `${prefix}${item.href}`;
      const active = item.id === page ? 'active' : '';
      return `<a class="${active}" href="${href}">${item.label}</a>`;
    })
    .join('');
}

export function renderFooter(footer) {
  const el = document.getElementById('footer');
  if (!el || !footer) return;
  el.innerHTML = `<p>${footer.copyright}</p><p>${footer.credit}</p>`;
}
