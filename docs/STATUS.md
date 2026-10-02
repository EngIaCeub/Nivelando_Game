# Status

Arquitetura: Factory genérica
Primeiro Exam Pack: TCE-GO TI 2026
Fase atual: StudyOS V1 — Operationalization
Último gate aprovado: F11

## Bootstrap F0

- `AGENTS.md`, Product Spec, Factory Workflow, Model Routing, contratos, schemas e papéis
  de Orchestrator/Architect/Planner/QA foram lidos.
- Auditoria: `core/` contém apenas documentação genérica e nenhum código específico de edital.
- Baseline criado com `npm test` usando o runner nativo do Node.
- Teste arquitetural: falha quando identificadores conhecidos de qualquer Exam Pack vazam para
  `core/`.
- Smoke test: schemas presentes são JSON válido e declaram `$schema` e `title`.
- Backlog F0–F11: `docs/ROADMAP.md`.
- ADRs: `docs/adr/001-core-boundary-and-pack-loading.md` e
  `docs/adr/002-schema-and-test-baseline.md`.

Validação F0: aprovada — 2 testes executados, 2 aprovados, 0 falhas. Neste ambiente, a
execução equivalente foi feita diretamente com o Node bundled porque `npm` não está no PATH;
o comando reproduzível continua sendo `npm test`.
## F1 — Shell/PWA

- Planejado e implementado pelo ownership Frontend (R1/R2), com revisão arquitetural do
  Orchestrator.
- Shell responsivo com landmarks, skip link, foco visível e navegação por teclado.
- Assets e `start_url` relativos para GitHub Pages/base path.
- Service Worker com cache do app shell e manifest web.
- QA: 3 testes aprovados, incluindo arquitetura, schemas e requisitos do shell.

Validação F1: aprovada.
Próxima ação: implementar F2 (storage/event log).

## F2 — Storage e event log

- Planejado pelo Orchestrator; ownership Architect/Learning Engine (R3) e QA (R1).
- `MemoryStore` para testes e `IndexedDbStore` para runtime, com operações do contrato:
  get, put, delete, query, transaction, export, import e migrate.
- Namespacing obrigatório por `examId`; export versionado; import rejeita versão ou pack
  incompatível.
- `EventLog` append-only e idempotente por `eventId`.
- QA: 5 testes aprovados, incluindo isolamento entre packs, export/import e idempotência.

Validação F2: aprovada.
Próxima ação: implementar F3 (currículo e plano).

## F3 — Currículo e plano

- Planejado pelo Orchestrator; ownership Curriculum/Planner (R2/R3) e QA (R1).
- Navegação genérica discipline > module > topic com `canonicalConceptIds` preservados.
- Plano determinístico por prioridade, peso, minutos disponíveis e tópicos concluídos.
- Nenhuma regra ou dado específico de edital entrou no Core.
- QA: 6 testes aprovados, incluindo prioridade, limite de minutos e determinismo.

Validação F3: aprovada.
Próxima ação: implementar F4 (quiz e score).

## F4 — Quiz e score

- Planejado pelo Orchestrator; ownership Learning Engine/Question Ingestor (R3) e QA (R1/R3).
- `ScoringEngine` cria uma única primeira tentativa por `simulationRunId` + `questionId`.
- Retentativas são registradas separadamente e não alteram `simulatedScore`.
- Runs diferentes têm contextos e scores independentes; ausência de respostas retorna `null`.
- QA: 7 testes aprovados, incluindo retentativa correta após erro e novo simulation run.

Validação F4: aprovada.
Próxima ação: implementar F5 (revisão e mastery).

## F5 — Revisão e mastery

- Planejado pelo Orchestrator; ownership Revision Engine (R3/R1) e QA (R1).
- Revisões determinísticas com `dueAt`, `interval`, `ease`, `mastery` e histórico.
- Primeira revisão começa em 1 dia; qualidade baixa reduz mastery e mantém intervalo curto.
- Estado de revisão é separado da coleção de score histórico.
- QA: 8 testes aprovados após correção da inicialização do intervalo.

Validação F5: aprovada.
Próxima ação: implementar F6 (gamificação).

## F6 — Gamificação

- Planejado pelo Orchestrator; ownership Gamification (R2) e QA (R1).
- XP derivado de tipos de evento permitidos e persistido por `eventId`.
- Duplicatas, reload, idle e abertura de página não geram XP.
- Retentativas recebem XP pedagógico limitado; nível é derivado do XP acumulado.
- QA: 9 testes aprovados, incluindo idempotência, reload e limite de retentativa.

Validação F6: aprovada.
Próxima ação: implementar F7 (analytics).

## F7 — Analytics

- Planejado pelo Orchestrator; ownership Analytics (R2/R3) e QA (R1).
- Métricas independentes: coverage, firstTryAccuracy, mastery, retention, pace e forecast.
- Todas são derivadas de entradas explícitas; não há score composto opaco.
- Dados duplicados de evento não inflacionam cobertura por tópico.
- QA: 10 testes aprovados, incluindo dimensões e casos de revisão vencida.

