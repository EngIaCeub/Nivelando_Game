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
