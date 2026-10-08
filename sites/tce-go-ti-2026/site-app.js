import { IndexedDbStore, EventLog, MasteryStore, TodayPlanEngine, TodayDashboard, GamificationEngine, calculateAnalytics, flattenTopics } from './core/src/index.js';
import { exportProductionBackup, exportRecoverySnapshot, restoreProductionBackup, validateBackupPayload, resetProductionStore, updateProductionSettings, bootstrapProductionSettings, importLegacyDiagnostic as migrateLegacyDiagnostic } from './core/src/production.js';
import { StudySession, StudyUI, action, node, safeResourceLink, lazyQuestions, selectSimulationQuestions } from './core/src/study-ui.js';
import { runMutation } from './core/src/mutation-context.js';
import { LibraryUI } from './core/src/library-ui.js';
import { PixelWorldTile } from './core/src/pixel-ui.js';
import { ownerStorageName } from './core/src/identity.js';
import { createSupabaseWorkspaceSync } from './supabase-sync.js';
import { createSupabaseAuth } from './supabase-auth.js';
import { withHistoricalContent } from './content-bank.js';

const examId = 'tce-go-ti-2026';
const SYNC_NAMESPACE = '__studyos_sync__';
let ownerId = null;
let preferenceKey = 'studyos-daily-minutes:' + examId;
let settingsKey = 'studyos-settings:' + examId;
const status = document.querySelector('#pack-status');
const notice = document.querySelector('#session-status');
const questionsRoot = document.querySelector('#questions');
const settingsRoot = document.querySelector('#production-settings');
const onboardingRoot = document.querySelector('#study-onboarding');
const diagnosticRoot = document.querySelector('#diagnostic-panel');
const flashcardsRoot = document.querySelector('#flashcards-panel');
const simulationsRoot = document.querySelector('#simulations-panel');
const today = () => { const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'); };
let storage, session, plans, masteryStore, events, gamification, pack, metadata, settings;
let diagnosticUI, quizUI, flashcardUI, libraryUI;
let authClient, authConfig, authSession, workspaceSync, guestMode = false;
document.documentElement.dataset.studyActive = 'false';

function report(error) {
  if (error?.code === 'STUDY_ACTIVE') { notice.textContent = error.message; notice.setAttribute('role', 'status'); return; }
  console.error('StudyOS operation failed', error);
  notice.textContent = 'Não foi possível concluir a operação. O progresso pode não ter sido salvo. Confira o armazenamento e tente novamente. ' + (error?.message ?? '');
  notice.setAttribute('role', 'alert');
}
const button = (label, handler) => action(label, handler, report);
const guarded = handler => (...args) => Promise.resolve().then(() => handler(...args)).catch(report);
function requirePaused() { if (document.documentElement.dataset.studyActive === 'true') throw Object.assign(new Error('Pause a sessão antes de importar, reiniciar ou trocar de atividade.'), { code: 'STUDY_ACTIVE' }); }
async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Conteúdo indisponível. Tente novamente com internet.');
  return response.json();
}
const ensureQuestions = lazyQuestions(async () => { pack.questions = await fetchJson('./exam-pack/questions.json'); return pack.questions; });
const ensureCards = lazyQuestions(async () => (await fetchJson('./exam-pack/flashcards.json')).cards);
let historyPromise;
const ensureHistory = () => historyPromise ??= fetchJson('./exam-pack/content-history.json').catch(error => { historyPromise = undefined; throw error; });
const ensureHistoricalQuestions = lazyQuestions(async () => withHistoricalContent(await ensureQuestions(), (await ensureHistory()).questions));
const ensureHistoricalCards = lazyQuestions(async () => withHistoricalContent(await ensureCards(), (await ensureHistory()).cards));
let simulationsPromise;
const ensureSimulations = () => simulationsPromise ??= fetchJson('./exam-pack/simulations.json').then(data => data.simulations).catch(error => { simulationsPromise = undefined; throw error; });
function downloadJson(filename, payload) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = node('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function stringifyJsonLossless(value) {
  const seen = new Set();
  const inspect = item => {
    if (item === null || typeof item === 'string' || typeof item === 'boolean') return;
    if (typeof item === 'number' && Number.isFinite(item)) return;
    if (typeof item !== 'object' || seen.has(item)) throw new Error('Snapshot contém dados que JSON não preserva integralmente.');
    const prototype = Object.getPrototypeOf(item);
    if (!Array.isArray(item) && prototype !== Object.prototype && prototype !== null) throw new Error('Snapshot contém dados que JSON não preserva integralmente.');
    seen.add(item);
    const keys = Reflect.ownKeys(item);
    if (keys.some(key => typeof key !== 'string')) throw new Error('Snapshot contém dados que JSON não preserva integralmente.');
    if (Array.isArray(item)) {
      if (keys.some(key => key !== 'length' && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= item.length))) throw new Error('Snapshot contém dados que JSON não preserva integralmente.');
      for (let index = 0; index < item.length; index++) {
        const descriptor = Object.getOwnPropertyDescriptor(item, String(index));
        if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) throw new Error('Snapshot contém dados que JSON não preserva integralmente.');
        inspect(descriptor.value);
      }
    } else for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(item, key);
      if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) throw new Error('Snapshot contém dados que JSON não preserva integralmente.');
      inspect(descriptor.value);
    }
    seen.delete(item);
  };
  inspect(value);
  return JSON.stringify(value, null, 2);
}
function readSettings() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(settingsKey) ?? '{}'); } catch { /* Recover with safe defaults and keep study controls available. */ }
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  const minutes = Number(saved.dailyMinutes ?? localStorage.getItem(preferenceKey) ?? 120);
  return { dailyMinutes: Number.isInteger(minutes) && minutes >= 1 && minutes <= 720 ? minutes : 120, onboardingSkipped: saved.onboardingSkipped === true, diagnosticCompleted: saved.diagnosticCompleted === true };
}
function applyLocalSettings(value) {
  localStorage.setItem(settingsKey, JSON.stringify(value));
  if (value.dailyMinutes !== undefined) localStorage.setItem(preferenceKey, String(value.dailyMinutes)); else localStorage.removeItem(preferenceKey);
}
async function saveSettings(patch, context) {
  return runMutation(storage, context, async ctx => {
    const value = await updateProductionSettings(storage, examId, patch, ctx);
    applyLocalSettings(value); settings = value;
    return value;
  });
}

