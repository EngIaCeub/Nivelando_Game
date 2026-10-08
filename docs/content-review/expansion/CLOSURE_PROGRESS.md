# Fechamento de lacunas — atualização 2026-10-08

## Baseline histórica no início do fechamento (05:33 UTC)

- Candidato: `STAGED_PACK.json`, SHA-256 `d4262062617c4df45cc531126e39f1750b1c5328ce812dd1676d382b87dd5210`.
- Resultado: biblioteca `partial`; 209 unidades em 45 tópicos, 168 unidades cobertas (`primary/full`), 26 tópicos integralmente cobertos e 41 lacunas documentadas.
- O catálogo ativo permanece no estado aprovado anteriormente: 119/209 unidades, 12/45 tópicos e 90 lacunas. Este candidato ainda não foi promovido.
- O banco candidato tem as mesmas 45 questões do pack ativo, incluindo as 35 inclusões previamente aprovadas; nenhuma questão foi alterada nesta atualização.
- QA independente existente aprova outro SHA (`f8d866867421decf550fad8575af1a74845845e1a554555b97cc09a7fdc69bfc`). Portanto, não cobre este candidato nem autoriza promoção.

## Unidade fechada nesta revisão

A unidade `sistemas-diretorios-virtualizacao-containers-unit` agora tem o recurso `expanded-redhat-linux-containers-vms-2026`, baseado na página didática da Red Hat sobre containers Linux. A leitura direta da página, publicada em 10/02/2026, confirma: virtualização de hardware via hypervisor e VMs; isolamento dos processos em containers; kernel do sistema operacional compartilhado; compatibilidade do container com o sistema subjacente; e uso complementar de VMs e containers. O recorte atende aos dois objetivos declarados da unidade. A fonte é de fornecedor e a licença de reprodução não foi confirmada, então permanece link-only.

## Candidato parcial adicional

A unidade `nuvem-arquitetura-modelos-serverless-unit` recebeu apoio parcial do *CNCF Serverless Whitepaper v1.0*. A leitura confirmou FaaS acionado por eventos, fontes/associação evento-função e comparação de responsabilidades entre CaaS, PaaS e FaaS. O whitepaper não cobre SaaS nem uma matriz completa IaaS/PaaS/SaaS; a unidade permanece aberta. Licença de reprodução não confirmada; link-only.

## Curadoria rejeitada

A página geral de pronomes da Brasil Escola parece ampla, mas contém erro conceitual ao classificar “isto/isso/aquilo” como referências “indefinidas”. Não foi aprovada nem usada para reduzir a lacuna de pronomes. Uma fonte ampla só fecha uma unidade se for factualmente confiável em todo o recorte coberto.

## Validações desta revisão

- `node docs/content-review/expansion/stage-expansion.mjs`: candidato gerado com 256 recursos, 35 novas questões, 41 lacunas e 168 unidades cobertas.
- Factory e schemas de biblioteca, recursos e questões: válidos, zero erros.
- `library-audit`: candidato `partial`; 41 lacunas únicas correspondem exatamente às unidades descobertas; questões candidatas iguais às ativas.
- `node scripts/validate-content.mjs`: packs TCE-GO, TJTO e template válidos.
- `git diff --check`: sem erro nos arquivos de curadoria alterados.

## Barreira restante

A biblioteca não está completa: faltam 41 recursos `primary/full` aprovados. Concluir cada unidade exige fonte gratuita que cubra todos os objetivos, recorte lido, licença de reprodução distinguida do acesso e revisão editorial. A promoção do candidato parcial também exige QA independente para este SHA. Não declarar a biblioteca completa enquanto houver lacunas ou sem parecer independente.


## Execução adicional — 2026-10-08 05:36 UTC

- Revisão factual direta fechou a unidade engsoft-requisitos-arquitetura-principios-unit como candidata primary/full com o capítulo 14.1.1–14.1.2 do OpenBook Java ist auch eine Insel. É material em alemão, 16ª edição/Java 17, link-only, sem exercícios avaliativos; a avaliação de integração independente continua pendente.
- Candidato regenerado: SHA-256 331e2b5f8657457c3b63eb5612ab6599b581465adb291b8b921dd0080d3a2f58; 209 unidades, 169 cobertas, 40 lacunas, 257 recursos, 45 questões; status permanece partial.
- Ledger refeito e reconciliado: 40 IDs únicos, exatamente iguais às unidades descobertas pelo audit. Baseline e hash do parecer TECH atualizados; pack ativo, 45 questões, 64 flashcards e 167 recursos ativos preservados.
- B4 não fecha: ainda há 40 lacunas. Não há promoção nem aprovação independente do SHA atual.

