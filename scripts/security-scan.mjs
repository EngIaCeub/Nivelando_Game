import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
const root = process.cwd();
const ignored = new Set(['.git', 'node_modules']);
const suspicious = /(ghp_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA|EC|OPENSSH|PGP) PRIVATE KEY-----)/;
const files = [];
async function walk(dir) { for (const entry of await readdir(dir, { withFileTypes: true })) { if (ignored.has(entry.name)) continue; const path = join(dir, entry.name); if (entry.isDirectory()) await walk(path); else files.push(path); } }
await walk(root);
const findings = [];
for (const file of files) { if (file.endsWith('.pdf')) continue; const text = await readFile(file, 'utf8').catch(() => ''); if (suspicious.test(text)) findings.push(relative(root, file)); }
if (findings.length) { console.error(`Potential secrets found: ${findings.join(', ')}`); process.exit(1); }
console.log(`security scan passed: ${files.length} files inspected`);
