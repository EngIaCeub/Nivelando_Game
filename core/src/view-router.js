export function resolveViewRoute(hash, viewIds) {
  const id = String(hash || '#today').replace(/^#/, '').split('?')[0];
  if (id.startsWith('region-') || id === 'curriculum') return viewIds.includes('subjects') ? 'subjects' : 'today';
  return viewIds.includes(id) ? id : 'today';
}

export function showActiveView(sections, activeId) {
  let active = false;
  for (const section of sections) {
    const selected = section.id === activeId;
    section.hidden = !selected;
    active ||= selected;
  }
  return active ? activeId : null;
}