## Validação adicional — 2026-10-08 05:38 UTC

- `node scripts/validate-content.mjs`: TCE-GO (45 questões), TJTO (3) e template (0) passaram schema/factory.
- Candidato exato: schemas `library`, `resource` e `question`, factory e auditoria passaram; auditoria segue `partial` (209 unidades, 169 cobertas, 27 tópicos cobertos, 40 IDs descobertos). Questões do candidato são estruturalmente idênticas às 45 ativas.
- Catálogo ativo rechecado: 119/209 unidades, 167 recursos v2, 45 questões, 64 flashcards; hashes de library/resources/questions/flashcards seguem idênticos à baseline congelada.
- `node --test`: 162/177 passaram; 15 falharam ao iniciar navegador (Playwright Chromium ausente e falhas de inicialização Edge no ambiente), não por uma asserção de curadoria. Gate de QA/browser permanece aberto.
- `git diff --check` nos arquivos de curadoria passou.
- Estado por etapa: Fase 0 implementada/reconciliada; Fase 1 estruturalmente conferida, mas falta parecer independente; Fase 2 em progresso (1 lacuna factual fechada no candidato, 40 abertas); Fase 3 preservação de questões/cartões verificada; Fase 4 schema/factory/auditoria parcial validados; Fases 5–6 bloqueadas por gates anteriores e aceite independente/browser.

## Execução adicional — 2026-10-08 05:45 UTC

- Fonte de Linux LFS101/freeCodeCamp lida e registrada: candidata `primary/full` para `sistemas-os-shell-linux-unit`, com acesso aberto, licença CC BY 4.0 declarada pela página, inglês e entrega link-only.
- Candidato regenerado: ver SHA registrado em `CURATION_BASELINE_2026-10-08.json`; 171/209 unidades cobertas, 38 gaps, 259 recursos e 45 questões; status continua `partial`.
- Ledger reconciliado com o candidato e hashes dos pareceres de fonte atualizados. Não houve alteração no pack ativo nem promoção.

## Execução adicional — 2026-10-08 05:47 UTC

- `nuvem-arquitetura-modelos-serverless-unit` recebeu recortes didáticos verificados sobre IaaS, PaaS, SaaS, FaaS, eventos e limites de responsabilidade; fonte Google Cloud, gratuita, em inglês e link-only. Unidade marcada `primary/full` apenas no candidato, aguardando QA independente.
- Candidato: SHA `1ec1656fd6cd4490b21120304fa160fa7543252ba26c400100fe9d17e0789d81`; 172/209 unidades cobertas, 37 lacunas, 260 recursos e 45 questões. Status `partial`, sem promoção.
- Ledger/baseline/hashes reconciliados. O pack ativo e seus recursos, questões, flashcards e progresso não foram alterados.

## Correção do registro de hash e andamento — 2026-10-08 05:48 UTC

- A linha anterior de progresso tinha uma expressão de shell literal no campo de hash; corrigida para o SHA efetivo `1ec1656fd6cd4490b21120304fa160fa7543252ba26c400100fe9d17e0789d81`.
- Último staging confirmou 209 unidades, 172 cobertas, 37 lacunas, 260 recursos e 45 questões. A reconciliação do ledger e do baseline corresponde ao candidato.
- A biblioteca continua `partial`; nenhuma promoção foi feita. O pack ativo segue em 119/209 unidades, 167 recursos, 45 questões e 64 flashcards.

## Pesquisa de atos organizacionais — 2026-10-08 05:55 UTC

- Fontes oficiais atuais adicionadas como cobertura parcial: RA14/2025 compilada, índice de estrutura, portal de integridade, Portaria58/2025 compilada, Portaria348/2026, RA6/2026.
- A RA14/2025 revoga RA19/2022, RA15/2023, RA23/2024 e RA6/2025; o índice público ainda lista atos antigos, exigindo conciliação. Portaria58/2025 tem alterações até Portaria455/2026.
- O candidato foi refeito: 209 unidades, 172 cobertas, 37 lacunas, 265 recursos, 45 questões; SHA-256 7fba2506c7d6183e27c82f9355ecd7363fbc3618dc30067eca703ba889db115d. Nenhuma lacuna foi fechada por esse inventário parcial; status continua partial.

## Fechamento candidato AD/LDAP — 2026-10-08 05:56 UTC

