import { EXPORT_VERSION } from './storage.js';
import { GLOBAL_NAMESPACE, MASTERY_VERSION, MasteryStore } from './mastery.js';
import { runMutation } from './mutation-context.js';

export const BACKUP_VERSION = 1;
export const BUILD_METADATA_VERSION = 1;
export const BACKUP_NAMESPACE = '__studyos_backups__';
export const RECOVERY_COLLECTION = 'corrupt-state';
export const SUPPORTED_STORAGE_VERSIONS = Object.freeze([1, 2]);

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const text = value => typeof value === 'string' && value.trim().length > 0;
const date = value => text(value) && /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(`${value.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) === value.slice(0, 10);
const natural = value => Number.isInteger(value) && value >= 0;
const unit = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
const eventTypes = new Set('topic_started topic_completed resource_opened question_answered review_completed simulation_started simulation_finished xp_awarded plan_rebalanced today_plan_generated activity_started activity_paused activity_resumed activity_completed today_plan_rebalanced daily_goal_completed extra_study_started diagnostic_started diagnostic_answered diagnostic_completed mastery_updated study_plan_rebalanced'.split(' '));
const activityTypes = new Set('theory questions review error_review simulation reading diagnostic_check'.split(' '));
const activityStatuses = new Set(['planned', 'in_progress', 'paused', 'completed', 'skipped']);

function invalid(message = 'backup inválido ou incompatível') { throw new Error(message); }
export function validateBackupSettings(settings) {
  if (!object(settings)) invalid('backup contém settings inválidos');
  const allowed = new Set(['dailyMinutes', 'onboardingSkipped', 'diagnosticCompleted']);
  for (const [key, value] of Object.entries(settings)) {
    if (!allowed.has(key)) invalid(`backup contém preferência desconhecida: ${key}`);
    if (key === 'dailyMinutes' && (!Number.isInteger(value) || value < 1 || value > 720)) invalid('dailyMinutes deve ser inteiro entre 1 e 720');
    if (key !== 'dailyMinutes' && typeof value !== 'boolean') invalid(`preferência ${key} deve ser booleana`);
  }
  return true;
}

export function validateRecoverySnapshot(snapshot, { examId } = {}) {
  if (!object(snapshot) || snapshot.kind !== 'studyos-recovery' || snapshot.recoveryVersion !== 1 || snapshot.recoveryOnly !== true ||
      !text(snapshot.captureId) || !date(snapshot.capturedAt) || !Array.isArray(snapshot.namespaceIds) ||
      !snapshot.namespaceIds.every(text) || new Set(snapshot.namespaceIds).size !== snapshot.namespaceIds.length || !object(snapshot.metadata) ||
      !Array.isArray(snapshot.rows) || (examId && !snapshot.namespaceIds.includes(examId))) invalid('snapshot de recuperação inválido');
  for (const row of snapshot.rows) {
    if (!object(row) || typeof row.key !== 'string' || typeof row.namespace !== 'string' || typeof row.collection !== 'string' ||
        !Object.hasOwn(row, 'value') || !snapshot.namespaceIds.includes(row.namespace)) invalid('snapshot de recuperação contém linha inválida');
  }
  return true;
}

async function preserveBeforeChange(store, examId, metadata, settings, replacements) {
  if (typeof store.captureAndReplaceNamespaces !== 'function') invalid('storage não suporta captura e substituição atômicas');
  let automaticBackup;
  let exportError;
  try {
    automaticBackup = await exportProductionBackup(store, examId, metadata, settings);
  } catch (error) {
    exportError = error;
  }
  const captureId = `recovery-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
  // Never replace an existing automatic copy. Save the new valid snapshot under
  // its legacy key when empty, otherwise retain it in an append-only collection.
  // Any write failure prevents the atomic namespace replacement below.
  if (automaticBackup) {
    const prior = await store.get(BACKUP_NAMESPACE, 'automatic', examId);
    if (prior === undefined) await store.put(BACKUP_NAMESPACE, 'automatic', examId, automaticBackup);
    else await store.put(BACKUP_NAMESPACE, 'automatic-history', captureId, automaticBackup);
  }
  const recoverySnapshot = await store.captureAndReplaceNamespaces({
    namespaceIds: replacements.map(item => item.examId), replacements,
    captureNamespace: BACKUP_NAMESPACE, captureCollection: RECOVERY_COLLECTION, captureId,
    metadata: {
      ...(object(metadata) ? structuredClone(metadata) : {}),
      errorSummary: exportError ? { name: text(exportError.name) ? exportError.name : 'Error', message: String(exportError.message ?? exportError).slice(0, 1000) } : null
    },
    rawSettings: settings === undefined ? null : settings
  });
  validateRecoverySnapshot(recoverySnapshot, { examId });
  return { automaticBackup, recoverySnapshot, recoveryOnly: true };
}

