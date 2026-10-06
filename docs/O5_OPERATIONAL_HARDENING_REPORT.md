# O5 — Operational hardening

Status em 2026-10-06: **PASS para o escopo sintético**; revisão independente `gpt-6.1-sol/high` aprovada.

## Escopo e privacidade

O5 observa jornadas automatizadas na publicação de produção usando perfis novos e isolados de
navegador. Não usa contas, dados pessoais ou dados de estudantes. O teste não envia telemetria;
requests a origens de terceiros falham o gate. Esta execução não é estudo longitudinal com pessoas.

## Critérios automatizados

- Confirmar SHA e metadata (versão, canal, examId, schemas e storage) da versão pública esperada.
- Três contexts isolados começam sem score/mastery herdados; cada um usa meta diária diferente.
- Validar language/main, IDs únicos, nomes acessíveis em botões/inputs, foco por teclado e
  ausência de overflow em desktop/mobile.
- Responder uma questão, criar retentativa, pausar, recarregar e retomar. Score da primeira
  tentativa, XP e sessão devem permanecer idênticos; retentativa fica registrada separadamente.
- Coletar tamanho codificado/decodificado e DCL sem declarar esses poucos samples como SLO de campo.
- Zero erro crítico de console, erro HTTP ou request externo; validar navegação offline via SW.
- QA independente `gpt-6.1-sol/high` antes de encerrar O5.

## Execução repetida

Harness: `scripts/o5-operational-check.mjs`.
Resultado: `docs/O5_SYNTHETIC_USAGE_EVIDENCE.json`.

URL: https://engiaceub.github.io/Nivelando_Game/
Commit medido: `44d3d06725354d5a737588ac51aca88afc2a4a00`
Metadata: build `44d3d0672535-20261006041614644`; app 1.0.0; examId `tce-go-ti-2026`; storage 2.

Resultado: **3/3 perfis passaram**. Metas 60/90/120 minutos sobreviveram a reload; os três
perfis iniciaram sem dados herdados, preservaram integralmente o score inicial após retentativa,
XP e sessão após reload/retomada, e mantiveram snapshot persistente (preferências, score, mastery,
planner, retentativas, awards e sessão) após recarga offline servida pelo Service Worker. Metadata
inclui SHA, build ID/timestamp, versão da aplicação, canal, examId, versão do pack, schema e storage.
Viewports desktop e mobile passaram verificações básicas de estrutura, nomes e overflow/foco.
Zero erros de console/HTTP e nenhuma request a terceiros observada.

Performance observada por contexto nesta execução headless: 1,077,247 bytes decodificados,
100,769 bytes codificados de recursos e DCL 80–126 ms. São amostras locais de navegador/cache,
não representam transferência total, latência, Core Web Vitals ou experiência real de usuários.

## Limitações explícitas

- Validação é sintética; não demonstra estudo longitudinal nem uso real por estudantes.
- Acessibilidade é uma checagem automatizada básica, não auditoria WCAG completa nem jornada
  integral de teclado.
- Um contexto valida navegação offline após cache provisionado; não mede primeira instalação offline.
- Ausência de requests externos observados nesta jornada não prova ausência de todo canal possível
  de telemetria.
- Amostras de performance não são SLO nem métricas de usuários reais.

## Próximo passo

Revisão independente `gpt-6.1-sol/high`: **PASS**, 3/3 perfis e zero falhas. A evidência não
estabelece validação humana ou uso real; a comparação offline cobre os campos selecionados, não
todo o banco, e o cálculo do score não foi recalculado independentemente.
