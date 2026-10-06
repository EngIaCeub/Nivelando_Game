import { IndexedDbStore, EventLog, MasteryStore, TodayPlanEngine, TodayDashboard, GamificationEngine, calculateAnalytics, flattenTopics } from './core/src/index.js';
import { exportProductionBackup, exportRecoverySnapshot, restoreProductionBackup, validateBackupPayload, resetProductionStore, updateProductionSettings, bootstrapProductionSettings, importLegacyDiagnostic as migrateLegacyDiagnostic } from './core/src/production.js';
import { StudySession, StudyUI, action, node, safeResourceLink, lazyQuestions, selectSimulationQuestions } from './core/src/study-ui.js';
import { runMutation } from './core/src/mutation-context.js';

const examId = 'tce-go-ti-2026';
const preferenceKey = 'studyos-daily-minutes:' + examId;
const settingsKey = 'studyos-settings:' + examId;
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
let diagnosticUI, quizUI, flashcardUI;
document.documentElement.dataset.studyActive = 'false';

function report(error) {
  console.error('StudyOS operation failed', error);
  notice.textContent = 'Não foi possível concluir a operação. O progresso pode não ter sido salvo. Confira o armazenamento e tente novamente. ' + (error?.message ?? '');
  notice.setAttribute('role', 'alert');
}
const button = (label, handler) => action(label, handler, report);
const guarded = handler => (...args) => Promise.resolve().then(() => handler(...args)).catch(report);
function requirePaused() { if (document.documentElement.dataset.studyActive === 'true') throw new Error('Pause a sessão antes de importar, reiniciar ou trocar de atividade.'); }
async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Conteúdo indisponível. Tente novamente com internet.');
  return response.json();
}
const ensureQuestions = lazyQuestions(async () => { pack.questions = await fetchJson('./exam-pack/questions.json'); return pack.questions; });
const ensureCards = lazyQuestions(async () => (await fetchJson('./exam-pack/flashcards.json')).cards);
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
  const [manifest, curriculum, resources, buildMetadata] = await Promise.all([
    fetchJson('./exam-pack/manifest.json'), fetchJson('./exam-pack/curriculum.json'), fetchJson('./exam-pack/resources.json'), fetchJson('./build-meta.json')
  ]);
  metadata = buildMetadata; pack = { manifest, curriculum, resources };
  const topicTitles = new Map(flattenTopics(curriculum).map(topic => [topic.id, topic.title]));
  document.title = 'StudyOS — ' + manifest.title;
  status.textContent = manifest.title + ' · prova prevista em ' + manifest.examDate + ' · versão ' + metadata.appVersion + '.';
  storage = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
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
  };
  diagnosticUI = new StudyUI({ root: diagnosticRoot, session, ensureQuestions, ensureCards, report, onComplete });
  quizUI = new StudyUI({ root: questionsRoot, session, ensureQuestions, ensureCards, report, onComplete });
  flashcardUI = new StudyUI({ root: flashcardsRoot, session, ensureQuestions, ensureCards, report, onComplete, topicTitleFor: topicId => topicTitles.get(topicId) ?? topicId });
  const oldStart = document.querySelector('#start-button');
  const start = button('Começar sessão', async () => {
    const current = await plans.get(examId, today());
    const activity = current?.activities.find(item => item.status !== 'completed');
    if (activity) await startActivity(activity); else { notice.textContent = 'Agenda concluída. Escolha um tópico ou simulado para estudar mais.'; document.querySelector('#subjects').scrollIntoView(); }
  }); start.id = 'start-button'; oldStart.replaceWith(start);
  // Recovery controls must survive a failure rendering existing study records.
  await showSettings(); renderCurriculum(); await refreshPanels();
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
  new TodayDashboard({ root: document.querySelector('#today-dashboard'), onStart: guarded(startActivity), onMinutes: guarded(async minutes => {
    requirePaused(); await runMutation(storage, undefined, async ctx => { await saveSettings({ dailyMinutes: minutes }, ctx); await regeneratePlan(ctx); }); await refreshPanels();
  }), onExtra: guarded(async () => {
    requirePaused(); const topic = flattenTopics(pack.curriculum)[0];
    if (!topic) throw new Error('Não há tópicos para estudo extra.');
    await plans.addExtraActivity({ examId, date: today(), topicId: topic.id, minutes: 15 }); await renderHome();
  }) }).render({ exam: pack.manifest, plan, summary, weekly, metrics: input.metric, streak, xp: xp.xp, availableMinutes, topics: flattenTopics(pack.curriculum) });
  status.dataset.todayState = 'plan-ready';
}
async function openSession(ui, run) { requirePaused(); await ui.open(run.id); }
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
    await startQuiz({ questions: ids.map(id => bank.find(q => q.id === id)).filter(Boolean), title: activity.reason, id: 'today-' + date + '-' + activity.activityId, activity, date });
  } else await showTheory(activity, date);
}
async function showTheory(activity, date) {
  const id = 'theory:' + activity.activityId;
  const reading = await session.startReading({ activity, date });
  if (reading.status === 'completed') { notice.textContent = 'Leitura já concluída.'; return; }
  document.documentElement.dataset.studyActive = 'true';
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
  }));
  questionsRoot.scrollIntoView();
}
function renderCurriculum() {
  const root = document.querySelector('#subjects');
  root.replaceChildren(node('h2', 'Matérias'));
  if (!pack.curriculum.disciplines.length) {
    const empty = node('p', 'Nenhum currículo disponível neste pacote.', 'pixel-panel');
    root.append(empty);
  }
  for (const discipline of pack.curriculum.disciplines) {
    const details = node('details', undefined, 'pixel-panel curriculum-campaign');
    const summary = node('summary', discipline.title);
    details.append(summary);
    for (const module of discipline.modules) {
      const questLine = node('section', undefined, 'curriculum-quest-line');
      questLine.append(node('h3', module.title));
      for (const topic of module.topics) {
        const article = node('article', undefined, 'topic-card pixel-panel pixel-panel--compact');
        article.append(node('h4', topic.title));
        for (const resource of pack.resources.filter(item => item.topicIds?.includes(topic.id))) article.append(safeResourceLink(resource), node('p', 'Recurso externo · exige internet.'));
        article.append(button('Praticar questões', async () => {
          requirePaused(); const questions = (await ensureQuestions()).filter(item => item.topicIds?.includes(topic.id));
          const existing = (await session.list()).find(run => run.kind === 'quiz' && run.title === topic.title && run.status !== 'completed');
          if (existing) await openSession(quizUI, existing); else await startQuiz({ questions, title: topic.title });
        }), button('Revisar flashcards', () => startCards(topic.id)));
        questLine.append(article);
      }
      details.append(questLine);
    }
    root.append(details);
  }
}
async function startCards(topicId = null) {
  requirePaused(); const cards = (await ensureCards()).filter(card => !topicId || card.topicIds?.includes(topicId));
  const title = topicId ? 'Flashcards — ' + (flattenTopics(pack.curriculum).find(topic => topic.id === topicId)?.title ?? topicId) : 'Flashcards';
  const existing = (await session.list()).find(run => run.kind === 'flashcards' && run.title === title && run.status !== 'completed');
  const run = existing ?? await session.start({ kind: 'flashcards', cards, title, contentVersion: metadata.examPackVersion });
  await openSession(flashcardUI, run);
}
async function renderOnboarding() {
  onboardingRoot.replaceChildren();
  const completed = (await storage.query(examId, 'diagnostic-runs')).some(run => run.status === 'completed');
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
  for (const run of runs) root.append(button('Retomar ' + run.title + ' · ' + run.status, () => openSession(run.kind === 'diagnostic' ? diagnosticUI : run.kind === 'flashcards' ? flashcardUI : quizUI, run)));
  for (const run of readings) root.append(button('Retomar leitura · ' + run.activity.topicId, async () => { requirePaused(); await showTheory(run.activity, run.date); }));
  if (!runs.length && !readings.length) root.append(node('p', 'Nenhuma sessão pendente. Comece pela agenda Hoje ou escolha um tópico.'));
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
  overview.append(node('h3', 'Nivelando Game'), node('p', 'StudyOS Engine · versão ' + metadata.appVersion + ' · dados armazenados neste dispositivo.'), node('p', 'Escolha a meta diária, faça o diagnóstico e siga Hoje. Questões, flashcards e simulados usam conteúdo local; links externos precisam de internet. Exporte backups para manter uma cópia fora deste navegador.'));
  settingsRoot.replaceChildren(overview);
  const actions = node('div', undefined, 'pixel-panel settings-actions');
  const file = node('input'); file.type = 'file'; file.accept = 'application/json,.json'; file.setAttribute('aria-label', 'Selecionar backup JSON');
  const message = node('p', '', 'status settings-message'); message.setAttribute('role', 'status');
  const recoveryNote = node('p', 'Snapshot bruto de recuperação: dados não validados, apenas para análise ou suporte. Este arquivo não pode ser importado como backup normal.', 'status settings-recovery-note');
  recoveryNote.setAttribute('role', 'note');
  actions.append(button('Exportar meus dados', async () => { requirePaused(); downloadJson('studyos-backup-' + examId + '.json', await exportProductionBackup(storage, examId, metadata, settings)); message.textContent = 'Backup completo preparado para download.'; }), file, button('Importar backup', async () => {
    requirePaused(); if (!file.files?.[0]) throw new Error('Selecione um arquivo JSON.');
    if (file.files[0].size > 25 * 1024 * 1024) throw new Error('Arquivo grande demais para importar (máximo 25 MB).');
    const payload = JSON.parse(await file.files[0].text()); validateBackupPayload(payload, { examId, metadata, requireComplete: true });
    const count = Object.values(payload.data.collections ?? {}).reduce((sum, records) => sum + records.length, 0);
    message.textContent = 'Backup de ' + payload.exportedAt + ': ' + count + ' registros; versão ' + payload.appVersion + '. Inclui mastery global e preferências.';
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

loadPack().catch(error => { report(error); status.textContent = 'Não foi possível iniciar o estudo. Verifique a conexão e o armazenamento do navegador. Nenhum salvamento foi confirmado.'; });