// Returns the recovery-only envelope for explicit download. It is not a normal
// production backup and validateBackupPayload/restoreProductionBackup reject it.
export async function exportRecoverySnapshot(store, examId, recoveryId) {
  const snapshots = (await store.query(BACKUP_NAMESPACE, RECOVERY_COLLECTION))
    .filter(item => item.namespaceIds?.includes(examId));
  const snapshot = recoveryId
    ? snapshots.find(item => item.captureId === recoveryId)
    : snapshots.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))[0];
  if (!snapshot) return undefined;
  validateRecoverySnapshot(snapshot, { examId });
  return structuredClone(snapshot);
}
function jsonValue(value, seen = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if ((!Array.isArray(value) && !object(value)) || seen.has(value)) invalid('backup contém valor não JSON');
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) invalid('backup contém chave insegura');
    jsonValue(child, seen);
  }
  seen.delete(value);
}

function validateEvent(event, namespace) {
  if (!object(event) || !text(event.eventId) || !eventTypes.has(event.type) || !date(event.timestamp) ||
      event.examId !== namespace || !text(event.entityId) || !object(event.payload) || event.schemaVersion !== 1) invalid('backup contém evento/schema incompatível');
}

function validatePlanActivity(activity) {
  if (!object(activity) || !text(activity.activityId) || !activityTypes.has(activity.type) ||
      typeof activity.estimatedMinutes !== 'number' || !Number.isFinite(activity.estimatedMinutes) || activity.estimatedMinutes < 0) {
    invalid('backup contém atividade de plano inválida');
  }
  if (activity.status !== undefined && !activityStatuses.has(activity.status)) invalid('backup contém status de atividade inválido');
  if (activity.actualMinutes !== undefined && (typeof activity.actualMinutes !== 'number' || !Number.isFinite(activity.actualMinutes) || activity.actualMinutes < 0)) invalid('backup contém minutos reais inválidos');
  for (const key of ['topicId', 'source']) if (activity[key] !== undefined && !text(activity[key])) invalid('backup contém referência de atividade inválida');
  if (activity.resourceId !== undefined && activity.resourceId !== null && !text(activity.resourceId)) invalid('backup contém referência de atividade inválida');
  for (const key of ['canonicalConceptIds', 'questionIds', 'reviewIds', 'dependencies']) {
    if (activity[key] !== undefined && (!Array.isArray(activity[key]) || !activity[key].every(text))) invalid('backup contém lista de atividade inválida');
  }
  if (activity.priority !== undefined && (typeof activity.priority !== 'number' || !Number.isFinite(activity.priority))) invalid('backup contém prioridade de atividade inválida');
  if (activity.reason !== undefined && typeof activity.reason !== 'string') invalid('backup contém justificativa de atividade inválida');
  if (activity.createdAt !== undefined && !date(activity.createdAt)) invalid('backup contém data de atividade inválida');
  if (activity.completedAt !== undefined && activity.completedAt !== null && !date(activity.completedAt)) invalid('backup contém conclusão de atividade inválida');
}

