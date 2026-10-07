import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
import { auditLibrary } from '../core/src/library-coverage.js';
export { auditLibrary };

async function main() {
  const args = process.argv.slice(2), examId = args[0];
  if (!examId || !/^[a-z0-9-]+$/.test(examId)) throw new Error('Usage: node scripts/library-audit.mjs <exam-id> [--require-complete] [--output file] [--as-of ISO-date]');
  const flags = new Set(['--require-complete', '--output', '--as-of']);
  for (let i = 1; i < args.length; i++) {
    if (!flags.has(args[i])) throw new Error('Unknown flag: ' + args[i]);
    if (args[i] !== '--require-complete') { if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Missing flag value'); i++; }
  }
  const base = resolve(root, 'exam-packs', examId);
  const json = async name => JSON.parse(await readFile(resolve(base, name + '.json'), 'utf8'));
  const pack = Object.fromEntries(await Promise.all(['manifest', 'curriculum', 'resources', 'source-map'].map(async name =>
    [name === 'source-map' ? 'sourceMap' : name, await json(name)])));
  try { pack.library = await json('library'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const asOf = args.indexOf('--as-of');
  const report = auditLibrary(pack, { now: asOf < 0 ? new Date() : args[asOf + 1] });
  const serialized = JSON.stringify(report, null, 2) + '\n';
  const output = args.indexOf('--output');
  if (output >= 0) await writeFile(resolve(root, args[output + 1]), serialized);
  console.log(serialized);
  if (report.errors.length || (args.includes('--require-complete') && !report.isComplete)) process.exitCode = 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => {
  console.error(error.message); process.exitCode = 1;
});
