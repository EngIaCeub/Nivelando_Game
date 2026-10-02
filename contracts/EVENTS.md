# Event Contract

Event log append-only.
Campos: eventId, type, timestamp, examId, entityId, payload, schemaVersion.
Consumidores idempotentes por eventId.

Tipos iniciais:
topic_started, topic_completed, resource_opened, question_answered,
review_completed, simulation_started, simulation_finished, xp_awarded,
plan_rebalanced.

Diagnóstico V1 também pode emitir `diagnostic_started`, `diagnostic_answered`,
`diagnostic_completed`, `mastery_updated` e `study_plan_rebalanced`. Esses eventos mantêm
`eventId`, `timestamp`, `examId`, `entityId`, `payload` e `schemaVersion`, e continuam
append-only e idempotentes.
