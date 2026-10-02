import { IndexedDbStore, EventLog, ScoringEngine, RevisionEngine, GamificationEngine, MasteryStore, TodayPlanEngine, TodayDashboard, calculateAnalytics, createBackupPayload, validateBackupPayload, resetStore } from './core/src/index.js';

const examId = 'tce-go-ti-2026';
const status = document.querySelector('#pack-status');
const subjects = document.querySelector('#subjects p');
const dashboardRoot = document.querySelector('#today-dashboard');
const questionsRoot = document.querySelector('#questions');
const settingsRoot = document.querySelector('#production-settings');
const storage = new IndexedDbStore({ name: 'studyos-tce-go-ti-2026-v2', version: 2 });
const plans = new TodayPlanEngine(storage);
const masteryStore = new MasteryStore(storage);
const scoring = new ScoringEngine(storage);
const revisions = new RevisionEngine(storage);
const events = new EventLog(storage);
const gamification = new GamificationEngine(storage);
const today = () => new Date().toISOString().slice(0, 10);
const preferenceKey = `studyos-daily-minutes:${examId}`;
let pack;
let metadata;

function downloadJson(filename, payload) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

function showSettings() {
  settingsRoot.replaceChildren();
  const about = document.createElement('div'); about.className = 'onboarding';
  const aboutTitle = document.createElement('h3'); aboutTitle.textContent = 'Nivelando Game';
  const aboutText = document.createElement('p'); aboutText.textContent = `StudyOS Engine · versão ${metadata.appVersion} · dados armazenados neste dispositivo.`;
  const guide = document.createElement('p'); guide.textContent = 'Comece pelo diagnóstico, use Hoje para sua agenda, responda questões e revise seus pontos fracos. Você pode pular o diagnóstico, mas o plano será menos personalizado.';
  about.append(aboutTitle, aboutText, guide);
  const actions = document.createElement('div'); actions.className = 'settings-actions';
  const exportButton = document.createElement('button'); exportButton.type = 'button'; exportButton.textContent = 'Exportar meus dados';
  exportButton.addEventListener('click', async () => downloadJson(`studyos-backup-${examId}.json`, createBackupPayload({ examId, exported: await storage.export(examId), metadata })));
  const file = document.createElement('input'); file.type = 'file'; file.accept = 'application/json,.json'; file.setAttribute('aria-label', 'Selecionar backup JSON');
  const importButton = document.createElement('button'); importButton.type = 'button'; importButton.textContent = 'Importar backup';
  const message = document.createElement('p'); message.className = 'status'; message.setAttribute('role', 'status');
  importButton.addEventListener('click', async () => {
    try {
      if (!file.files?.[0]) throw new Error('selecione um arquivo JSON');
      const payload = JSON.parse(await file.files[0].text()); validateBackupPayload(payload, { examId });
      const summary = `backup de ${payload.exportedAt}, ${Object.keys(payload.data.collections ?? {}).length} coleções`;
      if (!window.confirm(`Importar ${summary}? O estado atual será salvo como backup automático.`)) return;
      localStorage.setItem(`studyos-auto-backup:${examId}`, JSON.stringify(createBackupPayload({ examId, exported: await storage.export(examId), metadata })));
      await storage.import(examId, payload.data); message.textContent = 'Backup importado. Recarregando…'; window.location.reload();
    } catch (error) { message.textContent = `Importação recusada: ${error.message}`; }
  });
  const resetButton = document.createElement('button'); resetButton.type = 'button'; resetButton.textContent = 'Resetar meus dados'; resetButton.title = 'Exige confirmação digitando RESETAR';
  resetButton.addEventListener('click', async () => { if (window.prompt('Para confirmar, digite RESETAR') !== 'RESETAR') { message.textContent = 'Reset cancelado.'; return; } await resetStore(storage, examId); message.textContent = 'Dados do Exam Pack removidos. Recarregando…'; window.location.reload(); });
  actions.append(exportButton, file, importButton, resetButton);
  const details = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'Detalhes técnicos'; const technical = document.createElement('p'); technical.textContent = `buildId ${metadata.buildId} · commit ${metadata.commitSha} · canal ${metadata.channel} · pack ${metadata.examPackVersion} · storage ${metadata.storageVersion}`; details.append(summary, technical);
  settingsRoot.append(about, actions, message, details);
}

