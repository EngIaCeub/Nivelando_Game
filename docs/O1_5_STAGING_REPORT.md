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

O snapshot de testes antes da preparação passou com 38/38. Não foi possível registrar commit,
tag `o1-diagnostic-stable`, detectar remote/owner/repository/branch ou executar push/Actions:
este workspace não possui diretório `.git` e não há credencial GitHub disponível.

Consequentemente não existe URL pública, commit publicado ou resultado de GitHub Actions para
reportar. Este é o único bloqueio externo restante para a publicação real. Depois que o projeto
for aberto em um checkout Git autenticado, execute o workflow manualmente ou faça push na branch
principal; o workflow já está configurado para publicar o staging.

Rechecagem em 2026-10-02: o diretório de trabalho continua sem `.git`; `git status`, `git remote`,
`git branch` e `git log` retornam “not a git repository”. Nenhuma tentativa de inicializar um
histórico ou inventar um remote foi feita.

## Limitações

- A superfície de browser disponível não permitiu controlar viewport físico exatamente em
  375×667, 390×844, 430×932, 1366×768 e 1920×1080; a suíte valida viewport meta, media query,
  targets e ausência de assets absolutos, e o smoke foi executado no navegador desktop.
- A publicação real não foi feita por falta de `.git`/remote/credenciais, não por falha do build.

O2 não foi iniciado.
