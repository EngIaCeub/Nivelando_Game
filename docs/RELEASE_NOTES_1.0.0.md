# StudyOS V1.0.0

- Dashboard Hoje com plano adaptativo, revisões, mastery, XP e analytics locais.
- Diagnóstico inicial pausável e persistente.
- Pack TCE-GO TI 2026 com 45 tópicos, 289 questões, 102 flashcards, 16 simulações,
  20 recursos e 1 vídeo verificado.
- PWA instalável em `/Nivelando_Game/`, com shell e conteúdo empacotado offline após a primeira carga.
- Metadata de build e versão formal `1.0.0` no canal `production`.
- Exportação/importação de backup JSON e reset protegido.

O progresso é local em IndexedDB, namespaced por Exam Pack. Não há telemetria externa nem
envio automático de progresso. Recomenda-se exportar um backup regularmente.

Limitações conhecidas: o volume de questões P1/P2 segue a cobertura progressiva do O3, e o
payload atual é carregado integralmente no primeiro uso.
