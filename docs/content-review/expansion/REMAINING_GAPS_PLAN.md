# Plano das pendências de aceite e integração

Data de referência: 2026-10-08. Este documento organiza o trabalho restante a partir
dos artefatos atuais. As contagens anteriores em CLOSURE_PLAN.md são históricas.

## Retomada atual — 2026-10-08 18:00 UTC

O candidato em execução é `STAGED_PACK.json`, SHA-256
`d36b4a09353147b52eb7d2be6f027b0b1fe1cc74ea42d35617667d370b8d6131`. A factory e os
schemas passaram: 209 unidades/45 tópicos, 188 cobertas e 21 lacunas no ledger; 220 recursos
elegíveis e 19 percursos elegíveis. Foram fechadas, no candidato, as duas unidades legais
TCE-GO, PMBOK 8 e métodos ágeis. A revisão registrou verificações atuais para as URLs
diretamente abertas, removeu do percurso PMBOK a página de catálogo inacessível e acrescentou
um percurso autoral de Manifesto Ágil, Scrum e Kanban com questão prática. `completeApproved=false`;
QA independente do SHA exato está pendente e nenhum conteúdo foi promovido. Questões e cartões
ativos não mudaram. Testes focados 17/17 e `validate:content` nos três packs passaram; `content-audit`
mantém somente cinco alertas conhecidos no pack TJTO. Aprovações históricas valem apenas para
os hashes que citam.
## Estado observado na retomada — 2026-10-08 17:01 UTC

| Camada | Evidência atual | Pendência |
| --- | --- | --- |
| Candidato TCE-GO | `partial`; 209 unidades/45 tópicos; 175 unidades cobertas e 34 lacunas; 180 recursos e 12 percursos elegíveis | Continuar revisão editorial das lacunas e fontes; não declarar complete |
| QA de integração | QA do SHA `828630ece1a373f6bdc83415666312144e49f938f0e597fd27cb0e3903c159d3` pendente; aprovações anteriores são de hashes distintos | Reinspecionar o SHA exato após o próximo congelamento; complete requer auditoria integral |
| Pack ativo local | permanece partial; baseline reconciliada pelo script de evidências; arquivos ativos não foram escritos pelo staging | Promoção controlada só após QA parcial e factory aceita |
| Questões e cartões | 45 questões preservadas no candidato; pack ativo tem 45 questões e 64 flashcards | Correspondência técnica registrada; revisão factual individual de todas as questões/cartões ainda incompleta |
| Validação técnica | `validate-staged.mjs`: factory válida, `releaseReady=true`, zero erros de schema; testes focados 18/18 passaram | Repetir suíte completa e fechar UI/browser e gates operacionais; suíte browser segue bloqueada pelo localhost negado no ambiente |
| Segundo pack | validate-content.mjs passa; auditoria aponta 3 questões e 2 recursos TJTO sem proveniência/revisão suficientes | Corrigir ou retirar os cinco itens antes do aceite genérico |

SHA atual do candidato parcial congelado:
d7ef5d2e33a26b14851839da5c7294e9fec7cb731341d18c9572fb95335704f1.
A auditoria independente rejeitou os candidatos anteriores; o parecer parcial de 451157d6 ainda não cobre o novo hash.
d22ef5dd855a6f23dda7beaecbdd2dac768c63854448589dcf8fefb43bbe3de8 por cobertura
composta sob URL única, metadados de disponibilidade inventados, source-map obsoleto e
lacunas legais/PMBOK. Essas reprovações não são reaproveitadas como aprovação do SHA atual.

Na retomada foram removidos registros que combinavam publicações, introduzidas fontes e
percursos separados em alguns grupos, corrigida a reconciliação do source-map e a
representação de disponibilidade observada, e 79 URLs distintas foram abertas nesta sessão em
lotes com corpo visível. A contagem de 93 elegíveis/116 gaps é estado candidato, não
aprovação editorial independente. 221 dos 322 recursos mantêm disponibilidade desconhecida e permanecem fora do inventário ativo; só o percurso elegível permanece no candidato publicável. A revisão factual completa das 45 questões e
64 flashcards continua em aberto. A factory agora valida o candidato publicável porque somente os 101 links observados ficam em resources; os demais 221 ficam na fila library-candidates, sem converter desconhecido em verificado. O QA aprovou promoção parcial do SHA atual; não houve promoção, e o objetivo editorial de zero gaps continua aberto.
## 1. Congelar a entrada da revisão

