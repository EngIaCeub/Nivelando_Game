# Status

Arquitetura: Factory genérica
Primeiro Exam Pack: TCE-GO TI 2026
Fase atual: StudyOS V1 — Operationalization
Último gate aprovado: F11

Resumo operacional atual (2026-10-06): O1–O4 aprovados; O4 publicado e marcado `v1.0.0`.
O5 hardening automatizado concluído no escopo sintético, com revisão independente aprovada.

## Biblioteca didática — retomada 2026-10-08

- Candidato em `docs/content-review/expansion/STAGED_PACK.json`: 188/209 unidades
  cobertas, 21 lacunas, 220 recursos e 19 percursos elegíveis; estado `partial`.
- Curadoria desta retomada fechou no candidato os percursos de regime funcional,
  organização/controle no TCE-GO, PMBOK 8 e valores ágeis/Scrum/Kanban. Pack ativo
  não foi promovido nem alterado por esse staging.
- QA independente do SHA `d36b4a09353147b52eb7d2be6f027b0b1fe1cc74ea42d35617667d370b8d6131`
  permanece pendente. Testes focados: 17/17; validação de conteúdo: 3 packs aprovados;
  auditoria mantém 5 alertas conhecidos do segundo pack (TJTO).
- Permanecem abertas as lacunas listadas em `docs/content-review/expansion/GAP_LEDGER.json`,
  revisão factual integral de questões/cartões, QA independente e gates B5–B7.

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

## O2 — Dashboard Hoje e planner adaptativo

- Implementado `TodayPlan` genérico namespaced por `examId` e data, com algoritmo determinístico
  versionado (`today-v1`), orçamento diário, diversidade, dependências, retenção, erros,
  confiança, mastery, ritmo e razões observáveis.
- Dashboard integrado ao standalone: countdown, meta diária, fila, razões, início/pausa/
  retomada/conclusão, revisão de erros, questões, replanejamento, `ESTUDAR MAIS`, visão semanal,
  XP e sequência configurável.
- Persistência e isolamento: planos/atividades em IndexedDB, export/import namespaced,
  `simulatedScore` imutável e retentativas separadas; mastery permanece global.
- Schemas adicionados: `schemas/today-plan.schema.json` e `schemas/activity-state.schema.json`.
  Eventos O2 documentados em `contracts/EVENTS.md`.
- Build reproduzível em `scripts/build-standalone.mjs`, incluindo runtime genérico, pack,
  manifest e service worker relativos; nenhum dado TCE-GO entrou em `core/`.
- Suíte local desta etapa: 52/52 testes aprovados, 0 falhas. Workflow Pages #12 verde
  (`36983657539`) no commit `44dddca4c32bea186214ca66844ae4ecd64a731e`.
- Smoke remoto aprovado em `https://engiaceub.github.io/Nivelando_Game/`: Dashboard Hoje,
  Exam Pack, hash route, resposta/conclusão, mastery, replanejamento, persistência após
  reload, manifest relativo e service worker versionado validados. O contrato offline foi
  validado por testes/cache; o navegador automatizado não expôs uma chave de rede para
  executar um corte offline real nesta sessão.
- Relatório: `docs/O2_TODAY_PLANNER_REPORT.md`.

Validação O2: aprovada. Tag `o2-today-planner-stable` aponta para o commit publicado e validado.
O3 não iniciado.

## O3 — Expansão e curadoria do conteúdo real TCE-GO

- Inventário criado para os 45 tópicos em `exam-packs/tce-go-ti-2026/content-coverage.json`;
  classificação: 12 P1, 20 P2, 4 P3 e 9 P4.
- Pack expandido com 20 recursos verificados, 1 videoaula pública verificada, 289 questões
  originais com fingerprint e explicações, 102 flashcards e 16 simulados com pools e seeds.
- Simulado completo preserva a estrutura oficial: 25 questões gerais + 45 específicas, pesos
  1/2 e 270 minutos. `simulatedScore` e contratos de scoring não foram alterados.
- Todos os 45 tópicos têm recurso, questões, revisão e explicação; nenhum tópico `EMPTY`.
  A matriz classifica o lote como `MEDIUM` por manter metas progressivas sem redundância.
- Suíte local O3: 59/59 testes aprovados, 0 falhas. Core sem dados específicos do TCE-GO.
- Workflow Pages #15 (`36985780849`) verde no commit `572a872d22af4137d425b770d0cb8a40b1584023`.
- Smoke remoto em `https://engiaceub.github.io/Nivelando_Game/` aprovado: aplicação, assets,
  base path, hash routes, Dashboard Hoje, questão, manifest, service worker, payload expandido
  sem query e console sem erro crítico. Cache antigo foi isolado por versão e removido na ativação.
- Relatórios: `docs/O3_CONTENT_BASELINE.md` e `docs/O3_CONTENT_REPORT.md`.

Validação O3: aprovada; conteúdo publicado e smoke remoto aprovado. Tag `o3-content-stable`
publicada após o Actions final. O4 não iniciado.

## O4 — Production Release / StudyOS V1.0

- Baseline O3 confirmado em `c56ffbc15ff02b8ca86aa8884fa39344c5bc3ffe`, tag
  `o3-content-stable`, working tree limpo e 59/59 testes preservados.
- Implementação local: metadata formal `1.0.0`/`production`, Exam Pack versionado,
  backup/restore validado, reset protegido, migration registry genérico, cache PWA
  versionado, atualização discreta, ajuda e workflow de release.
- Após reprovação inicial, nova análise encontrou corrida que podia sobrescrever a primeira
  tentativa e preferências inválidas que podiam interromper o bootstrap após restore. Ambos
  corrigidos: score/retentativas são gravados em uma transação atômica; backups validam as
  preferências declaradas e as embutidas no storage antes de alterar qualquer namespace.
- Suíte local integrada: 96/96 testes aprovados; JSON Schema 2020-12/factory válidos para os
  packs TCE-GO, TJTO e template; scan de secrets passou (277 arquivos).
- Browser smoke local: 20/20 checks aprovados. Inclui cenário O3→V1 nativo, dados IndexedDB
  legados, import inválido sem mutação, score concorrente, export/import, offline, mobile,
  teclado, fluxo de estudo e console/requisições sem erros.
- Revisor adicional confirmou os dois fixes. Revisões seguintes foram interrompidas por
  autodescrição genérica GPT-6, interpretada incorretamente como falha de roteamento.
  A nova sessão Meitner tem `model: gpt-6-astra`, `effort: high` confirmados no registro
  `turn_context`. Parecer FAIL: backup com atividade nula quebra bootstrap; conclusões
  concorrentes perdem progresso; recuperação de retentativa pode duplicar o registro.
  A execução anterior de Dirac/Raman foi interrompida pelo limite de uso. Na retomada,
  Hume assume backup e Fermat concorrência/recuperação, ambos com Luna e ownership separado.
- Retomada: Hume/Fermat entregaram correções; integração passou 103/103 testes sem
  skips (81/81 Core/Exam Packs), schema/factory dos três packs e scan de 278 arquivos.
  Builds standalone/staging regenerados; smoke browser 20/20 após corrigir suporte
  a schema no próprio teste. Laplace/Astra reprovou quatro grupos de restore inválido.
  Hume implementou as validações e regressões, e o teste de arquitetura levou a mover
  a fixture para `core/tests/fixtures/`. Nova integração: 127/127 testes, smoke local
  21/21, três schemas/factory válidos e scan de 279 arquivos sem achados. Nova revisão
  independente Astra em andamento. Ainda não há commit, deploy ou tag; O5 não iniciado.
- Relatórios: `docs/O4_RELEASE_BASELINE.md`, `docs/O4_PRODUCTION_RELEASE_REPORT.md`,
  `docs/V1_RELEASE_CHECKLIST.md`, `docs/USER_GUIDE.md` e `docs/RELEASE_NOTES_1.0.0.md`.
- Working tree local ainda não commitada; deploy e smoke remoto pendentes. Aguardar parecer
  QA independente; não iniciar O5 até O4 aprovado.

Atualização 2026-10-03: usuário autorizou execução autônoma do roadmap restante,
incluindo aprovação independente Astra no lugar de validação humana. QA Astra
reprovou o candidato O4 após reproduzir falhas de backup, score após restore, cache,
atualização PWA, diagnóstico/UX, XP duplicado e replanejamento. Correções em andamento;
os blockers da primeira rodada foram corrigidos, mas a revisão Meitner reproduziu três
novas falhas de backup, concorrência e replay. Os resultados 96/96 e 20/20 precedem essas
correções e não aprovam o candidato atual. Publicação aguarda correções, novas evidências
e novo parecer independente Astra; O5 aguarda O4 aprovado.

### Retomada 2026-10-04 — validação local

- Corrigida a recuperação de armazenamento corrompido: captura bruta em envelope separado,
  transacional com substituição; importação normal rejeita esse envelope. Regressões cobrem
  invalid states, rollback e IndexedDB nativo.