- Sequência didática Microsoft Learn + RFC4512 + OpenLDAP para AD DS, árvore DIT, DN/RDN, filtros e operações LDAP examinada diretamente; unidade sistemas-diretorios-ad-ldap-unit aprovada para cobertura completa no candidato e removida do ledger aberto. Fontes em inglês, gratuitas, link-only; riscos de pré-requisitos/licença declarados.
- Candidato regenerado: 173/209, 36 lacunas, 265 recursos, 45 questões, status partial; SHA-256 e546e3866dbdb03cce48a7ae92e3e10bfaa1bf1289786e8d562b553ea167f744. QA independente deste hash e promoção continuam pendentes.

## Fechamento candidato Bash/PowerShell — 2026-10-08 05:57 UTC

- Sequência GNU Bash 5.3 + PowerShell 101 e documentação de streams/redirecionamento examinada; unidade sistemas-os-shell-shell-powershell-unit fechada no candidato. O GNU HTML/PDF expirou no leitor web; texto das seções oficiais chegou via busca e a limitação está registrada para QA/rechecagem. Tudo link-only, sem cópia.
- Candidato: 174/209 cobertas, 35 lacunas, 266 recursos, 45 questões, status partial; SHA-256 049d19ab9c1c41388c8f8fcac56c6164df8e984c3b7032934a236d4c1e2b4dc8. QA independente e promoção continuam pendentes.

## Atualização 2026-10-08T06:02:37.382Z

- Candidato regenerado por stage-expansion.mjs; SHA-256 a336c683b87b4426d23ac5ba005acee1142b7b3197facdb1b35ebc55f6e396f2.
- Cobertura candidata: 177/209; lacunas documentadas: 32; recursos: 266; questões: 45; status partial.
- A unidade Wi-Fi foi atualizada com uma sequência de leitura Cisco/Microsoft sobre bandas, canais e WPA2/WPA3; segue candidata até QA independente no hash exato. A biblioteca ativa não foi alterada.

## Candidato atualizado após revisão de regência/crase — 2026-10-08T06:08:06.801Z

- Capítulos 7–8 de Português Instrumental (EdUECE, 3ª ed.) avaliados como cobertura candidata da unidade de regência/crase; link-only por divergência sobre licença de reprodução e QA independente ainda requerido.
- Candidato regenerado: SHA-256 803d71d0884a4d399658b7f83cdd71147c152c0dddd97ca1bcb1fd405d5efd52; 178/209 cobertas, 31 lacunas, 267 recursos, 45 questões; status partial.
- Ledger e hashes dos pareceres reconciliados. O catálogo ativo não foi alterado nem promovido.

## Candidato completo e revalidado — 2026-10-08T15:25:00Z

- `close-legal-library-gaps.mjs` foi corrigido para declarar `reviewedAt` no momento real
  de execução e para disponibilizar o lookup antes das alterações às fontes.
- A consolidação oficial da Lei 20.756 foi reaberta. O PDF consultado contém 218 páginas,
  não 83; o registro foi corrigido para descrever leitura dirigida dos artigos pertinentes,
  sem afirmar leitura integral de notas e materiais compilados. A Lei 15.122, art. 2º, §2º,
  na redação da Lei 23.500/2025, confirma a aplicação subsidiária aos cargos efetivos
  Auditor e Técnico de Controle Externo. As exceções revogadas e a competência do SISCOR
  limitada ao Executivo estão expressamente contextualizadas.
- Regenerado o candidato exato `d22ef5dd855a6f23dda7beaecbdd2dac768c63854448589dcf8fefb43bbe3de8`:
  209/209 unidades, 45/45 tópicos, 317 recursos, 22 percursos elegíveis, 45 questões e zero
  lacunas. O banco de questões candidato é idêntico ao banco ativo; histórico preservado.
- `validate-staged.mjs`: schema/factory sem erros; 22/22 percursos elegíveis; cobertura
  integral e zero gaps. `record-candidate-evidence.mjs` atualizou o ledger e baseline e
  reconciliou as hashes do pack ativo sem escrever no Exam Pack.
- `node scripts/validate-content.mjs`: os três Exam Packs passaram. `node scripts/content-audit.mjs`:
  TCE-GO 0 alertas (45 questões, 64 flashcards e 167 recursos ativos); pendências do pack
  TJTO permanecem explícitas e fora desta conclusão factual.
- `node --test` com `PLAYWRIGHT_BROWSERS_PATH=C:\Users\felip\AppData\Local\ms-playwright`,
  fora do perfil AppContainer: 202/202 passaram, incluindo testes reais de IndexedDB,
  concorrência entre abas e Service Worker offline. No sandbox de perfil, os navegadores não
  conseguem criar alguns arquivos temporários; esse modo falha por ambiente.