function validateDiagnosticRun(value, id, namespace) {
  if (value.assessmentRunId !== id || value.examId !== namespace || value.schemaVersion !== 1 ||
      !['in_progress', 'completed'].includes(value.status) || !Array.isArray(value.questionIds) || !value.questionIds.every(text) ||
      new Set(value.questionIds).size !== value.questionIds.length || !Array.isArray(value.responses)) invalid('backup contém diagnóstico/schema inválido');
  for (const response of value.responses) {
    if (!object(response) || !text(response.questionId) || !value.questionIds.includes(response.questionId) ||
        typeof response.correct !== 'boolean' || !date(response.answeredAt) ||
        (!Array.isArray(response.canonicalConceptIds) || !response.canonicalConceptIds.every(text)) ||
        (response.selfAssessment !== undefined && response.selfAssessment !== null && !unit(response.selfAssessment))) invalid('backup contém resposta diagnóstica inválida');
  }
  if (new Set(value.responses.map(response => response.questionId)).size !== value.responses.length) invalid('backup contém respostas diagnósticas duplicadas');
  if (value.startedAt !== undefined && !date(value.startedAt)) invalid('backup contém data diagnóstica inválida');
  if (value.completedAt !== undefined && !date(value.completedAt)) invalid('backup contém data diagnóstica inválida');
  if (value.groups !== undefined && (!Array.isArray(value.groups) || !value.groups.every(text))) invalid('backup contém grupos diagnósticos inválidos');
  if (value.config !== undefined && (!object(value.config) ||
      ['initialQuestionsPerConcept', 'maxQuestionsPerConcept'].some(key => value.config[key] !== undefined && (!Number.isInteger(value.config[key]) || value.config[key] < 1)) ||
      ['highAccuracy', 'intermediateAccuracy'].some(key => value.config[key] !== undefined && !unit(value.config[key])))) invalid('backup contém configuração diagnóstica inválida');
  if (value.result !== undefined && (!object(value.result) || !Array.isArray(value.result.concepts) || !value.result.concepts.every(text) || !natural(value.result.questionCount))) invalid('backup contém resultado diagnóstico inválido');
  if (value.result?.mastery !== undefined) {
    const mastery = value.result.mastery;
    if (!Array.isArray(mastery) || mastery.some(item => !object(item) || !text(item.canonicalConceptId) || !unit(item.masteryEstimate)) ||
        new Set(mastery.map(item => item.canonicalConceptId)).size !== mastery.length) invalid('backup contém projeção de mastery diagnóstico inválida');
  }
}

function validateStudyResponse(response) {
  if (!object(response) || !text(response.itemId) || typeof response.correct !== 'boolean' ||
      (response.optionId !== undefined && response.optionId !== null && !text(response.optionId)) ||
      (response.retake !== undefined && typeof response.retake !== 'boolean') ||
      (response.timestamp !== undefined && !date(response.timestamp)) ||
      (response.quality !== undefined && ![2, 4].includes(response.quality))) invalid('backup contém resposta de sessão inválida');
}

function validatePendingEffects(pending) {
  if (!Array.isArray(pending.targets) || !Array.isArray(pending.reviewTargets)) invalid('backup contém efeitos pendentes inválidos');
  for (const target of pending.targets) {
    if (!object(target) || !text(target.canonicalConceptId) || !unit(target.masteryEstimate) || !unit(target.confidence) ||
        !text(target.source) || !date(target.assessedAt) || !natural(target.questionCount) || !natural(target.firstTryCorrect) ||
        !natural(target.firstTryWrong) || !text(target.reviewStatus)) invalid('backup contém mastery pendente inválido');
  }
  for (const target of pending.reviewTargets) {
    if (!object(target) || !text(target.topicId) || !natural(target.interval) || !unit(target.mastery) ||
        typeof target.ease !== 'number' || !Number.isFinite(target.ease) || target.ease < 1 || !date(target.dueAt) ||
        !Array.isArray(target.history) || !target.history.every(item => object(item) && date(item.reviewedAt) && natural(item.quality) && item.quality <= 5)) invalid('backup contém revisão pendente inválida');
  }
}

function validatePendingItem(item) {
  if (item.canonicalConceptIds !== undefined && (!Array.isArray(item.canonicalConceptIds) || !item.canonicalConceptIds.every(text))) invalid('backup contém conceitos de item pendente inválidos');
  if (item.topicIds !== undefined && (!Array.isArray(item.topicIds) || !item.topicIds.every(text))) invalid('backup contém tópicos de item pendente inválidos');
  if (item.options !== undefined && (!Array.isArray(item.options) || !item.options.every(option => object(option) && text(option.id)))) invalid('backup contém alternativas de item pendente inválidas');
  if (item.correctOptionId !== undefined && !text(item.correctOptionId)) invalid('backup contém resposta de item pendente inválida');
}

