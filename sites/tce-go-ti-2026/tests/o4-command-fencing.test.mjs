import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { MemoryStore } from '../../../core/src/storage.js';
import { runMutation, requireMutationContext } from '../../../core/src/mutation-context.js';

test('O4 mutation capabilities reject forged, cross-store and expired contexts; failures release the command', async () => {
  const store = new MemoryStore(), other = new MemoryStore();
  let calls = 0, escaped, ran = false;
  const exclusive = store.withExclusiveMutation.bind(store);
  store.withExclusiveMutation = work => { calls++; return exclusive(work); };
  await runMutation(store, undefined, async context => {
    escaped = context;
    assert.equal(Object.isFrozen(context), true);
    await runMutation(store, context, nested => assert.equal(nested, context));
    await assert.rejects(runMutation(store, {}, () => { ran = true; }), /Contexto/);
    await assert.rejects(runMutation(other, context, () => { ran = true; }), /Contexto/);
  });
  assert.equal(calls, 1);
  assert.equal(ran, false);
  assert.throws(() => requireMutationContext(store, escaped), /Contexto/);
  await assert.rejects(runMutation(store, escaped, () => { ran = true; }), /Contexto/);
  await assert.rejects(runMutation(store, undefined, context => { escaped = context; throw new Error('work failed'); }), /work failed/);
  await assert.rejects(runMutation(store, escaped, () => {}), /Contexto/);
  assert.equal(await runMutation(store, undefined, () => 'released'), 'released');
  await assert.rejects(runMutation({}, undefined, () => { ran = true; }), /coordenação/);
  assert.equal(ran, false);
});

let playwright;
try {
  playwright = await import(process.env.STUDYOS_PLAYWRIGHT_MODULE
    ? pathToFileURL(process.env.STUDYOS_PLAYWRIGHT_MODULE).href : 'playwright');
} catch { /* Native coverage is explicitly skipped when the browser runtime is unavailable. */ }

