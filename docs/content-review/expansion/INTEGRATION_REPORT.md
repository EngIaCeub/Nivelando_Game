# Expansão factual — 2026-10-07

## Questões integradas

Foram aprovadas e integradas 35 questões originais, uma para cada tópico que não
tinha questão ativa após a revisão do legado. O banco ativo contém 45 questões e
todos os 45 tópicos têm ao menos uma questão. Isso não demonstra cobertura de
todos os subitens do edital nem constitui uma prova anterior da FCC.

Os três pareceres independentes de domínio estão em `LEGAL_QUESTIONS_REVIEW.json`,
`TECH_QUESTIONS_REVIEW.json` e `LANGUAGE_SECURITY_QUESTIONS_REVIEW.json`. Cada
parecer identifica os IDs aprovados, as fontes com recorte e a evidência do
gabarito. Os pareceres estão vinculados ao SHA-256 de `QUESTIONS_DRAFT.json`:
`9cf2a441f767479d5e901bc5140bbfac98b978c2af024605904dcd1a61b7405e`.

`BASELINE_PACK.json` conserva o estado anterior à expansão. As dez questões
substantivas anteriores foram preservadas integralmente. As 35 novas questões
mantêm enunciado, alternativas, resposta e explicações do draft aprovado.
Metadados cognitivos distinguem compreensão de aplicação; normas usam o corte
25/08/2026, sem confundir data da norma com data da revisão editorial.

O treino `practice-expanded-45` usa as 45 questões. O treino anterior de dez
questões continua disponível. Ambos são parciais: não reproduzem a distribuição
oficial de uma prova de 70 questões. Primeiras tentativas, score, XP e sessões
anteriores não foram reescritos; `content-history.json` continua preservado.

## Biblioteca em expansão

A decomposição proposta abrange 209 unidades de estudo nos 45 tópicos, com
objetivos e referências ao Anexo II. As fontes são lidas por domínio e cada
associação informa recorte, papel e extensão. Os pareceres de fontes ainda
estão em andamento; portanto a biblioteca ativa não foi declarada completa.

`stage-expansion.mjs` monta exclusivamente um candidato em `STAGED_PACK.json`,
após os três pareceres concluírem. Não altera o Exam Pack ativo. Cobertura
integral exige fonte gratuita primária que ensine todos os objetivos da unidade,
auditoria do escopo e parecer independente final da integração. Links públicos,
metadados de livros pagos e contagens de recursos não substituem essa evidência.

Pesquisa complementar com EBIA, NIST Big Data/estatística e apostilas OBMEP
está em `ROOT_RESEARCH_NOTES.md`. São candidatos, não materiais aprovados:
cada um aguarda reinspeção editorial por domínio. A nota também registra dois
exercícios incorretos que devem ser excluídos de eventual recorte da OBMEP.

## Promoção parcial aprovada

O candidato foi revisado independentemente em `INTEGRATION_QA.json` e promovido
como biblioteca `partial`. A primeira revisão encontrou um papel de cobertura
fora do schema e divergências de proveniência em duas questões. O compilador foi
corrigido, o candidato foi regenerado e promovido. A atualização posterior da
unidade de arquitetura MCP foi aprovada no SHA-256
`b6b06153cffee7875c6a29e19b2c14445ba995a5dba8848cc43b9fc6d09534ea`. A
aritmética com inteiros e racionais foi aprovada no candidato exato
`f8d866867421decf550fad8575af1a74845845e1a554555b97cc09a7fdc69bfc`.

A promoção atual mantém 209 unidades, 167 recursos v2, 119 unidades com recurso
primary/full e 90 lacunas. Doze dos 45 tópicos têm todas as suas unidades
cobertas; os demais continuam parciais. `library-history.json` arquiva a
estrutura e os recursos anteriores para manter referências, sem alterar sessões,
tentativas, score, XP ou o banco de questões.

Pós-promoção: schemas e factory dos três packs passaram; `library-audit` não
encontrou erros e retornou `partial`, `isComplete=false`; a auditoria factual
do TCE-GO registrou zero alertas para as 45 questões, 64 flashcards e 167
recursos ativos. Não houve publicação nem teste em navegador nesta etapa.

## Evidência técnica atual

- 44 testes direcionados passaram, incluindo preservação das dez questões,
  vínculo dos três pareceres ao draft, cobertura dos 35 tópicos e histórico.
- Schemas e validação factory dos três packs passaram.
- Auditoria heurística das 45 questões ativas: zero alertas. Os pareceres de
  revisores de IA independentes fundamentam a aprovação editorial; a heurística
  não aprova o conteúdo e não houve revisão humana especializada neste lote.
- Empacotamento temporário inclui banco ativo e histórico, excluindo candidatos.
  Isso não equivale a inspeção visual ou teste offline em navegador.
- Esta expansão ainda não foi publicada.

## Atualização de cobertura candidata — 2026-10-08

`STAGED_PACK.json` foi regenerado depois de corrigir o registro factual da Lei 20.756/2020
e fechar as duas unidades legais. O SHA-256 atual é
`d22ef5dd855a6f23dda7beaecbdd2dac768c63854448589dcf8fefb43bbe3de8`. Ele contém 209/209
unidades cobertas em 45 tópicos, 317 recursos e 22 percursos elegíveis, sem lacunas.
O candidate validator confirmou schema/factory, identidade das 45 questões e existência
do histórico legado. O banco ativo continua igual ao baseline, com 167 recursos e status
`partial`; nenhuma promoção foi feita.

Verificações executadas: `node docs/content-review/expansion/validate-staged.mjs` passou;
`node scripts/validate-content.mjs` passou nos três packs; `node scripts/content-audit.mjs`
retornou zero alertas de conteúdo TCE-GO; `node --test` passou 202/202 com Chromium
Playwright disponível e fora do perfil AppContainer. O QA JSON aponta `pending` para o hash
atual. O parecer de aprovação anterior é preservado como histórico e cobre outro SHA e
somente promoção parcial; não aprova `complete`.

A atualização da lei foi conferida no PDF oficial atual: Lei 15.122, art. 2º, §2º, na
redação da Lei 23.500/2025, prevê aplicação subsidiária da Lei 20.756 aos cargos efetivos
de Auditor e Técnico; a antiga exclusão do art. 1º da Lei 20.756 foi revogada pela Lei
20.943/2020. O PDF consolidado da Lei 20.756 consultado tem 218 páginas, e o candidato
declara leitura dirigida dos artigos relevantes, sem presumir exame integral das notas
compiladas. Referências oficiais: [Lei 15.122/2005](https://legisla.casacivil.go.gov.br/api/v2/pesquisa/legislacoes/80023/pdf),
[Lei 20.756/2020](https://legisla.casacivil.go.gov.br/api/v2/pesquisa/legislacoes/100979/pdf),
[RA 14/2025](https://gnoi.tce.go.gov.br/atoNormativo/Publicado/25999) e
[RA 16/2025](https://gnoi.tce.go.gov.br/atoNormativo/Publicado/26239).

Gate restante para a biblioteca ativa: revisão independente do SHA exato e promoção
controlada. B6/segundo pack, B7/manutenção e P1/release continuam sendo gates próprios;
nenhum deles é declarado concluído por essa validação candidata.
