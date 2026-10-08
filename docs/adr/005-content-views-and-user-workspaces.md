# ADR 005 — Conteúdo editorial, views e workspaces por usuário

Data: 2026-10-07. Status: **proposta**, pendente da implementação e revisão arquitetural.

## Contexto

O usuário solicita validação dos conteúdos/flashcards, tema escuro único, uma tela por
vez e login com progresso separado. A V1 usa uma página longa e storage por concurso;
mastery global pertence ao navegador. Flashcards não passam por schema específico e
os 102 cartões TCE-GO usam respostas genéricas apesar do status legado validated.

Plano executável e baseline: `../CONTENT_DARK_VIEWS_ACCOUNTS_PLAN.md`.

## Decisão proposta

1. Separar validade estrutural, origem, disponibilidade e aprovação factual. Acrescentar
   contrato/schema editorial para cartões e versionar itens usados por sessões.
2. Evoluir os tokens compartilhados para tema escuro único; manter arte original e
   componentes existentes. Não adicionar dependência de tema no engine de aprendizagem.
3. Router genérico por hash com uma view ativa, guard de sessão e ciclo de vida por módulo.
   Manter deep links e base path relativo do GitHub Pages.
4. IdentityProvider/OwnerStorage genéricos; Supabase é provider proposto no adapter de site.
   Login recomendado: e-mail/senha com nome de exibição, confirmação e recuperação.
5. Owner UUID define banco local; examId e mastery global continuam dentro do workspace
   dessa pessoa. Identidade é fixa no lifetime da instância de storage.
6. Nuvem usa snapshot versionado e RPC com comparação de revisão, receipts idempotentes e
   ledger de primeiras tentativas. Não substituir transações locais por chamadas REST
   soltas nem sobrescrever snapshots concorrentes silenciosamente.
7. Migrar legado por cópia validada e escolha do titular. Não associar dados ao primeiro
   login automaticamente. Restore/reset remoto preservam ledger e têm contrato próprio.

## Alternativas consideradas

- Usuário/senha apenas no frontend: não autentica o acesso remoto nem protege dados entre
  contas; descartado para a promessa de conta real.
- Backend próprio completo: possível, mas exige operação de autenticação, recuperação,
  banco e sessões; comparar se já houver infraestrutura adequada.
- Reescrever engines/framework durante redesign: não justificado pela mudança visual.
- Sincronização com last-write-wins: pode perder respostas e restaurar snapshots antigos;
  descartada sem reconciliação e evidência de preservação dos invariantes.

## Consequências e gates

Atualizar PRODUCT_SPEC/contratos de identidade, sync, storage/backup somente junto à
implementação versionada. Auth e sync tornam a mudança COMPLEX e introduzem infraestrutura
externa. Definir configuração de provider/SMTP e acesso ao projeto antes de provisionar.
Tema/router podem ser entregues primeiro. Conteúdo novo exige revisão factual; login
exige autorização RLS/API testada entre A/B, migração, offline, concorrência e restore.
Provar segundo pack e QA independente antes de declarar aceite final.

Esta ADR não habilita auth, não aprova fonte/cartão e não altera contrato ativo de storage.
