# Revisão factual do conteúdo TJTO

Data: 2026-10-08. Escopo: as três questões autorais e dois links de referência do
Exam Pack `tjto-tecnico-administrativo-2022`.

## Parecer

As três questões são itens originais StudyOS derivados do edital, não questões
aplicadas pela FGV. Os campos `board`/`year` foram removidos das questões para não
induzir atribuição a prova anterior. As explicações e locators identificam o recorte
que sustenta cada resposta:

| ID | Evidência | Locator |
|---|---|---|
| `q-tjto-001` | Anexo I apresenta planejamento, organização, direção e controle como funções da administração. | impresso p.31 / PDF p.30 |
| `q-tjto-002` | Anexo II especifica ensino médio completo ou curso técnico equivalente, expedido por instituição reconhecida. | impresso p.35 / PDF p.34 |
| `q-tjto-003` | Redação em gênero dissertativo-argumentativo, mínimo 15 e máximo 20 linhas. | item 9.6.10.1, impresso p.17 / PDF p.16 |

O documento consultado é o edital compilado, retificado em 21/11/2022, posterior à
prova objetiva de junho de 2022. A 7ª retificação declara que os demais itens ficam
inalterados, mas este pack apresenta as questões como derivadas do edital, não como
transcrição nem como identificação de prova da FGV.

Os recursos `tjto-resource-edital` e `tjto-resource-concurso` foram revisados como
referências normativas/administrativas: o edital delimita requisitos/escopo; a página
FGV é índice do concurso e de seus arquivos. Nenhum dos dois é contado como aula ou
material pedagógico.

As três versões anteriores das questões estão arquivadas em `content-history.json`;
IDs ativos permanecem estáveis. Não houve alteração no Core nem no pack TCE-GO nesta
revisão.

## QA e validação

QA independente read-only aprovou o escopo factual e conferiu que os quatro arquivos
abaixo permaneceram estáveis durante sua inspeção:

- `questions.json`: `81ac3b93f11304e07dbf0f82c431547d76ba5cb2d79c754c20aef71100189feb`
- `resources.json`: `528865372e6a1c22946fe46f5e9a3064b1f0560e9a93db5cb24f4a0570b7a715`
- `source-map.json`: `6c6ee9fc1199ddcb20473a4d5e90bec819d60fc1550967c9ae4e29077a440c50`
- `content-history.json`: `36b0203a04186249256367d5b0e8d45f358f031dc64f5764606f83ecdd92fa9f`

- `node --test exam-packs/tjto-tecnico-administrativo-2022/tests/f11-genericity.test.mjs`: 7/7.
- `node scripts/validate-content.mjs`: três Exam Packs válidos.
- `node scripts/content-audit.mjs`: TJTO 0 alertas em 3 questões e 2 recursos.

Este parecer fecha a curadoria factual dos cinco alertas do TJTO. Não substitui B5
(browser/UI/accessibilidade/offline) nem o aceite integrado B6.

## Fontes oficiais

- [Concurso TJTO — página oficial FGV](https://conhecimento.fgv.br/concursos/tjto22)
- [Edital nº 01/2022 compilado e retificado](https://conhecimento.fgv.br/sites/default/files/concursos/tjto_-_edital_de_abertura_retificado_007_em_21-11-2022.pdf)
- [7ª retificação — 21/11/2022](https://conhecimento.fgv.br/sites/default/files/concursos/tjto_-_edital_de_retificacao_007_-_21-11-2022.pdf)
