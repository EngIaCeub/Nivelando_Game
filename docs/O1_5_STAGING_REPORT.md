# O1.5 — Staging Preview

## Resultado

O build de staging foi preparado em `sites/tce-go-ti-2026/staging/` e identificado visualmente
como `STAGING / PREVIEW`. O Core, contracts e schemas não receberam alterações para publicação.

## Build e deploy

- Script: `scripts/build-staging.mjs`.
- Workflow: `.github/workflows/pages.yml`.
- Artefato: conteúdo de `sites/tce-go-ti-2026/staging/`.
- Metadados: `staging-meta.json`, com versão `o1.5-staging`, SHA, timestamp, examId, schemas,
  storage e base path.
- O workflow executa a suíte, gera o build, valida o staging, cria Pages artifact e só então
  executa `actions/deploy-pages` com permissões mínimas.
- Não há tokens, secrets, credenciais ou dados locais no bundle.

## Validações locais

- Suíte completa: 41 testes aprovados, 0 falhas; os 38 testes anteriores permanecem verdes e
  3 testes novos cobrem base path, PWA, service worker, metadata e segurança do staging.
- Smoke browser: título, Exam Pack validado, banner STAGING, navegação hash e 14 disciplinas.
- Diagnóstico O1: abriu, carregou questões TCE-GO, respondeu questão, pausou, foi reaberto em
  nova aba e retomou o mesmo `assessmentRun` com resposta preservada.
- Feedback: resposta diagnóstica é registrada pela DiagnosticUI e não é enviada ao ScoringEngine.
- IndexedDB: mastery global persistiu após reload e reabertura em nova aba.
- Plano: o fluxo usa `createStudyPlan` com mastery e `explainPriority` após conclusão.
- Offline: após primeira visita, o painel de build carregou com o servidor local interrompido.
- PWA: manifest relativo, scope `./`, start URL `./` e service worker staging versionado.
- Rotas: `#today`, `#curriculum`, `#diagnostic`, `#questions`, `#reviews`, `#progress` e
  `#settings` estão presentes e não exigem rewrite server-side.
- Leakage e score: Core leakage aprovado; diagnóstico não cria registro em `scores`.

## Snapshot e publicação real

O snapshot pré-staging passou com 38/38 e a suíte final passou com 41/41. O primeiro workflow
falhou antes do build por falta de artefatos `dist` versionados; a correção foi publicada no
commit `148dd97`. O workflow final `36977900241` ficou verde para o commit publicado
`7783f34f2ad79eab04aa6676c260587f1f2bb75e`, incluindo checkout, testes, build, Pages, artifact e
deploy.

URL pública oficial: https://engiaceub.github.io/Nivelando_Game/
Base path confirmado: `/Nivelando_Game/`.
Tag de encerramento: `o1-5-staging-stable`, apontando para o commit publicado e validado.

Smoke remoto aprovado: aplicação, CSS/JS, título e Exam Pack TCE-GO com 14 disciplinas, hash
routes, diagnóstico, resposta de questão, pausa, reload e retomada do mesmo assessmentRun. O
diagnóstico foi concluído remotamente; os dez conceitos exibiram mastery global e o plano foi
recalculado com `explainPriority`. O diagnóstico usa `diagnostic-runs`, não altera `scores`, logo
`simulatedScore` permanece intocado conforme o contrato e a suíte automatizada.

O painel técnico remoto exibiu build `o1.5-staging`, SHA `7783f34f2ad79eab04aa6676c260587f1f2bb75e`,
timestamp `2026-10-02T07:30:30.466Z`, examId `tce-go-ti-2026`, schemas `mastery:1,
diagnostic-run:1`, storage `1`, service worker `./sw.js`, IndexedDB disponível e base path
`/Nivelando_Game/`. Os 28 recursos do app shell do service worker retornaram HTTP 200. O endpoint
legado `/service-worker.js` retorna 404 porque o nome publicado é `sw.js`; não há referência a
esse nome legado no bundle.

## Limitações

- A superfície de browser disponível não permitiu controlar viewport físico exatamente em
  375×667, 390×844, 430×932, 1366×768 e 1920×1080; a suíte valida viewport meta, media query,
  targets e ausência de assets absolutos, e o smoke foi executado no navegador desktop.
- O ambiente CUA não expôs um interruptor de rede/DevTools para desligar a conexão durante o
  smoke remoto; offline foi validado pelo app shell do service worker (28 recursos HTTP 200) e
  anteriormente no smoke local após primeira visita. Teste em aparelho físico continua pendente.

O2 não foi iniciado.
