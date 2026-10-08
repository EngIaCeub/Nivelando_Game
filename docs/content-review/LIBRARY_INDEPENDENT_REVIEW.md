# Parecer independente da biblioteca TCE-GO TI

Revisor: agente `/root/library_review`, GPT-6.1 Sol / high. Data: 2026-10-07.
Ownership: este relatório e `SOURCES_REVIEW.json`. Critérios: `contracts/DIDACTIC_LIBRARY.md`,
`skills/resource-curation/SKILL.md` e `docs/runbooks/DIDACTIC_LIBRARY_ACCEPTANCE.md`.

## Veredito inicial

**Biblioteca completa: reprovada. Biblioteca parcial: admissível após os recortes e
metadados abaixo serem aplicados e revistos.** As 45 unidades têm IDs coerentes com o
currículo, mas `syllabusRefs` vazios e objetivos que apenas repetem os títulos. Isso não
constitui decomposição auditada de todos os subitens. Nenhum dos 20 recursos legados
pode receber `primary/full` de uma unidade ampla automaticamente.

A extração integral das páginas 19–22 do PDF local foi lida com `pypdf`. O arquivo é
`exam-packs/tce-go-ti-2026/edital-01-2026-oficial.pdf`, 25 páginas. A URL oficial
[Edital 01/2026](https://portal.tce.go.gov.br/documents/20181/1541044/EDITAL%20N%C2%BA%2001%202026%20-%20ABERTURA%20DE%20INSCRI%C3%87%C3%95ES.pdf/ec3ecccd-39d9-4785-aefd-18109214b306)
retornou `Internal Error` nesta revisão; isso é bloqueio da ferramenta, sem sucesso
remoto presumido. Os dois registros de edital apontam para o mesmo documento.

O Anexo II p.19, observação 1, limita legislação e jurisprudência à data da publicação
do edital. A assinatura na p.17 é 24/08/2026; a assinatura não comprova a data de
publicação. A [notícia oficial](https://portal.tce.go.gov.br/-/tce-go-abre-concurso-publico-para-tecnico-de-controle-externo), seção inicial, afirma publicação no Diário Oficial em
25/08/2026. Esta é evidência oficial de relato da publicação; o exemplar do diário não
foi lido nesta revisão. Para normas, registrar o corte como **25/08/2026, data de
publicação do Edital de Abertura reportada pelo TCE-GO**. Não confundir
`retrievedAt:2026-10-02` com corte normativo. O conteúdo exige explicitamente OWASP
Top 10:2025, COBIT 2019, ITIL v4, ISO/IEC 38500:2024, PMBOK 8ª edição e PDTI 2025–2026.

## Revisão dos 20 recursos legados

Todos os acessos e leituras desta seção ocorreram em 2026-10-07 via ferramenta web.
Leitura significa texto do corpo efetivamente retornado e avaliado; não significa
leitura de todos os capítulos do site, execução de laboratórios ou assistir a vídeos.
Inglês nos portais deve substituir `language:pt-BR` presumido. Duração 30 minutos
uniforme não tem evidência: usar `null` até estimativa editorial fundamentada.
Entrega é somente `link`; licença desconhecida não autoriza cópia ou bundle.

| ID | Classificação | Evidência lida, locator e recorte admissível |
| --- | --- | --- |
| `resource-edital-oficial` | Portal/documento não didático | PDF local p.19–22, Anexo II. Referência de escopo; não ensina legislação institucional nem TI. `topicIds` atuais são IDs de disciplina, não os tópicos refinados. HTTP remoto não confirmado. |
| `resource-tce-concursos` | Portal não didático | [URL exata](https://portal.tce.go.gov.br/concursos), seção “Concurso Público TCE-GO”: anos de concurso e painel. Serve a avisos do certame; não explica matérias. |
| `resource-fcc` | Portal não didático | [URL exata](https://www.concursosfcc.com.br/), seções “Inscrições abertas” e “Últimos gabaritos e resultados”. Não é banco identificado de questões nem material de legislação. |
| `resource-mdn-javascript` | Manter com recorte | [Landing](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript) e [Sintaxe e tipos](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Grammar_and_types), seções “Declarações”, “Escopo de variável”, “Constantes”. Apenas JS parcial em `devsistemas-linguagens-web`. Tradução fala em sete tipos/seis primitivos e omite BigInt; landing refere ECMAScript 2018 como referência atual. Não aprovar esses trechos como estado atual nem cobrir Java/Node/Python/React/HTML/CSS/TS. |
| `resource-owasp-top10` | Manter com recorte | [Original](https://owasp.org/www-project-top-ten/) redireciona [projeto](https://owasp.org/projects/top-ten). [Edição exigida 2025](https://top10.owasp.org/2025/) e [A01](https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/) lidos: “Description”, “How to prevent”, “Example attack scenarios”. Parcial de segurança de aplicações; não cobre continuidade/ISO/DevSecOps inteiro. Trocar URL para versão 2025 explícita; inglês observado. |
| `resource-postgresql` | Manter com recorte | [Índice](https://www.postgresql.org/docs/) é seletor de versões; [17 SQL](https://www.postgresql.org/docs/17/tutorial-sql.html), [2.5 Querying a Table](https://www.postgresql.org/docs/17/tutorial-select.html), [3.4 Transactions](https://www.postgresql.org/docs/17/tutorial-transactions.html) efetivamente lidos. SELECT/WHERE/ORDER BY/DISTINCT e atomicidade/BEGIN/COMMIT/ROLLBACK. Inglês; parcial de SQL e operação PostgreSQL. Não cobre Oracle/NoSQL/álgebra/ACID integral/otimização integral. |
| `resource-python` | Manter com recorte | [Original](https://docs.python.org/3/) é índice inglês; [Python 3.13, tutorial 3](https://docs.python.org/pt-br/3.13/tutorial/introduction.html) lido nas seções 3.1.1 Números, 3.1.2 Texto e 3.1.3 Listas. Recorte português e versão 3.13 explícitos. Parcial de linguagem; automação/back-end precisam outras aulas. |
| `resource-docker` | Manter com recorte | [Índice](https://docs.docker.com/) tem busca/IA e produtos; [What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/) lido: definição, características, comparação VMs e laboratório. Inglês, teoria gratuita; instalação/licença de produto são distintas. Parcial containers. Não abrange AD/LDAP, Git, Compose ou Kubernetes. |
| `resource-openapi` | Manter com recorte | [Original latest](https://spec.openapis.org/oas/latest.html) retornou OpenAPI 3.2.1, 10/09/2026. Seções 2 Introduction, 3 Format, 4.2 Info Object e licença Apache 2.0 lidas. Fixar uma edição em vez de `latest`; não dar cobertura completa a REST/GraphQL/WebSockets/OAuth/OIDC/JWT/dependências. 3.2.1 é posterior à data auxiliar 25/08/2026; o corte legal não se aplica automaticamente à documentação técnica, mas diferenças de versão precisam ser expostas. |
| `resource-git` | Manter com recorte | [Original](https://git-scm.com/doc) é redirecionador; destino [Reference](https://git-scm.com/docs) lido. [Pro Git 2.1 Getting a Git Repository](https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository) lido, inicialização e clone. Capítulo pt-BR tentou acesso e recebeu Internal Error; manter inglês com recorte real. Parcial Git; não cobre branching/revisão/plataformas/pipelines/containers integralmente. |
| `resource-powershell` | Manter com recorte | [Índice](https://learn.microsoft.com/pt-br/powershell/) e [PowerShell 101, capítulo 2](https://learn.microsoft.com/pt-br/powershell/scripting/learn/ps101/02-help-system?view=powershell-7.5), “Os três cmdlets principais”, “Obter Ajuda”, parâmetros e exemplos lidos. Get-Help/Get-Command/Get-Member; parcial PowerShell. Não abrange Linux/Windows/processos/memória/arquivos inteiros. |
| `resource-official-edital-programa-o3` | Portal/documento não didático | Mesmo PDF local; Anexo II p.19, final p.20, p.21 e início p.22. Referência de escopo para todos os 45 tópicos, sem aprendizagem primária. URL remota falhou. |
| `resource-planalto-constituicao-o3` | Manter com recorte | [Texto oficial](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), arts.37–41 e 70–75. Foram lidos os dispositivos de Administração Pública e fiscalização; reference/partial, pois texto legal não oferece explicação/exercícios e jurisdição específica estadual está fora. Página consolidada exige comparação com corte do edital antes de usar alterações posteriores. |
| `resource-planalto-lgpd-o3` | Manter com recorte | [Texto oficial](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm), arts.5, 6, 12, 46–50: conceitos, princípios, anonimização e concepção/segurança. Reference/partial para `legti-lgpd`; não atribuir automaticamente “privacy by default” à redação legal literal. Comparar alterações com corte. |
| `resource-planalto-marco-civil-o3` | Manter com recorte | [Texto oficial](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm), arts.9–15: neutralidade, proteção/guarda e registros. Reference/partial. Não confundir 1 ano do art.13 com 6 meses do art.15; controlar texto vigente no corte. |
| `resource-w3c-html-css-o3` | Portal não didático | [Original](https://www.w3.org/standards/webdesign/htmlcss) agora redireciona [Web Standards](https://www.w3.org/standards/), seções promessa/justificativa dos padrões. Não há curso HTML/CSS no recorte retornado. Substituição exige novo recurso específico lido. |
| `resource-scrum-guide-o3` | Manter com recorte | [Guia HTML 2020](https://scrumguides.org/scrum-guide.html), Definition, Theory, Values, Team, Events e Artifacts lidos. Inglês; authors Ken Schwaber/Jeff Sutherland; guia referencial do Scrum parcial de `engsoft-ciclos`. Não cobre Kanban/Lean/XP/ciclos preditivos. |
| `resource-nist-csf-o3` | Portal não didático | [Original](https://www.nist.gov/cyberframework), CSF 2.0 e [Quick-Start Guides](https://www.nist.gov/cyberframework/quick-start-guides), lista/objetivo dos guias lidos. É índice de documentos. PDFs de guias não lidos nesta revisão; não aprovar cobertura pedagógica deles. CSF não substitui ISO 27000 do edital. |
| `resource-kubernetes-docs-o3` | Manter com recorte | [Original inglês](https://kubernetes.io/docs/home/), “Understand Kubernetes” e links de conceitos; [Visão Geral pt-BR](https://kubernetes.io/pt-br/docs/concepts/overview/) lida, “Voltando no tempo” e o que Kubernetes oferece. Tradução tem aviso de desatualização; admitir apenas conceitos básicos estáveis com ressalva/versão inglês para aprofundamento. Parcial de orquestração; AD/LDAP/Git/Docker Compose estão fora. |
| `resource-python-video-o3` | Candidato bloqueado | [URL exata](https://www.youtube.com/watch?v=CJtrNuTTs4Q) retornou Internal Error. Autoria, edição, disponibilidade, licença, duração e timecodes não confirmados; não aprovar nem alegar assistir. |

Resultado: 13 manter com recorte, 6 portais/documentos não didáticos, 1 candidato
bloqueado. “Manter com recorte” é parecer sobre trechos lidos, condicionado à aplicação
dos metadados v2 e não significa `primary/full`. Nenhuma fonte foi rejeitada por baixa
qualidade geral sem leitura; portais podem continuar como referências de navegação.

## Matriz de escopo das 45 unidades

Referência comum: Edital 01/2026, Anexo II. Páginas são as impressas do PDF e coincidem
com índices 18–21 em pypdf. Cada linha mantém `topicId`; a unidade correspondente tem
suffix `-study`. “Explicitar” significa adicionar recortes/objetivos verificáveis e
syllabusRefs: resumo do título sozinho não demonstra cobertura do subitem. Conteúdos
do cargo A01 na p.19–20 não pertencem ao B02 e não devem ser importados por proximidade.

| topicId | Locator proposto em syllabusRefs | Recortes/objetivos a explicitar |
| --- | --- | --- |
| `lp-texto` | p.19, conhecimentos gerais, Língua Portuguesa | Redação oficial; ortografia/acentuação; gêneros; contexto histórico; denotação/conotação; discurso direto/indireto/indireto livre; intertextualidade. Contexto/discursos/semântica estão ausentes do título. |
| `lp-morfossintaxe` | p.19, Língua Portuguesa | Morfossintaxe; formação de palavras; figuras; pronomes; flexões; vozes; sinonímia/antonímia e correlação de tempos/modos devem constar expressamente. |
| `lp-sintaxe-redacao` | p.19, Língua Portuguesa | Crase/pontuação/concordância/regência; coordenação/subordinação/conectivos; reconhecer frases corretas, reorganizar orações e transformar estruturas equivalentes. |
| `mrl-aritmetica` | p.19, Matemática e Raciocínio Lógico, primeiro período | Inteiros/racionais, potência, expressões, naturais/múltiplos/divisores e frações; resolver problemas, não apenas definições. |
| `mrl-proporcoes` | p.19, Matemática e Raciocínio Lógico, segundo período | Divisão em partes proporcionais ausente do título; razões, regra de três simples, porcentagem/acréscimos/descontos. |
| `mrl-logica` | p.19, Raciocínio Lógico, três períodos finais | Relações arbitrárias pessoas/lugares/objetos/eventos; dedução/avaliação de condições; formação de conceitos/discriminação de elementos; conclusões válidas a partir de hipóteses. |
| `leginst-constituicao` | p.19, Legislação Institucional, primeiro período | CF1988 Administração Pública e controle/fiscalização; delimitar arts.37–41 e 70–75 com corte e não confundir TCU com TCE-GO. |
| `leginst-tce` | p.19, Legislação Institucional, períodos 2–4 | Constituição GO sobre TCE; Lei16.168/2007; RI Res22/2008 e alterações. Identificar dispositivos e edição compilada no corte. |
| `leginst-servidor` | p.19, Legislação Institucional, períodos 5–final | Leis15.122/2005 e20.756/2020; ética; políticas governança/pessoas/segurança/riscos/dados quando existentes; demais organização/gestão; RA15/2024 Sistema de Planejamento e Gestão falta no título. |
| `engsoft-ciclos` | p.20, B02 Engenharia de Software, dois primeiros períodos | Fundamentos; ciclos preditivo/iterativo/incremental/adaptativo e combinações; Scrum/Kanban/Lean/XP separados. |
| `engsoft-requisitos-arquitetura` | p.20, B02 Engenharia de Software, requisitos/arquitetura | Levantamento/especificação/análise/validação/gerenciamento; funcionais/não funcionais; camadas/SOA/microsserviços/eventos; coesão/acoplamento faltam explícitos. |
| `engsoft-modelagem-qualidade` | p.20–21, B02 Engenharia de Software, Modelagem até dívida técnica | UML/BPMN; padrões criacionais/estruturais/comportamentais; desempenho/escalabilidade/disponibilidade/confiabilidade/manutenibilidade; testes unitários/integração/funcionais/regressão/carga/estresse/automação; revisão/refatoração/dívida. |
| `devsistemas-fundamentos` | p.21, Desenvolvimento de Sistemas, primeiro/dois períodos | Algoritmos, lógica, estruturas de dados; POO e programação funcional com exemplos comparativos. |
| `devsistemas-linguagens-web` | p.21, Desenvolvimento de Sistemas, linguagens/front-end e desenvolvimento web | Java básico; JS/Node; React; Python automação/back-end; HTML5/CSS3/TS. Material de uma linguagem é partial. |
| `devsistemas-apis-identidade` | p.21, Desenvolvimento de Sistemas, APIs até final | RESTful/GraphQL/WebSockets/JSON/XML; OAuth2/OIDC1.0/tokens/claims/JWT; Git; OpenAPI/Swagger; gerenciamento dependências, empacotamento e publicação ausentes do título detalhado. |
| `ia-agentivos-llm` | p.21, Engenharia de Software Assistida por IA, início | Fundamentos IA no desenvolvimento; LLMs; programação por intenção e desenvolvimento orientado à linguagem natural. |
| `ia-agentivos-contexto` | p.21, Engenharia de Software Assistida por IA, contexto e assistentes | Engenharia contexto/prompts; arquitetura de assistentes CLI/IDE, exemplos Claude Code/Antigravity CLI ou equivalentes. CLI/IDE estão ausentes dos objetivos atuais. |
| `ia-agentivos-ciclo-mcp` | p.21, Engenharia de Software Assistida por IA, Ciclo agentivo até final | Descoberta/planejamento/ações arquivos e shell/verificação/self-healing; geração/revisão/documentação/depuração/testes; memória/RAG/vetores/MCP/skills/tool-use; qualidade/alucinação/segurança/privacidade/PI/ética. |
| `devops-cicd` | p.21, DevOps, primeiro e último períodos | Integração/entrega/implantação; pipelines build/test; GitHub Actions/GitLab CI/Jenkins ou correlatas explicitamente. |
| `devops-iac-observabilidade` | p.21, DevOps, IaC e Observabilidade | Configuração; instrumentação/correlação eventos/indicadores técnicos aplicações e infraestrutura além de métricas/logs/traces/alertas. |
| `devops-git-containers` | p.21, DevOps, Controle de versão até Ambientes | GitHub/GitLab; Git Flow/trunk-based; PR/MR/revisão; Docker/Compose/Kubernetes; dev/homologação/produção. Separar material de Git e de containers. |
| `bd-modelagem` | p.21, Banco de Dados, primeiro período | ER, normalização e desnormalização com modelos/exemplos e limites. |
| `bd-sql` | p.21, Banco de Dados, SQL até Procedures/triggers/views | SQL/álgebra/transações/ACID/índices/otimização; **procedures/triggers/views faltam** no título e objetivos. |
| `bd-tecnologias-operacao` | p.21, Banco de Dados, Bancos relacionais até final | Admin/otimização PostgreSQL/Oracle; NoSQL documentos/chave-valor/wide-column/grafos, casos de uso; MongoDB/Redis; vetores/embeddings; replicação/backup/recuperação/**alta disponibilidade**/segurança/governança. |
| `ia-dados-ml` | p.21, IA Ciência de Dados e Automação, início | Fundamentos/supervisionado/não supervisionado/reforço/redes neurais/**deep learning**. |
| `ia-dados-generativa` | p.21, IA Ciência de Dados e Automação, PLN até multimodais | PLN; generativa conceitos/aplicações; agentes; multimodalidade. |
| `ia-dados-rag-etica` | p.21, IA Ciência de Dados e Automação, prompts até final | Prompts/contexto/RAG; automação/sistemas; responsável/explicabilidade/governança/LGPD; coleta/preparação/limpeza/transformação/exploração/análise; estatística/avaliação; Big Data/distribuído/3Vs; **Estratégia Brasileira de IA** ausente. |
| `seguranca-principios` | p.21, Segurança da Informação, início/classificação | CIA/autenticidade/não repúdio; riscos/vulnerabilidades/**gestão incidentes/classificação da informação**. |
| `seguranca-cripto-identidade` | p.21, Segurança da Informação, Controle acesso/Criptografia | Autenticação versus autorização/IAM; simétrica/assimétrica/PKI/certificados/assinatura digital. |
| `seguranca-aplicacoes-continuidade` | p.21, Segurança da Informação, Segurança aplicações até final | OWASP2025/DevSecOps/APIs/containers/nuvem; backup/BC/DR; **malware/ransomware/phishing/engenharia social/firewalls/antivírus/IDS/IPS/pentest/análise vulnerabilidades**; Zero Trust; família ABNT NBR ISO/IEC27000. |
| `sistemas-os-shell` | p.21, Sistemas Operacionais Redes e Nuvem, primeiro/dois períodos | Admin Windows/Linux/processos/memória/arquivos; shell/PowerShell e automação scripts. |
| `sistemas-diretorios` | p.21, Sistemas Operacionais Redes e Nuvem, diretórios/virtualização | AD/LDAP; virtualização e containers separados. Docker não cobre AD/LDAP. |
| `redes-protocolos` | p.21, Sistemas Operacionais Redes e Nuvem, Redes | TCP/IP/IPv4/IPv6/DNS/DHCP/HTTP2/HTTP3/HTTPS/SMTP/FTP/SSH/VPN/proxies; **redes sem fio** ausente; balanceamento/firewalls devem ter referência cruzada nuvem. |
| `nuvem-arquitetura` | p.21, Sistemas Operacionais Redes e Nuvem, redes + Computação nuvem | Balanceamento/firewalls; IaaS/PaaS/SaaS/serverless/escala/HA/monitoramento; **integração locais e nuvem** ausente. |
| `governanca-alinhamento` | p.21, Governança TI, início | Estratégia e objetivos institucionais com exemplos e responsabilidades. |
| `governanca-servicos` | p.21, Governança TI, Gestão serviços/portfólio | Catálogo/incidentes/problemas/mudanças/configuração/portfólio/ativos/continuidade. |
| `governanca-modelos` | p.21, Governança TI, Boas práticas e projetos | COBIT2019/ITILv4/ISO38500:2024/PMBOK8ª e ágeis. Edição distinta não supre edição exigida; acesso pago é complementar. |
| `governanca-publica` | p.21, Governança TI, Contratação TIC até final | Lei14.133/2021 aplicada TIC; Lei14.129/2021; Decreto12.069/2024 ENGD2024–2027 e recomendações/atualizações no corte. |
| `legti-lgpd` | p.21, Legislação Aplicada TI, primeiro período | LGPD aplicação desenvolvimento/operação; design **e by default**, minimização/anonimização/pseudonimização. Lei é referência, boa prática técnica requer explicação própria. |
| `legti-marco-civil` | p.21–22, Legislação Aplicada TI, Marco Civil | Lei12.965/2014 neutralidade/proteção/registro conexão versus acesso. |
| `legti-normas-tce` | p.22, Legislação Aplicada TI, Requisitos até LC205 | **Segurança em contratações TIC e certificação digital/aplicação sistemas** não constam título; LC205 de19/05/2025; recorte institucional só com texto oficial conferido. |
| `legti-pdti` | p.22, Legislação Aplicada TI, Normativos até final | RN13/2016 CETI compilada; RA14/2024 Governança Organizacional; RA17/2024 Segurança; RA14/2025 DTI/unidades; PDTI2025–26 aprovado OS001/2025-CETI. Não confundir RA14/2024 com RA15/2024. |
| `ingles-compreensao` | p.22, Língua Inglesa, primeiro período | Textos técnicos/científicos TI: prática de compreensão com pergunta e evidência localizada. |
| `ingles-estrategias` | p.22, Língua Inglesa, Estratégias | Ideia principal e informações específicas com exercícios; link em inglês sozinho não ensina estratégia. |
| `ingles-documentacao` | p.22, Língua Inglesa, Vocabulário e Interpretação | Vocabulário TI + interpretar manuais/software/artigos/APIs. Documentação real pode ser corpus parcial, exige guia didático e prática. |

## Condições para promoção

1. Aplicar e revisar os recortes v2 individualmente; verificar idioma e URL final reais.
2. Preservar ID ao substituir um portal por recorte; registrar troca no histórico.
3. Manter legislação como `reference/partial` com corte explicitado até revisão histórica.
4. Biblioteca `partial`; scopeReview pode documentar a auditoria item a item somente
   depois de syllabusRefs/objetivos incorporarem esta matriz. A auditoria não é cobertura.
5. Vídeo permanece candidato; portais genéricos não geram primary/full.
6. Rodar schemas e library-audit após integração. A aprovação dos recortes abaixo
   não aprova automaticamente os cartões, os mapeamentos ou a implementação runtime.

## Parecer final da proposta curada

**34 fontes aprovadas para links externos com cobertura parcial; 0 fontes rejeitadas
na versão revisada. Biblioteca completa continua reprovada.** O registro por ID e o
SHA256 da versão efetivamente revisada estão em `SOURCES_REVIEW.json`. Não houve
promoção no pack por este revisor. Os 64 cartões do draft têm revisão separada e não
recebem aprovação deste parecer.

Draft revisado: SHA256 `A9B6D69B6EEC0D47C517F3BB81F11D72A67A1874DEC49F901603B14DC8F62902`.
Fechamento: 2026-10-07 04:42:22 UTC. A restrição dos índices a busca/manutenção foi
aplicada pelo Orchestrator antes deste fechamento.

As leituras independentes ocorreram em 2026-10-07. Foram avaliados os corpos dos
recortes abaixo; não apenas resultados de busca, disponibilidade HTTP ou sumários.
Em documentos extensos a leitura restringe-se às seções indicadas. Não foi lido o
artigo RAG integral nem executados exemplos/laboratórios. `approvedSourceIds` aprova
a qualidade e pertinência destes recortes; não significa `full`, duração validada,
licença de reprodução ou aula completa sobre toda a unidade.

| ID | Parecer | Fonte exata e recorte efetivamente avaliado |
| --- | --- | --- |
| `curated-pg-transactions` | Aprovar partial | [PostgreSQL18 Tutorial3.4](https://www.postgresql.org/docs/18/tutorial-transactions.html), exemplo bancário e BEGIN/COMMIT/ROLLBACK: tudo ou nada, alterações confirmadas e cancelamento. Não demonstra todo ACID/SQL. |
| `curated-pg-foreign-keys` | Aprovar partial | [Tutorial3.3](https://www.postgresql.org/docs/18/tutorial-fk.html), cities/weather e integridade; [5.5.5](https://www.postgresql.org/docs/18/ddl-constraints.html#DDL-CONSTRAINTS-FK), parágrafo sobre NULL/MATCH FULL/NOT NULL. Tutorial isolado não sustenta exceções de NULL. |
| `curated-pg-indexes` | Aprovar partial | [18 §11.1](https://www.postgresql.org/docs/18/indexes-intro.html), busca em tabela, CREATE/DROP INDEX, planejador, construção e sincronização. Confirma benefício potencial e overhead de manutenção. Espaço e reconstrução não estão literalmente explicados neste recorte. |
| `curated-pg-backup` | Aprovar partial | [18 capítulo25](https://www.postgresql.org/docs/18/backup.html), introdução: dump SQL, backup de arquivos e arquivamento contínuo. Índice introdutório efetivamente lido, sem certificação de procedimentos de recuperação. |
| `curated-python-structures` | Aprovar partial | [Tutorial5](https://docs.python.org/3/tutorial/datastructures.html), 5.1.1 pilhas, 5.1.2 filas/deque e 5.4 conjuntos. Listas em fila têm custo de deslocamento. Endpoint móvel retornou Python3.14.8; não é curso de todas as estruturas. |
| `curated-mdn-functions` | Aprovar partial | [Funções](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Functions), declarando/chamando funções, funções aninhadas/closures e preservação de variáveis. Português observado. Recursão com arguments.callee e outras seções fora do recorte não recebem aprovação atual. |
| `curated-scrum-2020` | Aprovar partial | [Guia2020](https://scrumguides.org/scrum-guide.html), Theory, Sprint e Artifacts: empirismo/Lean, transparência/inspeção/adaptação, timebox de até1mês, artefatos e compromissos. Rodapé confirma CC-BY-SA4.0; Scrum não cobre Kanban/XP/Lean inteiro. |
| `curated-progit-control` | Aprovar partial | [ProGit2,1.1](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control), VCS local/centralizado/distribuído e cópia do histórico. Não ensina branching/pipelines completos. |
| `curated-docker-container` | Aprovar partial | [What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/), processo isolado e kernel compartilhado versus VM. Não cobre toda administração Windows/Linux/diretórios. |
| `curated-k8s-components` | Aprovar partial | [Components](https://kubernetes.io/docs/concepts/overview/components/), Core Components: control plane/nodes, kube-apiserver, etcd, scheduler e kubelet. Conceitos básicos, sem operar cluster nem confirmar todos componentes opcionais. |
| `curated-otel-signals` | Aprovar partial | [Signals](https://opentelemetry.io/docs/concepts/signals/), Traces/Metrics/Logs/Baggage e seus significados. Baggage é contexto propagado; não presumir que seja sinal de monitoramento equivalente aos outros três. |
| `curated-github-actions` | Aprovar partial | [Understand Actions](https://docs.github.com/en/actions/get-started/understand-github-actions), overview/workflows/jobs/runners: eventos, jobs, steps e execução. Não prova fluxo completo de implantação nem GitLab/Jenkins. |
| `curated-terraform-intro` | Aprovar partial | [What is Terraform?](https://developer.hashicorp.com/terraform/intro), providers/APIs e Write/Plan/Apply, dependências e estado. Introdução IaC, sem validar configuração, secrets ou recuperação operacional. |
| `curated-rfc6749` | Aprovar partial | [RFC6749](https://www.rfc-editor.org/rfc/rfc6749), §1/1.1/1.4: autorização delegada, quatro papéis e token de acesso com escopo/duração. A RFC2012 foi atualizada por RFCs posteriores; recorte conceitual não recomenda implicit/password grant em sistemas atuais. |
| `curated-rfc7519` | Aprovar partial | [RFC7519](https://www.rfc-editor.org/rfc/rfc7519), §3/JWS/JWE, 4.1.4/exp e 7.2/validação. JWT não garante cifragem ou assinatura por si só; aplicação precisa política e validação criptográfica. |
| `curated-oidc-core` | Aprovar partial | [Core1.0 errata2](https://openid.net/specs/openid-connect-core-1_0.html), Abstract/§1 e §2 IDToken/claims. Camada de identidade sobre OAuth2; IDToken expressa autenticação, não substitui access token para API. |
| `curated-openapi-311` | Aprovar partial | [OAS3.1.1](https://spec.openapis.org/oas/v3.1.1.html), Introduction e 4.8.24 SchemaObject: descrição API e tipos entrada/saída, JSONSchema2020-12. Corrigido locator amplo. Licença Apache2.0 visível; unknown é conservador para política somente-link. |
| `curated-rfc9110` | Aprovar partial | [RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html),9.2.1/9.2.2: safe versus idempotent. Side effects incidentais, como logs, podem existir; repetição não exige resposta idêntica. Não cobre HTTP2/3 inteiros. |
| `curated-nist800145` | Aprovar partial | [SP800-145](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf), §2 pp2–3 impressas (PDF5–6): cinco características, três serviços e quatro modelos implantação. Nota distingue controle IaaS/PaaS/SaaS. Sem serverless/HA integral. |
| `curated-sklearn-start` | Aprovar partial | [Getting Started](https://scikit-learn.org/stable/getting_started.html), Fitting/predicting e Pipelines: fit/predict, composição preprocessor/estimator, exemplo com split antes de fit. URL stable retornou1.9.1. Não demonstra todos paradigmas ML. |
| `curated-sklearn-leakage` | Aprovar partial | [Common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html),12.2/12.2.1: separar teste antes de preprocessing, não fit em teste, pipelines. Não afirmar que pipeline elimina toda possível fuga de dados. |
| `curated-rag-paper` | Aprovar reference/partial | [arXiv2005.11401](https://arxiv.org/abs/2005.11401), resumo v4 de12/04/2021: memória paramétrica/nonparamétrica, índice denso Wikipedia e retriever. **Só resumo lido**, sem aval de experimentos, reprodutibilidade ou artigo integral. |
| `curated-mcp-architecture` | Aprovar partial | [MCP2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/architecture), arquitetura/components/design principles: hosts, clientes1:1 para servidores, sessões e limites. Não ensina todo protocolo/skills/ciclo agentivo. |
| `curated-agent-workflows` | Aprovar partial | [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), What are agents?, augmented LLM, prompt chaining e evaluator-optimizer. Article19/12/2024, autoria ErikS./BarryZhang no rodapé. Padrões de fornecedor; não evidência universal de eficácia. |
| `curated-owasp-sqli` | Aprovar partial | [SQLInjection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html), Primary Defenses/Prepared Statements/Least Privilege: separação código/dados e privilégios mínimos. Nomes de tabelas dinâmicos precisam tratamento próprio; parâmetro não é defesa universal. |
| `curated-owasp-authz` | Aprovar partial | [Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), Introduction/LeastPrivilege/DenyDefault/EveryRequest. Autenticação difere de autorização. Menção a ranking2021 no texto é histórica; não confundir com edição2025 exigida. |
| `curated-nist-csf2` | Aprovar partial | [CSWP29](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), §2 pp3–5 impressas (PDF7–9): Govern/Identify/Protect/Detect/Respond/Recover, resultados e atividades simultâneas. Não substitui ISO27000, política do TCE ou checklist de execução. |
| `curated-cf-control` | Aprovar reference/partial | [CF](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm),70 caput/parágrafo único e71 caput. Congresso exerce controle externo com auxílioTCU. Recorte70paraEC19/1998 e caputs sem alteração posterior identificada; não transportar competências federais automaticamente ao TCE. |
| `curated-lgpd-principles` | Aprovar reference/partial | [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm),5I/III/V,6III e12: pessoal/anonimizado/titular, necessidade, reversibilidade. LocatorIII corrigido. Estes dispositivos2018 não têm alteração posterior indicada no corpo lido; não certificar lei consolidada inteira. |
| `curated-marco-neutrality` | Aprovar reference/partial | [Lei12.965](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm),9caput/§1 e13/15caputs: neutralidade/exceções, conexão1ano versus aplicações6meses com condições legais. Recortes originais2014, sem alteração posterior identificada neles. |
| `curated-openstax-fractions` | Aprovar partial | [Prealgebra2e4.1](https://openstax.org/books/prealgebra-2e/pages/4-1-visualize-fractions), fração/numerador/denominador/partes iguais e equivalência, b/c não nulos. Exemplos descritos no texto; não cobre inteiros/potências/aritmética inteira. |
| `curated-openstax-proportions` | Aprovar partial | [Prealgebra2e6.5](https://openstax.org/books/prealgebra-2e/pages/6-5-solve-proportions-and-their-applications), definição/crossproducts/unidades e percentproportions, exemplo45% de80=36. Não cobre divisão proporcional e todo raciocínio lógico. |
| `curated-bc-reading` | Aprovar partial | [How to read the text](https://learnenglishteens.britishcouncil.org/exams/reading-exams/how-read-text), skimming/scanning/readingdetail. Texto voltado B1/B2; adequação como estratégia introdutória, sem corpus técnicoTI completo. |
| `curated-funag-comma` | Aprovar partial | [Manual Vírgula](https://funag.gov.br/manual/index.php?title=V%C3%ADrgula), I.2b/vocativo e Conclusão(a,b)/termos essenciais-integrantes sem separação. Página credita Cunha/Cintra, Nova gramática2003 pp644–650; FUNAG compila/publica. Revisãooldid490,22/04/2020. Não reproduzir excertos do livro. |

### Metadados e limites de versão

- Correções LGPD5III, OpenAPI4.8.24 e URL índices11.1 foram reapreciadas no draft.
  FK exige manter a segunda URL5.5.5 em sua proveniência para NULL/MATCHFULL.
- Direitos: Scrum2020 é CC-BY-SA4.0 conforme o próprio rodapé. OpenAPI3.1.1
  informa Apache2.0; NIST800-145 informa ausência de copyright e solicita atribuição.
  Manter unknown nas demais entradas é uma escolha conservadora para link externo;
  não é confirmação de que todo material careça de licença. Código e documentação
  de projetos podem ter condições diferentes. Nenhuma cópia externa foi autorizada.
- FUNAG é provider/compiladora. Acrescentar Cunha/Cintra2003 à evidência de autoria
  do conteúdo referido; não declarar FUNAG autora exclusiva da explicação original.
- Versões dinâmicas Python3/scikit-learn stable e páginas contínuas precisam preservar
  versão observada/data de checagem; futuras leituras podem retornar texto diferente.
- Para índices, há suporte literal para busca/planejador/manutenção/construção.
  Custos de armazenamento ou reconstrução precisam outra referência localizada se
  forem apresentados como fatos verificados deste recorte específico.

### Corte normativo dos recortes legais

A data25/08/2026 é sustentada pela notícia oficial e pela regra do AnexoIIp19,
conforme registrado no início. A comparação foi limitada aos dispositivos usados:
CF70parágrafo com EC19/1998, CF70/71caputs e LGPD5I/III/V,6III,12 e MCI9caput/§1,
13/15caputs. Os recortes lidos não exibem modificação posterior ao corte. O portal
LGPD contém alterações2026 sobre a ANPD em outros dispositivos, portanto sua
consolidação atual inteira **não** recebeu certificação histórica. Julgados,
regulamentos e legislação estadual não foram auditados integralmente. Não declarar
que estas três referências completam Legislação Institucional/AplicadaTI.

### Decisão de integração

É admissível promover os34 recortes externos somente como partial, preservando
as restrições acima e a separação entre fonte e aprendizagem. Mapeamentos por unidade,
objetivos do edital, licenças/URLs e schema devem ser confrontados após integração.
O parecer não libera `complete`: permanecem lacunas de materiais, exercícios,
normativos estaduais/institucionais e edições específicas da matriz de45unidades.

## QA independente da integração efetiva

Inspeção estática dos arquivos reais em 2026-10-07 04:46 UTC. Escopo: pack,
`site-app.js`, `content-bank.js`, `validate-content.mjs`, `integrate-curation.mjs`,
empacotamento e consumo de cobertura. Não foram executados testes, build, navegador
ou checks offline por este revisor. Sucesso de publicação ou experiência visual não
é inferido desta leitura.

### Dados e honestidade da cobertura

- `resources.json` contém exatamente 34 IDs aprovados, todos v2, ativos, somente
  link e `estimatedMinutes:null`. URL inicial, título, idioma, locator, role,
  reviewer/data e associação topicId/unitId conferem com o draft aprovado.
- Cada mapping é `partial`; nenhuma unidade recebeu `full`. Há associação de
  recursos a 31 das 45 unidades, que não significa cobertura integral dessas 31.
- `library.json` permanece `status:partial`, `scopeReview:pending`. Todas as 45
  unidades receberam syllabusRefs do Anexo II pp.19–22. Objetivos ainda amplos
  permanecem provisórios; o parecer não promove revisão integral do escopo.
- RAG permanece reference/partial e locator explícito de resumo v4. Legislação
  permanece reference/partial; LGPD inciso III e OpenAPI4.8.24 corrigidos.
  Fonte complementar FK5.5.5 foi preservada em sourceRefs do flashcard pertinente.
- Scrum preserva CC-BY-SA4.0 com evidenceUrl; demais fontes unknown e entrega link.
  Correção de crédito Cunha/Cintra consta no editorialReview.evidence da FUNAG.
- O cálculo de biblioteca exige recurso primary/full elegível para marcar unidade
  coberta, e revisão de escopo para declarar complete. O catálogo não modifica
  score/mastery/XP. Contagem de itens em content-coverage permanece LOW/EMPTY.

### Continuidade e seleção de novos conteúdos

- Histórico contém 289 questões, 102 cartões e 20 recursos. Comparação dos objetos
  question/card com HEAD encontrou **zero alterações**. Não há IDs sobrepostos
  entre bancos ativos e históricos. Hash do arquivo histórico:
  `852AA107947867B85FEC2C1AA1156DDCDB158B77845AC34A2CAFFFC0614E8471`.
- `withHistoricalContent` recusa reutilização de ID e compõe lookup de textos.
  StudyUI recebe este lookup e resolve apenas IDs da sessão armazenada.
- Novos diagnósticos, questões por tópico, flashcards e seleção de treino usam
  ensureQuestions/ensureCards ativos. Sessão pendente antiga mantém seus IDs.
  Atividade antiga sem sessão já iniciada é bloqueada quando seus IDs foram
  retirados, com aviso para renovar agenda; não cria sessão nova com os itens antigos.
- O aviso de sessão anterior explica retirada editorial e preservação das primeiras
  respostas. Engine de scoring não foi alterado pela integração; campos persistidos
  de score não são recalculados a partir da nova resposta do banco.
- `validate-content.mjs` verifica sobreposição/duplicação histórica, schema dos
  itens arquivados e revisão independente dos novos itens, além dos checks de pack.
  Isto é inspeção do código de validação, não resultado de execução.
- Integrador confere SHA256 dos dois drafts contra os pareceres antes de escrever,
  filtra IDs aprovados, preserva arquivo histórico existente e gera cobertura parcial.
  Build inclui os JSON do pack e arquivos JS do site no manifesto local de cache;
  esta configuração não prova retomada real/offline ou export/import.

### Ajustes apresentados ao Orchestrator

1. FUNAG: UI mostra authors como autoria. Recomendada identificação dos autores
   creditados, com FUNAG explicitamente como compilação; evidência textual já corrigida.
2. RFC6749 e RFC7519: finalUrl foi preenchido com URL inicial, mas a leitura web
   registrou redirecionamento para `https://www.rfc-editor.org/info/rfc6749/` e
   `https://www.rfc-editor.org/info/rfc7519/`. Registrar destinos observados.
3. Textos do LibraryUI chamam covered/full apenas “recurso primário revisado” e
   sua ausência “revisão pendente”. Isto pode mostrar zero recursos revisados apesar
   dos recortes aprovados. Contador e badge devem explicitar **cobertura primária
   integral**, preservando a distinção entre revisão aprovada e lacuna de cobertura.

Não foi encontrada falha material de preservação/seleção de histórico na leitura
estática. Integração de dados admissível como parcial, sujeita aos ajustes de crédito,
destino URL e wording acima, à execução dos gates pelo Orchestrator e sem alegação
de biblioteca completa, experiência visual validada ou offline exercitado.

### Reinspeção e aceite após correções

Em **2026-10-07 04:48:09 UTC**, os três ajustes foram conferidos nos arquivos reais:
FUNAG identifica Cunha/Cintra e compilação; RFC6749/7519 registram os destinos /info/;
contador e badges explicam cobertura primária integral. O integrador contém as
correções de metadados, mantendo o draft assinado sem alteração do hash. Permanecem
34 recursos com mappings partial, 45 unidades e scopeReview pending.

**Aceite independente da integração parcial no escopo estático inspecionado.**
Nenhuma falha material remanescente identificada nesta revisão. Schema/testes foram
relatados pelo Orchestrator e não executados por este revisor. O aceite não certifica
publicação, browser, offline, sincronização ou aprendizagem longitudinal e não
promove biblioteca complete.

Artefatos finais inspecionados (SHA256):

| Arquivo | SHA256 |
| --- | --- |
| resources.json | B3A20B3C53840B9C7BD022A3E3CD94AE28D284EECE8A087FF536A85925BA2C2B |
| library.json | 0685ABCA780ACB82B7C33B0D3A670EE65B3F5409FE4AB5BD67354BFADA4858AC |
| content-bank.js | 4E30FD5BE83991D4F94BE68454402E04CB3B6251F68467E081C8CE33B0C99EC1 |
| site-app.js | 62613FCDB0B49C9B314EB214D70980972F3157B7FCC1FDFB1BBA837CBDF04BCF |
| validate-content.mjs | 54BFC8A148854E24B79EAC8652EF0032BBED58BE7FEA319ACC915F3F414E1792 |
| integrate-curation.mjs | D8E5BC82122988CC58A2644E32AF762C29B1F742DC70833032CB87546B3CBA36 |
| library-ui.js | 9AFBC34DE2DCCD0E2391F720022CE5CFCC36A39A8C3C27486CB7670C2F1C4C0D |
