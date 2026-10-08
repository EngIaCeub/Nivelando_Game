import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { validatePack } from '../core/src/factory.js';
import { auditLibrary } from './library-audit.mjs';

// Optional root supports validating an older local copy with this checkout's dependencies.
const root = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('..', import.meta.url));
const json = async file => JSON.parse(await readFile(resolve(root, file), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const filename of await readdir(resolve(root, 'schemas'))) {
  if (filename.endsWith('.json')) ajv.addSchema(await json(`schemas/${filename}`), filename);
}
for (const filename of await readdir(resolve(root, 'schemas'))) {
  if (filename.endsWith('.json')) ajv.getSchema(filename);
}
function check(value, schema, label) {
  const validate = ajv.getSchema(schema);
  if (!validate(value)) throw new Error(`${label}: ${ajv.errorsText(validate.errors)}`);
}
for (const directory of await readdir(resolve(root, 'exam-packs'), { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const base = `exam-packs/${directory.name}`;
  const pack = Object.fromEntries(await Promise.all(['manifest', 'curriculum', 'resources', 'questions'].map(async name => [name, await json(`${base}/${name}.json`)])));
  check(pack.manifest, 'exam-manifest.schema.json', `${base}/manifest`);
  check(pack.curriculum, 'curriculum.schema.json', `${base}/curriculum`);
  pack.resources.forEach(resource => check(resource, 'resource.schema.json', `${base}/resource/${resource.id}`));
  pack.questions.forEach(question => check(question, 'question.schema.json', `${base}/question/${question.id}`));
  try {
    const flashcards = await json(`${base}/flashcards.json`);
    check(flashcards, 'flashcards.schema.json', `${base}/flashcards`);
    if (flashcards.examId !== directory.name) throw new Error(`${base}/flashcards: examId não corresponde ao pack`);
    const ids = new Set();
    for (const card of flashcards.cards) {
      if (ids.has(card.id)) throw new Error(`${base}/flashcards: ID duplicado ${card.id}`);
      ids.add(card.id);
      for (const topicId of card.topicIds) {
        if (!pack.curriculum.disciplines.some(discipline => discipline.modules.some(module => module.topics.some(topic => topic.id === topicId)))) {
          throw new Error(`${base}/flashcards/${card.id}: topicId inexistente ${topicId}`);
        }
      }
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  // A curated pack explicitly retires legacy banks. Old IDs stay readable, never
  // silently overwritten or reintroduced into the active selection.
  try {
    const history = await json(`${base}/content-history.json`);
    if (history.examId !== directory.name || !Array.isArray(history.questions) || !Array.isArray(history.cards)) throw new Error(`${base}: invalid content history`);
    const cards = (await json(`${base}/flashcards.json`)).cards;
    for (const [kind, current, legacy] of [['questions', pack.questions, history.questions], ['cards', cards, history.cards]]) {
      const ids = new Set(current.map(item => item.id));
      if (legacy.some(item => ids.has(item.id)) || new Set(legacy.map(item => item.id)).size !== legacy.length) throw new Error(`${base}: reused historical ${kind} IDs`);
      if (current.some(item => item.reviewStatus !== 'approved' || item.editorialReview?.status !== 'approved' || !item.editorialReview.reviewer || !item.editorialReview.reviewedAt || !item.provenance?.locator)) throw new Error(`${base}: active ${kind} lacks independent review`);
    }
    history.questions.forEach(q => check(q, 'question.schema.json', `${base}/history/${q.id}`));
    check({examId:history.examId,cards:history.cards}, 'flashcards.schema.json', `${base}/history/cards`);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  let library;
  try { library = await json(`${base}/library.json`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (library) {
    check(library, 'library.schema.json', `${base}/library`);
    const sourceMap = await json(`${base}/source-map.json`);
    const audit = auditLibrary({ ...pack, library, sourceMap });
    if (audit.errors.length) throw new Error(`${base}/library: ${audit.errors.join('; ')}`);
  }
  try {
    const candidates = await json(`${base}/library-candidates.json`);
    check(candidates, 'library-candidates.schema.json', `${base}/library-candidates`);
    if (candidates.length && !library) throw new Error(`${base}: candidates require library.json`);
    if (library && candidates.length) {
      const sourceMap = await json(`${base}/source-map.json`);
      // Candidate paths may intentionally reuse already-active resources. Audit
      // the combined inventory so an unverified candidate is never substituted
      // for the active catalogue and valid active path steps are not orphaned.
      const candidateInventory = [...new Map([...candidates, ...pack.resources].map(resource => [resource.id, resource])).values()];
      const candidateAudit = auditLibrary({ ...pack, resources: candidateInventory, library: { ...library, status: 'planned' }, sourceMap });
      if (candidateAudit.errors.length) throw new Error(`${base}/candidates: ${candidateAudit.errors.join('; ')}`);
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const result = validatePack(pack); if (!result.valid) throw new Error(result.errors.join('; '));
  console.log(`${directory.name}: JSON Schema 2020-12 and factory valid (${pack.questions.length} questions)`);
}
