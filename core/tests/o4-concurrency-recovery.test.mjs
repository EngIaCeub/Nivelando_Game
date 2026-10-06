import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { MemoryStore } from '../src/storage.js';

const examId = 'o4-concurrency-recovery';
const metadata = { appVersion: '1.0.0', storageVersion: 2 };

test('O4 update parity: clones updater input and rejects async/throw without changing state', async () => {
  const store = new MemoryStore();
  await store.put(examId, 'records', 'value', { nested: { count: 1 } });
  const returned = await store.update(examId, 'records', 'value', previous => {
    previous.nested.count = 2;
    return previous;
  });
  assert.equal(returned.previous.nested.count, 1);
  assert.equal((await store.get(examId, 'records', 'value')).nested.count, 2);

  await assert.rejects(store.update(examId, 'records', 'value', async previous => previous), /synchronous/);
  await assert.rejects(store.update(examId, 'records', 'value', () => { throw new Error('updater failed'); }), /updater failed/);
  await assert.rejects(store.update(examId, 'records', 'value', () => () => 'not cloneable'));
  assert.equal((await store.get(examId, 'records', 'value')).nested.count, 2);
});

let playwright;
try {
  playwright = await import(process.env.STUDYOS_PLAYWRIGHT_MODULE
    ? pathToFileURL(process.env.STUDYOS_PLAYWRIGHT_MODULE).href
    : 'playwright');
} catch { /* Browser-backed evidence is reported as skipped when unavailable. */ }