- Suíte total: 135/135 testes aprovados, zero falhas/skip, usando Edge nativo.
- Validação de conteúdo/schema/factory: TCE-GO (289 questões), TJTO (3) e template válidos.
- Browser smoke local: 21/21 checks aprovados, incluindo recuperação, score/retake/XP,
  offline real, bancos O3 v1/v2, diagnóstico somente leitura, layouts móveis e teclado.
  Evidência: `docs/O4_BROWSER_EVIDENCE_FINAL.json` (build local).
- Scan por padrões de secrets: zero correspondências; `git diff --check` aprovado.
- O browser harness foi corrigido para servir o entry HTML de produção nos cenários que
  dependem do registro do service worker; os testes anteriores estavam removendo `app.js`.
- QA independente `gpt-6-astra/high` está revisando o candidato integrado. O4 permanece
  **pendente**, sem commit/deploy/tag; aguardar veredito antes de publicar. O5 não iniciado.

### Reprovações Astra e correções em curso — 2026-10-04

- Revisor Astra `gpt-6-astra/high` reprovou a rodada por aceitar questão executável
  inválida em backup de diagnóstico (P1); também reportou captura de outro exame no
  download de recovery (P2) e interceptação local no checker remoto (P2).
- Regressões/correções: `diagnostic-question-bank` valida schema e semântica antes do
  restore; capture export filtra pelo `examId`; smoke `--url` não intercepta páginas locais.
- Revisão independente paralela também reproduziu perda de mastery/revisão quando uma
  resposta pendente é retomada após outra sessão ter atualizado o mesmo conceito (P1).
  `operationId` agora protege updates atômicos por registro e o replay mescla com estado
  atual, preservando contagens/histórico e evitando duplicidade.
- Após as correções, suíte total: 135/135; casos focados: 50/50; schemas/factory dos três
  packs válidos; browser smoke local: 21/21. Build standalone e staging regenerados.
- Uma nova revisão Astra independente ainda é obrigatória; portanto O4 segue **não
  aprovado** e sem publicação. Smoke remoto, Actions, tag e O5 continuam pendentes.

### Continuação 2026-10-04 — verificações e QA pendente

- Suíte integrada repetida após cobrir colisão de `operationId` legado entre sessões:
  **136/136 testes**, zero falhas e zero skips.
- Standalone e staging regenerados; schema/factory TCE-GO (289 questões), TJTO (3) e
  template válidos.
- Browser smoke local repetido: **21/21 checks**, incluindo offline, persistência, restore,
  score/retake, diagnóstico, IndexedDB O3 v1/v2, teclado e quatro larguras. Evidência usa
  metadata `commitSha: local`; não é evidência de release publicada.
- Scan de padrões de secrets sem correspondências; `git diff --check` passou.
- Revisão Astra `gpt-6-astra/high` não iniciou por limite de uso reportado pelo agente.
  O FAIL anterior segue vigente: candidato ainda não aprovado. Sem commit, push, deploy ou
  tag; O5 não iniciado. Aguardar QA Astra independente.

### Segunda correção O4 — 2026-10-04

- Após revisão Astra FAIL, respostas de estudo agora adquirem pendência por update atômico
  da sessão; efeitos usam o resultado authoritative de `recordScoreAttempt`; finalização
  mescla resposta na sessão atual. Teste nativo com duas conexões IDB confirma primeira
  tentativa única e retentativa concorrente idempotente, sem alteração do score/XP.
- Conclusão diagnóstica agora combina a resposta com o mastery atual dentro de update
  atômico, grava recibo por `examId + assessmentRunId + canonicalConceptId` e suporta retry
  depois de falha antes de marcar assessment concluído. Testes cobrem interleaving, replay
  após falha e reutilização de ID entre exames.
- A falha da regressão de backup/replay foi corrigida na injeção da falha, agora direcionada
  ao update atômico de sessão; a asserção de rejeição continua intacta.
- Suíte integrada: **140/140**, zero falhas/skip; schema/factory dos três packs válidos;
  standalone/staging regenerados. Smoke browser local: **21/21**, metadata `commitSha: local`.
- Segunda revisão Astra independente `gpt-6-astra/high` está em andamento. Até o veredito,
  O4 segue sem aprovação/publicação/tag; O5 não iniciado.

### Terceira rodada de correções O4 — 2026-10-04

- Transições `pause`, `next`, `resume`, `finish` e revelação de flashcard usam atualizações
  atômicas da sessão atual. Pendência concorrente é aplicada antes de pausar/concluir; uma
  falha após commit do score é recuperada sem apagar resposta, mastery ou XP.
- Export de backup agora captura `examId` e namespace global na mesma transação IndexedDB
  readonly. Teste de duas conexões reproduz o snapshot inconsistente antigo; Exam B permanece
  isolado. Schema/runtime também validam projeção `result.mastery` de diagnóstico.
- Retry de diagnóstico concluído repara eventos ausentes `diagnostic_completed` e
  `mastery_updated` sem duplicação; valores históricos do evento ficam no assessment.
- Suíte completa: **145/145**, zero falhas/skip. TCE-GO (289 questões), TJTO (3) e template
  válidos; builds regenerados e browser smoke local **21/21** (`commitSha: local`).
- Nova revisão Astra independente será solicitada sobre este candidato integrado. O4 ainda
  não aprovado; sem commit/deploy/tag e sem iniciar O5 até PASS e validação remota.

### Quarta rodada de correções O4 — 2026-10-04

- Nova reprovação Astra identificou perda de respostas/queue em duas respostas
  diagnósticas concorrentes e gravação obsoleta de resposta depois de restore.
- `DiagnosticEngine.answer` agora mescla a resposta e calcula expansão da amostra
  dentro do update atômico do run vigente; retry de evento permanece idempotente.
- Operações StudySession são serializadas entre abas via Web Locks. Restore/reset
  exigem coordenação cross-tab; substituição de namespaces incrementa geração na
  mesma transação e instâncias antigas falham fechadas antes de mutar dados.
- Regressões reais Chromium/IndexedDB/Web Locks: diagnóstico concorrente, restore
  contra resposta em andamento, transições pause/next/finish e respostas/retakes
  simultâneos passaram **4/4**. Suíte integrada passou **147/147**, zero falhas e
  zero skips; schema/factory e `git diff --check` passaram.
- Standalone e staging regenerados; schema/factory de TCE-GO (289), TJTO (3) e
  template aprovados. Browser smoke: **20/21**; os 20 checks funcionais passaram
  (diagnóstico, score/XP, backup/import, recovery, offline, migração O3, saúde,
  teclado/mobile). O único FAIL é deliberado no gate de metadata: build local usa
  `commitSha: local`, não SHA exato de release. Evidência em
  `docs/O4_BROWSER_EVIDENCE_FINAL.json`.
- Scan de secrets sem achados; `git diff --check` aprovado. Nova revisão independente
  Astra `gpt-6-astra/high` permanecia pendente por indisponibilidade da delegação;
  O4 continua **não aprovado**, sem commit/deploy/tag. O5 não iniciado.

### Revisão independente Harvey — retomada

- Delegação restabelecida: Harvey foi invocado explicitamente com `gpt-6-astra/high`.
  Veredito **FAIL local**, apesar de confirmar 147/147 testes e schemas válidos.
- Reproduções demonstram mutações após restore por `StudySession.start/save`,
  planner e API direta de diagnóstico; erros de leitura da geração eram tratados
  como zero; checker comparava metadados internos de forma assimétrica.
- Correções em andamento: Bacon/Luna (storage fail-closed e regressões), Rawls/Luna
  (checker de restores repetidos), Maxwell/Sol (fronteiras dos comandos e contexto
  explícito entre engines/UI). Nova revisão Astra obrigatória após integração.
- Scan do projeto passou em 288 arquivos e módulos Core correspondiam aos dois
  builds antes destas correções. Evidências anteriores não aprovam o novo candidato.
- Sem commit, push, publicação ou tag; O5 permanece pendente de O4 aprovado.

### Continuação após interrupção dos agentes por limite de uso

- Rawls/Luna concluiu o checker: projeção simétrica, dois restores consecutivos e
  geração +1 em cada restore; sintaxe validada, smoke novo ainda não executado.
- Bacon/Luna e Maxwell/Sol foram interrompidos por limite de uso. O orquestrador
  corrigiu os fixtures incompletos e integrou checagem de geração na própria
  transação de put/delete, putIfAbsent, update e scoring do IndexedDB. Import usa
  essas primitivas. Erros de leitura/capacidade e geração malformada rejeitam.
- Regressão Chromium confirma que seis caminhos primitivos de escrita por conexão
  obsoleta rejeitam sem alterar dados nem executar updater. Suíte: **152/152**,
  zero falhas/skip. Essa evidência não resolve todos os requisitos do parecer.
