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

test('O4 multi-tab answers claim one durable intent and use authoritative first-attempt outcome', { skip: !playwright && 'Playwright unavailable; set STUDYOS_PLAYWRIGHT_MODULE' }, async () => {
  const server = createServer(async (request, response) => {
    if (request.url === '/') { response.end('<!doctype html><title>O4 study concurrency</title>'); return; }
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
      const examId = 'o4-multitab-study';
      const dbName = 'o4-multitab-study';
      const left = new StudySession(new IndexedDbStore({ name: dbName, version: 1 }), examId);
      const right = new StudySession(new IndexedDbStore({ name: dbName, version: 1 }), examId);
      const question = { id: 'shared-q', stem: 'Which?', topicIds: ['shared-topic'], canonicalConceptIds: ['shared-concept'], options: [{ id: 'wrong', text: 'Wrong' }, { id: 'right', text: 'Right' }], correctOptionId: 'right' };
      await left.start({ id: 'shared-run', questions: [question] });
      await Promise.all([left.resume('shared-run'), right.resume('shared-run')]);
      const initial = await Promise.all([
        left.answer('shared-run', question, 'wrong'),
        right.answer('shared-run', question, 'right')
      ]);
      const firstState = await left.get('shared-run');
      const firstScore = await left.scoring.getFirstAttempt(examId, 'shared-run', question.id);
      const firstMastery = await left.mastery.get('shared-concept');
      const xpBeforeRetake = await left.xp.total(examId);
      const retakes = await Promise.all([
        left.answer('shared-run', question, 'right', { retake: true }),
        right.answer('shared-run', question, 'right', { retake: true })
      ]);
      return {
        initialRunResponses: firstState.responses,
        firstScore,
        firstMastery,
        xpBeforeRetake,
        afterRetake: await left.get('shared-run'),
        afterRetakeScore: await left.scoring.getFirstAttempt(examId, 'shared-run', question.id),
        retakeRows: await left.store.query(examId, 'retakes'),
        finalMastery: await left.mastery.get('shared-concept'),
        finalXp: await left.xp.total(examId),
        returnedResponses: retakes.map(run => run.responses.length),
        returnedInitialResponses: initial.map(run => run.responses.length)
      };
    });
    assert.equal(result.initialRunResponses.length, 1);
    assert.equal(result.initialRunResponses[0].correct, false);
    assert.equal(result.firstScore.correct, false);
    assert.equal(result.firstScore.attempts, 1);
    assert.equal(result.firstMastery.questionCount, 1);
    assert.equal(result.firstMastery.firstTryWrong, 1);
    assert.equal(result.afterRetake.responses.length, 2);
    assert.equal(result.afterRetake.responses[1].retake, true);
    assert.equal(result.afterRetakeScore.correct, false);
    assert.equal(result.afterRetakeScore.attempts, 1);
    assert.equal(result.retakeRows.length, 1);
    assert.equal(result.finalMastery.questionCount, 2);
    assert.equal(result.finalMastery.firstTryWrong, 1);
    assert.equal(result.finalMastery.firstTryCorrect, 0);
    assert.equal(result.finalXp, result.xpBeforeRetake);
    assert.deepEqual(result.returnedResponses, [2, 2]);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
