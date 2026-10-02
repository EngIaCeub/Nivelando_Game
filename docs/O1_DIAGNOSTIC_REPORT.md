# O1 — Relatório de diagnóstico inicial

## Implementação

O1 adiciona `MasteryStore`, `DiagnosticEngine`, `DiagnosticUI` e suporte opcional de mastery
ao planner. O estado global é indexado por `canonicalConceptId` em uma namespace reservada do
adapter de storage; progresso curricular, scores, revisões e conclusões continuam por `examId`.

## Algoritmo

- Cada conceito recebe uma amostra inicial configurável, por padrão 3 questões.
- Questões são ordenadas por ID para amostragem determinística.
- Desempenho alto, a partir de 80%, encerra a amostra daquele conceito no tamanho inicial.
- Desempenho baixo, intermediário ou inconsistente expande a amostra progressivamente até o
  limite configurável, por padrão 6.
- Questões insuficientes não produzem erro nem inventam evidência; o conceito é calculado com o
  que existe.
- A execução possui `assessmentRunId`, pode ser pausada, retomada e reiniciada sem apagar runs
  anteriores.

## Mastery e confidence

`questionMastery = firstTryCorrect / questionCount`.

Questões têm peso de até 0,8, proporcional ao tamanho da amostra; autoavaliação opcional tem
peso 0,2; histórico anterior pode contribuir como prior com peso máximo 0,3, sempre normalizado.
Assim, autoavaliação isolada não comprova domínio. `confidence` cresce com o número de questões
e a consistência observada, mas permanece limitada a 1. Cada registro contém os campos do
contrato de mastery e `schemaVersion: 1`.

## Planner e prioridade

`explainPriority(topicId)` combina prioridade e peso curricular, fração não dominada, confidence,
revisões vencidas, desempenho recente e dias até a prova. Existe piso de prioridade; domínio alto
reduz teoria, mas não elimina o tópico. A saída inclui score, fatores e explicação textual.

## Eventos

Foram adicionados eventos genéricos, compatíveis com o envelope atual:
`diagnostic_started`, `diagnostic_answered`, `diagnostic_completed`, `mastery_updated` e
`study_plan_rebalanced`. Todos usam `eventId`, `examId`, `entityId`, `payload` e `schemaVersion`;
EventLog mantém append-only e idempotência.

## Schemas e migração

Criados `schemas/mastery.schema.json` e `schemas/diagnostic-run.schema.json`, além do contrato
`contracts/MASTERY.md`. A mudança é aditiva, com `schemaVersion: 1`; não foi necessária migração
destrutiva nem alteração incompatível no export existente. Mastery possui export/import próprio
versionado dentro do `DiagnosticEngine`.

## Testes

- 38 testes aprovados, 0 falhas na suíte completa.
- 6 testes O1: fluxo completo, alto/baixo/inconsistente, pausa/retomada, restart, eventos,
  mastery compartilhado, isolamento de score/progresso, planner, adversarial e export/import.
- Core leakage, schemas e todos os testes F0–F11 preservados e verdes.
- IndexedDB real: diagnóstico browser `dist/o1-diagnostics.html` passou antes e depois de reload,
  confirmando persistência global de `database.sql`.

## Score e limitações

Respostas diagnósticas nunca chamam `ScoringEngine` e são armazenadas em `diagnostic-runs`; o
`simulatedScore` permanece intacto. O UI genérico foi entregue como componente reutilizável e o
TCE-GO possui uma página de diagnóstico de persistência para QA; a integração completa no
Dashboard Hoje fica para O2. Não há IA em runtime.

## Alterações no Core e ADRs

Core alterado: sim, por generalização arquitetural necessária e específica de nenhum edital:
mastery global, diagnóstico determinístico, UI genérico e planner adaptativo opcional.

ADRs criados: nenhum. A mudança é compatível, coberta por testes e não exigiu workaround ou
alteração estrutural de contratos existentes.
