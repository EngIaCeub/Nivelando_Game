# StudyOS V1.0 — Release checklist

## BLOCKER

- [x] Suíte completa verde.
- [x] Build de produção sem `STAGING`/`PREVIEW BUILD`.
- [x] Metadata de app, build, commit, timestamp, canal, pack/schema/storage presentes.
- [x] Base path e PWA relativos.
- [x] Service worker versionado e caches obsoletos removidos com segurança.
- [x] Backup JSON validado e backup automático antes de restore.
- [x] Reset protegido por confirmação explícita.
- [x] Score histórico, mastery e XP preservados.
- [x] Core sem conteúdo específico de edital.
- [x] Scan de secrets sem achados.
- [ ] Deploy e smoke remoto da V1 ainda pendentes até a publicação deste commit.

## WARNING

- [x] Recursos externos dependem de internet; conteúdo local permanece disponível offline.
- [x] O banco atual é carregado como payload único; o contrato de pack está versionado.
- [x] Pools e seleção de simulados estão no pack; a UI dedicada permanece simples.

## INFO

- [x] Guia de usuário e release notes publicados.
- [x] Staging permanece disponível como ferramenta de prévia, não como artefato V1.
