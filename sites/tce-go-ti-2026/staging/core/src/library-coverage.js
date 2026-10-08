const duplicateIds = values => values.filter((id, i) => values.indexOf(id) !== i);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
export function externalResourceUrl(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
const httpUrl = value => externalResourceUrl(value) !== null;

/** Pure editorial coverage calculation. No network, storage or study-state mutations. */
export function auditLibrary(pack, { now = new Date() } = {}) {
  const at = new Date(now);
  if (!Number.isFinite(at.getTime())) throw new Error('Invalid audit date');
  const errors = [], warnings = [], resources = pack.resources ?? [];
  const topics = (pack.curriculum?.disciplines ?? []).flatMap(d =>
    (d.modules ?? []).flatMap(m => (m.topics ?? []).map(t => ({ ...t, disciplineId: d.id, disciplineTitle: d.title }))));
  const library = pack.library;
  if (!library) return { examId: pack.manifest?.examId, checkedAt: at.toISOString(),
    configured: false, isComplete: false, errors, warnings: ['library.json absent'],
    legacyResources: resources.filter(r => r.libraryVersion !== 2).length };
  const units = library.units ?? [];
  const topicMap = new Map(topics.map(t => [t.id, t]));
  const disciplineIds = new Set((pack.curriculum?.disciplines ?? []).map(d => d.id));
  const unitMap = new Map(units.map(u => [u.id, u]));
  const sourceIds = new Set((pack.sourceMap?.sources ?? []).map(s => s.id));
  if (library.examId !== pack.manifest?.examId) errors.push('library.examId differs from manifest');
  for (const id of library.pilotDisciplineIds ?? []) if (!disciplineIds.has(id)) errors.push('Unknown pilot discipline: ' + id);
  for (const [kind, ids] of [['unit', units.map(u => u.id)], ['resource', resources.map(r => r.id)], ['topic', topics.map(t => t.id)]])
    for (const id of new Set(duplicateIds(ids))) errors.push('Duplicate ' + kind + ': ' + id);
  for (const unit of units) {
    if (!topicMap.has(unit.topicId)) errors.push('Unknown topic for unit ' + unit.id + ': ' + unit.topicId);
    for (const prerequisite of unit.prerequisiteUnitIds ?? []) if (!unitMap.has(prerequisite)) errors.push('Unknown prerequisite: ' + prerequisite);
    if (library.scopeReview?.status === 'reviewed' && !(unit.syllabusRefs?.length)) errors.push('Reviewed unit lacks syllabus source: ' + unit.id);
    for (const ref of unit.syllabusRefs ?? []) if (!sourceIds.has(ref.source) || !nonempty(ref.locator)) errors.push('Invalid syllabus reference: ' + unit.id);
  }
  const visited = new Set(), stack = new Set();
  function visit(id) {
    if (stack.has(id)) { errors.push('Prerequisite cycle: ' + id); return; }
    if (visited.has(id)) return;
    visited.add(id); stack.add(id);
    for (const next of unitMap.get(id)?.prerequisiteUnitIds ?? []) if (unitMap.has(next)) visit(next);
    stack.delete(id);
  }
  units.forEach(u => visit(u.id));
  const policy = library.policy ?? {};
  if (policy.freePrimaryRequired !== true) errors.push('Didactic library requires a free primary resource');
  if (!(Number.isInteger(policy.reviewIntervalDays) && policy.reviewIntervalDays > 0)) errors.push('Invalid review interval');
  const freshness = value => {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && timestamp <= at.getTime() &&
      at.getTime() - timestamp <= policy.reviewIntervalDays * 86400000;
  };
  const resourceResults = resources.filter(r => r.libraryVersion === 2).map(resource => {
    const reasons = [];
    if (resource.examId !== library.examId) errors.push('Resource exam mismatch: ' + resource.id);
    if (!httpUrl(resource.url)) { errors.push('Unsafe resource URL: ' + resource.id); reasons.push('unsafe-url'); }
    if (!Array.isArray(resource.coverage) || !resource.coverage.length) errors.push('Resource lacks coverage mapping: ' + resource.id);
    for (const mapping of resource.coverage ?? []) {
      const unit = unitMap.get(mapping.unitId);
      if (!unit) errors.push('Unknown unit for resource ' + resource.id + ': ' + mapping.unitId);
      else if (!(resource.topicIds ?? []).includes(unit.topicId)) errors.push('Coverage/topic mismatch: ' + resource.id);
      if (!nonempty(mapping.locator)) errors.push('Mapping lacks chapter/lesson: ' + resource.id);
    }
    for (const id of resource.topicIds ?? []) if (!topicMap.has(id)) errors.push('Unknown v2 resource topic: ' + resource.id);
    const rights = resource.rights;
    if (rights && rights.delivery !== 'link') errors.push('Embed/bundle delivery is deferred to B5: ' + resource.id);
    if (!rights || !['link', 'embed', 'bundle'].includes(rights.delivery)) errors.push('Invalid delivery: ' + resource.id);
    if (rights && rights.delivery !== 'link' && (!nonempty(rights.license) ||
        /^(unknown|desconhecida|unverified)$/i.test(rights.license.trim()) || !httpUrl(rights.evidenceUrl))) errors.push('Missing reuse authorization: ' + resource.id);
    if (resource.status !== 'active' || resource.verified !== true) reasons.push('inactive-or-unverified');
    if (resource.verification?.result !== 'reachable') reasons.push('availability-not-confirmed');
    if (!freshness(resource.verification?.checkedAt)) reasons.push('availability-stale-or-undated');
    const review = resource.editorialReview;
    if (review?.status !== 'approved' || !nonempty(review?.reviewer) || !nonempty(review?.evidence)) reasons.push('editorial-review-pending');
    if (!freshness(review?.reviewedAt)) reasons.push('editorial-review-stale-or-undated');
    if (resource.access?.requiresRegistration && !policy.allowRegistration) reasons.push('registration-not-allowed');
    if (policy.freePrimaryRequired && !(['free', 'registration'].includes(resource.access?.mode) &&
        (resource.access.mode !== 'registration' || policy.allowRegistration))) reasons.push('no-free-primary');
    return { id: resource.id, eligible: reasons.length === 0, reasons };
  });
  const eligible = new Set(resourceResults.filter(r => r.eligible).map(r => r.id));
  const resourceById = new Map(resources.map(resource => [resource.id, resource]));
  const studyPaths = library.studyPaths ?? [];
  const duplicatePathIds = new Set(duplicateIds(studyPaths.map(path => path.id)));
  for (const id of duplicatePathIds) errors.push('Duplicate study path: ' + id);
  const pathResults = studyPaths.map(path => {
    const reasons = [];
    let structurallyValid = true;
    const unit = unitMap.get(path.unitId);
    if (!unit) { errors.push('Unknown unit for study path ' + path.id + ': ' + path.unitId); structurallyValid = false; }
    if (duplicatePathIds.has(path.id)) { reasons.push('duplicate-path-id'); structurallyValid = false; }
    if (!Array.isArray(path.steps) || path.steps.length < 2 || new Set((path.steps ?? []).map(step => step.resourceId)).size < 2) {
      errors.push('Study path must sequence at least two distinct resources: ' + path.id);
      reasons.push('invalid-sequence'); structurallyValid = false;
    }
    const objectives = new Set();
    for (const step of path.steps ?? []) {
      const resource = resourceById.get(step.resourceId);
      if (!resource) { errors.push('Unknown resource for study path ' + path.id + ': ' + step.resourceId); structurallyValid = false; continue; }
      if (!(resource.coverage ?? []).some(mapping => mapping.unitId === path.unitId)) {
        errors.push('Study path resource does not map to its unit: ' + path.id + '/' + step.resourceId);
        structurallyValid = false;
      }
      if (!nonempty(step.locator)) { errors.push('Study path step lacks locator: ' + path.id + '/' + step.resourceId); structurallyValid = false; }
      if (!Array.isArray(step.objectiveIndices) || !step.objectiveIndices.length) { errors.push('Study path step lacks objective mapping: ' + path.id + '/' + step.resourceId); structurallyValid = false; }
      for (const index of step.objectiveIndices ?? []) {
        if (!Number.isInteger(index) || index < 0 || index >= (unit?.learningObjectives?.length ?? 0)) {
          errors.push('Invalid learning objective index in study path: ' + path.id + '/' + index); structurallyValid = false;
        } else objectives.add(index);
      }
      if (!eligible.has(step.resourceId)) reasons.push('resource-ineligible:' + step.resourceId);
    }
    if (!structurallyValid) reasons.push('invalid-path-structure');
    if (unit && objectives.size !== unit.learningObjectives.length) reasons.push('learning-objectives-incomplete');
    if (path.practice !== undefined) {
      const practiceIds = new Set();
      for (const question of path.practice?.questions ?? []) {
        if (practiceIds.has(question.id)) errors.push('Duplicate practice question in study path: ' + path.id + '/' + question.id);
        practiceIds.add(question.id);
        if (!Array.isArray(question.options) || question.correctOptionIndex < 0 || question.correctOptionIndex >= question.options.length) {
          errors.push('Invalid practice answer index in study path: ' + path.id + '/' + question.id);
        }
        if (!(path.steps ?? []).some(step => step.resourceId === question.sourceResourceId)) {
          errors.push('Practice source is not in study path: ' + path.id + '/' + question.id);
        }
      }
    }
    const review = path.editorialReview;
    if (review?.status !== 'approved' || !nonempty(review?.reviewer) || !nonempty(review?.evidence)) reasons.push('editorial-review-pending');
    if (!freshness(review?.reviewedAt)) reasons.push('editorial-review-stale-or-undated');
    return { id: path.id, unitId: path.unitId, eligible: reasons.length === 0, reasons,
      coveredObjectiveCount: objectives.size, objectiveCount: unit?.learningObjectives?.length ?? 0 };
  });
  const coveredUnits = units.map(unit => {
    const primaryResourceIds = resources.filter(r => eligible.has(r.id) &&
      (r.coverage ?? []).some(c => c.unitId === unit.id && c.role === 'primary' && c.extent === 'full')).map(r => r.id);
    const primaryPathIds = pathResults.filter(path => path.eligible && path.unitId === unit.id).map(path => path.id);
    return { unitId: unit.id, topicId: unit.topicId, covered: primaryResourceIds.length > 0 || primaryPathIds.length > 0, primaryResourceIds, primaryPathIds };
  });
  const topicsReport = topics.map(topic => {
    const subset = coveredUnits.filter(u => u.topicId === topic.id);
    return { topicId: topic.id, disciplineId: topic.disciplineId, units: subset.length,
      coveredUnits: subset.filter(u => u.covered).length, covered: subset.length > 0 && subset.every(u => u.covered) };
  });
  const disciplines = (pack.curriculum?.disciplines ?? []).map(d => {
    const subset = topicsReport.filter(t => t.disciplineId === d.id);
    return { disciplineId: d.id, title: d.title, topics: subset.length, coveredTopics: subset.filter(t => t.covered).length };
  });
  const scope = library.scopeReview;
  const scopeReviewed = scope?.status === 'reviewed' && nonempty(scope.reviewer) &&
    nonempty(scope.evidence) && Number.isFinite(Date.parse(scope.reviewedAt)) && Date.parse(scope.reviewedAt) <= at.getTime();
  if (!scopeReviewed) warnings.push('Syllabus scope not reviewed; coverage is provisional');
  const legacyResources = resources.filter(r => r.libraryVersion !== 2).length;
  if (legacyResources) warnings.push(legacyResources + ' legacy resources excluded from didactic coverage');
  const completeConditions = scopeReviewed && topics.length > 0 && topicsReport.every(t => t.covered);
  if (library.status === 'complete' && !completeConditions) errors.push('Complete claim lacks reviewed scope or primary coverage');
  return {
    examId: library.examId, checkedAt: at.toISOString(), configured: true, status: library.status,
    scopeReviewed, isComplete: completeConditions && errors.length === 0, errors, warnings, legacyResources,
    totals: { topics: topics.length, units: units.length, coveredUnits: coveredUnits.filter(u => u.covered).length,
      coveredTopics: topicsReport.filter(t => t.covered).length, v2Resources: resourceResults.length },
    disciplines, topics: topicsReport, units: coveredUnits, resourceResults, pathResults,
    missingUnitTopics: topicsReport.filter(t => !t.units).map(t => t.topicId),
    uncoveredUnitIds: coveredUnits.filter(u => !u.covered).map(u => u.unitId)
  };
}