function validateStudySession(value, id, namespace) {
  const kinds = new Set(['quiz', 'simulation', 'diagnostic', 'flashcards']);
  const statuses = new Set(['pending', 'in_progress', 'paused', 'completed']);
  if (value.id !== id || (value.examId !== undefined && value.examId !== namespace) || !kinds.has(value.kind) ||
      !statuses.has(value.status) || !Array.isArray(value.responses)) invalid('backup contém sessão de estudo inválida');
  const idsKey = value.kind === 'flashcards' ? 'cardIds' : 'questionIds';
  if (!Array.isArray(value[idsKey]) || !value[idsKey].every(text) || new Set(value[idsKey]).size !== value[idsKey].length) invalid('backup contém itens de sessão inválidos');
  if (!natural(value.cursor) || value.cursor > value[idsKey].length) invalid('backup contém cursor de sessão inválido');
  for (const key of ['questionIds', 'cardIds', 'revealedIds']) if (value[key] !== undefined && (!Array.isArray(value[key]) || !value[key].every(text))) invalid('backup contém lista de sessão inválida');
  if (value.kind === 'flashcards' && !Array.isArray(value.revealedIds)) invalid('backup contém cartões revelados inválidos');
  if (value.title !== undefined && typeof value.title !== 'string') invalid('backup contém título de sessão inválido');
  if (value.date !== undefined && value.date !== null && !date(value.date)) invalid('backup contém data de sessão inválida');
  if (value.activity !== undefined && value.activity !== null && (!object(value.activity) || !text(value.activity.activityId) ||
      !text(value.activity.topicId) || !date(value.date))) invalid('backup contém atividade de sessão inválida');
  if (value.startedAt !== undefined && !date(value.startedAt)) invalid('backup contém data de sessão inválida');
  if (value.completedAt !== undefined && !date(value.completedAt)) invalid('backup contém data de sessão inválida');
  if (value.revealedIds !== undefined && (!Array.isArray(value.revealedIds) || !value.revealedIds.every(item => text(item) && value.cardIds?.includes(item)))) invalid('backup contém cartões revelados inválidos');
  for (const response of value.responses) validateStudyResponse(response);
  if (value.pending !== undefined) {
    const pending = value.pending;
    if (!object(pending) || !object(pending.item) || !text(pending.item.id) || !object(pending.response)) invalid('backup contém resposta pendente inválida');
    validateStudyResponse(pending.response);
    if (!date(pending.response.timestamp) || typeof pending.response.retake !== 'boolean') invalid('backup contém resposta pendente incompleta');
    validatePendingItem(pending.item);
    if (pending.item.id !== pending.response.itemId || value[idsKey][value.cursor] !== pending.item.id) invalid('backup contém resposta pendente incompatível');
    if (value.kind !== 'diagnostic') validatePendingEffects(pending);
    if (pending.operationId !== undefined && !text(pending.operationId)) invalid('backup contém operationId pendente inválido');
  }
}

function validateRetakeOperations(data) {
  const records = data.collections['retake-operations'] ?? [];
  const scores = new Map((data.collections.scores ?? []).map(record => [record.id, record.value]));
  const retakes = new Map((data.collections.retakes ?? []).map(record => [record.id, record.value]));
  const pendingOperations = new Map();
  for (const record of data.collections['study-sessions'] ?? []) {
    const pending = record.value.pending;
    if (!pending?.operationId) continue;
    if (pendingOperations.has(pending.operationId)) invalid('backup contém operationId duplicado entre sessões');
    pendingOperations.set(pending.operationId, { simulationRunId: record.id, questionId: pending.item.id, ...pending.response });
  }
  for (const record of records) {
    const receipt = record.value;
    if (!object(receipt) || receipt.operationId !== record.id || !text(receipt.simulationRunId) || !text(receipt.questionId) ||
        receipt.scoreId !== `${receipt.simulationRunId}::${receipt.questionId}` || typeof receipt.correct !== 'boolean' || !date(receipt.timestamp) ||
        !natural(receipt.attempts) || receipt.attempts < 1 || typeof receipt.firstAttempt !== 'boolean') invalid('backup contém recibo de tentativa inválido');
    const score = scores.get(receipt.scoreId);
    const retake = receipt.attempts === 1 ? null : retakes.get(`${receipt.scoreId}::${receipt.attempts}`);
    if (receipt.attempts === 1 ? (!score || score.attempts !== 1 || receipt.firstAttempt !== true) :
        (!retake || retake.attempts !== receipt.attempts || !score || retake.simulationRunId !== score.simulationRunId || retake.questionId !== score.questionId || receipt.firstAttempt === true)) {
      invalid('backup contém recibo de tentativa sem referência correspondente');
    }
    if (receipt.correct !== (retake ? retake.lastAttemptCorrect : score.correct) ||
        receipt.timestamp !== (retake ? retake.lastAttemptAt : score.answeredAt)) invalid('backup contém recibo divergente da tentativa');
    const pending = pendingOperations.get(record.id);
    if (pending && (pending.simulationRunId !== receipt.simulationRunId || pending.questionId !== receipt.questionId ||
        pending.correct !== receipt.correct || pending.timestamp !== receipt.timestamp || pending.retake === receipt.firstAttempt)) invalid('backup contém operationId pendente incompatível');
  }
}