- `core/src/mutation-context.js` foi iniciado pelo agente, mas ainda NÃO está
  integrado às engines/UI. Falta terminar a fronteira por comando, seus testes,
  regenerar dist/staging e repetir smoke e QA Astra. Builds e evidência browser
  existentes precedem estas últimas alterações e não validam o candidato atual.
- FAIL Harvey permanece vigente; sem commit/push/deploy/tag ou início de O5.

### Alteração do modelo de aprovação — 2026-10-06

- Usuário alterou a aprovação independente de gates/releases para **`gpt-6.1-sol/high`**.
  Políticas AGENTS, MODEL_ROUTING, QA, AUTONOMOUS_VALIDATION, checklist e ADR alinhados.
- Modelos de implementação e arquitetura permanecem inalterados. Pareceres históricos
  Astra conservam sua autoria; o FAIL anterior exige reavaliação independente das correções.
- Esta troca não aprova O4, não autoriza pular testes e não inicia O5.

### Retomada da integração O4 — 2026-10-06

- Coordenação por comando integrada em StudySession, DiagnosticEngine, TodayPlanEngine,
  preferências, leitura e import/reset. Contextos explícitos têm store e duração restritos;
  transações rejeitam instâncias obsoletas e gerações inválidas.
- Suíte completa repetida: **175/175**, zero falhas e zero skips. A primeira execução
  restrita não acessou o Chromium instalado; a repetição com acesso autorizado passou.
- Schemas/factory: três packs válidos; scan de secrets: 294 arquivos, sem achados.
  Git do checkout oficial e diff-check confirmados com acesso autorizado, sem recriar repositório.
- Smoke local completo: **20/21**. Os 20 fluxos funcionais passaram, incluindo duas
  restaurações consecutivas, igualdade de dados e geração +1. Única falha é o check
  de SHA publicado, esperado no build local (`commitSha: local`); precisa ser validado
  depois de commit e deploy. Evidência: `docs/O4_BROWSER_EVIDENCE_FINAL.json`.
- Checker corrigido: ausência legítima do contador antes do primeiro restore significa
  geração 0; contador malformado continua rejeitado. Não houve redução das asserções.
- Revisor independente Gauss (**gpt-6.1-sol/high**) emitiu **PASS local** após a correção
  das preferências. A revisão confirmou a falha com controle negativo, resultado corrigido
  90/90/90, 160 exports concorrentes com 120 gravações atômicas sem snapshot misturado,
  e os invariantes de score, XP, replay, rollback e fencing. A revisão não alterou checkout.
- Reavaliação encontrou e reproduziu divergência de preferências entre abas: envelope do
  backup podia divergir das preferências dentro do snapshot IDB. Exportação agora usa a
  preferência persistida no snapshot coerente. Regressão real em duas abas e suíte completa
  passaram (**177/177**, zero falhas/skip). Smoke local após o fix: **20/21**; 20 fluxos
  funcionais passaram e só o SHA de release falha por ser build local. Parecer independente
  revisão independente confirmou detecção do defeito antigo e ausência de mistura em
  concorrência. O4 local aprovado.

### Encerramento O4 — 2026-10-06

- Commit publicado: `44d3d06725354d5a737588ac51aca88afc2a4a00`; Actions `37412855831`
  verde; GitHub Pages: https://engiaceub.github.io/Nivelando_Game/.
- Veredito independente: PASS `gpt-6.1-sol/high`; suíte completa 177/177, sem falhas
  ou skips; schema/factory 3 packs válidos; scan 295 arquivos sem secrets; release checks 3/3.
- Smoke remoto **21/21** no SHA publicado: aplicação/assets/base path, hash routes, TCE-GO,
  diagnóstico/resposta/pausa/reload, assessmentRun e IndexedDB, mastery/planner/explainPriority,
  simulatedScore intacto, manifest/SW/offline, console, teclado e layouts 375/390/430/1280.
- Metadata remoto: build `44d3d0672535-20261006041614644`, timestamp
  `2026-10-06T04:16:14.644Z`, examId `tce-go-ti-2026`, schema 1, storage 2, canal production.
- Tag anotada `v1.0.0` aponta exatamente para o commit publicado e validado.
- Evidências: `docs/O4_BROWSER_EVIDENCE_REMOTE.json`, relatório O4 e link Actions acima.
- O5 foi iniciado após o encerramento formal O4 e está concluído; detalhes e parecer na seção O5 abaixo.

## O5 — Hardening operacional (concluído no escopo sintético)

- Critério: perfis de teste isolados, sem dados pessoais e sem envio de telemetria; observar
  persistência, score/XP, recuperação por reload, acessibilidade básica, requests e offline.
- Execução repetida do harness corrigido contra o SHA publicado: **3/3 perfis sintéticos passaram**
  em desktop/mobile; metadata completa conferida, score inicial imutável, XP/sessão após retomada e
  snapshot persistente comparado após navegação offline via Service Worker. Zero erro HTTP/console
  e nenhuma solicitação a terceiros observada nos três perfis.
- Performance observada no browser headless: 1,077,247 bytes decodificados e 100,769 bytes
  codificados dos recursos por contexto; DCL medido 80–126 ms nesta amostra. São medições sintéticas,
  não métricas de usuários reais.
- Evidência: `docs/O5_SYNTHETIC_USAGE_EVIDENCE.json`; harness: `scripts/o5-operational-check.mjs`.
- Revisores independentes `gpt-6.1-sol/high`: **PASS** para execução e encerramento sintético
  (3/3 perfis; zero falhas). Suíte local 177/177, schemas 3 packs válidos e security scan 299
  arquivos sem achados. Limitações: cobertura sintética, a11y básica, cache offline provisionado e
  amostra de desempenho que não
  representa métricas reais. Nenhuma alegação de estudo longitudinal/uso real.

## Pixel UI Foundation + Dashboard piloto — 2026-10-06

- Integração do pacote `StudyOS_Pixel_Codex_Config`: skill `skills/studyos-pixel-ui/`, referências de design/IA, roteamento de modelos, agentes e prompts foram adicionados sem sobrescrever documentação existente. O `AGENTS.md` recebeu uma seção aditiva de Pixel UI; o README original do projeto foi preservado.
- Auditoria da UI: `docs/PIXEL_UI_AUDIT.md`. Fonte de produção confirmada em `core/` e `sites/tce-go-ti-2026/site-app.js`; `dist/` é gerado. A auditoria mapeia telas, estados, dependências de negócio, classes e backlog. Dashboard classificado como INTERMEDIATE; quiz, storage/restore e PWA/offline permanecem COMPLEX/protegidos. GPT-6 Terra não está disponível; Luna para trabalho delimitado e Sol para fronteiras complexas.
- Baseline antes do redesign: branch `main`, commit `b9351ce2d0ad5f32fd6aef220c50987ebba0ff10`, working tree inicialmente limpo. `pnpm test`: **144/157**, com 13 falhas anteriores ligadas à inicialização/perfil temporário Edge/IndexedDB no sandbox. `pnpm validate:content` aprovou os três packs; security scan aprovou 320 arquivos; staging e O4 production tests passaram 3/3 cada. Browser checker sem acesso ao perfil Edge não iniciou checks.
- Foundation: tokens semânticos, bordas/shadows, focus, reduced-motion e CSS de `PixelPanel`, `PixelButton`, `PixelBadge`, `PixelProgress`, `PixelMeter` e `PixelStat`; primitives DOM exportadas por `core/src/pixel-ui.js`.
- Dashboard piloto: agenda renderiza nomes de tópico do currículo, estado e duração reais; XP/nível usam a projeção existente de XP; mastery desconhecido é mostrado como sem dados; streak, cobertura e meta/atividade vêm dos dados existentes. A hierarquia mantém o próximo estudo em destaque e rótulos acadêmicos. Nenhuma engine, schema, storage, scoring, XP, mastery ou regra PWA foi alterada.
- QA e ajuste: o teste identificou dependência do rótulo acessível `COMEÇAR` e do texto `Meta diária: N`; ambos foram mantidos no componente. `pnpm test`: **177/177**, zero falhas/cancelamentos/skip após executar com acesso local autorizado ao Edge. `pnpm validate:content`: TCE-GO (289 questões), TJTO (3) e template (0) válidos. `security-scan`: 324 arquivos, sem achados. `git diff --check` e verificações de sintaxe JS passaram.
- Browser QA: `scripts/o4-browser-check.mjs --expected-commit local --output docs/PIXEL_UI_BROWSER_EVIDENCE.json`: **21/21**, zero falhas. Inclui primeiro acesso/Dashboard, quiz/retakes, flashcards, score/XP, backup/restore, offline, console/HTTP/telemetria, teclado e viewports 375×667, 390×844, 430×932 e 1280×900. Relatório histórico `docs/O4_BROWSER_EVIDENCE.json` foi preservado; evidência local do Pixel UI fica no arquivo próprio.
- Decisão: manter a foundation no stylesheet compartilhado e primitives DOM nativas, sem fonte externa, dependência de framework ou mudança de semântica. Build standalone regenerado em `sites/tce-go-ti-2026/dist/`; não houve deploy, push, commit ou tag.
- Estado das etapas abaixo: shell/nav, currículo, revisões, flashcards, quiz, analytics, diagnóstico e apresentação de Settings migrados; os contratos de restore e PWA/cache permaneceram protegidos. O review identificou e a integração corrigiu `hidden`/PixelButton, foco com contraste insuficiente e espaçamento entre grupos de analytics.
- Capturas finais desktop/mobile ficam no diretório de visualizações desta tarefa: dashboard, shell/menu, currículo, flashcards, quiz, analytics e UI diagnóstica de staging. Não usar as capturas antigas `pixel-ui-desktop.png` e `pixel-ui-mobile.png` como evidência final.

