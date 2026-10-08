import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,extname,sep} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
import {buildStandalone} from './build-standalone.mjs';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
const root=fileURLToPath(new URL('../',import.meta.url));
const dist=await mkdtemp(join(tmpdir(),'studyos-p1-'));
await buildStandalone({root,examId:'tce-go-ti-2026',dist,buildId:'p1-resume-test',commitSha:'local-p1'});
const server=createServer(async(req,res)=>{try{const p=resolve(dist,decodeURIComponent(new URL(req.url,'http://localhost').pathname.slice('/study/'.length))||'index.html');if(!p.startsWith(dist+sep))throw Error('path');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'})[extname(p)]??'application/octet-stream');res.end(await readFile(p));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser=await chromium.launch({headless:true,...(existsSync(edge)?{executablePath:edge}:{})});
const context=await browser.newContext();const page=await context.newPage();page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.argv[2] ?? `http://127.0.0.1:${server.address().port}/study/`;
const evidence={isolation:'new browser context; synthetic data',checks:[]};
const snapshot=()=>page.evaluate(async()=>{const {IndexedDbStore}=await import('./core/src/storage.js');const s=new IndexedDbStore({name:'studyos-tce-go-ti-2026-v2',version:2});return {scores:await s.query('tce-go-ti-2026','scores'),xp:await s.query('tce-go-ti-2026','xp-awards')};});
try{
 await page.goto(base+'#library');const lib=page.locator('#library');
 await lib.getByText('209 de 209 unidades',{exact:false}).waitFor();
 assert.match(await lib.locator('.library-result-status').innerText(),/309 materiais.*43 percursos/);
 const before=await snapshot();
 await lib.getByLabel('Conteúdo',{exact:true}).selectOption('lp-texto');
 assert.ok(await lib.locator('.library-unit h4').count()>0);
 assert.equal(await lib.getByText('Lacuna:',{exact:false}).count(),0);
 const links=await lib.locator('a[target="_blank"]').evaluateAll(nodes=>nodes.map(n=>({url:n.href,rel:n.rel})));
 assert.ok(links.length>0);assert.ok(links.every(l=>/^https?:/.test(l.url)&&l.rel.includes('noopener')));
 await lib.getByRole('searchbox').fill('zzzz-inexistente-p1');
 await lib.getByRole('heading',{name:'Nenhum material neste filtro'}).waitFor();
 await lib.getByRole('button',{name:'Limpar filtros',exact:true}).press('Enter');
 assert.match(await lib.locator('.library-result-status').innerText(),/309 materiais.*43 percursos/);
 evidence.checks.push('209/209 coverage; 309 resources/43 paths; topic objectives, safe links, empty search, keyboard clear');
 for(const width of [1280,390]){
 await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:resolve(root,`docs/UX_P1_LIBRARY_${width}.png`)});
 }
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.reload();await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
 await context.setOffline(true);await page.reload();
 await lib.getByText('209 de 209 unidades',{exact:false}).waitFor();
 await lib.getByLabel('Conteúdo',{exact:true}).selectOption('lp-texto');
 assert.ok(await lib.locator('.library-unit h4').count()>0);
 assert.deepEqual(await snapshot(),before);assert.deepEqual(errors,[]);
 evidence.checks.push('desktop/mobile without overflow; real SW offline catalog reload/filter; score/XP unchanged');
 evidence.base=base;evidence.passed=true;console.log(JSON.stringify(evidence));
}catch(error){evidence.error=String(error.stack);console.error(error);process.exitCode=1;}finally{await writeFile(resolve(root,'docs/UX_P1_LIBRARY_BROWSER.json'),JSON.stringify(evidence,null,2));await context.close();await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
