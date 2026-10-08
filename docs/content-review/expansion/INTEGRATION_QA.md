**Estado vigente conferido em 2026-10-08:** candidato4597f81f942cbf205f7ec3dbfca8349f89d684a41ea44a72ba2b7ef11140f639 aprovado e já integrado ao catálogo ativo; completeApproved=true. P1 UX remoto conferido; ver docs/UX_P1_ACCEPTANCE.md. Os estados pendentes abaixo são históricos, restritos aos hashes indicados.

**Estado atual (2026-10-08):** reinspeção pendente para o `STAGED_PACK.json` SHA-256 `d7ef5d2e33a26b14851839da5c7294e9fec7cb731341d18c9572fb95335704f1`. O parecer parcial aprovado abaixo cobre somente o hash anterior `7d0b663ea92c3e6350b676f494e4bd54dac22f94e2130a18240837252db33bb8`, não se estende ao candidato atual. Candidato atual: 118/209 cobertas, 91 lacunas, 124 recursos ativos e 198 candidatos desconhecidos. `completeApproved=false`.

## Parecer anterior — candidato parcial 451157d6…

- **Revisor:** `/root/library_final_qa; independent integration QA`.
- **Data registrada:** 2026-10-08T17:04:08.000Z.
- Factory/schema: válida, `releaseReady=true`, zero erros; 209 unidades, 45 tópicos, 93 cobertas e 116 descobertas. Os 116 IDs descobertos coincidem exatamente com o ledger.
- 101 recursos ativos verificados/alcançáveis/elegíveis; 221 recursos com disponibilidade desconhecida estão isolados como candidatos não verificados. Sem colisão de IDs, duplicatas de URL ativa ou divergência de source-map. Um percurso elegível e sem referência órfã.
- As 45 questões candidatas permanecem idênticas às ativas. Simulação do helper confirmou preservação do snapshot legado (45 unidades/34 recursos), acréscimo do estado ativo atual (209 unidades/167 recursos) e idempotência.
- O QA verificou diretamente uma amostra de nove URLs. A amostra não valida o conteúdo integral de todos os 101 recursos nem dos 221 candidatos. Não é auditoria factual completa das questões/cartões, nem valida UI, offline, release ou publicação.
- **Decisão:** aprovada somente a promoção parcial deste hash. Não autoriza `complete`, publicação ou alegação de curadoria integral. As 116 lacunas e os gates restantes continuam abertos.

## Parecer anterior — candidato parcial 7d0b663e…

- **Revisor:** `/root/library_final_qa; independent integration QA`.
- **Data:** 2026-10-08.
- Factory/schema válidos, `releaseReady=true`, zero erros; 209 unidades, 107 cobertas e 102 lacunas idênticas ao ledger.
- 113 recursos ativos elegíveis; 209 desconhecidos isolados em candidatos; URLs ativas únicas, source-map alinhado, um percurso sem referências órfãs. Questões e currículo permanecem idênticos ao ativo; histórico de 289 questões e 102 cartões preservado.
- Simulação do arquivamento preservou os snapshots 45 unidades/34 recursos e 209 unidades/167 recursos, repetida idempotentemente. O defeito de hash no promotor foi corrigido antes da revisão final.
- A Lei Orgânica e o Regimento Interno foram abertos diretamente nas URLs oficiais em 08/10/2026 e estão ativos/elegíveis; recortes, cobertura e aprovação editorial cruzada permaneceram inalterados. Permanecem as ressalvas do corte normativo no registro jurídico.
- O parecer aprova **somente promoção parcial deste SHA**. Não valida integralmente 113 fontes, 209 candidatos, questões/cartões, UI, offline, release ou publicação. As 102 lacunas permanecem e `completeApproved=false`.

# QA independente da integração da biblioteca

**Resultado:** aprovado para promoção parcial.

**Candidato inspecionado:** `STAGED_PACK.json` SHA-256 `3b980b5a365caa1d54ec2bcf138f157dc3194d8f3f40716bc9b18cf32d896566`.

**Revisor:** `/root/integration_qa; GPT-6.1 Sol/high; independent integration QA`.

**Data:** 2026-10-08T07:00:00.000Z.

## Artefato efetivamente revisado

O SHA inicialmente indicado, `9cf2a441…`, corresponde a `QUESTIONS_DRAFT.json`. O arquivo `STAGED_PACK.json` presente no momento da revisão tem o SHA acima. Este parecer aprova apenas esse hash real.

## Estrutura, cobertura e questões

