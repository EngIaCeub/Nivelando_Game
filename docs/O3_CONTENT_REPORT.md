# O3 — Relatório de expansão e curadoria TCE-GO

Status: conteúdo operacional publicado no pack; aguardando validação de release remoto do O3.

## Resultado do lote

- 45 tópicos curriculares cobertos;
- 20 recursos ativos e verificados, incluindo documentação oficial, legislação, especificações
  públicas e 1 videoaula pública verificada;
- 289 questões, todas originais (`origin: generated_original`), com 5 alternativas, uma única
  resposta correta, fingerprint, dificuldade, nível cognitivo, explicação e `canonicalConceptIds`;
- dificuldades: 101 easy, 99 medium, 89 hard;
- 102 flashcards, principalmente `concept_card` e `definition_card`;
- 16 simulados: 14 por disciplina, 1 mini-simulado misto e 1 simulado completo;
- simulado completo com 70 questões, 25 gerais + 45 específicas, pesos 1/2 e 270 minutos,
  conforme o edital;
- 45/45 tópicos com recurso, questão, revisão e explicação;
- 12 tópicos P1, 20 P2, 4 P3 e 9 P4;
- nenhum tópico `EMPTY`; nenhum item quarantined neste lote; nenhum link quebrado após
  verificação HEAD em 20 URLs únicos.

## Fontes e direitos autorais

A fonte primária do escopo continua sendo o edital oficial preservado no pack. Legislação foi
linkada em fontes oficiais do Planalto; tecnologia usa documentação oficial ou especificação
pública; a videoaula cadastrada foi aberta e verificada antes de ser marcada como ativa.
Questões e flashcards são material original do StudyOS, não cópia de banco comercial.

## Artefatos

- `content-coverage.json`: matriz por tópico;
- `resources.json`: recursos com URL, provider, verificação, status e provenance;
- `questions.json`: banco original curado;
- `flashcards.json`: revisão derivada de conceito;
- `simulations.json`: pools e seeds determinísticas;
- `docs/O3_CONTENT_BASELINE.md`: inventário anterior e metas progressivas.

## Quality gates

Validados: schema/factory, referências de tópicos e conceitos, URLs estruturadas, vídeos,
unicidade de IDs e fingerprints, uma resposta correta, explicações, proveniência, dificuldade,
status, pools determinísticos, estrutura oficial do simulado, TodayPlan com conteúdo disponível,
Error Review por questionId, invariantes de scoring e leakage do Core.

Limitação de curadoria: a cobertura é operacional, não representa ainda a meta final de 30–50
questões P1 nem 20–30 P2. O próximo lote de conteúdo deve ampliar diversidade por subtema e
passar por nova quarentena pedagógica antes de publicação.
