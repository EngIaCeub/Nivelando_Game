// Read-only schema, factory, coverage, and active-content checks for STAGED_PACK.
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { validatePack } from '../../../core/src/factory.js';
import { auditLibrary } from '../../../core/src/library-coverage.js';

const here = new URL('./', import.meta.url);
const packRoot = new URL('../../../exam-packs/tce-go-ti-2026/', here);
const schemaRoot = new URL('../../../schemas/', here);
const read = async (root, name) => JSON.parse(await readFile(new URL(name, root), 'utf8'));
const bytes = await readFile(new URL('STAGED_PACK.json', here));
const staged = JSON.parse(bytes);
const digest = createHash('sha256').update(bytes).digest('hex');
const pack = staged.pack;
const schemas = new Ajv2020({ allErrors: true, strict: false });
addFormats(schemas);
for (const name of await readdir(schemaRoot)) {
  if (name.endsWith('.json')) schemas.addSchema(await read(schemaRoot, name), name);
}
const check = (value, schema, label) => {
  const validate = schemas.getSchema(schema);
  if (!validate(value)) throw new Error(`${label}: ${schemas.errorsText(validate.errors)}`);
};

check(pack.library, 'library.schema.json', 'library');
for (const resource of pack.resources) check(resource, 'resource.schema.json', `resource/${resource.id}`);
for (const resource of staged.resourceCandidates ?? []) check(resource, 'resource.schema.json', `candidate/${resource.id}`);
for (const question of pack.questions) check(question, 'question.schema.json', `question/${question.id}`);
const factory = validatePack(pack);
const audit = auditLibrary(pack);
if (audit.errors.length) throw new Error(audit.errors.join('; '));
const ineligibleResources = audit.resourceResults.filter(resource => !resource.eligible);
const requireComplete = process.argv.includes('--require-complete');
const releaseReadinessErrors = factory.errors.filter(error => /\.verified must be true for a release candidate$/.test(error));
const structuralFactoryErrors = factory.errors.filter(error => !releaseReadinessErrors.includes(error));
if (structuralFactoryErrors.length || (requireComplete && factory.errors.length)) throw new Error(factory.errors.join('; '));
if (requireComplete && ineligibleResources.length) throw new Error(`Ineligible resources: ${JSON.stringify(ineligibleResources)}`);
if (requireComplete && (!audit.isComplete || audit.uncoveredUnitIds.length || staged.gaps.length)) {
  throw new Error(`Candidate has open gaps: complete=${audit.isComplete}, uncovered=${audit.uncoveredUnitIds.length}, ledger=${staged.gaps.length}`);
}
const expectedStatus = audit.isComplete && staged.gaps.length === 0 ? 'complete' : 'partial';
if (pack.library.status !== expectedStatus) throw new Error(`Candidate library status must match audit: expected ${expectedStatus}`);
if (pack.library.units.length !== 209 || new Set(pack.library.units.map(unit => unit.id)).size !== 209) {
  throw new Error('Expected 209 unique study units');
}
const topics = pack.curriculum.disciplines.flatMap(d => d.modules.flatMap(m => m.topics));
if (topics.length !== 45 || new Set(pack.library.units.map(unit => unit.topicId)).size !== 45) {
  throw new Error('Expected unit coverage across all 45 original topics');
}
if (new Set(pack.resources.map(resource => resource.id)).size !== pack.resources.length) throw new Error('Duplicate resource IDs');
const activeIds = new Set(pack.resources.map(resource => resource.id));
const candidateIds = (staged.resourceCandidates ?? []).map(resource => resource.id);
if (new Set(candidateIds).size !== candidateIds.length || candidateIds.some(id => activeIds.has(id))) {
  throw new Error('Resource candidates must have unique IDs outside the active inventory');
}
if ((staged.resourceCandidates ?? []).some(resource => resource.verified === true || resource.verification?.result === 'reachable')) {
  throw new Error('Reachable resources belong in the active inventory, not the candidate queue');
}
const ineligiblePaths = audit.pathResults.filter(path => !path.eligible);
if (requireComplete && ineligiblePaths.length) throw new Error(`Ineligible study paths: ${JSON.stringify(ineligiblePaths)}`);
const activeQuestions = await read(packRoot, 'questions.json');
if (JSON.stringify(activeQuestions) !== JSON.stringify(pack.questions)) throw new Error('Staging changed active approved questions');
const history = await read(packRoot, 'content-history.json');
if (!history.questions?.length || !history.cards?.length) throw new Error('Active legacy content history is missing');

console.log(JSON.stringify({
  candidateSha256: digest,
  factoryValid: structuralFactoryErrors.length === 0,
  releaseReady: factory.valid,
  releaseReadinessErrors: releaseReadinessErrors.length,
  schemaErrors: 0,
  status: pack.library.status,
  completeAuditRequired: requireComplete,
  units: pack.library.units.length,
  topics: topics.length,
  coveredUnits: audit.totals.coveredUnits,
  uncoveredUnits: audit.uncoveredUnitIds.length,
  documentedGaps: staged.gaps.length,
  resources: pack.resources.length,
  ineligibleResources: ineligibleResources.length,
  studyPaths: audit.pathResults.length,
  ineligiblePaths: ineligiblePaths.length,
  questions: pack.questions.length,
  questionsMatchActive: true,
  legacyHistory: { questions: history.questions.length, flashcards: history.cards.length }
}));