- `validatePack` e validação AJV independente de `library.schema.json`, 279 recursos e 45 questões não reportaram erro.
- A auditoria retorna `partial`, com 209 unidades, 186 cobertas por recurso `primary/full`, 33 tópicos completos e 23 unidades descobertas.
- A recomputação independente dos recursos elegíveis confirmou os mesmos 23 `uncoveredUnitIds`; os 23 IDs únicos do ledger são exatamente esse conjunto. Não há lacuna documentada para unidade coberta.
- Os 279 recursos v2 são elegíveis no audit: ativos, gratuitos/permitidos, alcançáveis e com revisão editorial recente.
- As 45 questões são exatamente iguais ao banco ativo. As dez questões da linha de base e as 35 adições aprovadas foram preservadas; o hash de `QUESTIONS_DRAFT.json` também coincide com o registrado.

## UML 2.5.1

`tech-omg-uml251-notation-examples` é a especificação normativa oficial UML 2.5.1 do OMG, formal/17-12-05, adotada em dezembro de 2017. Os locators registram separadamente classes (§§11.4–11.5), estados (§14), atividades (§15), sequência (§17) e casos de uso (§18), com páginas impressas e do PDF.

A fonte sustenta `primary/full` para o objetivo delimitado de **ler** esses cinco diagramas: apresenta notação e exemplos comentados para cada tipo. É uma referência técnica em inglês e não um curso introdutório nem uma alegação de leitura integral da UML. A permissão limitada do documento está registrada e a entrega permanece por link.

## Study paths

`library.studyPaths` é uma lista vazia válida. Nenhuma unidade é declarada coberta por percurso composto: as 186 coberturas vêm de recursos individuais `primary/full`. Portanto não há mistura de proveniências ou fechamento de lacuna por caminho sem revisão.

## Limites

Esta aprovação permite promover somente este SHA como `partial`. `completeApproved=false`; as 23 lacunas permanecem explícitas, e cobertura da biblioteca não demonstra progresso, mastery, XP ou score.


## Veredito histórico — rejeição do candidato completo anterior

O candidato d22ef5dd855a6f23dda7beaecbdd2dac768c63854448589dcf8fefb43bbe3de8 foi rejeitado para promoção completa pela revisão independente read-only. Achados registrados: fontes de publicações distintas agrupadas sob uma URL/proveniência; sucesso GET/reachable atribuído sem evidência; source-map com URLs/locators obsoletos; lacunas da Lei 20.756; PrepPilot sem ensinar os princípios/tailoring do PMBOK 8; e conflitos de cobertura parcial/completa sem decisão reconciliada. Os IDs compostos foram desmembrados ou rebaixados, o escopo legal foi ampliado e a revisão PMBOK foi corrigida nas fontes. Essa reprovação histórica não decide o candidato atual.

## Rejeição técnica do candidato parcial 5a62eef7…

A auditoria independente confirmou os 116 gaps e a preservação das questões, mas rejeitou promoção pelo mecanismo atual: a factory exigia verified=true para os 221 links unknown, e o promotor arquivava apenas o BASELINE_PACK de 45 unidades/34 recursos, podendo perder IDs ativos adicionados posteriormente. Correções aplicadas depois dessa rejeição: somente recursos com verificação observada entram no inventário ativo; desconhecidos ficam em library-candidates.json; percursos com referências ausentes são omitidos do candidato; e o promotor arquiva um snapshot do catálogo ativo completo preservando snapshots anteriores. O novo SHA 451157d6… aguarda reinspeção independente.

## QA independente vigente — 2026-10-08 18:36 UTC

Decisão: aprovado para promoção complete. SHA-256 exato: 4597f81f942cbf205f7ec3dbfca8349f89d684a41ea44a72ba2b7ef11140f639. Revisor: /root/integration_qa; independent integration QA. Revisão somente leitura.

- Hash conferido; validatePack e AJV sem erros para biblioteca, 309 recursos ativos, 56 candidatos isolados e 45 questões.
- Auditoria independente: 209/209 unidades, 45/45 tópicos, zero lacunas, zero recursos inelegíveis e 43/43 percursos válidos cobrindo os objetivos declarados; sem IDs duplicados ou referências órfãs.
- As 45 questões são idênticas às ativas; dez baseline e 35 adições aprovadas preservadas; hash do draft confere. Helper de histórico append-only/idempotente.
- ISO usa a URL observada sem www; recursos ISO/Advisera/ABNT separados, sem alegar adoção ABNT da edição internacional 27000:2026. A ausência de captura histórica no corte de 25/08/2026 segue explícita.
- completeApproved=true para este SHA. O parecer não cobre B5/B6/B7, release, smoke remoto ou publicação. Pareceres anteriores abaixo continuam restritos aos hashes e escopos originais.
