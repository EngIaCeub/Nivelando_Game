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
  const studyPaths = pack.library?.studyPaths ?? [];
  const resourceById = new Map(resources.map(resource => [resource.id, resource]));
  const coverage = auditLibrary(pack, { now });
  return {
    topics, units, resources, studyPaths, resourceById, topicById, unitById, coverage,
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
    },
    filterPaths({ search = '', disciplineId = '', topicId = '', format = '', language = '', access = '' } = {}) {
      const term = normalize(search);
      return studyPaths.filter(path => {
        const unit = unitById.get(path.unitId), topic = topicById.get(unit?.topicId);
        if (!unit || !topic || (topicId && topic.id !== topicId) || (disciplineId && topic.disciplineId !== disciplineId)) return false;
        const stepResources = (path.steps ?? []).map(step => resourceById.get(step.resourceId)).filter(Boolean);
        if (format && !stepResources.some(resource => resource.type === format)) return false;
        if (language && !stepResources.some(resource => resource.language === language)) return false;
        if (access && !stepResources.some(resource => resourceAccess(resource) === access)) return false;
        const haystack = [path.title, unit.title, ...unit.learningObjectives, ...path.steps.flatMap(step => [step.locator, resourceById.get(step.resourceId)?.title, resourceById.get(step.resourceId)?.provider])].join(' ');
        return !term || normalize(haystack).includes(term);
      }).sort((a,b) => a.title.localeCompare(b.title, 'pt-BR'));
    }
  };
}