### Pixel UI — Flashcards — 2026-10-06

- Flashcard card now uses the Pixel surface/border/shadow system, shows front/back with session progress, topic references, current review state and expanded provenance. Status is read-only from existing RevisionEngine due records and MasteryStore reviewStatus; precedence is overdue, needs-review, scheduled review, stable and learning/unseen.
- Accessible action labels and write flow are unchanged: `Revelar resposta`, `Preciso revisar` / `Lembrei`. No scheduling, mastery, persistence, scoring or XP logic changed.
- Targeted test `core/tests/o4-study-session.test.mjs`: 8/8. Full `pnpm test`: 177/177. Browser checker: 21/21 including flashcard reveal/review/persistence, keyboard and mobile/desktop layouts. Evidence: `docs/PIXEL_UI_BROWSER_EVIDENCE.json`.
- Classification: INTERMEDIATE, presentation-only. The site composition resolves the pack's topic IDs through the existing curriculum to academic titles; it does not invent metadata.
- QA final após mapear IDs para títulos acadêmicos: checker real `scripts/o4-browser-check.mjs --expected-commit local --output docs/PIXEL_UI_BROWSER_EVIDENCE.json` passou **21/21**, incluindo quiz/retakes, flashcards, backup/restore, offline, teclado e viewports desktop/mobile. O arquivo de evidência histórico de O4 foi preservado.

### Pixel UI — Quiz — 2026-10-06

- A superfície mostra posição, progresso baseado em respostas únicas reais, enunciado, opções, feedback e resultado. Marcadores das alternativas são decorativos; os nomes acessíveis continuam sendo os textos originais.
- Após resposta comprometida, botões ficam desabilitados e correto/incorreto é indicado com texto, estado acessível e contraste além de cor. Em retentativa, o registro da primeira tentativa e a preservação de score/XP permanecem visíveis; a engine segue responsável por score/XP e persistência.
- Fluxo, callbacks, state machine e engines não foram alterados. O clique ainda registra a resposta; não há seleção temporária introduzida pela camada visual.
- QA: suíte completa **177/177**; `pnpm validate:content` aprovou três packs; `git diff --check` e `node --check core/src/study-ui.js` passaram; standalone build concluído; browser checker local **21/21**. Evidência atualizada em `docs/PIXEL_UI_BROWSER_EVIDENCE.json`.
- Inspeção visual direta em Edge headless nos painéis de questão e retentativa, desktop 1280 px e mobile 375 px: hierarquia, foco visual/estados, quebra do enunciado e alternativas mantiveram legibilidade sem overflow observado. Capturas em `C:\Users\felip\.codex\visualizations\2026\10\06\01a112e1-6b8f-77d2-b4b2-541f46c5c336\pixel-ui-quiz-desktop-question-panel.png`, `pixel-ui-quiz-desktop-locked-panel.png` e `pixel-ui-quiz-mobile-locked-panel.png`.
- Nenhum deploy, push, commit ou tag foi feito. Settings/restore e PWA/cache permanecem protegidos fora do redesign.

### Pixel UI — Shell e navegação — 2026-10-06

- Cabeçalho/brand, links de navegação, menu mobile, skip link, status e banner de atualização receberam tratamento Pixel baseado nos tokens. `core/index.html` e `core/app.js` não precisaram de mudanças; âncoras, toggle/`aria-expanded`, landmarks, atualização e service worker mantêm o comportamento original.
- Inspeção visual real do menu fechado com foco visível e aberto em viewport 375 px; menu em grade de duas colunas, foco contrastante e sem sobreposição observada.
- Build standalone; suíte **177/177**; validação de packs (3/3) e browser QA **21/21** incluindo teclado e 375/390/430/1280 px passaram. Capturas em `C:\Users\felip\.codex\visualizations\2026\10\06\01a112e1-6b8f-77d2-b4b2-541f46c5c336\pixel-ui-shell-mobile-closed.png` e `pixel-ui-shell-mobile-open.png`.
- Settings/backup foi incluído somente como apresentação; lógica de backup, restauração, recuperação legada e reset permaneceu fora de escopo. PWA/cache e service worker também permaneceram sem mudanças funcionais.

### Pixel UI — Settings e encerramento local — 2026-10-06

- A tela de Configurações agrupa visão do produto, ações de backup e disclosures; a área de reset é destacada como destrutiva. A nota de snapshot bruto aparece como aviso. Capturas inspecionadas: `pixel-ui-settings-final-desktop.png`, `pixel-ui-settings-risk-open-desktop.png`, `pixel-ui-settings-final-mobile.png`.
- Somente wrappers/classes e CSS mudaram em `showSettings()`. Inputs, rótulos, aceitação de arquivo, tamanho máximo de 25 MB, ordem de controles, callbacks, confirmations, store mutations, import/restore, reset, recuperação legada, roles e reload não mudaram. Checker de backup/import round-trip e recuperação passou; revisor GPT-6.1 Sol/high confirmou **PASS**, sem achados novos.
- Um achado LOW de especificidade (`.status:not(:empty)` sobre a nota de snapshot) foi corrigido e as capturas confirmam o estado. Permanecem regras antigas e novas de shell sobrepostas em CSS, sem comportamento incorreto observado; consolidação pode ser feita em uma limpeza futura.
- Verificação final do candidato: build standalone e staging; suíte `pnpm test` **177/177**; `pnpm validate:content` 3/3 packs (TCE-GO 289, TJTO 3, template 0); security scan 325 arquivos, sem achados; `git diff --check` e sintaxe dos módulos alterados passaram; browser QA **21/21** após Settings e correção da nota, com restore, offline, teclado e layouts 375×667, 390×844, 430×932 e 1280×900. Evidência: `docs/PIXEL_UI_BROWSER_EVIDENCE.json`.
- Revisão independente de release Pixel UI GPT-6.1 Sol/high: **PASS local**, sem BLOCKER/HIGH/MEDIUM pendentes. Foco tem contraste verificado em superfícies claras e header escuro; feedback quiz textual e estados acessíveis; progresso, XP, domínio e revisões continuam baseados nos dados/engines existentes.
- Artefatos gerados em `dist/` e `staging/` correspondiam ao candidato validado; a publicação posterior pelo workflow de GitHub Pages está registrada abaixo.

### Pixel UI — Currículo, Revisões, Analytics e QA final — 2026-10-06

- Currículo preserva hierarquia e nomes acadêmicos do pack, recursos/proveniência e ações de praticar/revisar. Disciplinas, módulos e tópicos são agrupados visualmente, sem alterar seleção nem elegibilidade.
- Revisões mostra os registros/datas existentes e estado textual vencida/agendada; o callback segue iniciando o mesmo review. Analytics apresenta cobertura, XP/nível, mastery, primeira tentativa, histórico, erros e recompensas derivados das fontes existentes; empty state explícito, sem números inventados.
- A tela exportada `DiagnosticUI` em `core/src/diagnostic-ui.js` é usada na prévia de staging; recebeu progresso/estados e lista de mastery com meters reais. A composição principal usa `StudyUI` para diagnóstico (`site-app.js`), já coberta pelo ramo visual de quiz. Ambas preservam amostragem, chamadas da engine, respostas e mastery.
- Revisão independente GPT-6.1 Sol/high: **PASS para integração local**, nenhum BLOCKER/HIGH. Três achados MEDIUM foram corrigidos: regra `[hidden]` agora vence `display` de PixelButton; grupos de analytics têm espaçamento; foco em superfície clara usa `#92400e` (7,09:1 sobre branco) e cabeçalho escuro mantém âmbar (6,10:1). Uma observação LOW sobre regras de shell duplicadas por cascata permanece para futura manutenção, sem regressão funcional detectada.
- Capturas finais renovadas após as correções: Dashboard (ação Aplicar corretamente oculta), Flashcards com títulos reais, Analytics espaçado, Quiz e menu. `pixel-ui-diagnostic-*` é explicitamente evidência da tela de staging, não da composição principal.
- Validação final após correções: `pnpm test` **177/177**, zero falhas/cancelamentos/skips; `pnpm validate:content` passou em TCE-GO (289), TJTO (3) e template (0); `security-scan` aprovou 325 arquivos; standalone/staging builds concluídos; browser checker **21/21**. Relatório local: `docs/PIXEL_UI_BROWSER_EVIDENCE.json`. `git diff --check` e verificações de sintaxe passaram.
- Settings recebeu mudanças somente de apresentação. Backup/restore e PWA/offline foram cobertos pelo QA existente e permaneceram funcionalmente intactos.