- `INTEGRATION_QA.json` registra `pending` para o SHA novo. A aprovação histórica de outro
  SHA foi preservada como histórica e não reaproveitada. Sem parecer independente final,
  candidato permanece não promovido e o pack ativo `partial` continua intacto.
- Gates remanescentes: QA independente do SHA exato; B6/segundo pack com curadoria factual,
  acessibilidade e auditoria separada do catálogo offline/links externos; B7 de manutenção;
  P1/release, incluindo validação real de auth/Supabase, caso essa fase permaneça no escopo.

## Reinspeção e correções de integração — 2026-10-08 17:04 UTC

- Candidato `451157d6a75094274cb296ed65a6501644d00dcef8a6d5acf89eb7cec15656a3` aprovado por QA independente somente para promoção parcial. `completeApproved=false`; 116 gaps permanecem e não houve promoção.
- Factory/schema válida, zero erros, 209 unidades, 93 cobertas, 116 descobertas correspondentes ao ledger, 101 recursos verificados ativos, 221 recursos desconhecidos isolados como candidatos, 1 percurso elegível e 45 questões preservadas.
- QA confirmou source-map sem divergências, ausência de URLs duplicadas ativas e simulação de histórico que mantém o snapshot legado e anexa o catálogo ativo completo idempotentemente. A amostra direta foi de 9 URLs, não auditoria integral dos recursos ou questões/cartões.
- `validate-staged.mjs` passou. Testes focados: 18/18. `node --test` integral continua sem gate verde: execução browser falha por `ERR_NETWORK_ACCESS_DENIED` ao acessar localhost mesmo com o perfil Chromium permitido. O resultado não é apresentado como falha de asserções do produto nem como validação aprovada.
- Próxima execução permanece em fechamento editorial das 116 unidades e revisão individual de 45 questões/64 cartões. Também continuam pendentes UI/browser B5, segundo pack TJTO, manutenção B7 e gates de release; não declarar complete nem publicar com base nesta QA parcial.

## Verificação direta de fontes e reinspeção — 2026-10-08 17:10 UTC

- URLs oficiais e didáticas adicionais foram abertas diretamente nesta sessão. No SHA atual, foram integradas novas verificações browser/reachable para Lei Orgânica e Regimento TCE-GO, Decreto 8.771, guia OASIS Privacy by Design, Google code review, PostgreSQL 17, scikit-learn clustering, Foundations of Computational Agents, arquitetura MCP e tese do TCU. Outros links recém-abertos ainda aguardam registro e regeneração; abrir o link isoladamente não os torna ativos.
- Candidato exato `7d0b663ea92c3e6350b676f494e4bd54dac22f94e2130a18240837252db33bb8`: 107/209 cobertas, 102 gaps, 113 recursos ativos elegíveis e 209 links desconhecidos separados. QA independente aprovou promoção parcial; complete continua reprovado.
- Ao atualizar esse registro, foi encontrado e corrigido `hash` ausente no promotor; sintaxe e diff-check passaram. Não houve promoção.
- Revalidação de 16 testes direcionados: 16/16. Os três packs passaram schemas/factory. O content audit mantém alertas conhecidos do TJTO (3 questões, 2 recursos); estes não foram apagados nem tratados como resolvidos.
- Próximo passo: continuar verificação de candidatos e fechar unidades só com link elegível e evidência pedagógica suficiente; cada nova modificação muda o SHA e requer reinspeção. Conteúdo integral, questões/cartões, UI/browser, TJTO e release permanecem abertos.

## Segunda rodada de fontes e staging — 2026-10-08 17:11 UTC

- Novas URLs foram abertas diretamente: Constituição compilada de Goiás, Lei estadual 15.122, Lei 14.129, artigos Atlassian de continuidade/CMDB, handbook de incidentes, Portaria MTur 12/2025, guia de requisitos de segurança do TCE-PB, Kanban Guide 2025.5 e livro aberto introdutório sobre ISO/IEC 38500. Metadados `browser/reachable` foram registrados no parecer jurídico, mantendo os recortes editoriais existentes.
- Reaberta a URL oficial da IN 94/2022, que redirecionou para a página de legislação de contratações TIC; o destino foi registrado como `finalUrl`.
- Candidato atual `d7ef5d2e33a26b14851839da5c7294e9fec7cb731341d18c9572fb95335704f1`: 118/209 cobertas, 91 gaps, 124 recursos elegíveis e 198 candidatos desconhecidos. Factory/schema válidos, questões iguais às ativas e histórico preservado.
- QA parcial do SHA anterior `7d0b663e…` foi aprovada; não cobre o hash atual. Nenhuma promoção ou publicação executada.
- 16 testes focados passaram; `validate-content.mjs` passou nos três packs. `content-audit.mjs` mantém 3 alertas em questões TJTO e 2 recursos sem revisão editorial/proveniência suficiente. A suíte browser continua bloqueada por `ERR_NETWORK_ACCESS_DENIED` ao localhost.
## Trabalho nas lacunas — 2026-10-08 17:19 UTC

