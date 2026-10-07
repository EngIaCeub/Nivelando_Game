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
      const candidateAudit = auditLibrary({ ...pack, resources: candidates, library: { ...library, status: 'planned' }, sourceMap });
      if (candidateAudit.errors.length) throw new Error(`${base}/candidates: ${candidateAudit.errors.join('; ')}`);
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const result = validatePack(pack); if (!result.valid) throw new Error(result.errors.join('; '));
  console.log(`${directory.name}: JSON Schema 2020-12 and factory valid (${pack.questions.length} questions)`);
}
