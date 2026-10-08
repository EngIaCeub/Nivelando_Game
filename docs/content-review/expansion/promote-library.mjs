// Promote only the exact library candidate inspected by independent integration QA.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { auditLibrary } from '../../../core/src/library-coverage.js';
import { validatePack } from '../../../core/src/factory.js';
import { appendLibrarySnapshot } from './archive-library-history.mjs';

const base = new URL('./', import.meta.url);
const packRoot = new URL('../../../exam-packs/tce-go-ti-2026/', base);
const schemas = new URL('../../../schemas/', base);
const load = async (root, name) => JSON.parse(await readFile(new URL(name, root), 'utf8'));
const save = async (root, name, value) => writeFile(new URL(name, root), JSON.stringify(value, null, 2) + '\n');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const bytes = await readFile(new URL('STAGED_PACK.json', base));
const staged = JSON.parse(bytes);
const digest = createHash('sha256').update(bytes).digest('hex');
const qa = await load(base, 'INTEGRATION_QA.json');
if (qa.status !== 'approved' || qa.stagedSha256 !== digest || !qa.reviewer || !qa.reviewedAt || !qa.evidence) {
  throw new Error('Independent integration QA must approve this exact staged SHA-256');
}
const authors = await Promise.all(['LEGAL', 'TECH', 'LANGUAGE_SECURITY'].map(group => load(base, group + '_SOURCES_REVIEW.json')));
if (authors.some(report => report.reviewer === qa.reviewer)) throw new Error('Integration QA must be independent of source authors');
const { pack } = staged;
const audit = auditLibrary(pack);
if (audit.errors.length) throw new Error(audit.errors.join('; '));
if (pack.library.status === 'complete' && (!audit.isComplete || staged.gaps.length || qa.completeApproved !== true)) {
  throw new Error('Complete claim needs all units covered, no unresolved gap, and independent full approval');
}
if (!pack.resources.length || new Set(pack.resources.map(r => r.id)).size !== pack.resources.length) throw new Error('Invalid resource inventory');
const currentQuestions = await load(packRoot, 'questions.json');
if (JSON.stringify(currentQuestions) !== JSON.stringify(pack.questions)) throw new Error('Library promotion must preserve the approved active questions');
const currentTopics = (await load(packRoot, 'curriculum.json')).disciplines.flatMap(d => d.modules.flatMap(m => m.topics)).map(t => t.id);
const stagedTopics = pack.curriculum.disciplines.flatMap(d => d.modules.flatMap(m => m.topics)).map(t => t.id);
if (JSON.stringify(currentTopics) !== JSON.stringify(stagedTopics)) throw new Error('Topic IDs must remain stable');
const factory = validatePack(pack);
if (!factory.valid) throw new Error(factory.errors.join('; '));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const name of await readdir(schemas)) if (name.endsWith('.json')) ajv.addSchema(await load(schemas, name), name);
const check = (value, schema) => {
  const validate = ajv.getSchema(schema);
  if (!validate(value)) throw new Error(schema + ': ' + ajv.errorsText(validate.errors));
};
check(pack.library, 'library.schema.json');
for (const resource of pack.resources) check(resource, 'resource.schema.json');
for (const question of pack.questions) check(question, 'question.schema.json');
const resourceCandidates = staged.resourceCandidates ?? [];
for (const resource of resourceCandidates) check(resource, 'resource.schema.json');
if (resourceCandidates.some(resource => resource.verified === true || resource.verification?.result === 'reachable')) {
  throw new Error('Only unverified resources may remain in library-candidates.json');
}
const activeResourceIds = new Set(pack.resources.map(resource => resource.id));
const existingCandidates = await load(packRoot, 'library-candidates.json');
const candidateById = new Map([...existingCandidates, ...resourceCandidates]
  .filter(resource => !activeResourceIds.has(resource.id)).map(resource => [resource.id, resource]));
const candidateCatalog = [...candidateById.values()];
check(candidateCatalog, 'library-candidates.schema.json');

// Archive the state being replaced, not the older curation baseline. The helper
// migrates the legacy archive into an append-only snapshots list and is idempotent.
const archivedAt = new Date().toISOString();
const activeLibrary = await load(packRoot, 'library.json');
const activeResources = await load(packRoot, 'resources.json');
const existingHistory = await load(packRoot, 'library-history.json');
const { history } = appendLibrarySnapshot(existingHistory, {
  schemaVersion: 1, examId: pack.manifest.examId, archivedAt,
  reason: 'Active catalog snapshot archived before approved library promotion.',
  sourceHashes: {
    librarySha256: hash(await readFile(new URL('library.json', packRoot))),
    resourcesSha256: hash(await readFile(new URL('resources.json', packRoot)))
  },
  library: activeLibrary, resources: activeResources
});
const coverage = structuredClone(await load(packRoot, 'content-coverage.json'));
coverage.generatedAt = new Date().toISOString();
for (const topic of coverage.topics) {
  const selected = pack.resources.filter(resource => resource.topicIds.includes(topic.topicId));
  topic.resourceCount = selected.length;
  topic.videoCount = selected.filter(r => r.type === 'video').length;
  if ('verifiedResourceCount' in topic) topic.verifiedResourceCount = selected.filter(r => r.verified).length;
  topic.exception = 'Cobertura parcial do banco: há questão aprovada; cobertura da biblioteca é auditada por unidade, separadamente do progresso e do score.';
}
await save(packRoot, 'library-history.json', history);
await save(packRoot, 'resources.json', pack.resources);
await save(packRoot, 'library.json', pack.library);
await save(packRoot, 'library-candidates.json', candidateCatalog);
await save(packRoot, 'source-map.json', pack.sourceMap);
await save(packRoot, 'content-coverage.json', coverage);
await save(base, 'LIBRARY_RESULT.json', { promotedAt: new Date().toISOString(), stagedSha256: digest,
  reviewer: qa.reviewer, status: pack.library.status, totals: audit.totals, uncoveredUnitIds: audit.uncoveredUnitIds,
  gaps: staged.gaps, historyFile: 'exam-packs/tce-go-ti-2026/library-history.json' });
console.log(JSON.stringify({ status: pack.library.status, ...audit.totals }));
