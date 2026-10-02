# O3 — Baseline de cobertura de conteúdo

Data da curadoria: 2026-10-02
Fonte primária: Edital nº 01/2026 do TCE-GO, especialmente Anexo II, pp. 19–22.

## Inventário inicial

Antes da expansão, o pack possuía 45 tópicos, 11 recursos e 10 questões. Não havia
matriz de cobertura, flashcards ou pools de simulados publicados.

## Priorização

| Prioridade | Regra | Tópicos |
|---|---|---:|
| P1 — crítico | priority >= 2,5 | 12 |
| P2 — alto | 2,2 <= priority < 2,5 | 20 |
| P3 — médio | 1,8 <= priority < 2,2 | 4 |
| P4 — complementar | priority < 1,8 | 9 |

A prioridade combina peso oficial, prioridade curricular, transversalidade, dependências,
dificuldade esperada e lacunas observadas. O campo `priorityScore` preserva o valor do
currículo; a classe P1–P4 é uma classificação de curadoria, não uma nova regra do Core.

## Matriz

`exam-packs/tce-go-ti-2026/content-coverage.json` contém, para cada `topicId`, disciplina,
módulo, `canonicalConceptIds`, prioridade, peso, recursos, vídeos, questões, questões
originais, questões de revisão, flashcards, simulados, explicações e `coverageStatus`.

Todos os 45 tópicos deixaram `EMPTY` e receberam ao menos um recurso oficial, questões,
flashcard e explicação. A matriz atual classifica os 45 como `MEDIUM`: o lote inicial é
operacional, mas continua abaixo da meta progressiva de volume para evitar inflação por
questões redundantes.

## Exceções de volume

- P1: lote inicial de 10 questões por tópico; meta posterior 30–50.
- P2: lote inicial de 6 questões por tópico; meta posterior 20–30.
- P3: lote inicial de 3 questões por tópico; meta posterior 10–20.
- P4: lote inicial de 2 questões por tópico; meta posterior 5–10.

As questões do lote são originais, com `origin: generated_original`, fingerprint, gabarito,
explicação por alternativa e proveniência. A expansão futura deve aumentar variedade e
qualidade por tópico, sem copiar bancos comerciais.