async function loadPack() {
  let libraryError = '';
  const [manifest, curriculum, resources, buildMetadata, library, sourceMap] = await Promise.all([
    fetchJson('./exam-pack/manifest.json'), fetchJson('./exam-pack/curriculum.json'), fetchJson('./exam-pack/resources.json'), fetchJson('./build-meta.json'),
    fetchJson('./exam-pack/library.json').catch(() => { libraryError = 'As unidades didáticas não puderam ser carregadas. As referências existentes continuam disponíveis; a cobertura editorial não foi confirmada.'; return null; }),
    fetchJson('./exam-pack/source-map.json').catch(() => ({ sources: [] }))
  ]);
  metadata = buildMetadata; pack = { manifest, curriculum, resources, library, sourceMap, libraryError };
  const topicTitles = new Map(flattenTopics(curriculum).map(topic => [topic.id, topic.title]));
  document.title = 'StudyOS — ' + manifest.title;
  status.textContent = manifest.title + ' · prova prevista em ' + manifest.examDate + ' · versão ' + metadata.appVersion + '.';
  storage = new IndexedDbStore({ name: ownerStorageName(examId, ownerId), version: 2 });
  await storage.query(examId, 'user-settings'); // Probe before announcing any successful save.
  plans = new TodayPlanEngine(storage); masteryStore = new MasteryStore(storage);
  events = new EventLog(storage); gamification = new GamificationEngine(storage);
  session = new StudySession(storage, examId);
  await runMutation(storage, undefined, async ctx => {
    const result = await bootstrapProductionSettings(storage, examId, readSettings(), ctx);
    if (result.recovered) { notice.textContent = 'Preferências locais inválidas; o progresso permanece disponível e as preferências foram restauradas com valores seguros.'; notice.setAttribute('role', 'alert'); }
    applyLocalSettings(result.settings); settings = result.settings;
  });
  const onComplete = async run => {
    document.documentElement.dataset.studyActive = 'false';
    if (run.kind === 'diagnostic') {
      await runMutation(storage, undefined, async ctx => { await saveSettings({ diagnosticCompleted: true }, ctx); await regeneratePlan(ctx); });
    }
    await refreshPanels();
    if (authSession) void syncWorkspace({ manual: false }).catch(error => syncStatus(error.message, 'alert'));
  };
  const historicalBanks = { ensureQuestions: ensureHistoricalQuestions, ensureCards: ensureHistoricalCards };
  diagnosticUI = new StudyUI({ root: diagnosticRoot, session, ...historicalBanks, report, onComplete });
  quizUI = new StudyUI({ root: questionsRoot, session, ...historicalBanks, report, onComplete, runTitleFor: run => { const topic = flattenTopics(pack.curriculum).find(t => t.id === run.activity?.topicId || t.title === run.title); return topic?.displayTitle ?? run.title; } });
  flashcardUI = new StudyUI({ root: flashcardsRoot, session, ...historicalBanks, report, onComplete, topicTitleFor: topicId => topicTitles.get(topicId) ?? topicId });
  const oldStart = document.querySelector('#start-button');
  const start = button('Começar sessão', async () => {
    const current = await plans.get(examId, today());
    const activity = current?.activities.find(item => item.status !== 'completed');
    if (activity) await startActivity(activity); else { notice.textContent = 'Agenda concluída. Escolha um tópico ou simulado para estudar mais.'; document.querySelector('#subjects').scrollIntoView(); }
  }); start.id = 'start-button'; oldStart?.replaceWith(start);
  // Recovery controls must survive a failure rendering existing study records.
  await showSettings();
  const libraryRoot = document.querySelector('#library-panel');
  if (libraryRoot) {
    libraryUI = new LibraryUI({ root: libraryRoot, pack, onPractice: guarded(practiceTopic), onCards: guarded(startCards), onRetry: async () => {
      const [library, sourceMap] = await Promise.all([fetchJson('./exam-pack/library.json'), fetchJson('./exam-pack/source-map.json')]);
      Object.assign(pack, { library, sourceMap, libraryError: '' });
    } });
    libraryUI.render();
  }
  renderCurriculum(); await refreshPanels();
}