- Separei a cobertura de dependências/publicação em quatro recursos com proveniência individual: `package.json`, `package-lock.json`, SemVer 2.0.0 e `npm publish`. As páginas foram abertas; as referências npm têm licença de reprodução não verificada, acesso gratuito e entrega somente por link.
- Sequência registrada em `TECH_SOURCES_REVIEW.json` e integrada ao candidato como `path-npm-manifest-lock-version-publish`, mapeando a única unidade de objetivo sem atribuir o conteúdo de uma URL a outra.
- Candidato regenerado: SHA-256 `3498397638473f0f93ad2a52edd38c0885958f5f3f9eac8e7de97a3ed93c2a4e`; 164/209 cobertas, 45 lacunas e 2 percursos elegíveis. Status `partial`; QA independente deste SHA pendente e nenhum dado ativo promovido.
- `validate-staged.mjs` passou: factory/schema válidos, zero recursos ou percursos inelegíveis, 45 questões iguais às ativas e histórico legado preservado. `validate-content.mjs` passou nos três packs. Testes direcionados: 16/16. `content-audit.mjs` mantém os 5 alertas conhecidos do TJTO (3 questões e 2 recursos).
- Próximo passo: continuar fechando somente unidades cuja sequência didática, acesso e recortes estejam sustentados; depois congelar novo SHA e solicitar QA independente. A curadoria integral, B5/B6/B7 e release seguem abertos.
## Trabalho nas lacunas — 2026-10-08 17:21 UTC

- Curadoria incorporou e separou proveniência para seis fontes nos domínios de software/DevOps e nuvem: Fowler refatoração e dívida técnica, Driessen Gitflow, DORA trunk-based, GitHub pull requests, GitLab merge requests, IETF RFC 8259 e AWS Lambda; o NIST SP 800-145 recebeu nova checagem direta.
- Percursos candidatos construídos para npm manifesto/lockfile/SemVer/publicação; refatoração e dívida técnica; feature/release/hotfix versus trunk; revisão PR/MR com dois fornecedores; JSON/XML/namespaces; IaaS/PaaS/SaaS e exemplo serverless baseado em eventos.
- Candidato exato `50029d3cc567ac247a7eccafe6ae206b1f8ca701a5e41abfe890045a905ae39e`: 168/209 unidades cobertas, 41 gaps, 164 recursos elegíveis, 6 percursos elegíveis, 45 questões. Status `partial`; nenhuma promoção; QA independente do SHA pendente.
- `validate-staged.mjs`: factory/schema válidos, zero recursos e percursos inelegíveis, questões ativas preservadas, histórico legado íntegro. `validate-content.mjs` passou nos três packs. Testes focados: 16/16. O pack ativo e os dados de progresso continuam inalterados.
- Pendências mantidas: 41 unidades no ledger, revisão factual completa de questões/cartões, B5/B6/B7 e P1/release. O content audit ainda aponta 3 questões e 2 recursos do TJTO sem evidência editorial suficiente.
## Correção de reconciliação de percursos — 2026-10-08 17:22 UTC

- `stage-expansion.mjs` agora remapeia IDs de recurso citados no parecer editorial para o ID canônico do recurso deduplicado no Exam Pack. `staging-metadata.mjs` contém a função testada que faz essa reconciliação; isso evita descartar silenciosamente um percurso quando o recurso reaproveita URL/ID de baseline.
- Correção revelou e fechou a sequência cloud/serverless que estava no parecer, mas era removida do pack por divergência de IDs; cobertura candidata ficou 169/209 com 40 lacunas.
- Novo SHA: `fe85381bbc417680919ea12b930599df9e03d2846210e2902be727ee1246daf5`, 164 recursos ativos, 7 percursos elegíveis. QA independente continua pendente e o candidato não foi promovido.
- Validação final da rodada: `validate-staged.mjs` passou com zero erros e questões/histórico preservados; `validate-content.mjs` passou nos três packs; 17 testes direcionados passaram. A auditoria TJTO ainda registra as mesmas 5 pendências.
## Novos percursos de REST e ambientes — 2026-10-08 17:24 UTC

