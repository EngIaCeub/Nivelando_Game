import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = process.argv[2], port = Number(process.argv[3] ?? 4180);
if (!site || !/^[a-z0-9-]+$/.test(site) || !Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Usage: node scripts/preview-standalone.mjs <site-id> [port]');
const root = resolve(fileURLToPath(new URL('../sites/', import.meta.url)), site, 'dist');
await stat(resolve(root, 'index.html'));
const base = '/Nivelando_Game/';
const types = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webmanifest':'application/manifest+json' };
createServer(async (request,response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    if (url.pathname === '/') { response.writeHead(302, {Location:base}); response.end(); return; }
    if (!url.pathname.startsWith(base)) { response.writeHead(404); response.end(); return; }
    const file = resolve(root, decodeURIComponent(url.pathname.slice(base.length)) || 'index.html');
    if (!file.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
    const data = await readFile(file);
    response.writeHead(200, {'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control':'no-store'}); response.end(data);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}${base}`));