### Pixel UI — Publicação GitHub Pages — 2026-10-06

- Push autorizado do código validado: commit `a90dd8200f203d67c3ba169a36b0c4d81ad47026` (`feat: apply Pixel UI across StudyOS`).
- Workflow Pages `37533529815`: **success**. Todos os passos verdes — suíte, schemas, builds standalone/staging, production release checks, browser release gate, security scan, staging validation e deploy.
- Site: https://engiaceub.github.io/Nivelando_Game/.
- Smoke remoto com `--expected-commit a90dd8200f203d67c3ba169a36b0c4d81ad47026`: **21/21**, incluindo metadata/SHA, score/XP e retakes, flashcards, backup/import/restore, offline, console/HTTP/telemetria, teclado e layouts 375/390/430/1280. Evidência: `docs/PIXEL_UI_BROWSER_EVIDENCE_REMOTE.json`.
- GitHub Pages serviu o SHA esperado. Nenhuma tag foi criada.

## Biblioteca didática — B1 arquitetura — 2026-10-06

- Contrato DIDACTIC_LIBRARY, ADR 004, plano B1–B7, schemas aditivos, papéis, skill e
  prompts incorporados. Relatório: docs/DIDACTIC_LIBRARY_ARCHITECTURE_REPORT.md.
- Packs reais/template têm library.json planned e escopo pending; IDs existentes
  preservados. Recursos legados não são considerados curadoria v2 automaticamente.
- Auditoria reproduzível por unidade e candidato; completude bloqueada com lacunas.
- QA/Architect independente GPT-6.1 Sol/high: B1 aprovado sem blockers. Milestones
  B2–B7 permanecem pendentes; biblioteca completa e UI ainda não foram entregues.
- Checkout publicado: suite final 186/186, schemas 3/3, security scan 347 arquivos.
  Cópia anterior: suite 47/47 e schema final 3/3 conferido via validador compartilhado.
- Baselines de cobertura: DIDACTIC_LIBRARY_BASELINE_TCE_GO/SECOND_PACK.json. Zero
  cobertura v2 indica revisão pendente, não ausência de links existentes.

## Pixel plataforma — planejamento V0 — 2026-10-06

- UI/UX atual revisada com pesquisa de referências oficiais Nintendo/SEGA e MDN/W3C.
- Direção Expedição do conhecimento, original e inspirada em plataformas de 16 bits,
  registrada em docs/design/PLATFORM_PIXEL_PLAN.md; fases V0–V6, assets e aceite.
- Sistema visual, regras UX, componentes, migration plan, AGENTS, Frontend, skill e
  prompt 52 conectados ao plano. Conceito isolado Hoje/Biblioteca/Questões com dados
  ilustrativos; nenhum acesso ao progresso nem mudança no runtime de produção.
- Render inspecionado em 1280×900, 390×844, 375×667 e reflow 640×450; busca/filtros,
  navegação, teclado/skip/disclosure, modo foco, paletas e bloqueio da resposta conferidos.
- Revisão independente GPT-6.1 Sol/high aprovou planejamento e composição V0;
  ajustes de rótulo, aria-hidden e autoria documentados. Evidências e limites:
  docs/design/PLATFORM_CONCEPT_REVIEW.md. Sintaxe JS/servidor e diff check passaram.
- V1–V6 pendentes; zoom real, QA completo de acessibilidade, regressão, offline,
  restore e segundo pack pertencem à implementação/release. Nova direção não publicada.

## Pixel plataforma — implementação local V1–V5/B5 — 2026-10-06

- Runtime standalone integrado: tokens, ícones/cenários originais, Hoje reorganizado,
  modo foco, grupos de navegação nativos, regiões curriculares e Biblioteca por tópico.
- Consulta/coverage genéricas no Core; dados de edital continuam nos packs. Biblioteca
  mostra 20 referências legadas e 0/45 unidades TCE-GO com principal revisado; não
  declara completude nem converte cobertura editorial em progresso.
- Build, sintaxe e validação schema/factory de três packs concluídos. Auditorias TCE-GO
  e TJTO sem erros estruturais, ambas planned/pending. Assets: 2.686 bytes gzip somados.
- Render CUA desktop/celular/reflow, filtros/vazio, teclado/Escape, hash/history e
  sessão isolada pausa/reload/retomada inspecionados. Engines/storage não alterados.
- Revisão independente encontrou quatro P2 e depois dois problemas de entrada/build; todos
  foram corrigidos. Parecer final e workflow remoto ainda pendentes.
- `pnpm test` tentou executar a suíte completa e falhou no sandbox Windows/Edge ao abrir
  perfis temporários IndexedDB (ENOENT), além de detectar falhas de build depois corrigidas.
  Direcionados: PWA/Biblioteca 18/18, produção 3/3, staging 3/3; validação de conteúdo
  3/3 packs; scanner 377 arquivos aprovado. CI e smoke remoto do SHA esperado pendentes.
- Aceite V1–V5/B5 e release V6 não aprovados. Nenhum commit, push ou publicação ocorreu.
  B2–B4/B6/B7 seguem pendentes. Relatório: `docs/design/PLATFORM_IMPLEMENTATION_REPORT.md`.
- B2–B4/B6/B7 da biblioteca permanecem pendentes; a interface já expõe as lacunas reais.

### Publicação Pixel plataforma + Biblioteca — release concluído

- Revisão independente final: favorável à integração local, sem bloqueios de código; release
  depende da suíte integral e do smoke remoto no SHA candidato.
- Verificações direcionadas: PWA/Biblioteca 18/18; validação de conteúdo 3 packs; scanner
  375 arquivos. A suíte Windows completa não passou por limitações de IndexedDB/Edge no
  sandbox; o workflow Pages é o gate completo.
- Catálogo continua planned/pending (TCE-GO 0/45 unidades revisadas); a interface mostra
  explicitamente as lacunas e candidatos não entram no build público.
- Publicado: commit `5e4ab6b5b4c58f6de4467614125a49bfc024fb34`; workflow Pages `37557567793` success, incluindo suíte 186/186, browser gate, scanner, staging e deploy.
- URL: https://engiaceub.github.io/Nivelando_Game/. Metadado público `build-meta.json` confirmou o SHA. HTML, bundle, shell, cenas e estilos novos conferidos por HTTP com cache-bust.
- A aba de inspeção manteve um service worker antigo já instalado; dados locais não foram limpos nem atualização forçada. Smoke interativo em perfil limpo fica pendente de ambiente sem estado antigo.
- Relatório: `docs/design/PLATFORM_IMPLEMENTATION_REPORT.md`.

## Planejamento — conteúdo, escuro, telas e contas — 2026-10-07

- Plano em `docs/CONTENT_DARK_VIEWS_ACCOUNTS_PLAN.md`; ADR 005 proposta.
- Inventário local: 102 flashcards TCE-GO, todos em padrões de resposta genérica e com
  status legado validated; não há schema/validação específica de flashcards no validador.
  Não constitui revisão factual dos 102 itens. Questões: 279 originais do gerador e dez
  com fonte do edital; origem não comprova gabarito nem caracteriza prova anterior FCC.
- Biblioteca: 20 legados, 45 unidades e zero recursos v2 revisados; curadoria pendente.
- Plano de implementação em andamento: auditoria editorial integral, tema escuro único,
  router por hash/view e contas com Supabase Auth, owner local e sync remoto RLS/RPC.
- Migração de progresso é explícita, sem atribuição automática a conta nem mistura de
  mastery global. Sessões/score/retakes/XP/backup/offline entram nos gates de regressão.

### Implementação faseada iniciada — 2026-10-07

- Schema de flashcards e validação opcional por pack adicionados; referências a tópicos
  são conferidas com o currículo. `scripts/content-audit.mjs` identifica templates,
  respostas genéricas, falta de recorte e ausência de parecer por ID.
- Auditoria local: 102/102 flashcards sinalizados para revisão; nenhum foi promovido e
  nenhum gabarito foi declarado validado por heurística.
- A auditoria ampliada sinaliza 289/289 questões com pendências, incluindo metadados
  FCC/ano sem prova identificada, e 20/20 recursos sem revisão editorial/recorte completo.
  Não significa erro comprovado de todos os gabaritos nem indisponibilidade dos links.
- Tema escuro aplicado aos tokens/estados principais; meta theme-color e manifest PWA
  atualizados. Shell mostra uma seção por vez nas rotas hash existentes.