async function loadPack() {
  const [manifest, curriculum, questions, resources, buildMetadata] = await Promise.all([
    fetch('./exam-pack/manifest.json').then((response) => response.json()),
    fetch('./exam-pack/curriculum.json').then((response) => response.json()),
    fetch('./exam-pack/questions.json').then((response) => response.json()),
    fetch('./exam-pack/resources.json').then((response) => response.json()),
    fetch('./build-meta.json').then((response) => response.json())
  ]);
  metadata = buildMetadata;
  pack = { manifest, curriculum, questions, resources };
  document.title = `StudyOS — ${manifest.title}`;
  status.textContent = `${manifest.title} · prova prevista em ${manifest.examDate} · versão ${metadata.appVersion} · pacote ${manifest.status}.`;
  subjects.textContent = `${curriculum.disciplines.length} disciplinas carregadas. A agenda de hoje é calculada automaticamente.`;
  showSettings();
}

async function context(availableMinutes) {
  const records = await masteryStore.list();
  const masteryByConcept = Object.fromEntries(records.map((record) => [record.canonicalConceptId, record]));
  const revisionRecords = await storage.query(examId, 'revisions');
  const scoreRecords = await storage.query(examId, 'scores');
  const firstAttempts = scoreRecords.map((attempt) => ({ ...attempt, ...(pack.questions.find((question) => question.id === attempt.questionId) ?? {}) }));
  const eventRecords = await events.list(examId);
  const completedTopicIds = eventRecords.filter((event) => event.type === 'topic_completed').map((event) => event.entityId);
  const metric = calculateAnalytics({ curriculum: pack.curriculum, events: eventRecords, firstAttempts, revisions: revisionRecords });
  metric.mastery = { topics: records.length, average: records.length ? records.reduce((sum, record) => sum + record.masteryEstimate, 0) / records.length : null };
  return { examId, date: today(), availableMinutes, curriculum: pack.curriculum, questions: pack.questions, resources: pack.resources, masteryByConcept, revisions: revisionRecords, firstAttempts, completedTopicIds, examDate: pack.manifest.examDate, now: new Date().toISOString(), metric };
}

async function renderQuestions(activity) {
  questionsRoot.replaceChildren();
  const heading = document.createElement('h2'); heading.textContent = 'Questões'; questionsRoot.append(heading);
  const selected = (activity.questionIds ?? []).map((id) => pack.questions.find((question) => question.id === id)).filter(Boolean);
  const answers = [];
  const runId = `today-${today()}-${activity.activityId}`;
  const list = document.createElement('ol');
  for (const question of selected) {
    const item = document.createElement('li'); item.className = 'card';
    const stem = document.createElement('p'); stem.textContent = question.stem; item.append(stem);
    for (const option of question.options) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = option.text;
      button.addEventListener('click', async () => {
        const correct = option.id === question.correctOptionId;
        const result = await scoring.submitAnswer({ examId, simulationRunId: runId, questionId: question.id, correct });
        answers.push({ question, correct, result });
        [...item.querySelectorAll('button')].forEach((candidate) => { candidate.disabled = true; });
        button.setAttribute('aria-pressed', 'true');
      }); item.append(button);
    }
    list.append(item);
  }
  const finish = document.createElement('button'); finish.type = 'button'; finish.textContent = 'Concluir atividade';
  finish.addEventListener('click', async () => {
    if (!answers.length) return;
    const byConcept = new Map();
    for (const { question, correct } of answers) for (const concept of question.canonicalConceptIds ?? []) {
      const current = byConcept.get(concept) ?? { correct: 0, total: 0 }; current.correct += correct ? 1 : 0; current.total += 1; byConcept.set(concept, current);
    }
    for (const [concept, result] of byConcept) {
      const previous = await masteryStore.get(concept);
      await masteryStore.put({ canonicalConceptId: concept, masteryEstimate: ((previous?.masteryEstimate ?? 0) * .5) + (result.correct / result.total) * .5, confidence: Math.min(1, (previous?.confidence ?? 0) + .1), source: 'today-activity', questionCount: (previous?.questionCount ?? 0) + result.total, firstTryCorrect: (previous?.firstTryCorrect ?? 0) + result.correct, firstTryWrong: (previous?.firstTryWrong ?? 0) + result.total - result.correct, reviewStatus: result.correct === result.total ? 'stable' : 'needs-review' });
    }
    await revisions.review({ examId, topicId: activity.topicId, quality: answers.every((answer) => answer.correct) ? 4 : 2 });
    await plans.completeActivity({ examId, date: today(), activityId: activity.activityId, actualMinutes: activity.estimatedMinutes });
    await events.append({ eventId: `topic-completed:${activity.activityId}`, type: 'topic_completed', timestamp: new Date().toISOString(), examId, entityId: activity.topicId, payload: { activityId: activity.activityId }, schemaVersion: 1 });
    const message = document.createElement('p'); message.className = 'status'; message.textContent = 'Atividade concluída; mastery, revisão, XP e agenda foram atualizados.'; questionsRoot.append(message);
    await renderHome();
  });
  questionsRoot.append(list, finish);
}