Validação F7: aprovada.
Próxima ação: implementar F8 (exam factory).

## F8 — Exam Factory

- Planejado pelo Orchestrator; ownership Architect/Exam Pack Generator/Release (R3/R2) e
  QA (R1/R3).
- Validação genérica de manifest, curriculum, resources, questions e provenance.
- Packs com `assumption` sem fonte ou recurso não verificado são rejeitados como candidatos
  de release.
- Saídas `standalone` e catálogo `hub` são geradas somente após validação.
- QA final: 11 testes aprovados, incluindo fronteira do Core, schemas, storage, score,
  mastery, gamificação, analytics e factory; a suíte foi repetida após corrigir o unwrap
  do valor no adapter IndexedDB.

Validação F8: aprovada.
F1–F8 concluídos sem dados específicos do TCE-GO no Core.
Próxima ação: F9 (pack TCE-GO), somente mediante comando explícito.

## F9 — Primeiro Exam Pack real: TCE-GO TI 2026

- Planejamento e ingestão realizados pelo Orchestrator com ownership de Exam Intake,
  Curriculum, Resource/Question, Planner, Release e QA conforme classes do Model Routing.
- Fonte primária: Edital nº 01/2026 oficial, 25 páginas, preservado em
  `exam-packs/tce-go-ti-2026/edital-01-2026-oficial.pdf`; SHA-256 registrado no source-map.
- Artefatos gerados e validados: `manifest.json`, `facts.json`, `source-map.json`,
  `curriculum.json`, `resources.json`, `questions.json` e `study-plan.json`.
- Cobertura: 14 disciplinas, 45 tópicos com IDs estáveis e 82 canonicalConceptIds reutilizáveis;
  conteúdo geral nas páginas 19–20 e conteúdo de TI nas páginas 20–22 do edital.
- Proveniência: fatos críticos apontam para página/item; recursos têm fonte, URL, verificação
  em 02/10/2026 e `verified: true`; 10 questões são originais, derivadas de conteúdo público,
  com banca/ano, gabarito, fingerprint e licença explícita.
- Plano: 107 dias até 17/01/2027, 120 minutos/dia, pesos 1/2, dependências, revisões,
  questões, simulados e justificativa de prioridade por disciplina.
- Assumption restante: conhecimento prévio do estudante não foi fornecido; não é publicado
  como fato e não bloqueia a validade do pack.
- Links de recursos: todos os 11 URLs foram checados e estão `verified: true`; não há link
  de recurso pendente de verificação.
- Build demo standalone em `sites/tce-go-ti-2026/dist/` carregado localmente com título do
  pack, data da prova e 14 disciplinas.
- Core F1–F8: nenhuma alteração realizada neste gate.
- QA: 19 testes aprovados, incluindo 11 do Core e 8 específicos do pack/build/acceptance.
- Acceptance: schema/factory, proveniência, IDs, deduplicação, hash do edital, plano, build
  standalone e leakage arquitetural aprovados.

Validação F9: aprovada.

## F10 — Release standalone TCE-GO TI 2026

- Build final gerado em `sites/tce-go-ti-2026/dist/`, com assets relativos, manifest PWA,
  ícone local, service worker versionado, payload do Exam Pack e cópia de runtime dos
  módulos genéricos do Core.
- `sites/tce-go-ti-2026/RELEASE_CHECKLIST.md` contém a checklist e as instruções objetivas
  de publicação no GitHub Pages.
- Diagnóstico de navegador disponível em `dist/release-diagnostics.html`; confirmou IndexedDB
  após reload, export/import, isolamento por `examId`, primeira tentativa de score, retake
  sem alteração do score histórico e XP idempotente.
- Smoke test do navegador: aprovado; título, pack validado, data da prova e 14 disciplinas
  carregados. Refresh direto em `#questions`: aprovado. Acessibilidade: landmarks, skip link,
  foco visível, controles nativos e navegação hash verificados; CSS responsivo para mobile.
- Offline: aprovado; após ativação do service worker, shell, diagnósticos e dados do Exam Pack
  carregaram com o servidor local interrompido.
- Integridade: payload `dist/exam-pack/` igual ao pacote-fonte e SHA-256 do edital conferido.
- Suíte automatizada: 25 testes aprovados, 0 falhas, incluindo Core, schemas, F9 acceptance,
  integridade do pack, release, score, storage, XP, isolamento e leakage arquitetural.
- Recursos: todos os 11 URLs do pack permanecem `verified: true`, com fonte e data; nenhuma
  pendência está registrada no Exam Pack. A tentativa adicional de HEAD neste ambiente foi
  bloqueada pela política de rede e não alterou a classificação já verificada.
- Core F1–F8: nenhuma alteração realizada no F10.

Validação F10: aprovada.

## F11 — Dry run de segundo edital e genericidade