- Cadastro/login/recuperação Supabase e logout implementados no adapter do site. UUID
  separa o IndexedDB e as preferências locais; backup novo identifica owner. Actions
  lê duas variáveis públicas de configuração; nenhuma está configurada neste ambiente.
- Adapter de sync remoto, migration SQL com RLS/RPC, outbox idempotente, detecção de
  conflito e preservação de primeira tentativa foram implementados. Testes unitários
  mockados cobrem o contrato HTTP; a migration ainda não foi aplicada em projeto real,
  portanto autorização/transação permanecem sem validação de integração.
- Revisão factual dos itens e migração assistida de dados ainda não concluídas. Sem
  projeto Supabase e variáveis públicas de build, auth/sync em produção permanecem
  desativados; progresso fica local e separado por UUID no dispositivo autenticado.
- Validação dos 3 packs passou. Suíte completa teve falhas conhecidas de IndexedDB/Edge
  no sandbox Windows; o navegador não iniciou para inspeção visual nem fluxo integrado.
  Testes de auth, namespaces, arquitetura e backup passaram. Deploy desta fase pendente.
- Nenhum deploy desta fase. Conteúdo factual permanece pendente e não há claim de
  inspeção visual em navegador ainda. Sem variáveis, build gera `auth-config.json`
  sem provider e conserva o modo local.

### Revisão factual e curadoria TCE-GO integrada — 2026-10-07

- Revisão integral do legado: 289 questões, 102 cartões e 20 recursos. Pareceres
  independentes em `docs/content-review/QUESTIONS_INDEPENDENT_REVIEW.md` e
  `LIBRARY_INDEPENDENT_REVIEW.md`; decisões por ID em `LEGACY_REVIEW.json`.
- 279 templates rejeitados editorialmente; 102 cartões instrucionais retirados da
  seleção nova. Dez questões substantivas ganharam revisão r2, fonte do gabarito,
  locator e explicações específicas das alternativas; FCC/ano removidos da autoria.
- Banco ativo aprovado: 10 questões originais, 64 novos flashcards e 34 recursos v2,
  com recortes/idiomas/direitos e revisão independente. Drafts e pareceres vinculados
  por SHA-256; nenhuma promoção por heurística. Fonte pública é entregue por link.
- Biblioteca partial: 45 tópicos auditados contra Anexo II pp.19–22, referências
  de escopo incorporadas; decomposição dos objetivos e novo parecer de escopo
  pendentes. Zero unidades com primary/full; 12 tópicos sem item ativo, 35 sem
  questões, 14 sem recursos e 14 sem cartões. A matriz registra os subitens faltantes.
- Normas limitadas aos dispositivos revisados no corte 25/08/2026, publicação
  reportada pela notícia oficial TCE-GO. Não houve auditoria histórica integral de
  normas estaduais, jurisprudência ou consolidados. RAG foi lido somente no resumo.
- Nenhum vídeo aprovado; simulados com templates retirados. Há um treino parcial
  de dez questões, sem claim de prova FCC ou simulado completo de 70 questões.
- `content-history.json` preserva textos/IDs antigos e 16 pools legados. A UI resolve
  IDs de sessões antigas pelo histórico; agenda e sessões novas usam o banco ativo.
  Primeiras tentativas/score/XP não foram reescritos. Tópicos vazios mostram a lacuna.
- 43 testes direcionados passaram: 25 Core/sessões/cobertura, 18 pack/curadoria/
  histórico/empacotamento. Incluem retomada legada, primeira tentativa imutável e
  export/import. Os três packs passaram schemas/factory; audit TCE-GO ativo 0 alertas;
  library-audit 0 erros e complete=false. Scanner de segredos e diff-check passaram.
- Build temporário inclui conteúdo ativo e histórico no cache e exclui candidatos;
  não equivale a offline real em navegador. Não houve inspeção visual ou deploy
  deste lote. TJTO permanece com 3 questões/2 recursos pendentes de revisão factual.
- QA independente da integração parcial aprovado após reinspeção dos artefatos:
  34 recursos/42 associações parciais, 45 unidades e histórico preservado. Ajustadas
  autoria FUNAG, URLs finais RFC e mensagens que distinguem revisão de cobertura
  integral. Hashes registrados no apêndice do parecer da biblioteca.

### Expansão das questões e biblioteca — 2026-10-07

- Os três pareceres independentes aprovaram 35 questões originais novas, uma por
  tópico anteriormente vazio. Integração ativa: 45 questões, 45 tópicos com questão,
  dois treinos parciais (10 e 45 questões). Nenhuma autoria FCC presumida; não há
  claim de cobertura de todos os subitens ou simulado integral de 70 questões.
- Draft, pareceres por ID, hash e baseline congelado em
  `docs/content-review/expansion/`. As dez questões anteriores permanecem idênticas;
  histórico de sessões/primeiras tentativas e score preservado.
- 44 testes direcionados passaram; os três packs passaram schemas/factory.
  Auditoria heurística das 45 questões: zero alertas, complementando os pareceres.
- Biblioteca em expansão: a proposta inicial de 209 unidades preservou os 45
  topicIds. A promoção parcial posterior está registrada abaixo; a revisão de
  fontes segue em andamento e não há declaração `complete`. Integração integral
  continua exigindo auditoria e parecer independente final.
- Relatório: `docs/content-review/expansion/INTEGRATION_REPORT.md`.
  Não houve deploy deste lote ou validação visual/offline real em navegador.

### Biblioteca didática parcial promovida — 2026-10-07

- Biblioteca ativa refinada para 209 unidades nos 45 tópicos, com 167 recursos
  v2. Auditoria: 119 unidades cobertas por recurso primary/full; 90 lacunas
  documentadas; 12 tópicos inteiramente cobertos. Status `partial`, sem claim
  de cobertura integral ou de progresso do estudante.
- Os três pareceres de domínio e a QA independente da integração estão em
  `docs/content-review/expansion/`. A primeira QA rejeitou inconsistência de
  schema e divergência de proveniência; o staging foi corrigido e o candidato
  regenerado foi aprovado para promoção parcial. Parecer não aprova complete.
- `library-history.json` mantém a estrutura e recursos v2 anteriores como
  arquivados. Questões ativas, histórico de conteúdo, sessões, primeiras
  tentativas, score e XP não foram reescritos.
- Pós-promoção: schemas/factory dos três packs válidos; library-audit sem erros,
  `isComplete=false`; content-audit do TCE-GO sem alertas para 45 questões,
  64 flashcards e 167 recursos ativos. Nenhum deploy ou teste de navegador.

### Fechamento de curadoria da biblioteca — 2026-10-08 (em andamento)

- Plano de execução e gates: `docs/content-review/expansion/CLOSURE_PLAN.md`; baseline/ledger de hash e lacunas em `CURATION_BASELINE_2026-10-08.json` e `GAP_LEDGER.json`.
- Candidato não promovido: `STAGED_PACK.json`, SHA-256 `331e2b5f8657457c3b63eb5612ab6599b581465adb291b8b921dd0080d3a2f58`; 169/209 unidades com cobertura `primary/full`, 40 lacunas, 257 recursos; status `partial`.
- A revisão factual acrescentou o OpenBook da Rheinwerk para SOLID/DRY/KISS/YAGNI com idioma alemão, versão 16/Java17, link-only e sem exercícios avaliativos. O status independente continua pendente para o SHA atual.
- B2: 45 tópicos/209 unidades e referências estruturais conferidos; parecer independente item a item ainda não registrado. B3: Desenvolvimento de Sistemas 23/23 e Português 4/13 no piloto configurado.
- Banco ativo e hashes preservados: 45 questões, 64 flashcards e 167 recursos; biblioteca ativa 119/209. Não houve promoção, commit ou publicação nesta etapa.
- Schema/factory/auditoria do candidato e `scripts/validate-content.mjs` passaram; auditoria do candidato permanece parcial. `node --test` ficou em 162/177: 15 testes browser não iniciaram por Chromium Playwright ausente e falhas de inicialização do Edge no ambiente.
- Próximos gates: fechar 40 lacunas com fontes e revisão, obter QA independente do SHA final, repetir browser QA, concluir B5/B6 e dry run factual do segundo pack; só então B7/P1 conforme os runbooks.

### Curadoria candidata — atualização 2026-10-08 05:45 UTC

- O candidato em `docs/content-review/expansion/STAGED_PACK.json` foi atualizado após leitura do curso introdutório Linux LFS101/freeCodeCamp: 171/209 unidades `primary/full`, 38 lacunas e 259 recursos; status continua `partial` e o candidato não foi promovido.
- O curso declara acesso gratuito e licença CC BY 4.0; está em inglês, permanece link-only e traz limitações de conteúdo introdutório/histórico registradas no parecer.
- O ledger e os hashes em `CURATION_BASELINE_2026-10-08.json` foram reconciliados. Recursos/questões ativos e flashcards não foram alterados; QA independente do SHA final segue pendente.

