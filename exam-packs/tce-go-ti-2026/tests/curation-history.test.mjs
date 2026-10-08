import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { withHistoricalContent } from '../../../sites/tce-go-ti-2026/content-bank.js';
import { StudySession } from '../../../core/src/study-ui.js';
import { MemoryStore } from '../../../core/src/storage.js';
import { exportProductionBackup, restoreProductionBackup } from '../../../core/src/production.js';
const load=async name=>JSON.parse(await readFile(new URL('../'+name,import.meta.url),'utf8'));
const history=await load('content-history.json'), active=await load('questions.json');
test('Expansão: os 35 tópicos vazios têm questão aprovada com conteúdo idêntico ao parecer',async()=>{
 const path=new URL('../../../docs/content-review/expansion/',import.meta.url);
 const bytes=await readFile(new URL('QUESTIONS_DRAFT.json',path)),draft=JSON.parse(bytes);
 const baseline=JSON.parse(await readFile(new URL('BASELINE_PACK.json',path),'utf8'));
 const digest=createHash('sha256').update(bytes).digest('hex');
 const reviews=await Promise.all(['LEGAL','TECH','LANGUAGE_SECURITY'].map(async g=>JSON.parse(await readFile(new URL(g+'_QUESTIONS_REVIEW.json',path),'utf8'))));
 const ids=reviews.flatMap(r=>{assert.equal(r.draftSha256.toLowerCase(),digest);return r.approvedQuestionIds;});
 assert.equal(ids.length,35);assert.equal(new Set(ids).size,35);
 const gaps=baseline['content-coverage'].topics.filter(t=>!t.questionCount);assert.equal(gaps.length,35);
 for(const topic of gaps)assert.ok(active.some(q=>q.topicIds.includes(topic.topicId)&&q.reviewStatus==='approved'));
 for(const old of baseline.questions)assert.deepEqual(active.find(q=>q.id===old.id),old);
 for(const proposed of draft){const actual=active.find(q=>q.id===proposed.id);assert.ok(actual);for(const key of ['stem','options','correctOptionId','explanation','explanationByOption'])assert.deepEqual(actual[key],proposed[key]);assert.ok(ids.includes(actual.id));assert.ok(actual.editorialReview.reviewer&&actual.sourceRefs.length);}
});
test('Curadoria: banco ativo exclui legado; lookup preserva texto e rejeita reutilização de ID',()=>{
 assert.equal(history.questions.length,289); assert.equal(history.cards.length,102);
 const combined=withHistoricalContent(active,history.questions);
 for(const legacy of history.questions){assert.deepEqual(combined.find(q=>q.id===legacy.id),legacy);assert.ok(!active.some(q=>q.id===legacy.id));}
 assert.throws(()=>withHistoricalContent(active,[active[0]]),/reutilizado/);
});
test('Curadoria: sessão pausada legada retoma, mantém primeira tentativa e export/import',async()=>{
 const store=new MemoryStore(), engine=new StudySession(store,'tce-go-ti-2026'), old=history.questions[0];
 await engine.start({id:'legacy-run',kind:'simulation',questions:[old],contentVersion:'legacy'});
 await engine.resume('legacy-run'); await engine.answer('legacy-run',old,'a'); await engine.pause('legacy-run');
 const first=await engine.scoring.getFirstAttempt('tce-go-ti-2026','legacy-run',old.id);
 const bank=withHistoricalContent(active,history.questions), persisted=bank.find(q=>q.id===old.id);
 const reloaded=new StudySession(store,'tce-go-ti-2026'); await reloaded.resume('legacy-run');
 await reloaded.answer('legacy-run',persisted,old.correctOptionId,{retake:true});
 assert.deepEqual(await reloaded.scoring.getFirstAttempt('tce-go-ti-2026','legacy-run',old.id),first);
 await reloaded.pause('legacy-run');
 const metadata={appVersion:'1.0.0',storageVersion:1};
 const backup=await exportProductionBackup(store,'tce-go-ti-2026',metadata,{}), restored=new MemoryStore();
 await restoreProductionBackup(restored,backup,{examId:'tce-go-ti-2026',metadata,currentSettings:{}});
 const restoredEngine=new StudySession(restored,'tce-go-ti-2026');
 assert.deepEqual((await restoredEngine.get('legacy-run')).questionIds,[old.id]);
 assert.deepEqual(await restoredEngine.scoring.getFirstAttempt('tce-go-ti-2026','legacy-run',old.id),first);
});
