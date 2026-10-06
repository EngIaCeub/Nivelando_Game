# Status

Arquitetura: Factory genérica
Primeiro Exam Pack: TCE-GO TI 2026
Fase atual: StudyOS V1 — Operationalization
Último gate aprovado: F11

Resumo operacional atual (2026-10-06): O1–O4 aprovados; O4 publicado e marcado `v1.0.0`.
O5 é o próximo gate operacional e ainda não começou.

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
- O5 permanece pendente de início; O4 está formalmente encerrado.