Responsável: integrador.

- Conferir o hash de STAGED_PACK.json e suas relações com os pareceres de domínio,
  o edital e os bancos ativos. Preservar BASELINE_PACK.json e os históricos.
- Consolidar a fila de aceite por unidade com objetivos, recursos/percursos,
  locators, corte/edição, evidências, autor da curadoria e decisão do revisor.
- Manter uma fila distinta para problemas de integração, UI, segundo pack e release.
  Zero gaps de conteúdo não deve zerar automaticamente essas pendências.
- Não regenerar o staging durante a revisão: timestamps também alteram o hash.

Aceite: entrada identificada pelo SHA, 209 IDs únicos e todos os 45 topicIds
preservados. Nenhum parecer de outro candidato é apresentado como aprovação atual.

## 2. Concluir a revisão editorial independente

Responsável: revisor distinto dos autores da curadoria, em uma revisão separada.

- Conferir os 209 subitens contra o edital, item a item. Verificar que a decomposição
  não omitiu conteúdo nem reduziu um objetivo para aparentar completude.
- Revisar a evidência pedagógica de cada unidade: os recortes devem ensinar o objetivo.
  Para os 29 percursos, conferir ordem, pré-requisitos, cobertura conjunta, leituras,
  exercícios e gabaritos. URL acessível e contagem de fontes não aprovam cobertura.
- Rechecar as 322 URLs exatas: resultado, URL final, data real, login e disponibilidade.
  Conferir autoria, edição, idioma, acesso gratuito e direitos de entrega separadamente.
- Priorizar legislação e corte temporal, conflitos entre atos, edições de frameworks,
  restrições de licenciamento, fontes em outros idiomas e recursos muito amplos.
- Confirmar as decisões por ID das 35 questões adicionadas e das dez anteriores,
  além dos 64 cartões. Reabrir qualquer resposta sem sustentação suficiente.

Aceite: parecer independente com decisões rastreáveis por unidade e por achado,
SHA exato, data e limitações. INTEGRATION_QA.json só recebe approved e
completeApproved=true quando nenhuma pendência impedir o aceite integral.

## 3. Corrigir os achados e fechar novamente o candidato

Responsável: curador/integrador; reinspeção pelo revisor independente.

- Cada reprovação reabre a unidade no ledger, indicando objetivo faltante, evidência,
  correção necessária e responsável. Corrigir o parecer de origem, não apenas a contagem.
- Buscar/substituir fontes quando necessário, atualizar locators, exercícios, versões
  e restrições. Manter IDs curriculares e histórico de substituições.
- Regenerar o candidato somente após as correções. Executar validate-staged.mjs,
  validação de schemas/factory e auditoria de conteúdo. Repetir testes afetados.
- Encaminhar o novo SHA à reinspeção. Uma aprovação perde validade para conteúdo
  alterado; não copiar o parecer anterior para um hash novo.

Aceite: 209/209 unidades efetivamente aprovadas, zero gaps, recursos/percursos
elegíveis, questões preservadas ou revisadas por decisão explícita, validações verdes
e parecer independente correspondente ao candidato final.

## 4. Promover e conferir o pack ativo

Responsável: integrador, após o aceite anterior.

- Executar promote-library.mjs com a QA aprovada para o hash exato. Conferir que a
  promoção arquiva referências anteriores e preserva questões e dados do estudante.
- Auditar o pack ativo com library-audit.mjs tce-go-ti-2026 --require-complete,
  validate-content.mjs e content-audit.mjs; conferir os deltas de arquivos e hashes.
- Repetir a suíte integral após a promoção, incluindo score imutável, XP idempotente,
  sessões antigas, reload, IndexedDB e export/import.
- Atualizar LIBRARY_RESULT.json, baseline, ledger, relatórios e STATUS com o estado
  ativo aprovado. A promoção local não equivale a publicação.

Aceite: pack ativo complete, auditoria integral aprovada, históricos resolvíveis,
nenhuma alteração indevida de score/progresso e suíte verde.

## 5. Aceitar a interface e a operação da biblioteca — B5/B6

Responsável: integrador/QA; parecer final independente.

