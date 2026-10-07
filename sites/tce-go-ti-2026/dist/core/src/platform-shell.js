import { PixelIcon, PixelScene } from './pixel-ui.js';

// Presentation only: native hashes/history remain the navigation mechanism.
export function setupPlatformShell() {
  const sceneRoot = document.querySelector('#platform-scene');
  const select = document.querySelector('#scene-select');
  const focus = document.querySelector('#focus-toggle');
  const nav = document.querySelector('#primary-nav');
  const toggle = document.querySelector('#menu-toggle');
  const renderScene = () => {
    const variant = select?.value ?? 'coast';
    document.documentElement.dataset.biome = variant;
    sceneRoot?.replaceChildren(PixelScene(variant));
  };
  renderScene(); select?.addEventListener('change', renderScene);
  focus?.addEventListener('click', () => {
    const active = focus.getAttribute('aria-pressed') !== 'true';
    focus.setAttribute('aria-pressed', String(active));
    document.documentElement.dataset.focusMode = String(active);
  });
  const brand = document.querySelector('.brand');
  brand?.prepend(PixelIcon('book'));
  const icons = { today: 'flag', subjects: 'book', library: 'book', questions: 'practice', reviews: 'review', progress: 'progress', settings: 'settings' };
  for (const link of nav?.querySelectorAll('a') ?? []) {
    const id = link.hash.slice(1);
    if (icons[id]) link.prepend(PixelIcon(icons[id]));
    const target = document.getElementById(id);
    if (target) target.tabIndex = -1;
  }
  const sync = (moveFocus = false) => {
    const hash = location.hash || '#today';
    for (const link of nav?.querySelectorAll('a') ?? []) {
      if (link.hash === hash) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    if (moveFocus) document.getElementById(hash.slice(1))?.focus({ preventScroll: true });
  };
  nav?.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    nav.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false');
    for (const group of nav.querySelectorAll('details')) group.open = false;
    // The anchor performs scrolling/history; focus follows without another navigation.
    document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
  });
  nav?.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const group = event.target.closest('details');
    if (group?.open) { group.open = false; group.querySelector('summary')?.focus(); }
    else { nav.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); toggle?.focus(); }
  });
  window.addEventListener('hashchange', () => sync(true)); sync();
}

setupPlatformShell();
