import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const resources = JSON.parse(await readFile(resolve(root, 'exam-packs/tce-go-ti-2026/resources.json'), 'utf8'));
const checkedAt = new Date().toISOString();
const results = [];
for (const url of new Set(resources.map((resource) => resource.url))) {
  let record;
  try {
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(12000) });
    if ([403, 405].includes(response.status)) { response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(12000) }); await response.body?.cancel(); }
    record = { url, status: response.status, finalUrl: response.url, checkResult: response.ok ? 'reachable' : 'http-error' };
  } catch (error) { record = { url, checkResult: 'unverified-this-run', error: error.name }; }
  results.push(record); console.log(`${record.checkResult}: ${url}`);
}
await writeFile(resolve(root, 'docs/O4_LINK_CHECKS.json'), `${JSON.stringify({ checkedAt, results, policy: 'Availability checks only; verified provenance classification was not changed.' }, null, 2)}\n`);