- Exercitar o pack promovido em desktop e celular: navegação por tópico/unidade,
  busca, filtros, estado vazio, percursos, leitura e prática.
- Conferir teclado, foco, nomes acessíveis, leitor de tela, contraste, reflow e base
  path relativo. Registrar casos, resultados e defeitos encontrados.
- Testar reload e catálogo offline em perfil limpo. Explicar na UI que recursos
  externos dependem de internet. Abertura de link não deve conceder mastery, XP ou score.
- Conferir novamente backup/importação e sessões históricas durante a navegação.

Aceite: matriz de casos aprovada, evidências de navegador e limitações explícitas;
qualquer defeito relevante é corrigido e retestado antes de fechar B5/B6.

## 6. Validar o segundo edital sem mudar o Core — B6

Responsável: curador do segundo pack e QA.

- Resolver os alertas das três questões e dos dois recursos TJTO com revisão factual,
  proveniência e decisão de aprovar, substituir ou retirar do catálogo ativo.
- Definir um escopo de biblioteca explícito para esse dry run. Cobertura parcial deve
  continuar visível; não exigir ou alegar curadoria completa do segundo edital sem evidência.
- Repetir consulta por tópico, filtros, percursos quando presentes, catálogo offline,
  isolamento de progresso e export/import usando o mesmo Core.
- Conferir ausência de nomes, regras, pesos e exceções específicas dos editais no Core.

Aceite: segundo pack funciona com escopo e limitações documentados; nenhum conteúdo
pendente é apresentado como aprovado e nenhuma regra específica foi adicionada ao Core.

## 7. Estabelecer manutenção e encerrar a biblioteca — B7

Responsável: proprietário editorial a ser registrado no projeto.

- Definir periodicidade por fonte/risco, corte normativo, responsáveis e fila de revisão.
- Documentar rechecagem de links, mudanças de edição, revogação, substituição arquivada
  e regressão de complete para partial quando a cobertura deixar de ser elegível.
- Conferir consistência entre pack, pareceres, histórico, ledger e STATUS.

Aceite: procedimento executável, responsabilidades registradas e gates B2–B7 com
decisão explícita e evidência. Só então declarar encerrada a entrega da biblioteca.

## Gate separado de publicação do sistema — P1

Publicação/deploy está fora do objetivo atual da curadoria. Se a entrega posterior
incluir o sistema completo, exigir CI/build, revisão de segredos, smoke do SHA publicado,
auth/Supabase provisionado, RLS/RPC testadas com contas distintas, migração de progresso,
recuperação de senha, sync/conflitos e rollback documentado. Testes mockados de auth/sync
não constituem esse aceite. A autorização de execução já dada pelo usuário deve ser
considerada ao retomar essa entrega; não criar uma nova confirmação por rotina.

## Regra de execução

Avançar somente após validar a saída da etapa atual. Falha factual reabre a unidade;
falha técnica reabre o caso correspondente. Preservar o último estado aprovado e não
substituir revisão independente por scripts escritos pelo próprio autor.

## Estado atualizado — 2026-10-08 18:34 UTC

- O staging fechou as 209 unidades curriculares: 209/209 cobertas, zero lacunas abertas, 309 recursos ativos elegíveis, 43 percursos elegíveis e 56 candidatos não verificados mantidos fora do inventário ativo. O candidato tem status `complete`, SHA-256 `16153f384f00422a2fc7e06044b71a5e854bc85a045102533028426cc3b76eea`.
- A última unidade era a família ISO/IEC 27000. Foram verificadas diretamente fichas oficiais ABNT para 27001:2022 corrigida:2023, Emenda 1:2024, 27002:2022 e cancelamento de 27000:2018 em 03/07/2026; ISO informa a edição internacional 27000:2026. O percurso separa papéis, edição nacional e internacional. Não há captura arquivada exatamente em 25/08/2026; essa limitação permanece explícita e não se infere adoção ABNT da edição internacional.
- Validação do SHA: factory válida, zero erros de schema, zero recursos/percursos inelegíveis; 45 questões iguais ao pack ativo; histórico legado preservado (289 questões/102 flashcards). Testes focados de curadoria: 20/20; `validate-content.mjs`: três packs válidos.
- Suíte integral: 177/190 passaram. Os 13 casos falhos dependem de IndexedDB/Playwright nativo: Chromium ausente na instalação e falha de inicialização do Edge no perfil sandbox. Não são aprovados nem descartados; devem ser repetidos em ambiente de navegador funcional.
- `content-audit.mjs`: TCE-GO sem alertas (45 questões, 64 cartões, 167 recursos ativos); TJTO mantém 5 alertas conhecidos (3 questões e 2 recursos) e continua fora do escopo desta curadoria.
- O banco ativo continua `partial` (167 recursos); candidato não promovido. A QA independente do SHA acima está pendente. Próximas etapas do plano são reinspeção independente exata, decisão sobre promoção, auditoria pós-promoção e B5–B7; a conclusão de cobertura curricular não equivale a release ou publicação.