- A curadoria separou Fielding REST, métodos HTTP e status HTTP (MDN) em três registros independentes; os links foram abertos diretamente e o percurso mapeia cada parte do objetivo REST aos seus recortes.
- Ambientes: Microsoft Cloud Adoption Framework, Twelve-Factor (config/build-release-run/dev-prod-parity) e Google Cloud deployment methodology viraram registros distintos e percurso sequencial com locators próprios. Licenças não verificadas permanecem link-only.
- Candidato SHA-256 `532708c23056f592ec4a0756539f40157eac91ce4167e8454e0cac824425f9fb`: 171/209 cobertas, 38 gaps, 172 recursos elegíveis e 9 percursos elegíveis; `partial`, nenhuma promoção, QA independente pendente.
- Validação de staging/schema/factory sem erros; questões/histórico preservados; testes direcionados 17/17. As fontes recém-checadas só demonstram acesso, enquanto os recortes educacionais e limites estão individualizados nos pareceres.
## Fechamento candidato de IA/agentivos — 2026-10-08 17:25 UTC

- Fonte de inference do Hugging Face foi lida diretamente e cobre o objetivo estreito sobre tokens, predição do próximo token, janela de contexto e limites computacionais/arquiteturais; o recorte permanece vinculado a essa página e limitações de modelo variam.
- Seis fontes foram divididas por URL em pareceres: Anthropic Skills e Permissions; especificação de Tools do MCP; GitHub Responsible Use; Anthropic workflows/best practices; OWASP LLM01 e LLM02. Três percursos editoriais separam instrução/ferramentas/permissões, validação de saída e riscos/IP.
- Candidato SHA-256 `828630ece1a373f6bdc83415666312144e49f938f0e597fd27cb0e3903c159d3`: 175/209 unidades cobertas, 34 gaps, 180 recursos ativos elegíveis, 12 percursos, 45 questões e status `partial`. QA independente do hash pendente; sem promoção.
- `validate-staged.mjs` passou (schema/factory, questões e histórico); testes focados 17/17. A revisão integral de conteúdo e as demais gates continuam abertas.
## Correção do percurso Windows — 2026-10-08 17:28 UTC

- Separei o antigo registro agregado em publicações Microsoft Learn por URL: processos/threads, Task Manager, memória virtual, contas locais, estrutura de volumes/diretórios/arquivos, NTFS e controle de acesso. Cada etapa do percurso tem recorte e locator próprios; edições e limites dependentes de versão permanecem explícitos.
- O extrator mostrou corpo das páginas junto a banner genérico de autorização. O candidato registra a URL como alcançada pelo extrator, mas mantém em `limitations` que a disponibilidade em navegador humano não foi validada; licença de reprodução desconhecida mantém link-only.
- Corrigi a data de revisão futura que tornava os recursos inelegíveis. Após staging, 1 unidade saiu do ledger: 176/209 cobertas, 33 gaps; 187 recursos e 13 percursos elegíveis. SHA-256: `54f3aa88f52da55738f43fd7784b36ec497b2d9e1a4f73cb9f58ebee3f874783`.
- `validate-staged.mjs` passou: factory válida, zero erros de schema/recursos/percursos inelegíveis, 45 questões iguais ao pack ativo e histórico legado de 289 questões/102 cartões preservado. Testes focados 17/17; `validate-content.mjs` aprovou os três packs; `content-audit.mjs` manteve os 5 alertas conhecidos de TJTO. `git diff --check` passou com avisos de conversão CRLF.
- QA independente do SHA atual continua pendente; pack ativo não foi promovido. Bash/PowerShell e as demais 32 unidades da fila seguem em aberto, além de revisão integral das questões/cartões, B5/B6/B7 e release.

## AD DS/LDAP e atributos NIST — 2026-10-08 17:28 UTC

- Registrei verificação de acesso direta para as quatro URLs da sequência AD DS/LDAP (Microsoft Learn, RFC 4512 e OpenLDAP Guide) e para NIST SP 800-12 Rev.1 que faltava na rota de atributos. Cada página segue parcial, com origem independente; Microsoft Learn mantém ressalva sobre banner de autorização do extrator.
- Os percursos AD DS/LDAP e atributos NIST passaram a elegíveis. Com o percurso Windows da mesma rodada: candidato `547fac9b5a5b2a350640eb77c515cabccc59e2c535197b2f22833c6249f0ffb5`, 178/209 cobertas, 31 lacunas, 192 recursos e 15 percursos elegíveis.
- `validate-staged.mjs` passou sem erros, com 45 questões iguais às ativas e histórico legado preservado. QA independente do hash atual ainda está pendente e nenhum conteúdo foi promovido.


## Lacunas legais, PMBOK 8 e ágil — 2026-10-08 18:00 UTC