function validateStudyReferences(data) {
  const plans = new Map((data.collections['today-plans'] ?? []).map(record => [record.id, record.value]));
  for (const record of [...(data.collections['study-reading'] ?? []), ...(data.collections['study-sessions'] ?? [])]) {
    const run = record.value;
    if (!run.activity) continue;
    const plan = plans.get(run.date);
    const activity = plan?.activities.find(item => item.activityId === run.activity.activityId);
    if (!activity || activity.topicId !== run.activity.topicId) invalid('backup contém referência de atividade de sessão inválida');
  }
  const diagnostics = new Map((data.collections['diagnostic-runs'] ?? []).map(record => [record.id, record.value]));
  for (const { value: run } of data.collections['study-sessions'] ?? []) {
    const ids = run.kind === 'flashcards' ? run.cardIds : run.questionIds;
    if (run.responses.some(response => !ids.includes(response.itemId))) invalid('backup contém resposta fora da sessão');
    if (run.kind === 'diagnostic' && !diagnostics.has(run.id)) invalid('backup contém sessão sem diagnóstico');
  }
}

function validateRecord(collection, id, value, namespace) {
  if (!object(value)) invalid('backup contém registro inválido');
  if (value.schemaVersion !== undefined && value.schemaVersion !== 1) invalid('backup contém schema incompatível');
  if (value.examId !== undefined && value.examId !== namespace) invalid('backup contém registro de outro Exam Pack');
  if (collection === 'events') {
    validateEvent(value, namespace);
    if (value.eventId !== id) invalid('backup contém ID de evento incompatível');
  }
  if (collection === 'user-settings' && id === 'preferences') validateBackupSettings(value);
  if (value.id !== undefined && value.id !== id) invalid('backup contém ID de registro incompatível');
  if (collection === 'mastery') {
    if (namespace !== GLOBAL_NAMESPACE || value.canonicalConceptId !== id || value.schemaVersion !== MASTERY_VERSION ||
        !unit(value.masteryEstimate) || !unit(value.confidence) || !text(value.source) || !date(value.assessedAt) ||
        !natural(value.questionCount) || !natural(value.firstTryCorrect) || !natural(value.firstTryWrong) || !text(value.reviewStatus) ||
        (value.selfAssessment != null && !unit(value.selfAssessment)) ||
        (value.appliedStudyOperations !== undefined && (!Array.isArray(value.appliedStudyOperations) || !value.appliedStudyOperations.every(text) || new Set(value.appliedStudyOperations).size !== value.appliedStudyOperations.length))) invalid('backup contém mastery/schema inválido');
  }
  if (collection === 'scores' || collection === 'retakes') {
    const expected = `${value.simulationRunId}::${value.questionId}`;
    if (!text(value.simulationRunId) || !text(value.questionId) || typeof value.correct !== 'boolean' || !date(value.answeredAt) ||
        !Number.isInteger(value.attempts) || value.attempts < 1 ||
        (collection === 'scores' ? id !== expected || value.attempts !== 1 : id !== `${expected}::${value.attempts}` || value.attempts < 2 || typeof value.lastAttemptCorrect !== 'boolean' || !date(value.lastAttemptAt))) invalid('backup contém score inválido');
  }
  if (collection === 'xp-awards' && (value.eventId !== id || !eventTypes.has(value.type) || !natural(value.xp) || !date(value.awardedAt))) invalid('backup contém XP inválido');
  if (collection === 'diagnostic-runs') validateDiagnosticRun(value, id, namespace);
  if (collection === 'diagnostic-question-bank') validateDiagnosticQuestion(value, id, namespace);
  if (collection === 'study-sessions') validateStudySession(value, id, namespace);
  if (collection === 'study-reading') {
    if (value.id !== id || !['in_progress', 'paused', 'completed'].includes(value.status) || !date(value.date) ||
        !object(value.activity) || !text(value.activity.topicId) || id !== `theory:${value.activity.activityId}` ||
        (value.completedAt !== null && !date(value.completedAt))) invalid('backup contém leitura inválida');
    validatePlanActivity(value.activity);
  }
  if (collection === 'today-plans' && (id !== value.date || value.examId !== namespace || !text(value.planId) || !date(value.date) || !date(value.generatedAt) ||
      !text(value.algorithmVersion) || !text(value.reasonSummary) || !Array.isArray(value.activities) || !['ready', 'active', 'complete'].includes(value.status) ||
      ![value.availableMinutes, value.plannedMinutes, value.completedMinutes].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0))) invalid('backup contém plano/schema inválido');
  if (collection === 'today-plans') {
    const activityIds = new Set();
    for (const activity of value.activities) {
      validatePlanActivity(activity);
      if (activityIds.has(activity.activityId)) invalid('backup contém IDs de atividade duplicados');
      activityIds.add(activity.activityId);
    }
  }
  if (collection === 'activity-state' && (value.activityId !== id || !text(value.planId) ||
      !['planned', 'in_progress', 'paused', 'completed', 'skipped'].includes(value.status) || !date(value.updatedAt) ||
      ![value.estimatedMinutes, value.actualMinutes].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0))) invalid('backup contém atividade/schema inválido');
  if (collection === 'revisions' && (value.topicId !== id || !natural(value.interval) || !unit(value.mastery) ||
      typeof value.ease !== 'number' || !Number.isFinite(value.ease) || value.ease < 1 || !date(value.dueAt) || !Array.isArray(value.history) ||
      !value.history.every(item => object(item) && date(item.reviewedAt) && natural(item.quality) && item.quality <= 5 && (item.operationId === undefined || text(item.operationId))))) invalid('backup contém revisão inválida');
}

