import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([['/', 'index.html'], ['/index.html','index.html'], ['/concept.css','concept.css'], ['/concept.js','concept.js']]);
const types = { html:'text/html; charset=utf-8', css:'text/css; charset=utf-8', js:'text/javascript; charset=utf-8' };
createServer(async (request,response) => {
  const file = files.get(new URL(request.url, 'http://127.0.0.1').pathname);
  if (!file) { response.writeHead(404); response.end('Not found'); return; }
  try { const content = await readFile(new URL(file,import.meta.url)); response.writeHead(200,{'Content-Type':types[file.split('.').pop()],'Cache-Control':'no-store'}); response.end(content); }
  catch { response.writeHead(500); response.end('Unable to load concept'); }
}).listen(4176,'127.0.0.1',()=>console.log('Concept preview: http://127.0.0.1:4176'));
