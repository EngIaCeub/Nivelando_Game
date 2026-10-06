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

Status: em correção após reprovação independente Astra; publicação, smoke remoto e tag
`v1.0.0` dependem da resolução de todos os blockers.

## O5 — Validação em uso real e hardening

Objetivo: observar uso real, corrigir problemas de acessibilidade, persistência, performance e
conteúdo, preservando os contratos do Core.

Status: autorizado pelo usuário em 2026-10-03; executar somente após aprovação O4.
Validação automatizada com estado isolado e revisão independente `gpt-6.1-sol/high`; não representa
acompanhamento longitudinal de estudantes humanos.

Regra de fase: não criar novos gates arquiteturais Fxx durante StudyOS V1.