function validateDiagnosticQuestion(value, id, namespace) {
  const options = value.options;
  const provenance = value.provenance;
  if (value.id !== id || value.examId !== namespace || !text(value.stem) || !Array.isArray(options) || options.length < 2 ||
      !options.every(option => object(option) && text(option.id) && text(option.text)) ||
      new Set(options.map(option => option.id)).size !== options.length ||
      !options.some(option => option.id === value.correctOptionId) ||
      !Array.isArray(value.canonicalConceptIds) || !value.canonicalConceptIds.every(text) ||
      (value.topicIds !== undefined && (!Array.isArray(value.topicIds) || !value.topicIds.every(text))) ||
      !object(provenance) || !['verified', 'derived', 'assumption'].includes(provenance.status) || !text(provenance.source) ||
      (provenance.url !== undefined && provenance.url !== null && typeof provenance.url !== 'string') ||
      (provenance.license !== undefined && provenance.license !== null && typeof provenance.license !== 'string')) {
    invalid('backup contém questão diagnóstica inválida');
  }
}

function sameProjection(values, records) {
  // Property order is immaterial; array order is part of the stored snapshot.
  const canonical = value => Array.isArray(value) ? value.map(canonical) : object(value) ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  return JSON.stringify(canonical(values)) === JSON.stringify(canonical(records.map(record => record.value)));
}

function validateExport(data, namespace) {
  if (!object(data) || data.version !== EXPORT_VERSION || data.examId !== namespace ||
      !Array.isArray(data.records) || !Array.isArray(data.events) || !object(data.collections)) invalid('backup incompleto ou versão incompatível');
  const eventIds = new Set();
  for (const event of data.events) {
    if (eventIds.has(event?.eventId)) invalid('backup contém eventos duplicados');
    eventIds.add(event?.eventId);
  }
  const progressIds = new Set();
  for (const record of data.records) {
    if (!object(record)) invalid('backup contém registro inválido');
    // Older progress values may not carry an id; collection wrappers remain
    // authoritative. When an id is present, the projection must be unique too.
    if (record.id !== undefined) {
      if (!text(record.id)) invalid('backup contém ID de registro inválido');
      if (progressIds.has(record.id)) invalid('backup contém IDs duplicados em records');
      progressIds.add(record.id);
    }
  }
  for (const [collection, records] of Object.entries(data.collections)) {
    if (!text(collection) || collection.includes('::') || !Array.isArray(records)) invalid('backup contém coleção inválida');
    const ids = new Set();
    for (const record of records) {
      if (!object(record) || !text(record.id) || !Object.hasOwn(record, 'value')) invalid('backup contém registro inválido');
      if (ids.has(record.id)) invalid('backup contém IDs duplicados');
      ids.add(record.id);
      validateRecord(collection, record.id, record.value, namespace);
    }
  }
  for (const event of data.events) validateEvent(event, namespace);
  validateRetakeOperations(data);
  validateStudyReferences(data);
  if (!sameProjection(data.records, data.collections.progress ?? []) || !sameProjection(data.events, data.collections.events ?? [])) invalid('backup contém projeções inconsistentes');
}