async function context(availableMinutes, withQuestions = false) {
  const records = await masteryStore.list();
  const masteryByConcept = Object.fromEntries(records.map(record => [record.canonicalConceptId, record]));
  const revisionRecords = await storage.query(examId, 'revisions');
  const scoreRecords = await storage.query(examId, 'scores');
  const questions = withQuestions ? await ensureQuestions() : pack.questions ?? [];
  const firstAttempts = scoreRecords.map(attempt => ({ ...(questions.find(question => question.id === attempt.questionId) ?? {}), ...attempt }));
  const eventRecords = await events.list(examId);
  const completedTopicIds = eventRecords.filter(event => event.type === 'topic_completed').map(event => event.entityId);
  const metric = calculateAnalytics({ curriculum: pack.curriculum, events: eventRecords, firstAttempts, revisions: revisionRecords });
  metric.mastery = { topics: records.length, average: records.length ? records.reduce((sum, record) => sum + record.masteryEstimate, 0) / records.length : null };
  return { examId, date: today(), availableMinutes, curriculum: pack.curriculum, questions, resources: pack.resources, masteryByConcept, revisions: revisionRecords, firstAttempts, completedTopicIds, examDate: pack.manifest.examDate, now: new Date().toISOString(), metric };
}
async function regeneratePlan(mutationContext) {
  requirePaused();
  return runMutation(storage, mutationContext, async ctx => {
    const preferences = await storage.get(examId, 'user-settings', 'preferences');
    const input = await context(preferences?.dailyMinutes ?? settings.dailyMinutes, true);
    return await plans.get(examId, today()) ? plans.replan(input, ctx) : plans.generate(input, ctx);
  });
}
async function renderHome() {
  const availableMinutes = settings.dailyMinutes;
  let plan = await plans.get(examId, today());
  // Bank selection is necessary on a new day or an explicit budget change only.
  if (!plan || plan.availableMinutes !== availableMinutes) plan = await regeneratePlan();
  const input = await context(availableMinutes);
  const [summary, weekly, streak, xp] = await Promise.all([plans.dailySummary(examId, today(), availableMinutes), plans.weeklySummary(examId, today()), plans.streak(examId, availableMinutes, .6, today()), gamification.snapshot(examId)]);
  const dashboardOptions = { onStart: guarded(startActivity), onMinutes: guarded(async minutes => {
    requirePaused(); await runMutation(storage, undefined, async ctx => { await saveSettings({ dailyMinutes: minutes }, ctx); await regeneratePlan(ctx); }); await refreshPanels();
  }), onExtra: guarded(async () => {
    requirePaused(); const topic = flattenTopics(pack.curriculum)[0];
    if (!topic) throw new Error('Não há tópicos para estudo extra.');
    await plans.addExtraActivity({ examId, date: today(), topicId: topic.id, minutes: 15 }); await renderHome();
  }), onLibrary: openLibrary };
  const dashboardState = { exam: pack.manifest, plan, summary, weekly, metrics: input.metric, streak, xp: xp.xp, availableMinutes, topics: flattenTopics(pack.curriculum), resourceTopicIds: [...new Set(pack.resources.flatMap(r => r.topicIds ?? []))] };
  new TodayDashboard({ root: document.querySelector('#today-dashboard'), ...dashboardOptions }).render(dashboardState);
  const planRoot = document.querySelector('#plan');
  if (planRoot) {
  planRoot.replaceChildren(node('h2', 'Plano'), node('p', 'Escolha uma atividade abaixo. Esta é a mesma agenda da tela Hoje; os tempos são estimativas de estudo, não um cronômetro.'), node('div'));
  planRoot.querySelector('h2').id = 'plan-title';
  new TodayDashboard({ root: planRoot.querySelector('div'), ...dashboardOptions }).render({ ...dashboardState, mode: 'plan' });
  }
  status.dataset.todayState = 'plan-ready';
}
async function openSession(ui, run) {
  requirePaused();
  const destination = ui.root.closest('section[id]');
  if (destination) location.hash = '#' + destination.id;
  await ui.open(run.id);
  const active = run.kind === 'flashcards' ? await ensureCards() : await ensureQuestions();
  const ids = run.kind === 'flashcards' ? run.cardIds : run.questionIds;
  if (ids?.some(id => !active.some(item => item.id === id))) ui.root.prepend(node('p', 'Sessão da versão anterior: conteúdo retirado da seleção atual pela revisão editorial. Textos e primeiras respostas foram preservados.'));
}
async function startQuiz({ questions, title = 'Questões', kind = 'quiz', id, activity = null, date = null }) {
  requirePaused();
  const run = await session.start({ id, kind, questions, title, activity, date, contentVersion: metadata.examPackVersion });
  await openSession(quizUI, run);
}
async function startDiagnostic() {
  requirePaused();
  const existing = (await session.list()).find(run => run.kind === 'diagnostic' && run.status !== 'completed');
  const run = existing ?? await session.start({ kind: 'diagnostic', questions: await ensureQuestions(), title: 'Diagnóstico inicial', contentVersion: metadata.examPackVersion });
  await openSession(diagnosticUI, run);
}
async function startActivity(activity, date = today()) {
  requirePaused();
  if (activity.status === 'completed') { notice.textContent = 'Atividade já concluída; escolha outra para continuar.'; return; }
  if (['questions', 'review', 'error_review'].includes(activity.type)) {
    const bank = await ensureQuestions();
    const ids = activity.questionIds?.length ? activity.questionIds : bank.filter(question => question.topicIds?.includes(activity.topicId)).slice(0, 8).map(question => question.id);
    const existingRun = await session.get('today-' + date + '-' + activity.activityId);
    if (existingRun) { await openSession(quizUI, existingRun); return; }
    if (ids.some(id => !bank.some(q => q.id === id)) || !ids.length) {
      notice.textContent = 'Esta atividade usa conteúdo retirado pela revisão editorial ou um tópico ainda sem questões aprovadas. Gere uma nova agenda ou escolha outro tópico; seu histórico foi preservado.';
      return;
    }
    await startQuiz({ questions: ids.map(id => bank.find(q => q.id === id)).filter(Boolean), title: activity.reason, id: 'today-' + date + '-' + activity.activityId, activity, date });
  } else await showTheory(activity, date);
}
async function showTheory(activity, date) {
  const id = 'theory:' + activity.activityId;
  const reading = await session.startReading({ activity, date });
  if (reading.status === 'completed') { notice.textContent = 'Leitura já concluída.'; return; }
  document.documentElement.dataset.studyActive = 'true';
  location.hash = '#questions';
  questionsRoot.replaceChildren(node('h2', 'Teoria / leitura'), node('p', activity.reason), node('p', 'Recursos externos precisam de internet. Ao concluir a leitura, registre a atividade abaixo.'));
  const resources = pack.resources.filter(resource => resource.id === activity.resourceId || resource.topicIds?.includes(activity.topicId));
  for (const resource of resources) questionsRoot.append(safeResourceLink(resource));
  if (!resources.length) questionsRoot.append(node('p', 'Sem recurso associado. Use as questões ou flashcards deste tópico.'));
  questionsRoot.append(button('Concluir leitura', async () => {
    await session.completeReading(id);
    document.documentElement.dataset.studyActive = 'false'; questionsRoot.replaceChildren(node('h2', 'Leitura concluída')); await refreshPanels();
  }), button('Pausar leitura', async () => {
    await session.pauseReading(id);
    document.documentElement.dataset.studyActive = 'false'; questionsRoot.replaceChildren(node('h2', 'Leitura pausada'), button('Retomar leitura', async () => { requirePaused(); await showTheory(activity, date); }));
    await renderResume(); await renderHome();
  }));
  questionsRoot.scrollIntoView();
  const heading = questionsRoot.querySelector('h2'); heading.tabIndex = -1; heading.focus({ preventScroll: true });
}
function renderCurriculum() {
  const root = document.querySelector('#subjects');
  root.replaceChildren(node('h2', 'Matérias'));
  if (!pack.curriculum.disciplines.length) {
    const empty = node('p', 'Nenhum currículo disponível neste pacote.', 'pixel-panel');
    root.append(empty);
  }
  const regions = node('div', undefined, 'pixel-worlds');
  pack.curriculum.disciplines.forEach((discipline, index) => {
    const tile = PixelWorldTile({ title: discipline.title, description: `${discipline.modules.length} ${discipline.modules.length === 1 ? 'módulo' : 'módulos'} · explorar conteúdos`, variant: ['coast', 'forest', 'night'][index % 3], onClick: () => {
      const destination = document.getElementById('region-' + discipline.id);
      if (destination) { destination.open = true; destination.scrollIntoView({ block: 'start' }); destination.querySelector('summary')?.focus({ preventScroll: true }); }
    } });
    regions.append(tile);
  });
  root.append(regions);
  for (const discipline of pack.curriculum.disciplines) {
    const details = node('details', undefined, 'pixel-panel curriculum-campaign');
    const summary = node('summary', discipline.title);
    details.id = 'region-' + discipline.id;
    details.append(summary);
    for (const module of discipline.modules) {
      const questLine = node('section', undefined, 'curriculum-quest-line');
      questLine.append(node('h3', module.title));
      for (const topic of module.topics) {
        const article = node('article', undefined, 'topic-card pixel-panel pixel-panel--compact');
        article.append(node('h4', topic.title));
        for (const resource of pack.resources.filter(item => item.topicIds?.includes(topic.id))) article.append(safeResourceLink(resource), node('p', 'Recurso externo · exige internet.'));
        const materials = node('a', 'Abrir biblioteca deste conteúdo', 'library-topic-link');
        materials.href = '#library'; materials.addEventListener('click', event => { event.preventDefault(); openLibrary(topic.id); });
        article.append(materials, button('Praticar questões', () => practiceTopic(topic.id)), button('Revisar flashcards', () => startCards(topic.id)));
        questLine.append(article);
      }
      details.append(questLine);
    }
    root.append(details);
  }
}
function openLibrary(topicId) {
  libraryUI?.showTopic(topicId); location.hash = '#library';
  const destination = document.querySelector('#library');
  destination?.scrollIntoView({ block: 'start' }); destination?.focus({ preventScroll: true });
}
async function practiceTopic(topicId) {
  requirePaused(); const topic = flattenTopics(pack.curriculum).find(item => item.id === topicId);
  if (!topic) throw new Error('Conteúdo não encontrado neste pacote.');
  const questions = (await ensureQuestions()).filter(item => item.topicIds?.includes(topic.id));
  const existing = (await session.list()).find(run => run.kind === 'quiz' && run.title === topic.title && run.status !== 'completed');
  if (existing) await openSession(quizUI, existing);
  else if (!questions.length) notice.textContent = 'Este tópico ainda não tem questões aprovadas. Consulte a biblioteca; a lacuna está registrada na curadoria.';
  else await startQuiz({ questions, title: topic.title });
}
async function startCards(topicId = null) {
  requirePaused(); const cards = (await ensureCards()).filter(card => !topicId || card.topicIds?.includes(topicId));
  const title = topicId ? 'Flashcards — ' + (flattenTopics(pack.curriculum).find(topic => topic.id === topicId)?.title ?? topicId) : 'Flashcards';
  const existing = (await session.list()).find(run => run.kind === 'flashcards' && run.title === title && run.status !== 'completed');
  if (!existing && !cards.length) { notice.textContent = 'Este tópico ainda não tem flashcards aprovados. Consulte os recursos e as lacunas da biblioteca.'; return; }
  const run = existing ?? await session.start({ kind: 'flashcards', cards, title, contentVersion: metadata.examPackVersion });
  await openSession(flashcardUI, run);
}
async function renderOnboarding() {
  onboardingRoot.replaceChildren();
  const completed = (await storage.query(examId, 'diagnostic-runs')).some(run => run.status === 'completed');
  const disclosure = onboardingRoot.closest('details');
  if (disclosure) { disclosure.hidden = completed; disclosure.open = !settings.onboardingSkipped; }
  if (completed) return;
  onboardingRoot.append(node('h2', 'Faça seu diagnóstico inicial'), node('p', pack.manifest.title + '. Escolha sua meta diária, responda o diagnóstico e siga a agenda Hoje. Progresso mostra domínio, revisões e primeiras tentativas.'));
  const label = node('label', 'Meta diária em minutos'); const input = node('input'); input.type = 'number'; input.min = '1'; input.max = '720'; input.value = String(settings.dailyMinutes); label.append(input);
  onboardingRoot.append(label, button('Salvar meta diária', async () => { requirePaused(); await runMutation(storage, undefined, async ctx => { await saveSettings({ dailyMinutes: Number(input.value) }, ctx); await regeneratePlan(ctx); }); await refreshPanels(); }), button('Fazer diagnóstico', startDiagnostic));
  if (!settings.onboardingSkipped) onboardingRoot.append(button('Pular e estudar agora', async () => { requirePaused(); await saveSettings({ onboardingSkipped: true }); await renderOnboarding(); notice.textContent = 'Preferência salva. O plano será menos personalizado até concluir o diagnóstico.'; }));
  else onboardingRoot.append(node('p', 'Você escolheu estudar sem diagnóstico. O plano será menos personalizado; pode fazer a avaliação quando quiser.'));
}
async function renderResume() {
  const root = document.querySelector('#study-resume'); root.replaceChildren();
  const runs = (await session.list()).filter(run => run.status !== 'completed');
  const readings = (await storage.query(examId, 'study-reading')).filter(run => run.status !== 'completed');
  root.hidden = !runs.length && !readings.length;
  if (runs.length || readings.length) root.append(node('h2', 'Continue de onde parou'));
  for (const run of runs) root.append(button('Retomar ' + run.title + ' · ' + ({ paused: 'pausada', active: 'em andamento', 'in-progress': 'em andamento' }[run.status] ?? 'pendente'), () => openSession(run.kind === 'diagnostic' ? diagnosticUI : run.kind === 'flashcards' ? flashcardUI : quizUI, run)));
  for (const run of readings) root.append(button('Retomar leitura · ' + run.activity.topicId, async () => { requirePaused(); await showTheory(run.activity, run.date); }));
  if (!runs.length && !readings.length) root.append(node('p', 'Nenhuma sessão pendente. Comece pela agenda Hoje ou escolha um tópico.'));
  questionsRoot.querySelector('#questions-resume')?.remove();
  if (document.documentElement.dataset.studyActive !== 'true') {
    const questionRuns = runs.filter(run => ['quiz', 'simulation'].includes(run.kind));
    if (questionRuns.length || readings.length) {
      const pending = node('div'); pending.id = 'questions-resume';
      pending.setAttribute('aria-label', 'Sessões pendentes de questões e leitura');
      pending.append(node('h3', 'Continue de onde parou'));
      for (const run of questionRuns) pending.append(button('Retomar ' + run.title, () => openSession(quizUI, run)));
      for (const run of readings) pending.append(button('Retomar leitura · ' + run.activity.topicId, async () => { requirePaused(); await showTheory(run.activity, run.date); }));
      questionsRoot.append(pending);
    }
  }
}
async function renderReviews() {
  const root = document.querySelector('#reviews'); root.replaceChildren(node('h2', 'Revisões'));
  const records = await storage.query(examId, 'revisions'); const due = records.filter(record => Date.parse(record.dueAt) <= Date.now());
  const list = node('div', undefined, 'pixel-grid reviews-list');
  if (!records.length) root.append(node('p', 'Sem revisões ainda. Responda questões ou avalie um flashcard para agendar a primeira revisão.', 'pixel-panel'));
  else if (!due.length) root.append(node('p', 'Nenhuma revisão vencida. A próxima revisão aparece na data agendada.', 'pixel-panel'));
  for (const record of records) {
    const title = flattenTopics(pack.curriculum).find(topic => topic.id === record.topicId)?.title ?? record.topicId;
    const overdue = due.includes(record);
    const row = node('article', undefined, 'pixel-panel pixel-panel--compact review-quest' + (overdue ? ' review-quest--due' : ''));
    const label = node('p', title + ' · ' + (overdue ? 'Vencida' : 'Agendada') + ' · ' + new Date(record.dueAt).toLocaleDateString());
    row.append(label, button('Revisar tópico', () => startCards(record.topicId)));
    list.append(row);
  }
  if (records.length) root.append(list);
  root.append(button('Ver erros da primeira tentativa', async () => {
    requirePaused(); const errors = (await storage.query(examId, 'scores')).filter(score => !score.correct);
    if (!errors.length) { notice.textContent = 'Sem erros registrados na primeira tentativa.'; return; }
    const first = errors[0]; let run = await session.get(first.simulationRunId);
    if (!run) { notice.textContent = 'Erro de sessão legada. Pratique o tópico no currículo; o score original permanece preservado.'; return; }
    run = await session.setCursor(run.id, { itemId: first.questionId }); await openSession(quizUI, run);
  }));
}
async function renderSimulations() {
  const root = simulationsRoot;
  root.replaceChildren(node('p', 'Escolha um pool empacotado. Pausa e reload preservam a execução e suas primeiras respostas.'), button('Escolher simulado', async () => {
    requirePaused(); const simulations = await ensureSimulations(); root.replaceChildren();
    if (!simulations.length) root.append(node('p', 'Nenhum simulado disponível neste pacote.'));
    for (const simulation of simulations) root.append(button(simulation.title, async () => {
      requirePaused(); const questions = selectSimulationQuestions(simulation, await ensureQuestions());
      const existing = (await session.list()).find(run => run.kind === 'simulation' && run.title === simulation.title && run.status !== 'completed');
      if (existing) await openSession(quizUI, existing); else await startQuiz({ questions, title: simulation.title, kind: 'simulation' });
    }));
  }));
  const completed = (await session.list()).filter(run => run.kind === 'simulation' && run.status === 'completed');
  if (!completed.length) root.append(node('p', 'Sem simulados concluídos. Seu histórico aparecerá aqui.'));
  for (const run of completed) {
    const score = await session.scoring.getScore(examId, run.id);
    root.append(node('p', run.title + ' · score histórico: ' + (score == null ? 'sem respostas' : Math.round(score) + '%')), button('Rever respostas / retentativa', async () => { requirePaused(); const current = await session.setCursor(run.id, { cursor: 0 }); await openSession(quizUI, current); }));
  }
}
async function renderAnalytics() {
  const root = document.querySelector('#progress'); const input = await context(settings.dailyMinutes);
  const xp = await gamification.snapshot(examId); const scores = await storage.query(examId, 'scores'); const history = await events.list(examId);
  root.replaceChildren(node('h2', 'Progresso'));
  const stats = node('div', undefined, 'pixel-grid pixel-grid--stats analytics-stats');
  stats.append(node('p', 'Cobertura: ' + Math.round((input.metric.coverage.rate ?? 0) * 100) + '%', 'pixel-panel pixel-stat'));
  stats.append(node('p', 'XP: ' + xp.xp + ' · Nível: ' + xp.level, 'pixel-panel pixel-stat'));
  root.append(stats);
  const details = node('div', undefined, 'pixel-grid analytics-details');
  details.append(node('p', input.metric.mastery.average == null ? 'Sem mastery estimado. Faça o diagnóstico ou responda questões.' : 'Domínio médio: ' + Math.round(input.metric.mastery.average * 100) + '%', 'pixel-panel'));
  details.append(node('p', scores.length ? 'Primeira tentativa: ' + Math.round(input.metric.firstTryAccuracy.rate * 100) + '% em ' + scores.length + ' resposta(s).' : 'Sem primeiras tentativas de questões ou simulados.', 'pixel-panel'));
  details.append(node('p', history.some(event => ['topic_completed', 'question_answered', 'review_completed', 'diagnostic_completed'].includes(event.type)) ? 'Histórico de estudo preservado neste dispositivo.' : 'Sem histórico de estudo concluído.', 'pixel-panel'));
  details.append(node('p', scores.some(score => !score.correct) ? scores.filter(score => !score.correct).length + ' erro(s) da primeira tentativa. Use Revisões para praticar.' : 'Sem erros registrados na primeira tentativa.', 'pixel-panel'));
  details.append(node('p', xp.awards.length ? xp.awards.length + ' recompensa(s) de estudo registradas.' : 'Sem recompensas ainda. Conclua atividades para ganhar XP.', 'pixel-panel'));
  root.append(details);
}
async function refreshPanels() {
  await renderHome(); await renderOnboarding(); await renderResume(); await renderReviews(); await renderAnalytics(); await renderSimulations();
  if (!diagnosticRoot.childElementCount) diagnosticRoot.append(node('p', 'O diagnóstico estima domínio sem alterar o score simulado.'), button('Iniciar / retomar diagnóstico', startDiagnostic));
  if (!flashcardsRoot.childElementCount) flashcardsRoot.append(node('p', 'Revele a resposta antes de avaliar sua lembrança.'), button('Estudar flashcards', () => startCards()));
}
async function showSettings() {
  const overview = node('div', undefined, 'pixel-panel settings-overview');
  overview.append(node('h3', 'Nivelando Game'), node('p', 'StudyOS Engine · versão ' + metadata.appVersion + (authSession ? ' · conta: ' + (authSession.user.email ?? 'autenticada') : ' · dados deste dispositivo') + '.'), node('p', 'Escolha a meta diária, faça o diagnóstico e siga Hoje. Questões, flashcards e simulados usam conteúdo local; links externos precisam de internet. Exporte backups para manter uma cópia fora deste navegador.'));
  settingsRoot.replaceChildren(overview);
  const actions = node('div', undefined, 'pixel-panel settings-actions');
  const file = node('input'); file.type = 'file'; file.accept = 'application/json,.json'; file.setAttribute('aria-label', 'Selecionar backup JSON');
  const message = node('p', '', 'status settings-message'); message.setAttribute('role', 'status');
  const recoveryNote = node('p', 'Snapshot bruto de recuperação: dados não validados, apenas para análise ou suporte. Este arquivo não pode ser importado como backup normal.', 'status settings-recovery-note');
  recoveryNote.setAttribute('role', 'note');
  actions.append(button('Exportar meus dados', async () => { requirePaused(); downloadJson('studyos-backup-' + examId + '.json', await exportProductionBackup(storage, examId, metadata, settings, ownerId ?? undefined)); message.textContent = 'Backup completo preparado para download' + (ownerId ? ' para esta conta.' : '.'); }), file, button('Importar backup', async () => {
    requirePaused(); if (!file.files?.[0]) throw new Error('Selecione um arquivo JSON.');
    if (file.files[0].size > 25 * 1024 * 1024) throw new Error('Arquivo grande demais para importar (máximo 25 MB).');
    const payload = JSON.parse(await file.files[0].text()); validateBackupPayload(payload, { examId, metadata, requireComplete: true });
    const count = Object.values(payload.data.collections ?? {}).reduce((sum, records) => sum + records.length, 0);
    const ownerNote = ownerId && payload.ownerId && payload.ownerId !== ownerId ? ' Este backup pertence a outra conta; a importação transfere seu conteúdo explicitamente.' : ownerId && !payload.ownerId ? ' Este backup legado não registra conta; confirme que deseja transferi-lo para a conta atual.' : '';
    message.textContent = 'Backup de ' + payload.exportedAt + ': ' + count + ' registros; versão ' + payload.appVersion + '. Inclui mastery global e preferências.' + ownerNote;
    if (!window.confirm(message.textContent + '\nRestaurar e substituir os dados deste concurso e o domínio global? Uma cópia automática de recuperação será criada antes.')) return;
    await runMutation(storage, undefined, async ctx => {
      const result = await restoreProductionBackup(storage, payload, { examId, metadata, currentSettings: settings }, ctx);
      await storage.put(examId, 'user-settings', 'preferences', result.settings);
      applyLocalSettings(result.settings); settings = result.settings;
    });
    message.textContent = 'Backup restaurado e validado. Recarregando…'; window.location.reload();
  }), button('Baixar snapshot bruto de recuperação', async () => {
    requirePaused();
    const snapshot = await exportRecoverySnapshot(storage, examId);
    if (!snapshot) throw new Error('Nenhum snapshot bruto de recuperação disponível.');
    const serialized = stringifyJsonLossless(snapshot);
    const url = URL.createObjectURL(new Blob([serialized], { type: 'application/json' }));
    const link = node('a'); link.href = url; link.download = 'studyos-raw-recovery-only-' + examId + '.json'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message.textContent = 'Snapshot bruto baixado. Não foi validado e não pode ser importado como backup normal.';
  }));
  settingsRoot.append(actions, recoveryNote, message);
  if (authClient?.configured) {
    const syncPanel = node('div', undefined, 'pixel-panel settings-sync');
    syncPanel.append(node('h3', 'Sincronização da conta'));
    const syncStatus = node('p', authSession ? 'Progresso da conta fica neste dispositivo até sincronizar.' : 'Entre em uma conta para sincronizar o progresso.', 'status');
    syncStatus.id = 'workspace-sync-status'; syncStatus.setAttribute('role', 'status');
    syncPanel.append(syncStatus);
    if (authSession) syncPanel.append(button('Sincronizar agora', () => syncWorkspace({ manual: true })));
    const conflict = node('div', undefined, 'settings-sync-conflict'); conflict.id = 'workspace-sync-conflict';
    syncPanel.append(conflict); settingsRoot.append(syncPanel);
  }
  const legacy = node('details', undefined, 'pixel-panel settings-disclosure'); legacy.append(node('summary', 'Recuperar diagnóstico do staging anterior'), node('p', 'Importa somente registros ausentes. Preserva o banco legado e os dados atuais.'), button('Importar diagnóstico legado', importLegacyDiagnostic)); settingsRoot.append(legacy);
  const danger = node('details', undefined, 'pixel-panel settings-disclosure settings-danger danger-zone'); danger.append(node('summary', 'Área de risco: resetar dados'), node('p', 'Remove os dados deste concurso e o domínio global, afetando mastery de outros packs. Os históricos dos outros concursos e o banco legado são preservados.'), button('Resetar meus dados', async () => {
    requirePaused(); if (window.prompt('Remove os dados deste concurso e mastery GLOBAL, inclusive domínio usado em outros packs. Para confirmar, digite RESETAR') !== 'RESETAR') { message.textContent = 'Reset cancelado.'; return; }
    await runMutation(storage, undefined, async ctx => {
      const result = await resetProductionStore(storage, examId, { confirmation: 'RESETAR', metadata, currentSettings: settings }, ctx);
      applyLocalSettings(result.settings); settings = result.settings;
    });
    message.textContent = 'Dados removidos. Backup automático disponível para recuperação. Recarregando…'; window.location.reload();
  })); settingsRoot.append(danger);
  const technical = node('details', undefined, 'pixel-panel settings-disclosure settings-technical'); technical.append(node('summary', 'Detalhes técnicos'), node('p', 'buildId ' + metadata.buildId + ' · commit ' + metadata.commitSha + ' · canal ' + metadata.channel + ' · pack ' + metadata.examPackVersion + ' · storage ' + metadata.storageVersion)); settingsRoot.append(technical);
}
function syncRevisionKey() { return `studyos-sync-revision:${ownerId}`; }
function syncStatus(message, role = 'status') {
  const output = document.querySelector('#workspace-sync-status');
  if (output) { output.textContent = message; output.setAttribute('role', role); }
}
function showSyncConflict(localBackup, remotePayload, message) {
  const root = document.querySelector('#workspace-sync-conflict');
  if (!root) { syncStatus(message, 'alert'); return; }
  root.replaceChildren(node('p', message));
  if (localBackup) root.append(button('Baixar backup local', () => downloadJson(`studyos-local-conflict-${examId}.json`, localBackup)));
  if (remotePayload) root.append(button('Baixar cópia remota para reconciliação', () => downloadJson('studyos-remote-workspace-conflict.json', remotePayload)));
}
async function localWorkspaceSnapshot() {
  const backup = await exportProductionBackup(storage, examId, metadata, settings, ownerId);
  const { globalData, ...examSnapshot } = backup;
  return { backup, payload: { schemaVersion: 1, exams: { [examId]: examSnapshot }, globalData: await masteryStore.export() } };
}
function hasLocalStudyData(backup) {
  const collections = Object.entries(backup.data.collections ?? {}).filter(([name]) => name !== 'user-settings');
  return collections.some(([, records]) => records.length > 0) || (backup.globalData?.collections?.mastery?.length ?? 0) > 0;
}
function workspaceGlobalExport(mastery) {
  const records = (mastery?.records ?? []).map(record => ({ id: record.canonicalConceptId, value: record }));
  return { version: 1, examId: '__studyos_global__', records: [], events: [], collections: { mastery: records } };
}
async function applyRemoteWorkspace(payload) {
  if (!payload || payload.schemaVersion !== 1 || !payload.exams || typeof payload.exams !== 'object') throw new Error('Workspace remoto inválido.');
  const examSnapshot = payload.exams[examId];
  const globalData = workspaceGlobalExport(payload.globalData);
  if (examSnapshot) {
    const result = await restoreProductionBackup(storage, { ...examSnapshot, globalData }, { examId, metadata, currentSettings: settings });
    await storage.put(examId, 'user-settings', 'preferences', result.settings);
    applyLocalSettings(result.settings); settings = result.settings;
  } else if (payload.globalData?.records?.length) await masteryStore.import(payload.globalData);
  await refreshPanels();
}
async function syncWorkspace({ manual = true } = {}) {
  requirePaused();
  if (!authSession || !workspaceSync) throw new Error('Entre em uma conta para sincronizar.');
  syncStatus(manual ? 'Preparando sincronização…' : 'Sincronização em andamento…');
  const resumed = await authClient.resume();
  if (!resumed) throw new Error('Entre novamente para sincronizar esta conta.');
  authSession = resumed;
  const pending = await storage.query(SYNC_NAMESPACE, 'outbox');
  if (pending.length) {
    const operation = pending[0];
    try {
      const result = await workspaceSync.commit(operation);
      const revision = Number(result?.revision);
      if (!Number.isSafeInteger(revision) || revision < 1) throw new Error('Resposta de revisão remota inválida.');
      await storage.delete(SYNC_NAMESPACE, 'outbox', operation.operationId);
      localStorage.setItem(syncRevisionKey(), String(revision));
      syncStatus('Progresso sincronizado. Revisão ' + revision + '.');
      document.querySelector('#workspace-sync-conflict')?.replaceChildren();
      return;
    } catch (error) {
      if (error.payload?.code === '40001' || error.payload?.code === '23514') {
        const remote = await workspaceSync.load().catch(() => null);
        const local = await localWorkspaceSnapshot().catch(() => null);
        showSyncConflict(local?.backup, remote?.payload, 'Há alterações concorrentes. As duas versões foram preservadas; baixe-as e reconcilie antes de sincronizar de novo.');
      } else syncStatus('Progresso local salvo; a sincronização ficou pendente e tentará novamente depois.', 'alert');
      return;
    }
  }

  const [remote, local] = await Promise.all([workspaceSync.load(), localWorkspaceSnapshot()]);
  const baselineValue = localStorage.getItem(syncRevisionKey());
  const baseline = baselineValue === null ? null : Number(baselineValue);
  if (remote && baseline === null) {
    if (!hasLocalStudyData(local.backup)) {
      await applyRemoteWorkspace(remote.payload);
      localStorage.setItem(syncRevisionKey(), String(remote.revision));
      syncStatus('Progresso da conta restaurado neste dispositivo. Revisão ' + remote.revision + '.');
    } else showSyncConflict(local.backup, remote.payload, 'Este dispositivo e a conta já têm progresso. Nada foi sobrescrito. Baixe as duas versões para reconciliar.');
    return;
  }
  if (remote && baseline !== Number(remote.revision)) {
    showSyncConflict(local.backup, remote.payload, 'A conta mudou desde a última sincronização. Nada foi sobrescrito. Baixe as duas versões para reconciliar.');
    return;
  }
  if (!remote && baseline !== null) {
    showSyncConflict(local.backup, null, 'A cópia remota não está disponível, mas o dispositivo já registrou uma revisão. O envio foi bloqueado para proteger o progresso.');
    return;
  }

  const payload = {
    schemaVersion: 1,
    exams: { ...(remote?.payload?.exams ?? {}), [examId]: local.payload.exams[examId] },
    globalData: local.payload.globalData
  };
  const operationId = crypto.randomUUID();
  const operation = { expectedRevision: Number(remote?.revision ?? 0), operationId, payload };
  await storage.put(SYNC_NAMESPACE, 'outbox', operationId, operation);
  try {
    const result = await workspaceSync.commit(operation);
    const revision = Number(result?.revision);
    if (!Number.isSafeInteger(revision) || revision < 1) throw new Error('Resposta de revisão remota inválida.');
    await storage.delete(SYNC_NAMESPACE, 'outbox', operationId);
    localStorage.setItem(syncRevisionKey(), String(revision));
    syncStatus('Progresso sincronizado. Revisão ' + revision + '.');
    document.querySelector('#workspace-sync-conflict')?.replaceChildren();
  } catch (error) {
    if (error.payload?.code === '40001' || error.payload?.code === '23514') {
      const latest = await workspaceSync.load().catch(() => null);
      showSyncConflict(local.backup, latest?.payload, 'A conta mudou durante o envio. As versões foram preservadas; baixe-as e reconcilie antes de sincronizar de novo.');
    } else syncStatus('Progresso local salvo; a sincronização ficou pendente e tentará novamente depois.', 'alert');
  }
}