test('O4 native IDB: concurrent plan transitions, replan and extra activity preserve all committed state', { skip: !playwright && 'Playwright unavailable; set STUDYOS_PLAYWRIGHT_MODULE' }, async () => {
  const server = createServer(async (request, response) => {
    if (request.url === '/') { response.end('<!doctype html><title>O4 concurrency</title>'); return; }
    if (!/^\/core\/src\/[a-z-]+\.js$/.test(request.url)) { response.writeHead(404); response.end(); return; }
    try {
      response.setHeader('Content-Type', 'text/javascript');
      response.end(await readFile(new URL(`../../${request.url.slice(1)}`, import.meta.url)));
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, ...(process.env.STUDYOS_CHROMIUM_EXECUTABLE ? { executablePath: process.env.STUDYOS_CHROMIUM_EXECUTABLE } : {}) });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const result = await page.evaluate(async () => {
      const { IndexedDbStore } = await import('/core/src/storage.js');
      const { TodayPlanEngine } = await import('/core/src/today-planner.js');
      const curriculum = { examId: 'generic', disciplines: [{ id: 'd', title: 'D', modules: [{ id: 'm', title: 'M', topics: [1, 2, 3].map(n => ({ id: `t${n}`, title: `Topic ${n}`, canonicalConceptIds: [`c${n}`], estimatedMinutes: 30 })) }] }] };
      const input = { examId: 'generic', date: '2031-04-05', availableMinutes: 60, curriculum, now: '2031-04-05T09:00:00.000Z' };
      const leftStore = new IndexedDbStore({ name: 'o4-concurrent-plan', version: 1 });
      const rightStore = new IndexedDbStore({ name: 'o4-concurrent-plan', version: 1 });
      const left = new TodayPlanEngine(leftStore);
      const right = new TodayPlanEngine(rightStore);
      const plan = await left.generate(input);
      let updaterPromiseRejected = false;
      try { await leftStore.update(input.examId, 'update-check', 'async', async previous => previous ?? { ok: true }); }
      catch (error) { updaterPromiseRejected = /synchronous/.test(error.message); }
      await leftStore.put(input.examId, 'update-check', 'throw', { value: 1 });
      let updaterThrowRejected = false;
      try { await rightStore.update(input.examId, 'update-check', 'throw', () => { throw new Error('injected updater throw'); }); }
      catch (error) { updaterThrowRejected = /injected updater throw/.test(error.message); }
      let updaterCloneRejected = false;
      try { await rightStore.update(input.examId, 'update-check', 'throw', () => () => 'not cloneable'); }
      catch { updaterCloneRejected = true; }
      const updaterState = await leftStore.get(input.examId, 'update-check', 'throw');
      const two = plan.activities.slice(0, 2);
      await Promise.all([
        left.completeActivity({ examId: input.examId, date: input.date, activityId: two[0].activityId, timestamp: '2031-04-05T10:00:00.000Z' }),
        right.completeActivity({ examId: input.examId, date: input.date, activityId: two[0].activityId, timestamp: '2031-04-05T10:01:00.000Z' }),
        right.completeActivity({
          examId: input.examId, date: input.date, activityId: two[1].activityId,
          timestamp: '2031-04-05T10:02:00.000Z'
        })
      ]);
      const afterCompletions = await right.get(input.examId, input.date);
      const [replanned, extraPlan] = await Promise.all([
        left.replan({ ...input, availableMinutes: 90, now: '2031-04-05T11:00:00.000Z' }),
        right.addExtraActivity({ examId: input.examId, date: input.date, topicId: 'extra-topic', minutes: 15 })
      ]);
      const finalPlan = await left.get(input.examId, input.date);
      return {
        afterMinutes: afterCompletions.completedMinutes,
        afterCompletedCount: afterCompletions.activities.filter(a => a.status === 'completed').length,
        completedCount: finalPlan.activities.filter(a => a.status === 'completed').length,
        completedMinutes: finalPlan.completedMinutes,
        extraCount: finalPlan.activities.filter(a => a.source === 'extra-study').length,
        uniqueIds: new Set(finalPlan.activities.map(a => a.activityId)).size === finalPlan.activities.length,
        replanGeneration: finalPlan.replanGeneration,
        extraPresentInReturnedReplan: replanned.activities.some(a => a.source === 'extra-study'),
        extraPresentInReturnedAdd: extraPlan.activities.some(a => a.source === 'extra-study'),
        updaterPromiseRejected, updaterThrowRejected, updaterCloneRejected, updaterState
      };
    });
    assert.equal(result.afterMinutes, 60);
    assert.equal(result.afterCompletedCount, 2);
    assert.equal(result.completedCount, 2);
    assert.equal(result.completedMinutes, 60);
    assert.equal(result.extraCount, 1);
    assert.equal(result.uniqueIds, true);
    assert.ok(result.replanGeneration >= 1);
    assert.equal(result.updaterPromiseRejected, true);
    assert.equal(result.updaterThrowRejected, true);
    assert.equal(result.updaterCloneRejected, true);
    assert.deepEqual(result.updaterState, { value: 1 });
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});

test('O4 native IDB: completion replay repairs activity-state, event and XP after projection failures', { skip: !playwright && 'Playwright unavailable; set STUDYOS_PLAYWRIGHT_MODULE' }, async () => {
  const server = createServer(async (request, response) => {
    if (request.url === '/') { response.end('<!doctype html><title>O4 plan recovery</title>'); return; }
    if (!/^\/core\/src\/[a-z-]+\.js$/.test(request.url)) { response.writeHead(404); response.end(); return; }
    try {
      response.setHeader('Content-Type', 'text/javascript');
      response.end(await readFile(new URL(`../../${request.url.slice(1)}`, import.meta.url)));
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, ...(process.env.STUDYOS_CHROMIUM_EXECUTABLE ? { executablePath: process.env.STUDYOS_CHROMIUM_EXECUTABLE } : {}) });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const result = await page.evaluate(async () => {
      const { IndexedDbStore } = await import('/core/src/storage.js');
      const { TodayPlanEngine } = await import('/core/src/today-planner.js');
      const { GamificationEngine } = await import('/core/src/gamification.js');
      const store = new IndexedDbStore({ name: 'o4-plan-projection-recovery', version: 1 });
      const engine = new TodayPlanEngine(store);
      const examId = 'generic';
      const input = { examId, date: '2031-04-06', availableMinutes: 60, now: '2031-04-06T09:00:00.000Z', curriculum: { examId, disciplines: [{ id: 'd', title: 'D', modules: [{ id: 'm', title: 'M', topics: [1, 2].map(n => ({ id: `t${n}`, title: `Topic ${n}`, canonicalConceptIds: [`c${n}`], estimatedMinutes: 30 })) }] }] } };
      const plan = await engine.generate(input);
      const originalPut = IDBObjectStore.prototype.put;
      let failStateProjection = true;
      IDBObjectStore.prototype.put = function(row, ...args) {
        const request = originalPut.call(this, row, ...args);
        if (failStateProjection && row?.collection === 'activity-state') {
          failStateProjection = false;
          request.addEventListener('success', () => this.transaction.abort());
        }
        return request;
      };
      let stateFailure = false;
      try { await engine.completeActivity({ examId, date: input.date, activityId: plan.activities[0].activityId, timestamp: '2031-04-06T10:00:00.000Z' }); }
      catch { stateFailure = true; }
      IDBObjectStore.prototype.put = originalPut;
      const afterStateFailure = await engine.get(examId, input.date);
      const missingProjectionBeforeRetry = await store.get(examId, 'activity-state', plan.activities[0].activityId) === undefined;
      await engine.completeActivity({ examId, date: input.date, activityId: plan.activities[0].activityId, timestamp: '2031-04-06T10:30:00.000Z' });
      const firstEventCount = (await store.query(examId, 'events')).filter(event => event.type === 'activity_completed').length;

      let failXpProjection = true;
      IDBObjectStore.prototype.put = function(row, ...args) {
        const request = originalPut.call(this, row, ...args);
        if (failXpProjection && row?.collection === 'xp-awards') {
          failXpProjection = false;
          request.addEventListener('success', () => this.transaction.abort());
        }
        return request;
      };
      let xpFailure = false;
      try { await engine.completeActivity({ examId, date: input.date, activityId: plan.activities[1].activityId, timestamp: '2031-04-06T11:00:00.000Z' }); }
      catch { xpFailure = true; }
      IDBObjectStore.prototype.put = originalPut;
      const beforeXpRetry = await engine.get(examId, input.date);
      const xpBeforeRetry = await new GamificationEngine(store).total(examId);
      const awardsBeforeXpRetry = await store.query(examId, 'xp-awards');
      await engine.completeActivity({ examId, date: input.date, activityId: plan.activities[1].activityId, timestamp: '2031-04-06T11:30:00.000Z' });
      return {
        stateFailure, missingProjectionBeforeRetry, firstState: await store.get(examId, 'activity-state', plan.activities[0].activityId),
        firstEventCount,
        afterStateCompletedAt: afterStateFailure.activities[0].completedAt,
        xpFailure, minutesBeforeXpRetry: beforeXpRetry.completedMinutes, xpBeforeRetry, awardsBeforeXpRetry,
        final: await engine.get(examId, input.date), finalAwards: await store.query(examId, 'xp-awards'), awardCount: (await store.query(examId, 'xp-awards')).filter(award => award.eventId.startsWith('activity_completed:')).length,
        xp: await new GamificationEngine(store).total(examId)
      };
    });
    assert.equal(result.stateFailure, true);
    assert.equal(result.missingProjectionBeforeRetry, true);
    assert.equal(result.firstState.status, 'completed');
    assert.equal(result.firstEventCount, 1);
    assert.equal(result.afterStateCompletedAt, '2031-04-06T10:00:00.000Z');
    assert.equal(result.xpFailure, true);
    assert.equal(result.minutesBeforeXpRetry, 60);
    assert.equal(result.xpBeforeRetry, 5, JSON.stringify(result.awardsBeforeXpRetry));
    assert.equal(result.final.completedMinutes, 60);
    assert.equal(result.final.activities.filter(activity => activity.status === 'completed').length, 2);
    assert.equal(result.awardCount, 2);
    assert.equal(result.finalAwards.filter(award => award.type === 'activity_completed').reduce((sum, award) => sum + award.xp, 0), 10);
    assert.equal(result.finalAwards.filter(award => award.type === 'daily_goal_completed').reduce((sum, award) => sum + award.xp, 0), 25);
    assert.equal(result.xp, 35);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});

test('O4 native IDB: pending retake replays once after score commit and receipt survives backup restore', { skip: !playwright && 'Playwright unavailable; set STUDYOS_PLAYWRIGHT_MODULE' }, async () => {
  const server = createServer(async (request, response) => {
    if (request.url === '/') { response.end('<!doctype html><title>O4 recovery</title>'); return; }
    if (!/^\/core\/src\/[a-z-]+\.js$/.test(request.url)) { response.writeHead(404); response.end(); return; }
    try {
      response.setHeader('Content-Type', 'text/javascript');
      response.end(await readFile(new URL(`../../${request.url.slice(1)}`, import.meta.url)));
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, ...(process.env.STUDYOS_CHROMIUM_EXECUTABLE ? { executablePath: process.env.STUDYOS_CHROMIUM_EXECUTABLE } : {}) });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const result = await page.evaluate(async () => {
      const { IndexedDbStore } = await import('/core/src/storage.js');
      const { ScoringEngine } = await import('/core/src/scoring.js');
      const { StudySession } = await import('/core/src/study-ui.js');
      const { exportProductionBackup, restoreProductionBackup } = await import('/core/src/production.js');
      const namespace = 'generic';
      const store = new IndexedDbStore({ name: 'o4-retake-recovery', version: 1 });
      const question = { id: 'q', topicIds: [], canonicalConceptIds: [], stem: 'Q', options: [{ id: 'a' }, { id: 'b' }], correctOptionId: 'b' };
      const session = new StudySession(store, namespace);
      await session.start({ id: 'run', questions: [question] });
      await session.resume('run');
      await session.answer('run', question, 'a');
      const first = (await session.get('run')).responses[0];
      const firstOperationId = `study-answer:${namespace}:run:q:${first.timestamp}`;
      const firstReplay = await session.scoring.submitAnswer({ examId: namespace, simulationRunId: 'run', questionId: 'q', correct: false, timestamp: first.timestamp, operationId: firstOperationId });
      const originalSubmit = session.scoring.submitAnswer.bind(session.scoring);
      let failAfterDurableScore = true;
      session.scoring.submitAnswer = async args => {
        const outcome = await originalSubmit(args);
        if (args.operationId && failAfterDurableScore) { failAfterDurableScore = false; throw new Error('injected crash after score commit'); }
        return outcome;
      };
      let injected = false;
      try { await session.answer('run', question, 'b', { retake: true }); }
      catch (error) { injected = /injected crash/.test(error.message); }
      const pending = await session.get('run');
      const backup = await exportProductionBackup(store, namespace, { appVersion: '1.0.0', storageVersion: 1 }, { dailyMinutes: 60 });
      const restored = new IndexedDbStore({ name: 'o4-retake-recovery-restored', version: 1 });
      await restoreProductionBackup(restored, backup, { examId: namespace, metadata: { appVersion: '1.0.0', storageVersion: 1 }, currentSettings: {} });
      const restoredPending = await restored.get(namespace, 'study-sessions', 'run');
      const recovered = await new StudySession(restored, namespace).resume('run');
      const receipts = await restored.query(namespace, 'retake-operations');
      const savedRetakeReceipt = receipts.find(receipt => receipt.firstAttempt === false);
      const replayRetake = await new ScoringEngine(restored).submitAnswer({ examId: namespace, simulationRunId: 'run', questionId: 'q', correct: true, timestamp: savedRetakeReceipt.timestamp, operationId: savedRetakeReceipt.operationId });
      const retakes = await restored.query(namespace, 'retakes');
      const score = await new ScoringEngine(restored).getScore(namespace, 'run');
      const collisionEngine = new ScoringEngine(restored);
      const retakeReceipt = savedRetakeReceipt;
      const collisions = await Promise.all([
        collisionEngine.submitAnswer({ examId: namespace, simulationRunId: 'run', questionId: 'q', correct: false, timestamp: retakeReceipt.timestamp, operationId: retakeReceipt.operationId }).then(() => false, () => true),
        collisionEngine.submitAnswer({ examId: namespace, simulationRunId: 'other-run', questionId: 'q', correct: true, timestamp: retakeReceipt.timestamp, operationId: retakeReceipt.operationId }).then(() => false, () => true),
        collisionEngine.submitAnswer({ examId: namespace, simulationRunId: 'run', questionId: 'other-q', correct: true, timestamp: retakeReceipt.timestamp, operationId: retakeReceipt.operationId }).then(() => false, () => true)
      ]);
      return {
        injected, pendingRetake: pending.pending?.response?.retake === true,
        backupPendingRetake: restoredPending.pending?.response?.retake === true,
        recoveredPending: recovered.pending === undefined,
        responseCount: recovered.responses.length,
        receiptCount: receipts.length, receipts, retakeCount: retakes.length,
        firstReplay: firstReplay.replayed, firstReplayAttempt: firstReplay.firstAttempt,
        retakeReplay: replayRetake.replayed,
        score, restoredReceipts: await restored.query(namespace, 'retake-operations'),
        restoredScore: await new ScoringEngine(restored).getScore(namespace, 'run'), collisions
      };
    });
    assert.equal(result.injected, true);
    assert.equal(result.pendingRetake, true);
    assert.equal(result.backupPendingRetake, true);
    assert.equal(result.recoveredPending, true);
    assert.equal(result.responseCount, 2);
    assert.equal(result.firstReplay, true);
    assert.equal(result.firstReplayAttempt, true);
    assert.equal(result.receiptCount, 2); // one receipt for the first attempt and one for the retake
    assert.equal(result.retakeCount, 1);
    assert.equal(result.retakeReplay, true);
    assert.equal(result.score, 0);
    assert.equal(result.restoredReceipts.length, 2);
    assert.equal(result.restoredScore, 0);
    assert.deepEqual(result.collisions, [true, true, true]);
    const retakeReceipt = result.receipts.find(receipt => receipt.firstAttempt === false);
    assert.equal(retakeReceipt.simulationRunId, 'run');
    assert.equal(retakeReceipt.questionId, 'q');
    assert.equal(retakeReceipt.correct, true);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
