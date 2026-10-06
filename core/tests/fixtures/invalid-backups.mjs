// Generic backup corruptions shared by core and browser tests.
// Schema covers shapes; comparisons across rows/collections are runtime invariants.
export function replayCorruptions() {
  const session = p => p.data.collections['study-sessions'].find(row => row.value.pending).value;
  const receipt = p => p.data.collections['retake-operations'][0].value;
  const activity = p => p.data.collections['today-plans'][0].value.activities[0];
  return [
    ['negative actualMinutes', p => { activity(p).actualMinutes = -99; }, true],
    ['object actualMinutes', p => { activity(p).actualMinutes = { bad: true }; }, true],
    ['missing pending timestamp', p => { delete session(p).pending.response.timestamp; }, true],
    ['missing pre-score pending timestamp', p => { delete session(p).pending.response.timestamp; delete p.data.collections.scores; delete p.data.collections['retake-operations']; }, true],
    ['pending contradicts receipt', p => { Object.assign(session(p).pending.response, { correct: true, optionId: 'b' }); }],
    ['duplicate pending token before original', p => { const row = structuredClone(p.data.collections['study-sessions'][0]); row.id = row.value.id = 'other'; p.data.collections['study-sessions'].unshift(row); }],
    ['duplicate pending token after original', p => { const row = structuredClone(p.data.collections['study-sessions'][0]); row.id = row.value.id = 'other'; p.data.collections['study-sessions'].push(row); }],
    ['response outside pool', p => { session(p).responses = [{ itemId: 'foreign', correct: true, timestamp: p.exportedAt }]; }],
    ['plan key differs from date', p => { p.data.collections['today-plans'][0].id = '1999-01-01'; }],
    ['null reading activity', p => { p.data.collections['study-reading'][0].value.activity = null; }, true],
    ...['operationId', 'simulationRunId', 'questionId', 'correct', 'timestamp'].map(key => [`missing receipt ${key}`, p => { delete receipt(p)[key]; }, true]),
    ['receipt contradicts score', p => { receipt(p).correct = true; }],
    ['receipt timestamp differs', p => { receipt(p).timestamp = '2001-01-01T00:00:00.000Z'; }],
    ['receipt operationId differs from key', p => { receipt(p).operationId = 'other'; }],
    ['receipt attempt is absent', p => { receipt(p).attempts = 2; receipt(p).firstAttempt = false; }],
    ['reading references absent plan', p => { p.data.collections['study-reading'][0].value.date = '1999-01-01'; }]
  ];
}

export function invalidBackups(valid) {
  const mutated = mutate => { const draft = structuredClone(valid); mutate(draft); return draft; };
  const append = (collection, id, value) => d => { (d.data.collections[collection] ??= []).push({ id, value }); };
  return [
    ['malformed JSON', '{'],
    ['unsupported backup version', mutated(d => { d.backupVersion = 99; })],
    ['foreign exam', mutated(d => { d.examId = 'other-exam'; })],
    ['missing global mastery', mutated(d => { delete d.globalData; })],
    ['incompatible score schema', mutated(d => { d.data.collections.scores[0].value.schemaVersion = 99; })],
    ['duplicate compound score IDs', mutated(d => { d.data.collections.scores.push(structuredClone(d.data.collections.scores[0])); })],
    ['truncated compound score ID', mutated(d => { d.data.collections.scores[0].id = d.data.collections.scores[0].value.questionId; })],
    ['invalid global mastery', mutated(d => { d.globalData.collections.mastery[0].value.masteryEstimate = 2; })],
    ['inconsistent event projection', mutated(d => { d.data.events = []; })],
    ['incompatible storage version', mutated(d => { d.storageVersion = 999; })],
    ['invalid daily goal', mutated(d => { d.settings.dailyMinutes = -1; })],
    ['invalid embedded user settings', mutated(d => { d.data.collections['user-settings'] = [{ id: 'preferences', value: { dailyMinutes: -1 } }]; })],
    ['unsafe settings key', JSON.stringify(valid).replace('"settings":{', '"settings":{"__proto__":{"polluted":true},')],
    ['null today-plan activity', mutated(append('today-plans', 'plan-invalid', { planId: 'plan-invalid', examId: valid.examId, date: '2026-10-02', availableMinutes: 0, generatedAt: valid.exportedAt, algorithmVersion: 'v1', activities: [null], plannedMinutes: 0, completedMinutes: 0, status: 'ready', reasonSummary: '' }))],
    ['malformed diagnostic response', mutated(append('diagnostic-runs', 'diagnostic-invalid', { assessmentRunId: 'diagnostic-invalid', examId: valid.examId, status: 'in_progress', questionIds: ['q1'], responses: [null], schemaVersion: 1 }))],
    ['malformed study-session pending', mutated(append('study-sessions', 'session-invalid', { id: 'session-invalid', examId: valid.examId, kind: 'quiz', status: 'paused', questionIds: ['q1'], responses: [], pending: { item: { id: 'q1' }, response: { itemId: 'q1', correct: true }, targets: null, reviewTargets: [] } }))],
    ['orphaned retake operation receipt', mutated(append('retake-operations', 'operation-invalid', { scoreId: 'missing::q1', attempts: 1, firstAttempt: true }))]
  ];
}