async function importLegacyDiagnostic() {
  requirePaused();
  const legacyName = 'studyos-staging-tce-go-ti-2026-v1';
  if (indexedDB.databases && !(await indexedDB.databases()).some(db => db.name === legacyName)) throw new Error('Nenhum banco de diagnóstico legado encontrado neste navegador.');
  const legacy = new IndexedDbStore({ name: legacyName, version: 1 });
  const diagnosticRuns = await legacy.query(examId, 'diagnostic-runs'); const records = await new MasteryStore(legacy).list();
  if (!diagnosticRuns.length && !records.length) throw new Error('Nenhum diagnóstico legado disponível.');
  if (!window.confirm('Importar ' + diagnosticRuns.length + ' avaliação(ões) e ' + records.length + ' conceito(s) ausentes? O banco legado será preservado.')) return;
  await migrateLegacyDiagnostic(storage, legacy, examId);
  notice.textContent = 'Diagnóstico legado importado; origem preservada.'; await refreshPanels();
}

function showAuthMessage(message, role = 'status') {
  const output = document.querySelector('#auth-status');
  if (output) { output.textContent = message; output.setAttribute('role', role); }
}
function bindAccountForms() {
  const accountAction = handler => async event => {
    event.preventDefault();
    try { await handler(event); }
    catch (error) { showAuthMessage(error.message, 'alert'); }
  };
  const login = document.querySelector('#login-form');
  login?.addEventListener('submit', accountAction(async () => {
    const session = await authClient.signIn({ email: login.elements.email.value.trim().toLowerCase(), password: login.elements.password.value });
    await startAccount(session);
  }));
  const register = document.querySelector('#register-form');
  register?.addEventListener('submit', accountAction(async () => {
    const result = await authClient.register({ email: register.elements.email.value.trim().toLowerCase(), password: register.elements.password.value, displayName: register.elements.displayName.value.trim() });
    if (result.access_token && result.user?.id) await startAccount(authClient.current());
    else showAuthMessage('Conta criada. Confirme o e-mail antes de entrar.');
  }));
  const recover = document.querySelector('#recover-form');
  recover?.addEventListener('submit', accountAction(async () => {
    await authClient.recover(recover.elements.email.value.trim().toLowerCase());
    showAuthMessage('Se o e-mail estiver cadastrado, você receberá um link de recuperação.');
  }));
  const reset = document.querySelector('#reset-form');
  reset?.addEventListener('submit', accountAction(async () => {
    await authClient.updatePassword(reset.elements.password.value);
    reset.reset(); reset.hidden = true; recover.hidden = false;
    showAuthMessage('Senha atualizada. Entre com sua nova senha.'); location.hash = '#login';
  }));
  document.querySelector('#guest-button')?.addEventListener('click', async () => {
    guestMode = true; ownerId = null; preferenceKey = 'studyos-daily-minutes:' + examId; settingsKey = 'studyos-settings:' + examId;
    location.hash = '#today'; await loadPack();
  });
  document.querySelector('#logout-button')?.addEventListener('click', guarded(async () => {
    requirePaused(); await authClient.signOut(); authSession = null; guestMode = false; location.reload();
  }));
}
async function startAccount(session) {
  requirePaused();
  authSession = session; ownerId = session.user.id; guestMode = false;
  workspaceSync = createSupabaseWorkspaceSync({ config: authConfig, userId: ownerId, accessToken: () => authClient.current()?.access_token });
  preferenceKey = `studyos-daily-minutes:${ownerId}:${examId}`;
  settingsKey = `studyos-settings:${ownerId}:${examId}`;
  document.querySelector('#account-link').textContent = session.user.email ?? 'Minha conta';
  document.querySelector('#account-link').href = '#settings';
  document.querySelector('#logout-button').hidden = false;
  location.hash = '#today'; await loadPack();
}
async function bootStudyOS() {
  try {
    authConfig = await fetchJson('./auth-config.json');
    authClient = createSupabaseAuth(authConfig);
  } catch { authConfig = {}; authClient = createSupabaseAuth(authConfig); }
  bindAccountForms();
  if (!authClient.configured) {
    showAuthMessage('Login por conta ainda não está configurado neste site. O progresso continua salvo localmente neste navegador.');
    await loadPack(); return;
  }
  document.querySelector('#guest-button').hidden = false;
  showAuthMessage('Entre ou crie sua conta. Os dados locais antigos permanecem disponíveis pelo acesso deste dispositivo e podem ser exportados como backup.');
  const resetForm = document.querySelector('#reset-form');
  const recoverForm = document.querySelector('#recover-form');
  try {
    const callback = await authClient.consumeRedirect();
    if (callback?.type === 'recovery') { resetForm.hidden = false; recoverForm.hidden = true; location.hash = '#recover'; return; }
    const session = callback?.session ?? await authClient.resume();
    if (session) { await startAccount(session); return; }
  } catch (error) { showAuthMessage(error.message, 'alert'); }
  if (!location.hash || !['#login', '#register', '#recover'].includes(location.hash)) location.hash = '#login';
}
window.addEventListener('hashchange', () => {
  const accountRoute = ['#login', '#register', '#recover'].includes(location.hash);
  if (authClient?.configured && !authSession && !guestMode && !accountRoute) location.hash = '#login';
  if ((authSession || guestMode) && accountRoute) location.hash = '#today';
});
window.addEventListener('studyos:session-paused', () => {
  void (async () => { await renderResume(); await renderHome(); })().catch(report);
  if (authSession) void syncWorkspace({ manual: false }).catch(error => syncStatus(error.message, 'alert'));
});
bootStudyOS().catch(error => { report(error); status.textContent = 'Não foi possível iniciar o estudo. Verifique a conexão e o armazenamento do navegador. Nenhum salvamento foi confirmado.'; });
