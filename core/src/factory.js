const STATUSES = new Set(['draft', 'validated', 'released']);
const BUILD_MODES = new Set(['standalone', 'hub']);
const PROVENANCE_STATUSES = new Set(['verified', 'derived', 'assumption']);

function required(object, fields, path, errors) {
  for (const field of fields) if (object?.[field] === undefined || object[field] === null) errors.push(`${path}.${field} is required`);
}

function validateManifest(manifest, errors) {
  required(manifest, ['examId', 'title', 'status', 'sourceRefs', 'buildModes'], 'manifest', errors);
  if (manifest?.examId && !/^[a-z0-9-]+$/.test(manifest.examId)) errors.push('manifest.examId has invalid format');
  if (manifest?.status && !STATUSES.has(manifest.status)) errors.push('manifest.status is invalid');
  if (Array.isArray(manifest?.buildModes) && manifest.buildModes.some((mode) => !BUILD_MODES.has(mode))) errors.push('manifest.buildModes contains an invalid mode');
}

function validateCurriculum(curriculum, errors) {
  required(curriculum, ['examId', 'disciplines'], 'curriculum', errors);
  for (const [dIndex, discipline] of (curriculum?.disciplines ?? []).entries()) {
    required(discipline, ['id', 'title', 'modules'], `curriculum.disciplines[${dIndex}]`, errors);
    for (const [mIndex, module] of (discipline.modules ?? []).entries()) {
      required(module, ['id', 'title', 'topics'], `curriculum.disciplines[${dIndex}].modules[${mIndex}]`, errors);
      for (const [tIndex, topic] of (module.topics ?? []).entries()) required(topic, ['id', 'title', 'canonicalConceptIds'], `curriculum.disciplines[${dIndex}].modules[${mIndex}].topics[${tIndex}]`, errors);
    }
  }
}

function validateResource(resource, index, errors) {
  required(resource, ['id', 'examId', 'title', 'type', 'topicIds', 'url', 'verified'], `resources[${index}]`, errors);
  if (resource?.verified !== true) errors.push(`resources[${index}].verified must be true for a release candidate`);
}

function validateQuestion(question, index, errors) {
  required(question, ['id', 'examId', 'stem', 'options', 'correctOptionId', 'provenance'], `questions[${index}]`, errors);
  if (!Array.isArray(question?.options) || question.options.length < 2) errors.push(`questions[${index}].options needs at least two options`);
  if (question?.options && !question.options.some((option) => option.id === question.correctOptionId)) errors.push(`questions[${index}].correctOptionId is not in options`);
  if (!PROVENANCE_STATUSES.has(question?.provenance?.status) || typeof question?.provenance?.source !== 'string' || !question.provenance.source.trim()) errors.push(`questions[${index}].provenance is incomplete`);
}

export function validatePack(pack) {
  const errors = [];
  if (!pack || typeof pack !== 'object') return { valid: false, errors: ['pack is required'] };
  validateManifest(pack.manifest, errors);
  validateCurriculum(pack.curriculum, errors);
  for (const [index, resource] of (pack.resources ?? []).entries()) validateResource(resource, index, errors);
  for (const [index, question] of (pack.questions ?? []).entries()) validateQuestion(question, index, errors);
  if (pack.manifest?.examId && pack.curriculum?.examId && pack.manifest.examId !== pack.curriculum.examId) errors.push('manifest.examId and curriculum.examId must match');
  return { valid: errors.length === 0, errors };
}

export function createStandaloneConfig(pack) {
  const result = validatePack(pack);
  if (!result.valid) throw new Error(`invalid pack: ${result.errors.join('; ')}`);
  return { mode: 'standalone', manifest: structuredClone(pack.manifest), curriculum: structuredClone(pack.curriculum), resources: structuredClone(pack.resources ?? []), questions: structuredClone(pack.questions ?? []) };
}

export function createHubCatalog(packs) {
  if (!Array.isArray(packs)) throw new TypeError('packs must be an array');
  return packs.map((pack) => {
    const result = validatePack(pack);
    if (!result.valid) throw new Error(`invalid pack: ${result.errors.join('; ')}`);
    return { examId: pack.manifest.examId, title: pack.manifest.title, status: pack.manifest.status };
  });
}
