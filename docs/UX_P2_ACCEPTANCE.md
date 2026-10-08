# UX P2 — Plano e clareza dos títulos

Data: 2026-10-08. Checkout canônico: `C:\CodexProjects\Nivelando_Game`.
Estado: P2 concluído, publicado e conferido remotamente.

## Entrega

Plano apresenta a mesma agenda de Hoje, tempo disponível, minutos estimados, estados, motivos e ações por atividade. Iniciar/retomar reutiliza startActivity/openSession; mudanças de meta reutilizam a transação existente. Pausa de leitura ou questões atualiza ambas as telas. Concluídas/ignoradas não oferecem reinício; ausência de material tem indicação e acesso à biblioteca.

Os 45 tópicos do pack receberam displayTitle, opcional no schema genérico. Hoje, Plano, cabeçalho de Questões e filtro/cabeçalho da Biblioteca usam o título curto. Currículo completo continua em expansões nativas acessíveis. Os campos originais e IDs foram comparados contra Git e permanecem idênticos. run.title persistido continua intacto; runTitleFor é somente apresentação.

## Validação por etapa

1. Orientação Plano: smoke e QA independente aprovados antes dos títulos.
2. Títulos: schema dos três packs aprovado; 45 títulos distintos; comparação integral dos campos originais aprovada; QA independente aprovado. Guarda de tópico ausente recomendada pelo QA aplicada.
3. `scripts/p2-plan-check.mjs`: Hoje/Plano equivalentes, mudança de minutos nas duas telas, início por Enter, resposta, pausa, reload e retomada preservando cursor/respostas/score/XP. Fixtures isolados: vazia, concluída sem reinício e sem material. Títulos em quatro telas e currículo completo por Enter. Plano com sessão pendente carrega via service worker offline.
4. Screenshots 390 e 1280 inspecionados: ação principal legível, título específico, duração e detalhes separados, sem overflow.
5. Suíte completa 210/210 aprovada. Security scan: 496 arquivos. Gate de release repetido após adaptar seletores ao controle de minutos em duas views e incluir a nova expansão de detalhes na sequência de teclado; assertions de score/persistência permanecem.

Pareceres: /root/p1_review, GPT-6.1 Sol/high, read-only QA/Architect, orientação e títulos aprovados localmente. Evidências: UX_P2_PLAN_BROWSER.json, UX_P2_RELEASE_BROWSER.json, UX_P2_PLAN_390.png e UX_P2_PLAN_1280.png.

## Limites

Evidência sintética em contextos descartáveis, sem pesquisa com usuários ou validação longitudinal. Casos vazia/concluída/sem material são fixtures de apresentação, não dados reais. Tempo é estimativa da agenda; não representa medição de tempo ativo. A mudança não altera engines, pontuação, schema de storage ou dados históricos. Publicação só será declarada após pipeline e smoke remoto.

## Gate local final
Release browser21/21 aprovado, inclusive layouts375/390/430/1280, teclado com expansão de detalhes, offline, migração O3 e export/import round-trip. Relatório identifica SHA base a53e83e com árvore modificada; CI reconstruirá o commit publicado.

## Publicação e smoke remoto
Commit497fbb21a23700f9d53437db7a8ca12c5ce15988 conferido no build-meta público. Pages run37848531627: build/deploy success, incluindo suíte e gate de navegador no commit exato. Smoke P2 repetido em https://engiaceub.github.io/Nivelando_Game/: todos os cenários passaram, inclusive Plano offline com sessão pendente. Evidência local preservada em UX_P2_PLAN_LOCAL_BROWSER.json; remoto em UX_P2_PLAN_BROWSER.json; metadata em UX_P2_REMOTE_BUILD.json. Screenshots390/1280 atualizados pelo smoke remoto. CUA conferiu instalação existente, atualização explícita e Plano novo com atividade pendente, título curto e botão RETOMAR. P2 aprovado no escopo das diretrizes; não é pesquisa longitudinal.