### Hash final após correção de proveniência — 2026-10-08 18:35 UTC

Após ajustar a URL da ficha ABNT da Emenda 1:2024 ao endereço que foi aberto, o staging e a validação foram repetidos. SHA final atual: `a16a2e28d3eac7e443e7dafdce7c238a98183d44b0af467867dd2d9df060505a`. São 209/209 unidades, zero lacunas, 309 recursos elegíveis, 43 percursos elegíveis; 56 recursos sem verificação de disponibilidade permanecem fora do catálogo publicado. Factory/schema válidos; 45 questões e histórico preservados; 20 testes focados e validação dos três packs passaram. A suíte integral teve 177/190 sucessos, com 13 falhas de inicialização de browser/IndexedDB no ambiente. QA independente exata pendente; biblioteca ativa não promovida.

### Correção do registro de URL e reinício da QA — 2026-10-08 18:36 UTC

A inspeção do inventário do navegador mostrou que o endereço realmente aberto da ficha da Emenda 1:2024 é a URL sem `www`. Corrigido o registro, refeito staging/evidence/validation, com 209/209 cobertas e zero lacunas. SHA vigente: `4597f81f942cbf205f7ec3dbfca8349f89d684a41ea44a72ba2b7ef11140f639`. O hash anterior `a16a2e28...` está supersedido; a inspeção independente deve cobrir somente este hash. A URL correta e a ressalva de corte seguem no parecer ISO.

### B6 factual TJTO e B7 — 2026-10-08

A revisão factual independente do TJTO eliminou os cinco alertas: 3 questões autorais agora têm recortes e não alegam ser questões aplicadas pela FGV; 2 referências foram descritas corretamente como não didáticas. QA independente aprovada, teste F11 7/7, schemas/factory válidos e auditoria sem alertas. O runbook B7 define papéis e ciclos de revisão 30/90 dias, mas falta nomear o mantenedor editorial responsável. B6 integrado continua dependente de B5.

B5: a ferramenta CUA recusou a tentativa de abrir o arquivo local pelo protocolo file e proibiu servidor local ou execução indireta para o mesmo fim. Acesso a um preview autorizado por HTTPS é necessário para testar teclado, mobile, leitor de tela e catálogo/offline. B7 nominal e P1 permanecem pendentes.

## TJTO e gates de release

- Curadoria factual TJTO independente aprovada: 3 questões revisadas como originais StudyOS, sem falsa atribuição à FGV/2022, e 2 links administrativos sem alegação didática. Histórico das revisões preservado; teste F11 7/7; content audit sem alertas em ambos os Exam Packs.
- `DIDACTIC_LIBRARY_MAINTENANCE.md` documenta ciclos, papéis e regressão; falta indicar mantenedor nominal.
- Não foi possível executar B5 visual no build local porque o browser-use rejeitou `file://` e proibiu tentar servidor local/execução indireta como alternativa. Solicita-se ao usuário uma URL de staging HTTPS autorizada para continuar B5.
- P1 (publicação/deploy) permanece pendente; nenhum push ou publicação foi realizado nesta atualização.

## Última verificação — 2026-10-08 18:45 UTC

O pacote aprovado e promovido permanece sem lacunas; auditoria complete, schema/factory e content audit passam. Revalidação após curação TJTO: QA factual independente, 7/7 F11, três Exam Packs válidos e zero alertas TCE-GO/TJTO. A suíte global permanece 177/190 devido aos 13 testes de inicialização browser/IndexedDB. B5 e B6 integrado não estão aceitos sem browser de staging; B7 mantém papel definido e indivíduo por nomear; P1 permanece não executado.
