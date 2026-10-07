import { auditLibrary } from './library-coverage.js';
export { externalResourceUrl } from './library-coverage.js';

const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
export function resourceAccess(resource) {
  return resource.access?.mode ?? (resource.free === true ? 'free' : resource.free === false ? 'paid' : 'unknown');
}
export function createLibraryCatalog(pack, { now = new Date() } = {}) {
  const topics = (pack.curriculum?.disciplines ?? []).flatMap(d => (d.modules ?? []).flatMap(m => (m.topics ?? []).map(t => ({
    ...t, disciplineId: d.id, disciplineTitle: d.title, moduleTitle: m.title
  }))));
  const topicById = new Map(topics.map(t => [t.id, t]));
  const units = pack.library?.units ?? [];
  const unitById = new Map(units.map(u => [u.id, u]));
  const resources = pack.resources ?? [];
  const coverage = auditLibrary(pack, { now });
  return {
    topics, units, resources, topicById, unitById, coverage,
    filter({ search = '', disciplineId = '', topicId = '', format = '', language = '', access = '' } = {}) {
      const term = normalize(search);
      return resources.filter(resource => {
        const ids = resource.topicIds ?? [];
        if (topicId && !ids.includes(topicId)) return false;
        if (disciplineId && !ids.some(id => topicById.get(id)?.disciplineId === disciplineId)) return false;
        if (format && resource.type !== format) return false;
        if (language && resource.language !== language) return false;
        if (access && resourceAccess(resource) !== access) return false;
        const haystack = [resource.title, resource.provenance?.title, resource.provider,
          ...ids.map(id => topicById.get(id)?.title), ...(resource.coverage ?? []).map(item => item.locator)].join(' ');
        return !term || normalize(haystack).includes(term);
      }).sort((a,b) => {
        const roleRank = resource => Math.min(...(resource.coverage ?? []).filter(c => {
          const topic = topicById.get(unitById.get(c.unitId)?.topicId);
          return (!topicId || topic?.id === topicId) && (!disciplineId || topic?.disciplineId === disciplineId);
        }).map(c => ({primary:0,reference:1,video:2,complementary:3}[c.role] ?? 4)), 4);
        return roleRank(a)-roleRank(b) || a.title.localeCompare(b.title, 'pt-BR');
      });
    }
  };
}
