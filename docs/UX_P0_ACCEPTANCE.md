# P0 UX — aceite dos flashcards

Data: 2026-10-08. Veredito: **P0 aprovado no escopo de retirada dos templates da seleção nova, integridade editorial e compatibilidade histórica**.

## Versão verificada

Site: https://engiaceub.github.io/Nivelando_Game/
Build observado na interface: `fd712248d3dd-20261008190857602`.
Commit informado: `fd712248d3dd203dddfff9f78424c114c16873e2`.
O site já entregava a correção; esta execução não criou deploy nem reescreveu conteúdo curado.

## Evidências de aceite

- Payload remoto `exam-pack/flashcards.json`: 64 cartões, 64 approved, nenhum template instrucional antigo detectado.
- QA independente `/root/p0_qa`, modelo solicitado `gpt-6.1-sol/high`: aprovado sem bloqueantes. 64/64 ativos correspondem integralmente ao CURATION_DRAFT assinado, exceto metadados de promoção; frente, resposta e sourceRefs coincidem com reviewedCardItems do FACTUAL_REVIEW.
- SHA-256 CURATION_DRAFT: `a9b6d69b6eec0d47c517f3bb81f11d72a67a1874dec49f901603b14dc8f62902`.
- SHA-256 flashcards ativo: `c331ef9cb19b8fb14eb7e656f885b85a5912e84fd9c35e162564218bcdc875c0`.
- SHA-256 content-history: `852aa107947867b85fec2c1aa1156ddcdb158b77845ac34a2cafffc0614e8471`, correspondente ao LEGACY_REVIEW. 102/102 históricos rejeitados, sem sobreposição de IDs com ativos.
- Código seleciona ensureCards em atividades novas e resolve ensureHistoricalCards apenas para compatibilidade de sessões existentes.
- Schemas/factory dos três packs passaram. Auditoria TCE-GO: zero alertas heurísticos.
- 18/18 testes direcionados passaram: curation-history, o3-content e o4-study-session. Cobrem histórico, primeira tentativa, export/import, revelação, persistência e idempotência. QA executou adicionalmente cartão legado em memória: pausa, export/import, retomada com revelação preservada e revisão sem score.

## Inspeção no site publicado

1. Configurações → Detalhes técnicos: build acima.
2. Estudar flashcards retomou a sessão antiga de 102 cartões, com aviso explícito: conteúdo retirado da seleção atual; textos e primeiras respostas preservados. Isso é compatibilidade histórica, não seleção nova aprovada.
3. Biblioteca → Conteúdo SQL → Revisar flashcards abriu sessão específica de quatro cartões ativos.
4. Primeiro cartão: “Qual propriedade de uma transação impede a aplicação de apenas parte de suas alterações?”. Enter em Revelar resposta mostrou explicação de atomicidade, distinguindo durabilidade, com link PostgreSQL.
5. Desktop e viewport móvel 390 × 844 inspecionados. Pergunta, resposta e controles legíveis; scrollWidth 375 para innerWidth 390. Evidência: `UX_P0_MOBILE.jpg`.
6. Reload/nova aba preservou revelação do cartão ao retomar por tópico. Sessões foram pausadas ao fim. Nenhuma avaliação Lembrei/Preciso revisar ou alternativa foi enviada; score/XP não foram alterados pelo teste.

## Limites

A revisão independente desta execução reconfirma os artefatos assinados em 07/10; não constitui nova consulta normativa de todas as fontes. Não significa cobertura integral por tópico, eficácia pedagógica longitudinal ou aceite dos demais problemas UX.

Browser continha dados anteriores; não foi feito reset. O preview em origem limpa falhou por conexão; essa falha não foi tratada como aprovação. A evidência remota combina auditoria integral do payload, inspeção de seleção nova por tópico, retomada histórica real e testes de estado em memória isolada. Não foi executado novo gate integral offline/browser de release, pois nenhuma implementação ou publicação foi realizada nesta etapa.

Identificador `curated-pg-transactions` ainda aparece como nome da fonte. Não aparece como resposta; melhorar o rótulo bibliográfico é ajuste de apresentação posterior, sem invalidar a resposta didática.

P1 não iniciado nesta execução.