export function createBuildMetadata(input = {}) {
  const required = ['appVersion', 'buildId', 'commitSha', 'buildTimestamp', 'channel', 'examPackVersion', 'schemaVersion', 'storageVersion'];
  for (const field of required) if (input[field] === undefined || input[field] === null || input[field] === '') throw new TypeError(`missing build metadata field: ${field}`);
  return Object.freeze({ metadataVersion: BUILD_METADATA_VERSION, ...input });
}

export function createBackupPayload({ examId, exported, metadata, globalExported, settings, ownerId, exportedAt = new Date().toISOString() } = {}) {
  if (!examId || !exported || exported.examId !== examId) throw new TypeError('backup requires a matching examId and export');
  const payload = { backupVersion: BACKUP_VERSION, exportedAt, appVersion: metadata?.appVersion ?? 'unknown', storageVersion: metadata?.storageVersion ?? 'unknown', examId, data: structuredClone(exported) };
  if (globalExported !== undefined) payload.globalData = structuredClone(globalExported);
  if (settings !== undefined) payload.settings = structuredClone(settings);
  if (ownerId !== undefined) {
    if (typeof ownerId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ownerId)) invalid('backup contém ownerId inválido');
    payload.ownerId = ownerId;
  }
  return payload;
}

export function validateBackupPayload(payload, { examId, metadata, requireComplete = false } = {}) {
  if (!object(payload) || payload.backupVersion !== BACKUP_VERSION) invalid();
  if (payload.ownerId !== undefined && (typeof payload.ownerId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.ownerId))) invalid('backup contém ownerId inválido');
  if (examId && payload.examId !== examId) throw new Error('backup pertence a outro Exam Pack');
  validateExport(payload.data, payload.examId);
  if (!text(payload.examId) || payload.examId.includes('::') || [GLOBAL_NAMESPACE, BACKUP_NAMESPACE].includes(payload.examId) || !date(payload.exportedAt) ||
      !text(payload.appVersion) || !SUPPORTED_STORAGE_VERSIONS.includes(payload.storageVersion)) invalid();
  if (metadata?.storageVersion !== undefined && payload.storageVersion !== metadata.storageVersion) invalid('backup contém storageVersion incompatível');
  if (requireComplete && (!Object.hasOwn(payload, 'globalData') || !Object.hasOwn(payload, 'settings') || payload.storageVersion === 'unknown')) invalid('backup de produção incompleto');
  if (Object.hasOwn(payload, 'globalData')) validateExport(payload.globalData, GLOBAL_NAMESPACE);
  if (Object.hasOwn(payload, 'settings')) validateBackupSettings(payload.settings);
  jsonValue(payload);
  return true;
}

// Prefer the settings captured in the same namespace snapshot. The caller's
// settings are only a fallback for legacy/external preferences not persisted in
// the Exam Pack namespace; this keeps the backup envelope consistent with data.
export async function exportProductionBackup(store, examId, metadata, settings, ownerId) {
  const [exported, globalExported] = await store.exportNamespaces([examId, GLOBAL_NAMESPACE]);
  const storedSettings = exported.collections?.['user-settings']?.find(row => row.id === 'preferences')?.value;
  const payload = createBackupPayload({ examId, exported, globalExported, metadata, settings: storedSettings ?? settings, ownerId });
  validateBackupPayload(payload, { examId, metadata, requireComplete: true });
  return payload;
}