### Curadoria candidata — atualização 2026-10-08 05:47 UTC

- O candidato em `docs/content-review/expansion/STAGED_PACK.json` registra 172/209 unidades `primary/full`, 37 lacunas e 260 recursos; status `partial`, não promovido. SHA-256 atualizado no ledger/baseline de `docs/content-review/expansion/`.
- Foram incorporadas evidências de curso de Linux e guia de modelos cloud/serverless. Idiomas, licença desconhecida no recurso Google Cloud e recortes foram registrados; conteúdo segue link-only.
- Banco ativo e estado do estudante preservados. O candidato exato continua aguardando QA independente.

### Reconciliacao da curadoria em andamento — 2026-10-08

- Hash do candidato atual: `1ec1656fd6cd4490b21120304fa160fa7543252ba26c400100fe9d17e0789d81`. Ele esta `partial` com 172/209 unidades `primary/full`, 37 unidades abertas, 260 recursos e 45 questoes.
- As fontes Linux e Google Cloud foram adicionadas somente no candidato. Auditoria ativa continua com 119/209 unidades e 167 recursos; nenhum conteudo do aluno, banco ativo ou publicacao foi alterado.
- As validacoes de schema/factory/auditoria do candidato passaram. QA independente para o SHA atual e browser QA continuam pendentes; revisao factual prossegue antes desses gates.

### Candidato completo da biblioteca — 2026-10-08 15:25 UTC

- Curadoria do candidato `STAGED_PACK.json`: 209/209 unidades cobertas em 45 tópicos,
  317 recursos link-only, 22 percursos elegíveis e zero lacunas. SHA-256
  `d22ef5dd855a6f23dda7beaecbdd2dac768c63854448589dcf8fefb43bbe3de8`.
- Corrigida a evidência da Lei 20.756: a consolidação PDF consultada tem 218 páginas;
  o parecer delimita os recortes efetivamente lidos e distingue a aplicação subsidiária
  ao TCE-GO das competências do Poder Executivo. A Lei 15.122, art. 2º, §2º, confirma
  a subsidiariedade na redação da Lei 23.500/2025. Fontes oficiais linkadas no candidato.
- Validação automatizada local: schema/factory sem erros; 209 unidades
  cobertas; 22/22 percursos elegíveis; 45 questões idênticas ao banco ativo; histórico
  legado de 289 questões e 102 cartões presente. `scripts/validate-content.mjs` passou
  para os três packs. `scripts/content-audit.mjs`: TCE-GO com zero alertas para 45
  questões, 64 flashcards e 167 recursos ativos.
- Suíte integral executada com Chromium do Playwright e fora do perfil temporário
  restrito: **202/202 passaram**, incluindo IndexedDB, export/import, score/retentativas,
  concorrência e PWA offline. A execução padrão no sandbox não é equivalente: o perfil
  bloqueia criação dos dados do Edge/IndexedDB necessários aos testes de navegador.
- `GAP_LEDGER.json` reconciliado para zero lacunas; `CURATION_BASELINE_2026-10-08.json`
  contém hashes atuais do candidato e do pack ativo. O pack ativo permanece inalterado
  (biblioteca `partial`, 119/209 unidades, 167 recursos); nenhuma promoção ou deploy.
- **QA final independente do SHA atual está pendente**: a aprovação anterior cobre outro
  hash e apenas a promoção parcial. Portanto o candidato não foi promovido. B6/B7 e P1
  seguem condicionados aos aceites do plano, incluindo segunda edição, auditoria de links
  e QA de release. Evidências em `docs/content-review/expansion/`.

### Retomada das lacunas da biblioteca — 2026-10-08 17:11 UTC (reconciliada)

- Estado observado após novas verificações diretas: candidato `STAGED_PACK.json` SHA-256 `d7ef5d2e33a26b14851839da5c7294e9fec7cb731341d18c9572fb95335704f1`, 118/209 unidades cobertas, 91 gaps; 124 recursos ativos elegíveis e 198 links com disponibilidade desconhecida isolados em candidatos.
- A QA independente aprovou somente promoção parcial do hash anterior `7d0b663e…`; a reinspeção para o hash atual está pendente. `completeApproved=false`; não houve promoção. O pack ativo, as 45 questões, 64 flashcards e os dados do estudante permanecem intactos.
- `validate-staged.mjs` passou factory/schema com zero erros. Testes focados nesta atualização: 16/16; a suíte completa segue pendente por falha ambiental de navegador ao acessar localhost (`ERR_NETWORK_ACCESS_DENIED`), mesmo com Chromium autorizado.
- Ainda não estão fechadas: curadoria das 116 unidades, revisão factual completa de questões/cartões, UI/browser B5, auditoria factual do TJTO, manutenção B7 e release/publicação. A biblioteca não pode ser marcada `complete`.

### Atualização de curadoria candidata — 2026-10-08 17:19 UTC

- O candidato da biblioteca está em `docs/content-review/expansion/STAGED_PACK.json`, SHA-256 `3498397638473f0f93ad2a52edd38c0885958f5f3f9eac8e7de97a3ed93c2a4e`: 164/209 unidades cobertas, 45 lacunas, 156 recursos ativos e 2 percursos elegíveis. A unidade de pacotes/publicação recebeu um percurso com quatro fontes atribuídas separadamente.
- Schema/factory passaram; testes direcionados 16/16; os três packs passaram `validate-content.mjs`. A revisão independente do SHA continua pendente. O pack ativo permanece inalterado e `partial`; nenhuma promoção, publicação ou deploy foi feita.
- Permanecem pendentes revisão completa das 45 questões e 64 cartões, 45 lacunas restantes, QA independente do SHA congelado, B5 (UI/browser), B6 (segundo pack), B7 (manutenção) e P1 (release/auth real).

### Atualização de curadoria candidata — 2026-10-08 17:21 UTC

- O candidato `STAGED_PACK.json`, SHA-256 `50029d3cc567ac247a7eccafe6ae206b1f8ca701a5e41abfe890045a905ae39e`, registra 168/209 unidades cobertas, 41 lacunas, 164 recursos e 6 percursos de estudo elegíveis. Novos percursos mantêm publicações e fornecedores em registros distintos.
- `validate-staged.mjs` passou com factory/schema válidos, sem recursos ou percursos inelegíveis, com as 45 questões e o histórico preservados. `validate-content.mjs` passou nos três Exam Packs; testes direcionados: 16/16.
- QA independente do hash atual continua pendente. A biblioteca ativa permanece `partial` sem alteração; não houve promoção, commit, deploy ou publicação. Restam 41 lacunas editoriais e gates B5/B6/B7/P1.

### Correção do gerador de percursos — 2026-10-08 17:22 UTC

- Corrigido `docs/content-review/expansion/stage-expansion.mjs` para reconciliar IDs dos pareceres com IDs canônicos já existentes no Exam Pack ao gerar referências dos percursos. A regression test em `staging-metadata.test.mjs` cobre esse caso.
- O candidato atual é `fe85381bbc417680919ea12b930599df9e03d2846210e2902be727ee1246daf5`: `partial`, 169/209 unidades cobertas, 40 lacunas, 164 recursos e 7 percursos elegíveis. `validate-staged.mjs`, os schemas/factory dos três packs e 17 testes focados passaram.
- QA independente do hash atual pendente; pack ativo e estado de progresso preservados; nenhuma promoção, commit ou publicação realizada.

### Curadoria de REST e ambientes — 2026-10-08 17:24 UTC

- Novas sequências candidatas em `TECH_SOURCES_REVIEW.json` separam a dissertação de Fielding e as referências HTTP MDN; Microsoft, Twelve-Factor e Google Cloud também mantêm URLs/licenças individuais. O candidato ficou com 171/209 unidades cobertas, 38 lacunas e 9 percursos elegíveis (SHA-256 `532708c23056f592ec4a0756539f40157eac91ce4167e8454e0cac824425f9fb`).
- Staging, factory/schema e 17 testes focados passaram; o pack ativo segue sem alteração. QA independente do SHA atual continua pendente; ainda não promover ou publicar como biblioteca completa.

### Curadoria candidata de IA/agentivos — 2026-10-08 17:25 UTC

- A candidata `STAGED_PACK.json` está em `partial`, SHA-256 `828630ece1a373f6bdc83415666312144e49f938f0e597fd27cb0e3903c159d3`: 175/209 cobertas, 34 lacunas, 180 recursos e 12 percursos elegíveis. Fontes de skills/MCP, validação, riscos e LLM foram individualizadas e conferidas em páginas públicas.
- `validate-staged.mjs` passou com schema/factory válidos e questões/histórico preservados; 17 testes direcionados passaram. QA independente deste SHA está pendente e nenhum pack ativo foi promovido ou publicado.

### Curadoria candidata Windows — 2026-10-08 17:28 UTC

