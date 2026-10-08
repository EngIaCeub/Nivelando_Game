# Contrato de validação editorial de conteúdo

## Dimensões diferentes

- **Schema**: objeto segue estrutura JSON, campos e tipos.
- **Integridade**: referências a Exam Pack, tópico, fonte e questão existem; IDs são únicos.
- **Origem**: `provenance.status` identifica `verified_fact`, `derived` ou `assumption`.
- **Direitos**: licença de reprodução é diferente de acesso gratuito ou permissão para link.
- **Editorial**: pessoa revisora verificou pergunta, resposta, recorte e validade.

Schema válido, link acessível, autoria original ou status legado `validated` não significam
aprovação factual. `scripts/content-audit.mjs` emite sinais heurísticos e pendências; nunca
altera arquivos, promove itens ou decide gabarito.

## Flashcards e questões

Cada item tem ID estável, Exam Pack, tópicos, enunciado/frente e resposta, proveniência e
versão. Novos itens incluem `reviewStatus`, `sourceRefs` com localização específica,
`editorialReview` com data/responsável/evidência e `validAsOf` para conteúdo sujeito a
versão normativa/técnica. Autoria derivada é independente da aprovação.

Questão identificada como prova anterior de banca precisa de concurso, banca, ano,
caderno/identificador, número e gabarito definitivo com referências verificáveis.
Questões originais são rotuladas como tais. Sem dados suficientes, registrar lacuna;
nunca inferir a origem pelo estilo ou pelo assunto.

## Revisão e promoção

1. Automação confere schema, IDs, referências, gabarito estrutural, duplicatas e padrões
   instrucionais. Heurísticas geram fila, nunca aprovação.
2. Curador consulta a fonte em contexto, registra trecho/capítulo/seção/timecode e redige
   proposta atômica com objetivo, resposta e limites.
3. Revisor factual independente aprova/rejeita com justificativa e data. Item rejeitado ou
   pendente permanece fora da coleção ativa nova.
4. Corrigir proveniência/direitos e rodar `node scripts/validate-content.mjs` e
   `node scripts/content-audit.mjs`. Atualizar auditoria integral e STATUS antes do gate.

Uma correção preserva snapshots de sessões antigas, primeira tentativa, score e XP. Mudança
de objetivo ou gabarito cria versão/relação de substituição segundo os contratos de sessão.
Retentativa pode atualizar aprendizagem/mastery, nunca score histórico.

## Inventário inicial — antes da curadoria de 2026-10-07

O schema estrutural de flashcards e referências de tópico foram integrados ao validador.
O relatório encontrou 102/102 cartões TCE-GO com alertas, 289/289 questões com pendências
(banca/ano sem prova identificada) e 20/20 recursos sem parecer editorial registrado.
Esses números são filas de revisão, não uma constatação de respostas incorretas nem de
links indisponíveis. Itens existentes seguem no pack legado por compatibilidade; não estão
factualmente aprovados e nenhum novo cartão foi promovido. Concluir revisão integral antes
de declarar a biblioteca completa ou tratar o conjunto como provas anteriores FCC.

## Estado após revisão independente — 2026-10-07

TCE-GO: 279 templates rejeitados editorialmente, dez questões substantivas corrigidas
em novos IDs r2 e 102 cartões instrucionais retirados da seleção nova. Banco ativo:
10 questões originais, 64 cartões atômicos e 34 recursos v2 com recortes parciais,
aprovados nos pareceres em `docs/content-review/`. Não são questões passadas FCC.
Os registros JSON dos revisores incluem hashes dos drafts efetivos; integração exige
correspondência desses hashes. Não reutilizar IDs para reescrita substantiva.

`content-history.json` preserva os objetos anteriores para sessões existentes. Sua
presença não aprova o legado nem permite selecioná-lo em uma nova atividade. A UI
resolve IDs históricos separadamente; nenhuma primeira tentativa é recalculada.
A auditoria heurística do banco ativo tem zero alertas; isso acompanha o parecer,
não o substitui. TJTO mantém pendências e não recebeu revisão factual neste lote.

A biblioteca permanece partial: todos os recursos têm extent partial; 45 tópicos
auditados contra Anexo II e zero unidades com cobertura integral. ScopeReview ainda
pending, com matriz de subitens e referências de páginas registrada. Nenhum vídeo
foi aprovado. O treino de dez itens não reproduz a distribuição de uma prova completa.