- Formalizei verificação estruturada de acesso para 22 fontes de dois percursos legais TCE-GO e PMBOK 8, com URLs finais e método observados. Removi do percurso PMBOK a página PMI inacessível que servia apenas de catálogo; TOC oficial permanece como mapa, não como conteúdo integral.
- Fechadas no candidato as unidades de regime funcional subsidiário, organização/controle e PMBOK 8. Para PMBOK, mantive limites de acesso/escopo e a divergência de 42 entradas visuais versus 40 processos como pendência factual explicitada, sem afirmar equivalência não demonstrada.
- Acrescentei percurso autoral sobre valores/princípios ágeis, empirismo/estrutura Scrum e workflow/métricas Kanban, usando quatro URLs separadas e uma questão prática. Licenças e acesso gratuito seguem como campos distintos; recursos continuam link-only.
- Candidato regenerado e validado: `d36b4a09353147b52eb7d2be6f027b0b1fe1cc74ea42d35617667d370b8d6131`, 188/209 cobertas, 21 lacunas, 220 recursos elegíveis e 19 percursos elegíveis. Factory/schema válidos, 45 questões correspondentes ao pack ativo e histórico legado preservado.
- Testes focados: 17/17; `validate-content.mjs`: três packs válidos; `content-audit.mjs`: TCE-GO sem alertas e cinco alertas de proveniência/revisão no pack TJTO. `git diff --check` passou; avisos de normalização CRLF permanecem informativos.
- QA independente do hash atual continua pendente; biblioteca ativa permanece parcial e sem promoção. B5–B7, auditoria factual de todas as questões/cartões e demais 21 gaps permanecem em aberto.

## Fechamento candidato de cobertura ISO — 2026-10-08 18:34 UTC

- Consultei diretamente fichas oficiais ABNT 27001:2022 corrigida:2023, Emenda 1:2024, 27002:2022 e a ficha de cancelamento de 27000:2018 (03/07/2026); ISO 27000:2026 é edição internacional e não prova adoção nacional. O percurso de estudo e a ressalva da ausência de arquivo histórico exato no corte de 25/08/2026 foram registrados em `LANGUAGE_SECURITY_SOURCES_REVIEW.json`.
- Corrigida a elegibilidade da fonte didática Advisera já lida: registro agora inclui checagem direta de acesso, permitindo que o percurso entre no candidato. O staging fechou 209/209 unidades e 0 gaps; 309 recursos elegíveis, 43 percursos elegíveis, 56 candidatos desconhecidos isolados. SHA-256 `16153f384f00422a2fc7e06044b71a5e854bc85a045102533028426cc3b76eea`.
- `validate-staged.mjs` passou: factory e schema válidos, nenhuma fonte/percurso inelegível, 45 questões iguais às ativas e histórico de 289 questões/102 flashcards preservado. Testes de curadoria 20/20; validação dos três Exam Packs passou.
- Suíte integral: 177/190. As 13 falhas são de inicialização de browser/IndexedDB: binário Chromium Playwright ausente e Edge não inicia corretamente dentro do perfil sandbox. Registrado como pendência ambiental, sem classificar como sucesso.
- Auditoria de conteúdo: TCE-GO sem alertas; TJTO mantém 3 alertas de questões e 2 de recursos. Candidato não promovido; QA independente exata pendente. O hash é imutável para esse parecer e qualquer mudança exige novo SHA e nova inspeção.

### Congelamento final corrigido — 2026-10-08 18:35 UTC

- Corrigi a URL da ficha da Emenda 1:2024 para corresponder exatamente ao endereço oficial aberto (inclui `www`) e regenerei o candidato. SHA FINAL atual: `a16a2e28d3eac7e443e7dafdce7c238a98183d44b0af467867dd2d9df060505a`; 209/209 unidades, 0 lacunas, 309 recursos elegíveis, 43 percursos, 56 candidatos isolados; 45 questões inalteradas.
- Schema/factory e auditoria da biblioteca passaram; 20 testes focados passaram e validação dos três Exam Packs passou. A suíte completa anterior ficou em 177/190, com 13 problemas de inicialização de browser no ambiente local. A revisão independente deve usar somente este SHA final.
- QA exata pendente; conteúdo ativo continua `partial` e nenhum deploy, promoção ou publicação foi feito.

### Retificação final do locator ABNT — 2026-10-08 18:36 UTC

O inventário da aba aberta no navegador confirma que a ficha ABNT Emenda 1:2024 foi acessada pela URL sem `www`; o registro voltou a corresponder a esse endereço observado. Hash final congelado agora: `4597f81f942cbf205f7ec3dbfca8349f89d684a41ea44a72ba2b7ef11140f639`. Revalidação: 209/209 unidades, zero gaps, factory/schema válidos, 309 recursos e 43 percursos elegíveis, 45 questões iguais ao pack ativo e histórico preservado. QA independente solicitada novamente para este hash exato; nenhuma promoção.