- A candidata tem 176/209 unidades cobertas, 33 lacunas abertas, 187 recursos ativos elegíveis e 13 percursos de estudo. A unidade Windows foi fechada no candidato por sete fontes separadas e locators específicos; a disponibilidade humana das páginas Learn permanece ressalvada devido ao banner de autorização observado pelo extrator.
- SHA-256 `54f3aa88f52da55738f43fd7784b36ec497b2d9e1a4f73cb9f58ebee3f874783`; QA independente pendente e `completeApproved=false`. Nenhuma promoção foi feita; o pack ativo permanece `partial`.
- Validação: factory/schema e 17 testes focados passaram; os três packs passaram `validate-content.mjs`. TJTO mantém 3 questões e 2 recursos com alertas editoriais/proveniência conhecidos.

### Curadoria candidata — rotas AD DS/LDAP e segurança — 2026-10-08 17:28 UTC

- Após registrar as URLs revisadas das rotas Windows, AD DS/LDAP e atributos de segurança NIST, o candidato chegou a 178/209 unidades cobertas, 31 lacunas, 192 recursos ativos e 15 percursos elegíveis.
- SHA-256 `547fac9b5a5b2a350640eb77c515cabccc59e2c535197b2f22833c6249f0ffb5`; validação de staging/factory/schema passou sem erros; `completeApproved=false`, QA independente pendente. O pack ativo continua intacto e `partial`.

### Fechamento de cobertura curricular candidata — 2026-10-08 18:34 UTC

- Candidato em `docs/content-review/expansion/STAGED_PACK.json`: 209/209 unidades cobertas, 0 lacunas, 309 recursos elegíveis, 43 percursos elegíveis, 56 recursos com disponibilidade desconhecida isolados como candidatos. SHA-256 `16153f384f00422a2fc7e06044b71a5e854bc85a045102533028426cc3b76eea`; status de biblioteca candidata `complete`.
- O fechamento da unidade ISO/IEC 27000 usa fichas ABNT e ISO consultadas diretamente e guia didático separado. A nota editorial ressalva que não há captura arquivada das fichas no corte exato de 25/08/2026, e não presume adoção brasileira da edição ISO 27000:2026.
- Validação do staging/schema/factory passou; banco candidato preserva 45 questões ativas e histórico de 289 questões/102 cartões. `validate-content.mjs` passou nos três packs. Testes focados: 20/20. Suíte completa: 177/190; 13 falhas de ambiente Chromium/Edge/IndexedDB, a repetir em runtime de browser funcional. TCE-GO sem alertas de conteúdo; TJTO retém cinco alertas documentados.
- Estado ativo permanece `partial` (167 recursos) e intacto. QA independente do SHA atual está pendente; nenhuma promoção, commit ou publicação ocorreu. O status de cobertura não autoriza release nem substitui B5–B7/P1.

### Hash congelado após correção do locator oficial — 2026-10-08 18:35 UTC

A URL da ficha ABNT da Emenda 1:2024 foi ajustada para o endereço efetivamente aberto no navegador. Isso gerou o SHA FINAL `a16a2e28d3eac7e443e7dafdce7c238a98183d44b0af467867dd2d9df060505a`. O último candidato estruturalmente validado segue com 209/209 unidades, 0 lacunas, 309 recursos e 43 percursos elegíveis; 45 questões iguais ao pack ativo e histórico legado preservado. Os 20 testes focados e a validação dos três packs passaram. A QA independente exata foi reiniciada como pendente para este hash. Os 13 casos ambientais da suíte integral (177/190) seguem para repetição quando Chromium/Edge/IndexedDB estiverem disponíveis.

### Correção final de proveniência — 2026-10-08 18:36 UTC

Retificação: a variante `www` não corresponde ao endereço da aba que foi aberta. O parecer e o candidato foram regenerados usando a URL efetivamente observada sem `www`. SHA vigente: `4597f81f942cbf205f7ec3dbfca8349f89d684a41ea44a72ba2b7ef11140f639`; 209/209 unidades, 0 lacunas, validação estrutural válida. QA independente exata pendente; nenhum conteúdo promovido.

### Promoção da biblioteca local — 2026-10-08 18:38 UTC

A QA independente aprovou `complete` no SHA `4597f81f942cbf205f7ec3dbfca8349f89d684a41ea44a72ba2b7ef11140f639`; a biblioteca local foi promovida pelo runbook. Estado ativo: 209/209 unidades, 45/45 tópicos, 309 recursos, zero lacunas. O catálogo anterior foi arquivado em `library-history.json`; questões (45), cartões (64) e progresso do estudante permanecem preservados. `library-audit --require-complete`, validação de conteúdo e auditoria TCE-GO passaram. O validador de candidatos foi corrigido para auditar recursos ativos e candidatos juntos. O build standalone local foi regenerado. Suíte integral: 177/190, com 13 falhas ambientais de Chromium/Edge/IndexedDB. Nenhum commit, push, deploy ou publicação. A auditoria TJTO (3 questões, 2 recursos), B5, B6 e B7 continuam em etapas próprias; veja `CLOSURE_PROGRESS.md`.

### Atualização final da rodada — 2026-10-08 18:42 UTC

B4 e promoção local passaram; B6 factual subgate TJTO passou QA independente e validações (7/7 testes F11, 3 packs válidos, zero alertas TCE-GO/TJTO). B7 já tem runbook com ciclos de 30/90 dias e rollback editorial; falta indicar pessoa nominal. A inspeção B5 do build local não foi possível: a política do navegador recusou file:// e proibiu contorno por servidor/execução indireta. Para prosseguir B5 é necessária uma URL HTTPS de staging autorizada. P1/publicação não foi executado.

## Situação no encerramento desta rodada — 2026-10-08 18:45 UTC

A biblioteca TCE-GO foi curada, aprovada independentemente e promovida localmente como `complete` (209 unidades, 45 tópicos, 309 recursos, 43 percursos). O subgate factual TJTO também fechou seus cinco alertas com QA independente e auditoria zero. O teste F11 do TJTO passou 7/7; os três packs validam; TCE-GO/TJTO têm zero alertas no content audit. `library-audit --require-complete` passou. A suíte integral marcou 177/190: os 13 casos restantes não iniciam Chromium/Edge/IndexedDB no ambiente atual.

Pendências para concluir o plano integral: B5 precisa de URL HTTPS autorizada para smoke visual e offline (o browser-use bloqueou file:// e vedou workaround local); B6 integrado depende de B5 e de validar persistência/navegação no segundo pack; B7 precisa nomear indivíduo mantenedor. P1, commit, push e publicação não foram executados nesta rodada. A decisão completa de cobertura não deve ser confundida com release do site.

## UX P0 — flashcards, aceite 2026-10-08
P0 aprovado no escopo de qualidade do deck ativo e preservação histórica. QA independente conferiu 64/64 cartões contra o parecer assinado e 102/102 históricos; 18/18 testes direcionados e schemas dos três packs passaram. Site publicado conferido no build fd712248d3dd-20261008190857602: catálogo de 64 aprovados, sessão nova por tópico com resposta substantiva, Enter, desktop e viewport 390 pixels. Relatório e limites: docs/UX_P0_ACCEPTANCE.md; imagem: docs/UX_P0_MOBILE.jpg. Nenhum deploy ou alteração de conteúdo nesta etapa. Não equivale a cobertura integral, novo gate offline de release ou pesquisa longitudinal. P1 não iniciado.

## UX P1 — continuidade, 2026-10-08
Retomada em Questões após reload implementada; listagem de Hoje atualiza após pausa. Teste focal em contexto descartável passou, preservando respostas, cursor, score, eventos de resposta e XP. Suíte completa 210/210; schemas de três packs e security scan aprovados. Gate amplo browser: 20 verificações funcionais aprovadas; metadata local requer regeneração com commit exato. QA final/publicação/smoke remoto pendentes. Evidências: docs/UX_P1_CONTINUITY.md e docs/UX_P1_RESUME_EVIDENCE.json. P1 biblioteca não promovido nesta etapa.

P1 continuidade: QA independente aprovado; gate amplo repetido 21/21 com SHA base correto (árvore local modificada). Publicação e smoke remoto ainda pendentes.

P1 continuidade concluído: Pages37846025510 success; commit09418a7 remoto conferido; smoke publicado aprovado.

## UX P1 — aceite final 2026-10-08
Continuidade publicada09418a7, Pages37846025510 success, smoke remoto aprovado. Biblioteca ativa já integrada:209/209 unidades,309 recursos,43 percursos; auditoria require-complete sem lacunas e QA independente conferido. Teste local/remoto da biblioteca aprovou filtros, teclado,390/1280, catálogo offline e score/XP invariantes. Suite210/210 após rebuild; schemas3packs. Detalhes/limites docs/UX_P1_ACCEPTANCE.md. P1 UX concluído; não declara B6/segundo pack ou B7; P2 não iniciado.