async function startActivity(activity) {
  await plans.startActivity({ examId, date: today(), activityId: activity.activityId });
  if (activity.type === 'questions' || activity.type === 'review' || activity.type === 'error_review') return renderQuestions(activity);
  questionsRoot.replaceChildren();
  const heading = document.createElement('h2'); heading.textContent = activity.type === 'theory' ? 'Teoria' : 'Leitura';
  const text = document.createElement('p'); text.textContent = activity.reason;
  const resource = pack.resources.find((item) => item.id === activity.resourceId);
  const complete = document.createElement('button'); complete.type = 'button'; complete.textContent = 'Concluir atividade'; complete.addEventListener('click', async () => { await plans.completeActivity({ examId, date: today(), activityId: activity.activityId }); await events.append({ eventId: `topic-completed:${activity.activityId}`, type: 'topic_completed', timestamp: new Date().toISOString(), examId, entityId: activity.topicId, payload: { activityId: activity.activityId }, schemaVersion: 1 }); await renderHome(); });
  questionsRoot.append(heading, text); if (resource) { const link = document.createElement('a'); link.href = resource.url; link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = resource.title; questionsRoot.append(link); } questionsRoot.append(complete);
}

async function renderHome() {
  status.dataset.todayState = 'starting';
  const availableMinutes = Number(localStorage.getItem(preferenceKey) ?? 120);
  const input = await context(availableMinutes);
  status.dataset.todayState = 'context-ready';
  let plan = await plans.get(examId, input.date);
  if (!plan || plan.availableMinutes !== availableMinutes) plan = await plans.generate(input);
  status.dataset.todayState = 'plan-ready';
  const summary = await plans.dailySummary(examId, input.date, availableMinutes);
  const weekly = await plans.weeklySummary(examId, input.date);
  const streak = await plans.streak(examId, availableMinutes, .6, input.date);
  const xp = await gamification.snapshot(examId);
  new TodayDashboard({ root: dashboardRoot, onStart: startActivity, onMinutes: async (minutes) => { localStorage.setItem(preferenceKey, String(minutes)); await plans.replan({ ...await context(minutes), availableMinutes: minutes }); await renderHome(); }, onExtra: async () => { const topic = pack.curriculum.disciplines.flatMap((discipline) => discipline.topics ?? [])[0]; await plans.addExtraActivity({ examId, date: input.date, topicId: topic?.id, minutes: 15 }); await renderHome(); } }).render({ exam: pack.manifest, plan, summary, weekly, metrics: input.metric, streak, xp: xp.xp, availableMinutes });
}

loadPack().then(renderHome).catch((error) => { console.error('StudyOS Today dashboard failed', error); status.textContent = `Não foi possível carregar o painel Hoje: ${error.message}`; });