### Promoção local após parecer independente — 2026-10-08 18:38 UTC

- O revisor independente aprovou `complete` para o SHA `4597f81f942cbf205f7ec3dbfca8349f89d684a41ea44a72ba2b7ef11140f639`. Decisão e verificações registradas em `INTEGRATION_QA.json` e no topo de `INTEGRATION_QA.md`.
- `promote-library.mjs` promoveu a biblioteca local: 209 unidades/45 tópicos cobertos, 309 recursos v2; snapshot ativo anterior arquivado em `library-history.json`. As 45 questões, 64 flashcards e dados pessoais não foram modificados.
- `library-audit --require-complete` passou sem erros/avisos. `validate-content.mjs` e `content-audit.mjs` passaram para TCE-GO; a auditoria conserva cinco alertas do pack TJTO. Corrigido `validate-content.mjs` para auditar inventário ativo e candidatos em conjunto, evitando falsos órfãos em percursos que reutilizam fontes ativas.
- Build standalone local regenerado. Suíte integral pós-promoção: 177/190; 13 falhas de inicialização Chromium/Edge/IndexedDB reproduzem a limitação do ambiente. Não houve publicação, deploy, commit ou push.
- Restam os aceites B5 de navegador/mobile/offline, B6 para o segundo pack e seus cinco alertas, B7 de manutenção e gate P1/release. Biblioteca TCE-GO não tem lacunas de cobertura; essas são etapas operacionais distintas.

## B6 factual subgate do TJTO — 2026-10-08 18:42 UTC

- Confrontei as três questões do pack TJTO com o edital oficial FGV, com locators individualizados: Anexo I p.31/PDF30 para funções administrativas; Anexo II p.35/PDF34 para escolaridade; item 9.6.10.1 p.17/PDF16 para a redação. Removi banca/ano de questão, pois são itens autorais StudyOS derivados do edital, não questões aplicadas pela FGV. As três explicações e proveniências foram corrigidas.
- Os dois recursos do TJTO agora estão descritos como referências administrativas/normativas, não como fontes didáticas; ambos têm locators/revisão. As versões anteriores das três questões estão arquivadas no content-history do pack.
- QA independente aprovou e confirmou hashes estáveis dos quatro arquivos. Teste F11 do TJTO: 7/7; `validate-content.mjs` passou nos três packs; `content-audit.mjs` passou com zero alertas para ambos TCE-GO e TJTO.
- Corrigido o teste F11 que exigia metadados FGV/2022 nas questões; agora ele impede atribuição de prova não sustentada e exige provenance locator.
- Este subgate factual de B6 está fechado. A conclusão integrada de B6 ainda depende do aceite B5 de UI/mobile/teclado/offline e da verificação de isolamento/persistência no browser.

## Manutenção B7 definida — 2026-10-08 18:42 UTC

- Criado `docs/runbooks/DIDACTIC_LIBRARY_MAINTENANCE.md`, com função responsável, rechecagem por risco (30 dias para fonte normativa/produto e no máximo 90 dias para demais recursos), procedimento de troca/arquivo/regressão de `complete` para `partial`, evidência exigida e comandos de validação.
- O papel de mantenedor editorial está definido, mas o projeto ainda não registra uma pessoa responsável nominal. B7 permanece pendente até essa indicação e reconciliação final após B5/B6.

## Validação pós-promoção e B6 — 2026-10-08 18:45 UTC

- Pack TCE-GO ativo: `library-audit --require-complete` passou (209/209, 45/45, 309 recursos, 43 percursos). `validate-content.mjs` passou nos três packs.
- TCE-GO e TJTO: `content-audit.mjs` sem alertas. Teste F11 TJTO 7/7; QA independente aprovou a revisão factual TJTO e hashes dos quatro arquivos.
- Suíte integral final: 177/190 passaram, 13 falharam ao iniciar IndexedDB/browser por Chromium ausente e perfil Edge restrito. A aprovação da biblioteca é estrutural/editorial, não substitui esse gate operacional.
- Build local standalone atualizado. UI/B5 permanece sem prova visual; o CUA bloqueou o protocolo file e proibiu workaround por servidor/execução indireta. A continuidade requer URL HTTPS de staging autorizada.
- B7: procedimento 30/90 dias documentado; falta nomear responsável editorial. Nenhum push/deploy/publicação foi realizado.
