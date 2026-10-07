# StudyOS V1 — Operational Roadmap

## O1 — Diagnóstico inicial e perfil de domínio

Objetivo: estimar domínio por `canonicalConceptId`, reutilizar mastery entre Exam Packs,
manter progresso curricular namespaced por `examId` e recalcular prioridades de forma explicável.

Status: concluído e aprovado.

## O1.5 — Staging preview no GitHub Pages

Objetivo: preparar e publicar, após autenticação e remote disponíveis, uma prévia real do
TCE-GO identificada como `STAGING / PREVIEW`, com diagnóstico técnico, base path, PWA,
offline e validação browser.

Status: concluído e aprovado no O1.5; publicação real validada no GitHub Pages.

## O2 — Dashboard Hoje e planner adaptativo

Objetivo: expor a fila diária, o resultado do diagnóstico, revisões vencidas e plano adaptativo
em uma experiência operacional integrada.

Status: concluído e aprovado; baseline publicado preservado.

Relatório: `docs/O2_TODAY_PLANNER_REPORT.md`.

## O3 — Expansão de conteúdo real do TCE-GO

Objetivo: ampliar questões, recursos autorizados e trilhas de estudo do pack TCE-GO com
proveniência e QA contínuos.

Status: concluído e aprovado; tag `o3-content-stable` preservada como baseline.

Relatórios: `docs/O3_CONTENT_BASELINE.md` e `docs/O3_CONTENT_REPORT.md`.

## O4 — Release real no GitHub Pages

Objetivo: publicar o standalone validado, configurar automação de deploy e observar base path,
offline e integridade dos assets em produção.

Status: concluído e aprovado em 2026-10-06. Commit `44d3d06725354d5a737588ac51aca88afc2a4a00`,
tag `v1.0.0`, Actions verde e smoke remoto 21/21 no GitHub Pages.
Relatório: `docs/O4_PRODUCTION_RELEASE_REPORT.md`.

## O5 — Validação sintética e hardening operacional

Objetivo: executar jornadas sintéticas automatizadas para identificar riscos operacionais em
acessibilidade básica, persistência e performance, preservando os contratos do Core.

Status: concluído em 2026-10-06 para o escopo sintético aprovado.
Validação automatizada com três perfis sintéticos isolados e revisão independente `gpt-6.1-sol/high`;
não representa acompanhamento longitudinal nem uso por estudantes humanos.
Plano, limites e evidência automatizada (sem alegação de estudo humano longitudinal):
`docs/O5_OPERATIONAL_HARDENING_REPORT.md`.

Regra de fase: não criar novos gates arquiteturais Fxx durante StudyOS V1.

## Biblioteca didática — B1–B7

B1 arquitetura incorporada; B2 escopo, B3 piloto, B4 curadoria, B5 interface,
B6 aceite integral/segundo pack e B7 manutenção permanecem pendentes.
Ordem e critérios: `docs/DIDACTIC_LIBRARY_PLAN.md`. São milestones de conteúdo,
não novos gates Fxx. Aprovação de O3 não significa completude pedagógica da biblioteca.
