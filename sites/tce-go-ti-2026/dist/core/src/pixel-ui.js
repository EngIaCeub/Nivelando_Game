const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
};

export function PixelPanel({ as = 'section', className = '', children = [], label } = {}) {
  const panel = element(as, `pixel-panel${className ? ` ${className}` : ''}`);
  if (label) panel.setAttribute('aria-label', label);
  panel.append(...(Array.isArray(children) ? children : [children]));
  return panel;
}

export function PixelButton({ label, onClick, variant = 'primary', disabled = false, type = 'button' } = {}) {
  const button = element('button', `pixel-button${variant === 'secondary' ? ' pixel-button--secondary' : ''}`, label);
  button.type = type;
  button.disabled = Boolean(disabled);
  if (onClick) button.addEventListener('click', onClick);
  return button;
}

export function PixelBadge(label, tone = 'neutral') {
  return element('span', `pixel-badge${['success', 'warning', 'info'].includes(tone) ? ` pixel-badge--${tone}` : ''}`, label);
}

export function PixelProgress({ label, current = 0, max = 0, valueText } = {}) {
  const container = element('div', 'pixel-progress');
  const safeMax = Number.isFinite(Number(max)) && Number(max) > 0 ? Number(max) : 1;
  const safeCurrent = Number.isFinite(Number(current)) ? Math.min(safeMax, Math.max(0, Number(current))) : 0;
  const heading = element('div', 'pixel-progress__label');
  heading.append(element('span', '', label ?? 'Progresso'));
  if (valueText) heading.append(element('span', '', valueText));
  const progress = document.createElement('progress');
  progress.max = safeMax;
  progress.value = safeCurrent;
  progress.setAttribute('aria-label', label ?? 'Progresso');
  container.append(heading, progress);
  return container;
}

export function PixelMeter({ label, value = null, state = 'unknown', valueText } = {}) {
  const known = value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
  const safeValue = known ? Math.min(100, Math.max(0, Number(value))) : null;
  const container = element('div', `pixel-meter${known ? '' : ' pixel-meter--unknown'}${['learning', 'reviewing'].includes(state) ? ` pixel-meter--${state}` : ''}`);
  const heading = element('div', 'pixel-progress__label');
  heading.append(element('span', '', label ?? 'Domínio'));
  heading.append(element('span', '', valueText ?? (known ? `${Math.round(safeValue)}%` : 'Sem dados ainda')));
  container.append(heading);
  if (known) {
    const meter = element('div', 'pixel-meter__track');
    meter.setAttribute('role', 'meter');
    meter.setAttribute('aria-label', label ?? 'Domínio');
    meter.setAttribute('aria-valuemin', '0');
    meter.setAttribute('aria-valuemax', '100');
    meter.setAttribute('aria-valuenow', String(Math.round(safeValue)));
    const fill = element('span', 'pixel-meter__fill');
    fill.style.width = `${safeValue}%`;
    meter.append(fill);
    container.append(meter);
  }
  return container;
}

export function PixelStat({ label, value, className = '' } = {}) {
  const stat = element('div', `pixel-panel pixel-panel--compact pixel-stat${className ? ` ${className}` : ''}`);
  stat.append(element('span', 'pixel-stat__value', value), element('span', 'pixel-stat__label', label));
  return stat;
}

const iconPaths = Object.freeze({
  book: 'M2 4h8v2h4V4h8v16h-8v2h-4v-2H2zM4 6v12h6V6zm10 0v12h6V6z',
  flag: 'M4 2h2v20H4zM6 2h14v8H6zM8 4v4h10V4z',
  practice: 'M4 2h16v20H4zM6 4v16h12V4zM8 6h8v2H8zm0 4h8v2H8zm0 4h4v2H8z',
  review: 'M6 4h12v2h2v12h-2v2H6v-2H4v-8H2V6h8v4H6v6h2v2h8v-2h2V8h-2V6H6z',
  progress: 'M2 20h20v2H2zM4 14h4v4H4zm6-6h4v10h-4zm6-6h4v16h-4z',
  settings: 'M10 2h4v4h4V4h4v6h-4v4h4v6h-4v-2h-4v4h-4v-4H6v2H2v-6h4v-4H2V4h4v2h4zM10 10v4h4v-4z'
});

export function PixelIcon(name = 'book') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('class', 'pixel-icon');
  svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', iconPaths[name] ?? iconPaths.book); path.setAttribute('fill', 'currentColor');
  path.setAttribute('fill-rule', 'evenodd'); svg.append(path); return svg;
}

const sceneAssets = Object.freeze({
  coast: new URL('../assets/pixel/islands.svg', import.meta.url).href,
  forest: new URL('../assets/pixel/forest.svg', import.meta.url).href,
  night: new URL('../assets/pixel/observatory.svg', import.meta.url).href
});
export function PixelScene(variant = 'coast') {
  const image = element('img', 'pixel-scene');
  image.src = sceneAssets[variant] ?? sceneAssets.coast;
  image.alt = ''; image.width = 640; image.height = 200;
  image.setAttribute('aria-hidden', 'true'); return image;
}

export function PixelWorldTile({ title, description, onClick, variant = 'coast' }) {
  const tile = PixelButton({ label: '', variant: 'secondary', onClick });
  tile.className = 'pixel-world';
  const image = PixelScene(variant); image.loading = 'lazy';
  const copy = element('span', 'pixel-world__copy');
  copy.append(element('strong', '', title), element('small', '', description));
  tile.append(image, copy); return tile;
}
