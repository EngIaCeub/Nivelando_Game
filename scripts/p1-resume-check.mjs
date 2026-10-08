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
const snapshot=()=>page.evaluate(async()=>{const {IndexedDbStore}=await import('./core/src/storage.js');const s=new IndexedDbStore({name:'studyos-tce-go-ti-2026-v2',version:2});return {runs:await s.query('tce-go-ti-2026','study-sessions'),scores:await s.query('tce-go-ti-2026','scores'),events:await s.query('tce-go-ti-2026','events'),xp:await s.query('tce-go-ti-2026','xp-awards')};});
try{
 console.log('Open isolated practice pool');await page.goto(base+'#simulations');await page.getByRole('button',{name:'Escolher simulado',exact:true}).click();await page.getByRole('button',{name:'Treino revisado — 10 questões originais (parcial)',exact:true}).click();
 const q=page.locator('#questions');await q.locator('.quiz-option').first().click();await q.locator('.study-feedback').waitFor();
 const before=await snapshot();assert.equal(before.runs.length,1);assert.equal(before.runs[0].responses.length,1);console.log('Answered; reload');
 await page.reload();await page.locator('#questions-resume button').first().waitFor();assert.equal(await q.isVisible(),true);
 await page.locator('#questions-resume button').first().press('Enter');await q.locator('.study-feedback').waitFor();
 const after=await snapshot();assert.deepEqual(after.scores,before.scores);assert.deepEqual(after.events.filter(e=>e.type==='question_answered'),before.events.filter(e=>e.type==='question_answered'));assert.deepEqual(after.xp,before.xp);assert.deepEqual(after.runs[0].responses,before.runs[0].responses);assert.equal(after.runs[0].cursor,before.runs[0].cursor);
 evidence.checks.push('answered active simulation → reload #questions → keyboard resume; responses/score/answer events/XP unchanged');console.log('Resume after answer passed');
 await q.getByRole('button',{name:'Continuar',exact:true}).click();await q.locator('.quiz-option').first().waitFor();
 const moved=await snapshot();assert.equal(moved.runs[0].cursor,1);
 await q.getByRole('button',{name:'Pausar e continuar depois',exact:true}).click();await page.locator('#questions-resume button').first().waitFor();
 await page.getByRole('link',{name:'Hoje',exact:true}).click();await page.locator('#study-resume button').first().waitFor();assert.equal(await page.locator('#study-resume').isVisible(),true);
 await page.reload();await page.locator('#study-resume button').first().click();await q.locator('.quiz-option').first().waitFor();const resumed=await snapshot();assert.equal(resumed.runs[0].cursor,1);assert.deepEqual(resumed.scores,moved.scores);assert.deepEqual(resumed.xp,moved.xp);
 evidence.checks.push('pause → Hoje CTA → reload → resume retains cursor 1 without score/XP mutation');
 await page.setViewportSize({width:390,height:844});await q.getByRole('button',{name:'Pausar e continuar depois',exact:true}).click();await page.locator('#questions-resume button').first().waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:resolve(root,'docs/UX_P1_RESUME_MOBILE.png')});evidence.checks.push('mobile pending CTA visible, no horizontal overflow');assert.deepEqual(errors,[]);
 evidence.passed=true;console.log(JSON.stringify(evidence,null,2));
}catch(error){evidence.error=String(error.stack);console.error(error);process.exitCode=1;}finally{await writeFile(resolve(root,'docs/UX_P1_RESUME_EVIDENCE.json'),JSON.stringify(evidence,null,2));await context.close();await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}