test('O4 public command fencing with native IndexedDB and Web Locks', {
  timeout: 45000, skip: !playwright && 'Playwright unavailable; set STUDYOS_PLAYWRIGHT_MODULE'
}, async t => {
  const uiExamId = 'tce-go-ti-2026';
  const uiQuestion = { id: 'q1', examId: uiExamId, stem: 'Synthetic UI question',
    options: [{ id: 'a', text: 'Wrong' }, { id: 'b', text: 'Right' }], correctOptionId: 'b',
    canonicalConceptIds: ['concept'], topicIds: ['topic'], provenance: { status: 'derived', source: 'Original UI fixture' } };
  const uiContent = {
    'manifest.json': { examId: uiExamId, title: 'Synthetic UI Pack', examDate: '2027-01-01' },
    'curriculum.json': { examId: uiExamId, disciplines: [{ id: 'd', title: 'Discipline', modules: [{ id: 'm', title: 'Module',
      topics: [{ id: 'topic', title: 'Topic', canonicalConceptIds: ['concept'], estimatedMinutes: 30 }] }] }] },
    'questions.json': [uiQuestion], 'resources.json': [], 'flashcards.json': { cards: [] }, 'simulations.json': { simulations: [] },
    'content-history.json': { questions: [], cards: [] }
  };
  const server = createServer(async (request, response) => {
    if (request.url === '/') { response.end('<!doctype html><title>O4 command fencing</title>'); return; }
    if (request.url === '/ui/') {
      response.end(`<!doctype html><title>O4 source UI</title><main><p id="pack-status"></p><p id="session-status"></p>
        <button id="start-button">Start</button>${['questions', 'diagnostic-panel', 'flashcards-panel', 'subjects', 'study-resume', 'reviews', 'progress']
        .map(id => `<section id="${id}"></section>`).join('')}
        <section id="today"><div id="today-dashboard"></div><div id="study-onboarding"></div></section>
        <section id="simulations"><div id="simulations-panel"></div></section>
        <section id="settings"><div id="production-settings"></div></section>
        </main><script type="module" src="./core/src/platform-shell.js"></script>
        <script type="module" src="./site-app.js"></script>`);
      return;
    }
    if (request.url === '/ui/build-meta.json' || request.url.startsWith('/ui/exam-pack/')) {
      const value = request.url === '/ui/build-meta.json'
        ? { appVersion: '1.0.0', storageVersion: 2, examPackVersion: '1.0.0' }
        : uiContent[request.url.split('/').at(-1)];
      if (!value) { response.writeHead(404).end(); return; }
      response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(value)); return;
    }
    const siteModule = {
      '/ui/content-bank.js': new URL('../content-bank.js', import.meta.url),
      '/ui/supabase-auth.js': new URL('../supabase-auth.js', import.meta.url),
      '/ui/supabase-sync.js': new URL('../supabase-sync.js', import.meta.url)
    }[request.url];
    if (request.url !== '/ui/site-app.js' && !siteModule && !/^\/(?:ui\/)?core\/src\/[a-z-]+\.js$/.test(request.url)) { response.writeHead(404).end(); return; }
    try {
      response.setHeader('Content-Type', 'text/javascript');
      response.end(await readFile(request.url === '/ui/site-app.js'
        ? new URL('../site-app.js', import.meta.url)
        : siteModule ?? new URL(`../../../core/src/${request.url.split('/').at(-1)}`, import.meta.url)));
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true,
      ...(process.env.STUDYOS_CHROMIUM_EXECUTABLE ? { executablePath: process.env.STUDYOS_CHROMIUM_EXECUTABLE } : {}) });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.evaluate(async () => {
      const storage = await import('/core/src/storage.js');
      const study = await import('/core/src/study-ui.js');
      const diagnostic = await import('/core/src/diagnostics.js');
      const planner = await import('/core/src/today-planner.js');
      const production = await import('/core/src/production.js');
      const mutation = await import('/core/src/mutation-context.js');
      const examId = 'generic-o4-commands', metadata = { appVersion: '1.0.0', storageVersion: 2 };
      const settings = { dailyMinutes: 30, onboardingSkipped: false };
      const q = { id: 'q1', examId, stem: 'Synthetic question', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
        correctOptionId: 'b', canonicalConceptIds: ['concept'], topicIds: ['topic'], provenance: { status: 'derived', source: 'Original test fixture' } };
      const input = { examId, date: '2026-10-04', availableMinutes: 30, now: '2026-10-04T12:00:00.000Z',
        curriculum: { examId, disciplines: [{ id: 'd', modules: [{ id: 'm', topics: [{ id: 'topic', title: 'Topic', canonicalConceptIds: ['concept'], estimatedMinutes: 30 }] }] }] } };
      const pair = async () => {
        const name = `o4-command-${crypto.randomUUID()}`;
        const a = new storage.IndexedDbStore({ name }), b = new storage.IndexedDbStore({ name });
        await a.withExclusiveMutation(() => {}); await b.withExclusiveMutation(() => {});
        return { a, b, name };
      };
      const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
      const waitQueued = async (name, count = 1) => {
        for (let attempt = 0; attempt < 200; attempt++) {
          const state = await navigator.locks.query();
          if (state.pending.filter(lock => lock.name === `studyos:${name}:mutation`).length >= count) return true;
          await new Promise(resolve => setTimeout(resolve, 5));
        }
        throw new Error('Command never queued on native lock');
      };
      const backup = store => production.exportProductionBackup(store, examId, metadata, settings);
      const restore = (store, payload, context) => production.restoreProductionBackup(store, payload, { examId, metadata, currentSettings: settings }, context);
      window.fixture = { ...storage, ...study, ...diagnostic, ...planner, ...production, ...mutation,
        examId, metadata, settings, q, input, pair, deferred, waitQueued, backup, restore };
    });

    await t.test('all stale public writers reject without changing restored sessions, plan, mastery, events or XP', async () => {
      const result = await page.evaluate(async () => {
        const f = window.fixture;
        const { a, b } = await f.pair();
        const session = new f.StudySession(a, f.examId), plans = new f.TodayPlanEngine(a);
        const diagnostic = new f.DiagnosticEngine(a, { initialQuestionsPerConcept: 1, maxQuestionsPerConcept: 1 });
        await session.start({ id: 'run', questions: [f.q] }); await session.resume('run');
        const card = { id: 'card', front: 'F', back: 'B', canonicalConceptIds: ['concept'], topicIds: ['topic'] };
        await session.start({ id: 'cards', kind: 'flashcards', cards: [card] });
        await diagnostic.start({ examId: f.examId, assessmentRunId: 'diag', questions: [f.q] });
        const plan = await plans.generate(f.input), activity = plan.activities[0];
        const reading = await session.startReading({ activity, date: f.input.date });
        const clean = await f.backup(b);
        await session.answer('run', f.q, 'a');
        const staleRun = await session.get('run');
        await f.restore(b, clean);
        const before = await b.exportNamespaces([f.examId, '__studyos_global__']);
        let sourceRead = false;
        const source = { exportNamespaces() { sourceRead = true; throw new Error('stale migration read the source'); } };
        const activityArgs = { examId: f.examId, date: f.input.date, activityId: activity.activityId };
        const diagnosticArgs = { examId: f.examId, assessmentRunId: 'diag' };
        const commands = {
          save: () => session.save(staleRun), start: () => session.start({ id: 'after-restore', questions: [f.q] }),
          cursor: () => session.setCursor('run', { cursor: 0 }), resume: () => session.resume('run'),
          pause: () => session.pause('run'), reveal: () => session.reveal('cards', 'card'),
          answer: () => session.answer('run', f.q, 'b'), next: () => session.next('run'), finish: () => session.finish('run'),
          pending: () => session.applyPending(staleRun),
          effects: () => session.applyAnswerEffects({ item: f.q, response: staleRun.responses[0], runId: 'run' }),
          diagnosticStart: () => diagnostic.start({ examId: f.examId, assessmentRunId: 'new-diag', questions: [f.q] }),
          diagnosticAnswer: () => diagnostic.answer({ ...diagnosticArgs, questionId: 'q1', canonicalConceptIds: ['concept'], correct: true }),
          diagnosticComplete: () => diagnostic.complete(diagnosticArgs),
          diagnosticRestart: () => diagnostic.restart({ examId: f.examId, questions: [f.q] }),
          diagnosticImport: () => diagnostic.importExam(f.examId, { version: 1, examId: f.examId, diagnosticRuns: [] }),
          diagnosticEvent: () => diagnostic.recordPlanRebalanced({ examId: f.examId, planId: 'p' }),
          planSave: () => plans.save(plan), generate: () => plans.generate({ ...f.input, date: '2026-10-05' }),
          replan: () => plans.replan(f.input), extra: () => plans.addExtraActivity({ examId: f.examId, date: f.input.date, topicId: 'topic' }),
          activityStart: () => plans.startActivity(activityArgs), activityResume: () => plans.resumeActivity(activityArgs),
          activityPause: () => plans.pauseActivity(activityArgs), activityComplete: () => plans.completeActivity(activityArgs),
          readingStart: () => session.startReading({ activity, date: f.input.date }),
          readingPause: () => session.pauseReading(reading.id), readingComplete: () => session.completeReading(reading.id),
          preferences: () => f.updateProductionSettings(a, f.examId, { dailyMinutes: 90 }),
          bootstrap: () => f.bootstrapProductionSettings(a, f.examId, f.settings),
          legacyMigration: () => f.importLegacyDiagnostic(a, source, f.examId),
          restore: () => f.restore(a, clean), reset: () => f.resetStore(a, f.examId),
          productionReset: () => f.resetProductionStore(a, f.examId, { confirmation: 'RESETAR', metadata: f.metadata, currentSettings: f.settings })
        };
        const errors = {};
        for (const [name, command] of Object.entries(commands)) {
          try { await command(); errors[name] = null; } catch (error) { errors[name] = error.message; }
        }
        return { errors, sourceRead, before, after: await b.exportNamespaces([f.examId, '__studyos_global__']),
          newRun: await b.get(f.examId, 'study-sessions', 'after-restore'), score: await b.get(f.examId, 'scores', 'run::q1'),
          responses: (await session.get('run')).responses.length, awards: await b.query(f.examId, 'xp-awards'),
          completedMinutes: (await plans.get(f.examId, f.input.date)).completedMinutes,
          generation: (await b.get('__studyos_meta__', 'system', 'generation')).generation };
      });
      for (const [command, error] of Object.entries(result.errors)) assert.match(error ?? '', /substituído em outra aba/, command);
      assert.equal(result.sourceRead, false);
      assert.deepEqual(result.after, result.before);
      assert.equal(result.newRun, undefined); assert.equal(result.score, undefined);
      assert.equal(result.responses, 0); assert.equal(result.completedMinutes, 0);
      assert.deepEqual(result.awards, []); assert.equal(result.generation, 1);
    });

    await t.test('direct diagnostic answer holds the lock across read/write/events; restore queues and fences queued old answers', async () => {
      const result = await page.evaluate(async () => {
        const f = window.fixture, { a, b, name } = await f.pair();
        const c = new f.IndexedDbStore({ name }); await c.withExclusiveMutation(() => {});
        const options = { initialQuestionsPerConcept: 1, maxQuestionsPerConcept: 1 };
        const engine = new f.DiagnosticEngine(a, options), queuedEngine = new f.DiagnosticEngine(c, options);
        await engine.start({ examId: f.examId, assessmentRunId: 'diag', questions: [f.q] });
        const clean = await f.backup(b), entered = f.deferred(), release = f.deferred();
        const query = a.query.bind(a);
        a.query = async (...args) => {
          const rows = await query(...args);
          if (args[1] === 'diagnostic-question-bank') { entered.resolve(); await release.promise; }
          return rows;
        };
        const args = { examId: f.examId, assessmentRunId: 'diag', questionId: 'q1', canonicalConceptIds: ['concept'], correct: true };
        const answer = engine.answer(args); await entered.promise;
        let restored = false, queuedError;
        const replacing = f.restore(b, clean).then(value => { restored = true; return value; });
        await f.waitQueued(name);
        const queued = queuedEngine.answer(args).catch(error => { queuedError = error.message; });
        await f.waitQueued(name, 2);
        const waited = !restored;
        release.resolve(); await answer; await replacing; await queued;
        let completeError; try { await engine.complete({ examId: f.examId, assessmentRunId: 'diag' }); } catch (error) { completeError = error.message; }
        return { waited, queuedError, completeError, run: await engine.getRun(f.examId, 'diag'),
          mastery: await b.query('__studyos_global__', 'mastery'), events: await b.query(f.examId, 'events') };
      });
      assert.equal(result.waited, true);
      assert.match(result.queuedError, /substituído/); assert.match(result.completeError, /substituído/);
      assert.equal(result.run.responses.length, 0); assert.deepEqual(result.mastery, []);
      assert.deepEqual(result.events.map(event => event.type), ['diagnostic_started']);
    });

    for (const operation of ['start', 'save', 'diagnosticStart', 'diagnosticComplete', 'generate', 'replan', 'extra',
      'activityComplete', 'readingStart', 'readingPause', 'readingComplete', 'preferences', 'bootstrap', 'migration']) {
      await t.test(`restore waits for the entire ${operation} command before replacing its effects`, async () => {
        const result = await page.evaluate(async operation => {
          const f = window.fixture, { a, b, name } = await f.pair();
          const session = new f.StudySession(a, f.examId), plans = new f.TodayPlanEngine(a);
          const diagnostic = new f.DiagnosticEngine(a, { initialQuestionsPerConcept: 1, maxQuestionsPerConcept: 1 });
          const plan = await plans.generate(f.input), activity = plan.activities[0];
          const reading = await session.startReading({ activity, date: f.input.date });
          const run = await session.start({ id: 'run', questions: [f.q] });
          await diagnostic.start({ examId: f.examId, assessmentRunId: 'diag', questions: [f.q] });
          await diagnostic.answer({ examId: f.examId, assessmentRunId: 'diag', questionId: 'q1', canonicalConceptIds: ['concept'], correct: true });
          const { a: source } = await f.pair();
          await new f.DiagnosticEngine(source).start({ examId: f.examId, assessmentRunId: 'legacy', questions: [f.q] });
          const clean = await f.backup(b);
          const entered = f.deferred(), release = f.deferred();
          const hooks = {
            start: ['put', 'study-sessions'], save: ['put', 'study-sessions'],
            diagnosticStart: ['put', 'diagnostic-question-bank'], diagnosticComplete: ['update', 'mastery'],
            generate: ['update', 'today-plans'], replan: ['update', 'today-plans'], extra: ['update', 'today-plans'],
            activityComplete: ['put', 'activity-state'], readingStart: ['update', 'study-reading'],
            readingPause: ['update', 'study-reading'], readingComplete: ['update', 'study-reading'],
            preferences: ['update', 'user-settings'], bootstrap: ['update', 'user-settings'], migration: ['update', 'diagnostic-runs']
          };
          const [method, collection] = hooks[operation], original = a[method].bind(a);
          let blocked = false;
          a[method] = async (...args) => {
            const value = await original(...args);
            if (!blocked && args[1] === collection) { blocked = true; entered.resolve(); await release.promise; }
            return value;
          };
          const commands = {
            start: () => session.start({ id: 'new-run', questions: [f.q] }),
            save: () => session.save({ ...run, title: 'Changed' }),
            diagnosticStart: () => diagnostic.start({ examId: f.examId, assessmentRunId: 'new-diag', questions: [f.q] }),
            diagnosticComplete: () => diagnostic.complete({ examId: f.examId, assessmentRunId: 'diag' }),
            generate: () => plans.generate({ ...f.input, date: '2026-10-05' }), replan: () => plans.replan(f.input),
            extra: () => plans.addExtraActivity({ examId: f.examId, date: f.input.date, topicId: 'topic' }),
            activityComplete: () => plans.completeActivity({ examId: f.examId, date: f.input.date, activityId: activity.activityId }),
            readingStart: () => session.startReading({ activity, date: f.input.date }),
            readingPause: () => session.pauseReading(reading.id), readingComplete: () => session.completeReading(reading.id),
            preferences: () => f.updateProductionSettings(a, f.examId, { dailyMinutes: 90 }),
            bootstrap: () => f.bootstrapProductionSettings(a, f.examId, f.settings),
            migration: () => f.importLegacyDiagnostic(a, source, f.examId)
          };
          const pending = commands[operation](); await entered.promise;
          let restored = false;
          const replacing = f.restore(b, clean).then(value => { restored = true; return value; });
          await f.waitQueued(name);
          const waited = !restored;
          release.resolve(); await pending; await replacing;
          return { waited, after: await b.exportNamespaces([f.examId, '__studyos_global__']),
            expected: [clean.data, clean.globalData], generation: (await b.get('__studyos_meta__', 'system', 'generation')).generation };
        }, operation);
        assert.equal(result.waited, true);
        assert.deepEqual(result.after, result.expected);
        assert.equal(result.generation, 1);
      });
    }

    await t.test('nested engines use exactly one lock per public command and cursor patches preserve current answers', async () => {
      const result = await page.evaluate(async () => {
        const f = window.fixture, { a, b } = await f.pair();
        const original = a.withExclusiveMutation.bind(a);
        let calls = 0, escaped;
        a.withExclusiveMutation = (...args) => { calls++; return original(...args); };
        const session = new f.StudySession(a, f.examId), counts = {};
        const measure = async (name, work) => { const before = calls; const value = await work(); counts[name] = calls - before; return value; };
        await measure('diagnosticStart', () => session.start({ id: 'diag', kind: 'diagnostic', questions: [f.q] }));
        await measure('resume', () => session.resume('diag'));
        await measure('diagnosticAnswer', () => session.answer('diag', f.q, 'b'));
        await measure('next', () => session.next('diag'));
        await measure('diagnosticComplete', () => session.finish('diag'));
        const plan = await new f.TodayPlanEngine(a).generate(f.input), activity = plan.activities[0];
        const reading = await measure('readingStart', () => session.startReading({ activity, date: f.input.date }));
        await measure('readingPause', () => session.pauseReading(reading.id));
        await measure('readingResume', () => session.startReading({ activity, date: f.input.date }));
        await measure('readingComplete', () => session.completeReading(reading.id));
        await measure('readingReplay', () => session.completeReading(reading.id));
        await session.start({ id: 'quiz', questions: [f.q] }); await session.resume('quiz');
        const stale = await session.get('quiz');
        await new f.StudySession(b, f.examId).answer('quiz', f.q, 'a');
        const patched = await measure('cursor', () => session.setCursor(stale.id, { itemId: 'q1' }));
        await measure('preferences', () => f.runMutation(a, undefined, async context => {
          escaped = context;
          await f.bootstrapProductionSettings(a, f.examId, f.settings, context);
          await f.updateProductionSettings(a, f.examId, { dailyMinutes: 60 }, context);
        }));
        let expiredError; try { await session.pause('quiz', escaped); } catch (error) { expiredError = error.message; }
        const clean = await f.backup(a);
        await measure('restoreWithProjection', () => f.runMutation(a, undefined, async context => {
          const restored = await f.restore(a, clean, context);
          await a.put(f.examId, 'user-settings', 'preferences', restored.settings);
        }));
        return { counts, patched, expiredError, awards: await a.query(f.examId, 'xp-awards'),
          reading: await a.get(f.examId, 'study-reading', reading.id), plan: await session.plans.get(f.examId, f.input.date),
          mastery: await session.mastery.get('concept'), score: await session.scoring.getFirstAttempt(f.examId, 'quiz', 'q1') };
      });
      for (const [command, count] of Object.entries(result.counts)) assert.equal(count, 1, command);
      assert.match(result.expiredError, /Contexto/);
      assert.equal(result.patched.responses.length, 1); assert.equal(result.patched.responses[0].correct, false);
      assert.equal(result.score.correct, false); assert.equal(result.mastery.questionCount, 2);
      assert.equal(result.reading.status, 'completed'); assert.equal(result.plan.completedMinutes, 30);
      assert.equal(result.awards.filter(award => award.type === 'activity_completed').length, 1);
      assert.equal(result.awards.filter(award => award.type === 'daily_goal_completed').length, 1);
    });

    await t.test('unrelated public calls on the same store queue without inheriting the active context', async () => {
      const result = await page.evaluate(async () => {
        const f = window.fixture, { a, name } = await f.pair();
        const session = new f.StudySession(a, f.examId), entered = f.deferred(), release = f.deferred();
        let finished = false;
        const holding = f.runMutation(a, undefined, async () => { entered.resolve(); await release.promise; });
        await entered.promise;
        const unrelated = session.start({ id: 'queued', questions: [f.q] }).then(value => { finished = true; return value; });
        await f.waitQueued(name);
        const stayedQueued = !finished && !(await session.get('queued'));
        release.resolve(); await holding; const run = await unrelated;
        return { stayedQueued, run };
      });
      assert.equal(result.stayedQueued, true); assert.equal(result.run.id, 'queued');
    });

    await t.test('preference patches, bootstrap and legacy migration preserve current fields and source records', async () => {
      const result = await page.evaluate(async () => {
        const f = window.fixture, { a, b } = await f.pair();
        await f.bootstrapProductionSettings(a, f.examId, f.settings);
        await Promise.all([f.updateProductionSettings(a, f.examId, { dailyMinutes: 45 }),
          f.updateProductionSettings(b, f.examId, { onboardingSkipped: true })]);
        const preferences = await f.bootstrapProductionSettings(a, f.examId, { dailyMinutes: 90, onboardingSkipped: false, diagnosticCompleted: false });
        const { a: source } = await f.pair();
        await new f.DiagnosticEngine(source, { initialQuestionsPerConcept: 1 }).start({ examId: f.examId, assessmentRunId: 'legacy', questions: [f.q] });
        const before = await source.exportNamespaces([f.examId, '__studyos_global__']);
        await f.importLegacyDiagnostic(a, source, f.examId);
        const session = new f.StudySession(a, f.examId);
        await session.resume('legacy'); await session.answer('legacy', f.q, 'b');
        await f.importLegacyDiagnostic(a, source, f.examId);
        return { preferences: preferences.settings, before, after: await source.exportNamespaces([f.examId, '__studyos_global__']),
          target: await session.get('legacy'), diagnostic: await session.diagnostics.getRun(f.examId, 'legacy') };
      });
      assert.deepEqual(result.preferences, { dailyMinutes: 45, onboardingSkipped: true, diagnosticCompleted: false });
      assert.deepEqual(result.after, result.before);
      assert.equal(result.target.responses.length, 1); assert.equal(result.target.status, 'in_progress');
      assert.equal(result.diagnostic.responses.length, 1);
    });

    await t.test('source UI cursor updates preserve current responses; stale reading and preference buttons cannot write', async () => {
      const context = await browser.newContext();
      const ui = await context.newPage();
      try {
        await ui.goto(`http://127.0.0.1:${server.address().port}/`);
        await ui.evaluate(async ({ examId, q, curriculum }) => {
          const { IndexedDbStore } = await import('/core/src/storage.js');
          const { StudySession } = await import('/core/src/study-ui.js');
          const { TodayPlanEngine } = await import('/core/src/today-planner.js');
          const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
          const session = new StudySession(store, examId);
          await session.start({ id: 'simulation', kind: 'simulation', title: 'Synthetic simulation', questions: [q] });
          await session.resume('simulation'); await session.answer('simulation', q, 'a');
          await session.next('simulation'); await session.finish('simulation');
          const d = new Date(), date = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
          await new TodayPlanEngine(store).generate({ examId, date, curriculum, availableMinutes: 120 });
          await store.update(examId, 'today-plans', date, plan => { plan.activities[0].type = 'reading'; return plan; });
        }, { examId: uiExamId, q: uiQuestion, curriculum: uiContent['curriculum.json'] });
        await ui.goto(`http://127.0.0.1:${server.address().port}/ui/#simulations`);
        ui.setDefaultTimeout(5000);
        await ui.waitForFunction(() => document.querySelector('#simulations-panel')?.textContent.includes('Synthetic simulation'));
        await ui.getByRole('button', { name: 'Rever respostas / retentativa', exact: true }).waitFor();
        await ui.evaluate(async examId => {
          const { IndexedDbStore } = await import('/ui/core/src/storage.js');
          const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
          await store.update(examId, 'study-sessions', 'simulation', run => {
            run.title = 'Current simulation';
            run.responses.push({ ...run.responses[0], retake: true, correct: true, optionId: 'b', timestamp: new Date().toISOString() });
            return run;
          });
        }, uiExamId);
        await ui.getByRole('button', { name: 'Rever respostas / retentativa', exact: true }).click();
        await ui.locator('#questions h2').filter({ hasText: 'Current simulation' }).waitFor();
        const updated = await ui.evaluate(async examId => {
          const { IndexedDbStore } = await import('/ui/core/src/storage.js');
          return new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 }).get(examId, 'study-sessions', 'simulation');
        }, uiExamId);
        assert.equal(updated.responses.length, 2); assert.equal(updated.cursor, 0); assert.equal(updated.status, 'completed');
        await ui.getByRole('button', { name: 'Pausar e continuar depois', exact: true }).click();
        await ui.locator('html[data-study-active="false"]').waitFor();
        await ui.goto(`http://127.0.0.1:${server.address().port}/ui/#today`);
        await ui.getByRole('button', { name: 'COMEÇAR', exact: true }).click();
        await ui.getByRole('button', { name: 'Concluir leitura', exact: true }).waitFor();
        const restored = await ui.evaluate(async examId => {
          const { IndexedDbStore } = await import('/ui/core/src/storage.js');
          const { exportProductionBackup, restoreProductionBackup } = await import('/ui/core/src/production.js');
          const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
          const settings = await store.get(examId, 'user-settings', 'preferences'), metadata = { appVersion: '1.0.0', storageVersion: 2 };
          const backup = await exportProductionBackup(store, examId, metadata, settings);
          await restoreProductionBackup(store, backup, { examId, metadata, currentSettings: settings });
          return store.exportNamespaces([examId, '__studyos_global__']);
        }, uiExamId);
        await ui.getByRole('button', { name: 'Concluir leitura', exact: true }).click();
        await ui.locator('#session-status').filter({ hasText: 'substituído em outra aba' }).waitFor();
        const afterReading = await ui.evaluate(async examId => {
          const { IndexedDbStore } = await import('/ui/core/src/storage.js');
          return new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 }).exportNamespaces([examId, '__studyos_global__']);
        }, uiExamId);
        assert.deepEqual(afterReading, restored);
        await ui.reload();
        await ui.goto(`http://127.0.0.1:${server.address().port}/ui/#today`);
        await ui.getByRole('button', { name: 'Salvar meta diária', exact: true }).waitFor();
        const preferencesBefore = await ui.evaluate(async examId => {
          const { IndexedDbStore } = await import('/ui/core/src/storage.js');
          const { exportProductionBackup, restoreProductionBackup } = await import('/ui/core/src/production.js');
          const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
          const settings = await store.get(examId, 'user-settings', 'preferences'), metadata = { appVersion: '1.0.0', storageVersion: 2 };
          const backup = await exportProductionBackup(store, examId, metadata, settings);
          await restoreProductionBackup(store, backup, { examId, metadata, currentSettings: settings });
          return { exported: await store.exportNamespaces([examId, '__studyos_global__']), local: localStorage.getItem(`studyos-settings:${examId}`) };
        }, uiExamId);
        await ui.locator('#study-onboarding input').fill('90');
        await ui.getByRole('button', { name: 'Salvar meta diária', exact: true }).click();
        await ui.locator('#session-status').filter({ hasText: 'substituído em outra aba' }).waitFor();
        const afterPreferences = await ui.evaluate(async examId => {
          const { IndexedDbStore } = await import('/ui/core/src/storage.js');
          const store = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
          return { exported: await store.exportNamespaces([examId, '__studyos_global__']), local: localStorage.getItem(`studyos-settings:${examId}`) };
        }, uiExamId);
        assert.deepEqual(afterPreferences, preferencesBefore);
      } finally { await context.close(); }
    });
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
