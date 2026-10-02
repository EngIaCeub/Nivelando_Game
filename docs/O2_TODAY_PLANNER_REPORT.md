# O2 — Dashboard Hoje e planner adaptativo

Status: aprovado; publicado e validado remotamente em 2026-10-02.

## Escopo

O2 adiciona uma entidade genérica `TodayPlan`, namespaced por `examId` e data. O plano é determinístico, limitado ao orçamento diário e preserva atividades concluídas durante uma replanificação. A implementação não contém nome, peso ou regra específica do TCE-GO.

## Priorização explicável

Cada tópico recebe uma prioridade versionada (`today-v1`) composta por sinais normalizados:

`0,24·urgência + 0,18·importância + 0,18·lacuna de mastery + 0,12·confiança baixa + 0,10·erros recentes + 0,08·retenção/revisão + 0,06·dependências + 0,04·ritmo`.

O resultado recebe bônus de diversidade de disciplina e é truncado pelo orçamento em minutos. As razões gravadas na atividade informam apenas fatores observados no estado: revisão vencida, erro recente, mastery baixo, confiança baixa, proximidade da prova, dependência pendente, ritmo e balanceamento de disciplina.

## Operação

- Orçamentos predefinidos de 30, 60, 90 e 120 minutos e valor personalizado.
- Fila de teoria, questões, revisão e revisão de erros, com `questionIds`, `reviewIds` e `resourceId` quando aplicável.
- Início, pausa, retomada e conclusão persistidos; `actualMinutes` é usado no saldo quando fornecido.
- Replanejamento preserva concluídos e redistribui somente o saldo; dias perdidos entram como prioridade gradual, sem duplicar o orçamento.
- `ESTUDAR MAIS` cria atividade opcional persistida e não altera a meta original.
- Sequência diária usa limiar configurável de conclusão e não é acionada por abertura, refresh ou tempo ocioso.
- Visão semanal, métricas de cobertura/mastery/questões/revisões, XP e countdown da prova.

## Persistência e contratos

Foram adicionados `schemas/today-plan.schema.json` e `schemas/activity-state.schema.json`. Export/import agora preserva coleções namespaced, planos e estados de atividade, mantendo compatibilidade com campos legados. Eventos genéricos: `today_plan_generated`, `activity_started`, `activity_paused`, `activity_resumed`, `activity_completed`, `today_plan_rebalanced`, `daily_goal_completed` e `extra_study_started`.

## Validação

Suíte local: 52 testes aprovados, 0 falhas. O workflow GitHub Actions #12
(`36983657539`) concluiu com sucesso para o commit `44dddca4c32bea186214ca66844ae4ecd64a731e`.

Smoke remoto aprovado em [https://engiaceub.github.io/Nivelando_Game/](https://engiaceub.github.io/Nivelando_Game/):

- o shell, assets, Exam Pack e base path carregaram;
- hash route `#questions` funcionou;
- o Dashboard Hoje exibiu meta de 120 minutos, agenda, prioridade explicável e ação `COMEÇAR`;
- uma questão foi respondida e concluída; a agenda passou para `completed`, mastery/cobertura
  foram atualizados e o próximo item foi replanejado;
- reload preservou a atividade concluída via IndexedDB;
- manifest relativo e service worker foram carregados; o cache publicado contém o script
  versionado `site-app.js?o2=1`;
- não foram observados erros críticos no smoke.

O motor local também validou pausa/retomada, XP idempotente, simulatedScore imutável,
export/import e isolamento por `examId`. A página remota de diagnóstico confirmou os
checks de score, retentativa, XP e export/import; o check sintético de IndexedDB dessa
página requer estado previamente criado por ela e não substitui a persistência observada
no fluxo Hoje.

Tag de encerramento: `o2-today-planner-stable`, apontando para o commit publicado e validado.

Limitação: não há controle de rede offline exposto pelo navegador automatizado nesta execução;
o contrato do service worker/cache foi validado estaticamente e pelos testes automatizados.

Limitação conhecida: o diretório `sites/tce-go-ti-2026/dist/` legado está bloqueado por um processo externo neste ambiente; o build é reproduzível em checkout limpo pelo workflow.
