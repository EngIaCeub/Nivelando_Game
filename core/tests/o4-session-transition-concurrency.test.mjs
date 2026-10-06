import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

let playwright;
try {
  playwright = await import(process.env.STUDYOS_PLAYWRIGHT_MODULE
    ? pathToFileURL(process.env.STUDYOS_PLAYWRIGHT_MODULE).href
    : 'playwright');
} catch { /* Browser-backed regression will be reported as skipped when unavailable. */ }

test('O4 pause, next and finish merge current IndexedDB state instead of stale session snapshots', { skip: !playwright && 'Playwright unavailable; set STUDYOS_PLAYWRIGHT_MODULE' }, async () => {
  const server = createServer(async (request, response) => {
    if (request.url === '/') { response.end('<!doctype html><title>O4 transition concurrency</title>'); return; }
    if (!/^\/core\/src\/[a-z-]+\.js$/.test(request.url)) { response.writeHead(404); response.end(); return; }
    try {
      response.setHeader('Content-Type', 'text/javascript');
      response.end(await readFile(new URL(`../src/${request.url.split('/').at(-1)}`, import.meta.url)));
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
      const { StudySession } = await import('/core/src/study-ui.js');
      const examId = 'o4-transition-concurrency';
      const dbName = 'o4-transition-concurrency';
      const leftStore = new IndexedDbStore({ name: dbName, version: 1 });
      const rightStore = new IndexedDbStore({ name: dbName, version: 1 });
      const left = new StudySession(leftStore, examId);
      const right = new StudySession(rightStore, examId);
      const question = { id: 'q', stem: 'Question', topicIds: ['topic'], canonicalConceptIds: ['concept'], options: [{ id: 'a' }, { id: 'b' }], correctOptionId: 'b' };
      const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

      await left.start({ id: 'pause-run', questions: [question] });
      await Promise.all([left.resume('pause-run'), right.resume('pause-run')]);
      const answerEntered = deferred(), releaseAnswer = deferred();
      const pauseSubmit = right.scoring.submitAnswer.bind(right.scoring);
      right.scoring.submitAnswer = async args => { const result = await pauseSubmit(args); answerEntered.resolve(); await releaseAnswer.promise; throw new Error('injected interruption after first-attempt score'); };
      const answerPromise = right.answer('pause-run', question, 'a');
      await answerEntered.promise;
      const pausePromise = left.pause('pause-run');
      let pauseInterrupted = false;
      const interrupted = answerPromise.catch(error => /injected interruption/.test(error.message));
      right.scoring.submitAnswer = pauseSubmit;
      releaseAnswer.resolve();
      pauseInterrupted = await interrupted;
      await answerPromise.catch(() => {});
      const paused = await pausePromise;
      const pauseScore = await left.scoring.getFirstAttempt(examId, 'pause-run', 'q');
      const pauseMastery = await left.mastery.get('concept');
      const pauseXp = await left.xp.total(examId);

      await left.start({ id: 'next-run', questions: [question] });
      await Promise.all([left.resume('next-run'), right.resume('next-run')]);
      await left.answer('next-run', question, 'a');
      const retakeEntered = deferred(), releaseRetake = deferred();
      const rightSubmit = right.scoring.submitAnswer.bind(right.scoring);
      right.scoring.submitAnswer = async args => { const result = await rightSubmit(args); retakeEntered.resolve(); await releaseRetake.promise; throw new Error('injected interruption after retake score'); };
      const retakePromise = right.answer('next-run', question, 'b', { retake: true });
      await retakeEntered.promise;
      const nextPromise = left.next('next-run');
      const interruptedRetake = retakePromise.catch(error => /injected interruption/.test(error.message));
      right.scoring.submitAnswer = rightSubmit;
      releaseRetake.resolve();
      const retakeInterrupted = await interruptedRetake;
      await retakePromise.catch(() => {});
      let nextRejectedPending = false;
      try { await nextPromise; } catch (error) { nextRejectedPending = /ainda precisa ser salva/.test(error.message); }
      const pendingBeforeResume = await left.get('next-run');
      const resumedNext = await left.resume('next-run');

      await left.start({ id: 'finish-run', questions: [question] });
      await Promise.all([left.resume('finish-run'), right.resume('finish-run')]);
      await left.answer('finish-run', question, 'a');
      const finishAnswerEntered = deferred(), releaseFinishAnswer = deferred();
      right.scoring.submitAnswer = async args => { const result = await rightSubmit(args); finishAnswerEntered.resolve(); await releaseFinishAnswer.promise; return result; };
      const finishRetake = right.answer('finish-run', question, 'b', { retake: true });
      await finishAnswerEntered.promise;
      const finishPromise = left.finish('finish-run');
      right.scoring.submitAnswer = rightSubmit;
      releaseFinishAnswer.resolve();
      await finishRetake;
      const finished = await finishPromise;

      return {
        paused: { interrupted: pauseInterrupted, status: paused.status, responses: paused.responses, pending: paused.pending, score: pauseScore, mastery: pauseMastery, xp: pauseXp },
        next: { retakeInterrupted, nextRejectedPending, pendingPreserved: Boolean(pendingBeforeResume.pending),
          status: resumedNext.status, cursor: resumedNext.cursor, responses: resumedNext.responses,
          score: await left.scoring.getFirstAttempt(examId, 'next-run', 'q'), retakes: await leftStore.query(examId, 'retakes') },
        finish: { status: finished.status, completedAt: finished.completedAt, responses: finished.responses,
          pending: finished.pending, score: await left.scoring.getFirstAttempt(examId, 'finish-run', 'q') }
      };
    });
    assert.equal(result.paused.interrupted, true);
    assert.equal(result.paused.status, 'paused');
    assert.equal(result.paused.responses.length, 1);
    assert.equal(result.paused.responses[0].correct, false);
    assert.equal(result.paused.pending, undefined);
    assert.equal(result.paused.score.correct, false);
    assert.equal(result.paused.mastery.questionCount, 1);
    assert.equal(result.paused.xp, 5);
    assert.equal(result.next.retakeInterrupted, true);
    assert.equal(result.next.nextRejectedPending, true);
    assert.equal(result.next.pendingPreserved, true);
    assert.equal(result.next.responses.length, 2);
    assert.equal(result.next.responses[1].retake, true);
    assert.equal(result.next.score.correct, false);
    assert.equal(result.next.score.attempts, 1);
    assert.equal(result.next.retakes.filter(row => row.simulationRunId === 'next-run').length, 1);
    assert.equal(result.finish.status, 'completed');
    assert.equal(result.finish.responses.length, 2);
    assert.equal(result.finish.responses[1].retake, true);
    assert.equal(result.finish.pending, undefined);
    assert.equal(result.finish.score.correct, false);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
