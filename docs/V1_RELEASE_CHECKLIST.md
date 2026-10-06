# StudyOS V1.0 — Release checklist

## BLOCKER

- [x] Suíte completa do candidato integrado: 177/177 em 2026-10-06,
      zero falhas/skip; coordenação por comando integrada.
- [x] Build de produção sem `STAGING`/`PREVIEW BUILD`.
- [x] Metadata de app, build, commit, timestamp, canal, pack/schema/storage presentes.
- [x] Base path e PWA relativos.
- [x] Service worker com atualização adiada, bridge legada explícita e limpeza restrita ao escopo StudyOS.
- [x] Backup/restore protege writers obsoletos; snapshot e preferências coerentes entre abas.
      Regressões locais e QA independente Sol 6.1/high aprovados.
- [x] Reset protegido por confirmação explícita.
- [x] Score da primeira tentativa imutável; regressões para concorrência, replay de retentativa e XP idempotente.
- [x] Core sem conteúdo específico de edital.
- [x] Scan de secrets sem achados.
- [ ] Deploy e smoke remoto da V1 pendentes.
- [x] Fluxos operacionais diagnóstico, flashcards, simulado, revisões e analytics.
- [x] Browser real local: offline, mobile, teclado, restore repetido e upgrade O3→V1.
      20/21; único FAIL é SHA local, que exige deploy do commit definitivo.
- [x] Reavaliação independente `gpt-6.1-sol/high` aprovada sem blocker; revisão corrigiu
      preferência entre abas, e concluiu 177/177 com 160 exports concorrentes.

## WARNING

- [x] Recursos externos dependem de internet; conteúdo local permanece disponível offline.
- [x] O banco atual é carregado como payload único; o contrato de pack está versionado.
- [x] Pools e seleção de simulados estão no pack; a UI dedicada permanece simples.

## INFO

- [x] Guia de usuário e release notes preparados localmente; publicação V1 pendente.
- [x] Staging permanece disponível como ferramenta de prévia, não como artefato V1.