export async function restoreProductionBackup(store, payload, { examId, metadata, currentSettings } = {}, context) {
  return runMutation(store, context, async () => {
    let snapshot;
    try { snapshot = typeof payload === 'string' ? JSON.parse(payload) : structuredClone(payload); }
    catch { invalid('backup JSON inválido'); }
    if (!text(examId)) invalid('Exam Pack de destino obrigatório');
    validateBackupPayload(snapshot, { examId, metadata, requireComplete: true });
    const preservedState = await preserveBeforeChange(store, examId, metadata, currentSettings, [snapshot.data, snapshot.globalData]);
    return { settings: structuredClone(snapshot.settings), ...preservedState, restored: true };
  });
}

export async function resetStore(store, examId, context) {
  return runMutation(store, context, async () => {
    await store.replaceNamespaces([{ version: EXPORT_VERSION, examId, collections: {} }]);
    return true;
  });
}

// This explicit production reset clears shared global mastery too. The UI must
// explain that scope before requesting RESETAR; other exam namespaces survive.
export async function resetProductionStore(store, examId, { confirmation, metadata, currentSettings } = {}, context) {
  return runMutation(store, context, async () => {
    if (confirmation !== 'RESETAR') invalid('reset exige confirmação RESETAR');
    const replacements = [examId, GLOBAL_NAMESPACE].map(namespace => ({ version: EXPORT_VERSION, examId: namespace, collections: {} }));
    const preservedState = await preserveBeforeChange(store, examId, metadata, currentSettings, replacements);
    return { settings: {}, ...preservedState, reset: true };
  });
}

export async function updateProductionSettings(store, examId, patch, context) {
  return runMutation(store, context, async () => {
    validateBackupSettings(patch);
    const outcome = await store.update(examId, 'user-settings', 'preferences', current => {
      validateBackupSettings(current ?? {});
      const value = { ...current, ...patch };
      validateBackupSettings(value);
      return value;
    });
    return outcome.value;
  });
}

export async function bootstrapProductionSettings(store, examId, defaults, context) {
  return runMutation(store, context, async () => {
    validateBackupSettings(defaults);
    let recovered = false;
    const outcome = await store.update(examId, 'user-settings', 'preferences', current => {
      try { validateBackupSettings(current ?? {}); }
      catch { current = {}; recovered = true; }
      return { ...defaults, ...current };
    });
    return { settings: outcome.value, recovered };
  });
}

// Import only absent rows, preserving the source and the current target state.
export async function importLegacyDiagnostic(store, source, examId, context) {
  return runMutation(store, context, async () => {
    const [exam, global] = await source.exportNamespaces([examId, GLOBAL_NAMESPACE]);
    const mastery = new MasteryStore(store);
    for (const { value } of global.collections.mastery ?? []) {
      if (!await mastery.get(value.canonicalConceptId)) await mastery.put(value);
    }
    for (const collection of ['diagnostic-runs', 'diagnostic-question-bank', 'events']) {
      for (const { id, value } of exam.collections[collection] ?? []) {
        await store.update(examId, collection, id, current => current === undefined ? value : undefined);
      }
    }
    for (const { value: run } of exam.collections['diagnostic-runs'] ?? []) {
      if (run.status === 'completed') continue;
      await store.update(examId, 'study-sessions', run.assessmentRunId, current => current === undefined ? {
        id: run.assessmentRunId, kind: 'diagnostic', title: 'Diagnóstico legado', examId, status: 'paused',
        cursor: run.responses.length, questionIds: run.questionIds, cardIds: [],
        responses: run.responses.map(response => ({ itemId: response.questionId, correct: response.correct, timestamp: response.answeredAt })),
        revealedIds: [], activity: null, date: null, schemaVersion: 1
      } : undefined);
    }
  });
}

export class MigrationRegistry {
  #migrations = new Map();
  register(from, to, migrate) {
    if (!Number.isInteger(from) || to !== from + 1 || typeof migrate !== 'function') throw new TypeError('migration must advance exactly one version');
    this.#migrations.set(from, migrate);
    return this;
  }
  async apply(value, from, to) {
    let current = structuredClone(value);
    for (let version = from; version < to; version += 1) {
      const migrate = this.#migrations.get(version);
      if (!migrate) throw new Error(`missing migration ${version} -> ${version + 1}`);
      current = await migrate(current);
    }
    return current;
  }
}