- Segundo pack criado a partir do edital oficial retificado do TJTO 2022 para Técnico Judiciário — Apoio Judiciário e Administrativo, com fonte PDF, facts, source-map, currículo, recursos, questões e study plan.
- Diferenças exercitadas: FGV contra FCC, 5 contra 14 disciplinas, 13 contra 45 tópicos, 80 contra 70 questões, redação contra estudo de caso, data encerrada, pesos ausentes em disciplinas e regras de aprovação distintas.
- Sobreposição: 20 conceitos no segundo pack, 5 compartilhados, 82 no TCE-GO, união de 97; overlap Jaccard de 5,15% e 25% dos conceitos do TJTO reaproveitáveis no TCE-GO.
- Isolamento simultâneo validado para progresso, score, primeira tentativa, XP/eventos, planos, analytics, recursos, questões, export/import e troca do pack ativo.
- Builds standalone dos dois packs e hub com os dois packs gerados.
- Suite completa: 32 testes aprovados, 0 falhas; SECOND_EXAM_DRY_RUN, NEW_EXAM_ACCEPTANCE, schema/contrato e leakage arquitetural aprovados.
- Core: nenhuma alteração realizada no F11. ADRs abertos: nenhum.
- Relatório completo: `docs/F11_GENERICITY_REPORT.md`.

Validação F11: aprovada. Nenhum gate posterior iniciado.

## O1 — Diagnóstico inicial e perfil de domínio

- Roadmap criado em `docs/OPERATIONAL_ROADMAP.md`; O2–O5 permanecem planejados e não iniciados.
- Implementados `MasteryStore` global por `canonicalConceptId`, `DiagnosticEngine` com amostragem progressiva determinística, `DiagnosticUI` acessível e contexto opcional de mastery no Study Planner.
- Questões diagnósticas ficam em `diagnostic-runs` e não entram em `scores`; simulatedScore permanece intacto.
- Mastery global sobrevive à troca de `examId`; progresso curricular, score, revisões, conclusão e analytics específicos continuam isolados.
- Eventos genéricos adicionados: `diagnostic_started`, `diagnostic_answered`, `diagnostic_completed`, `mastery_updated` e `study_plan_rebalanced`.
- Schemas adicionados: `schemas/mastery.schema.json` e `schemas/diagnostic-run.schema.json`; contrato aditivo em `contracts/MASTERY.md`; nenhuma migração destrutiva necessária.
- Diagnóstico browser IndexedDB: aprovado antes e depois de reload com `database.sql` persistido.
- Suíte completa: 38 testes aprovados, 0 falhas; leakage, schemas e testes F0–F11 preservados.
- Core: alterado de forma genérica e necessária para suportar mastery global/diagnóstico; nenhum identificador específico de edital entrou no Core.
- Relatório: `docs/O1_DIAGNOSTIC_REPORT.md`.

Validação O1: aprovada. O2 não iniciado.

## O1.5 — Staging Preview

- Build staging preparado em `sites/tce-go-ti-2026/staging/` com banner `STAGING / PREVIEW`,
  diagnóstico O1, painel técnico de build e metadata sem secrets.
- Script reprodutível: `scripts/build-staging.mjs`; workflow Pages: `.github/workflows/pages.yml`.
- Base path relativo, hash routes, manifest, service worker, Exam Pack e imports validados.
- Smoke browser local aprovado: pack carregado, diagnóstico respondeu questão, pausou, reabriu em
  nova aba e retomou o assessmentRun; mastery IndexedDB persistiu após reload/reabertura; offline
  do painel técnico passou após primeira visita.
- Suíte completa: 41 testes aprovados, 0 falhas; 38 anteriores preservados + 3 testes O1.5.
- Snapshot pré-staging: 38/38 verde.
- Publicado em `https://engiaceub.github.io/Nivelando_Game/` pelo workflow `36977900241`, verde
  no commit `7783f34f2ad79eab04aa6676c260587f1f2bb75e`.
- Smoke remoto aprovado: app, assets, Exam Pack TCE-GO, base path `/Nivelando_Game/`, hash routes,
  diagnóstico, pausa/retomada, reload, IndexedDB/mastery e plano adaptativo com explainPriority.
- PWA aprovado: manifest relativo, `sw.js` registrável e 28 recursos do app shell com HTTP 200.
  `/service-worker.js` não existe; o nome canônico publicado é `sw.js`.
- Score: diagnóstico concluído sem alteração de `simulatedScore`; a separação é coberta pela suíte.
- Suíte final: 41/41 testes aprovados; staging: 3/3 aprovados; nenhum secret staged.
- Tag de encerramento criada e publicada: `o1-5-staging-stable`, apontando para o SHA publicado
  e validado remotamente.
- O2 não iniciado. Relatório: `docs/O1_5_STAGING_REPORT.md`.

Validação O1.5: publicação remota aprovada; documentação final pendente apenas do commit/tag de encerramento.
