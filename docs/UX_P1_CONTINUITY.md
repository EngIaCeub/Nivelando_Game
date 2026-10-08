# P1 UX — continuidade e retomada

Data: 2026-10-08. Estado: validação local concluída; publicação e smoke remoto pendentes.

## Problema e correção

Após reload em Questões, a lista de sessões pendentes existia somente em Hoje. A correção mostra também em Questões as sessões de quiz/simulado e leituras pendentes. Os botões usam openSession/showTheory existentes. Não altera storage, schema, respostas ou regras de score/XP. Pausa de questão/flashcard e leitura atualiza a listagem em Hoje. O painel não é inserido sobre uma atividade ativa.

## Validação

- `node scripts/p1-resume-check.mjs`: contexto de navegador descartável e dados sintéticos. Resposta registrada no treino, reload direto em #questions, retomada por Enter; respostas, cursor, scores, eventos question_answered e xp-awards preservados. Avanço ao cursor 1, pausa, reload em Hoje e retomada preservados. Viewport 390×844 sem overflow.
- Não se exige igualdade de todos os eventos: activity_resumed é registro legítimo de uma retomada. Eventos de resposta e recompensas não podem duplicar.
- 13 testes direcionados de sessão, roteamento e histórico aprovados.
- Suíte completa: 210/210 passaram, zero skips, incluindo checks de PWA/offline, fencing e backup.
- Schemas/factory: três packs aprovados. Security scan: 482 arquivos; aprovado. git diff --check aprovado.
- Screenshot UX_P1_RESUME_MOBILE.png inspecionado: CTA legível e utilizável em viewport estreito. A pausa mantém também o botão direto da sessão atual; a lista oferece identificação do treino pendente.

## Limites

Evidência sintética, sem validação longitudinal com usuários. O cenário browser focado usa pool de treino de dez questões; não é uma prova completa. A renderização de leitura foi corrigida, mas o smoke focado não exercita seu fluxo completo. A suíte antiga o4-study-browser não foi usada como aceite, pois contém seletores incompatíveis com views modulares; o teste específico acima é reproduzível.

P1 biblioteca é gate separado e não foi promovido por esta correção.

## Parecer e gate local
QA independente /root/p1_review (GPT-6.1 Sol/high): aprovado no escopo de continuidade local, sem bloqueantes. Browser independente adicional abortado por sandbox; parecer baseado em inspeção e evidências reproduzíveis do coordenador. Gate amplo repetido com metadados Git: 21/21 aprovado; inclui offline, upgrade, backup, teclado e layouts. O SHA base no relatório identifica a árvore base com alteração local (checkoutDirty); publicação será conferida pelo SHA do novo commit e smoke remoto.
