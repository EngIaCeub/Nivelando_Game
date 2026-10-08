# Parecer de domínio — curadoria técnica

Revisor: /root/tech_completion, GPT-6.1 Sol/high, COMPLEX. Data UTC: 2026-10-08T06:35:51.064768+00:00. Veredito: **partial — QA independente pendente**.

Preservadas **112 unidades**, todos os objetivos e **18 topicIds**. **108 fontes**, **112 unidades com proposta primary/full** e **0 lacunas documentais de cobertura**. A retomada ampla partiu de 70 full/42 gaps; incremento acumulado de 42 unidades. **Nesta retomada foram fechadas as quatro lacunas por fontes focais alternativas**, preservando os seis candidatos pending (SHU legado e cinco candidatos recentes) e suas ressalvas. As decisões novas são parecer de domínio sujeito à QA independente de integração. O status partial mantém essa pendência de aceitação; não declara biblioteca global complete. Sem promoção ou integração do Exam Pack/runtime.

## Critério e escopo


- Conferência com matriz LIBRARY_INDEPENDENT_REVIEW.md, Anexo II B02 pp.20–21 e contratos DIDACTIC_LIBRARY/CONTENT_VALIDATION; skills resource-curation e question-ingestion.
- Um material primary/full precisa ensinar todos os objetivos da unidade. URL200, portal, snippet, índice ou enumeração de títulos não contam como leitura pedagógica.
- Objetivos e topicIds não foram reduzidos para produzir cobertura. syllabusRefs usam source, conforme schema.
- Recursos gratuitos externos são delivery:link. Licença de reprodução distinta do acesso; nenhuma autorização para embed/bundle foi inferida.
- As fontes deste arquivo são propostas revisadas; integração e validação do Exam Pack pertencem ao Orchestrator.

## Cobertura por tópico

| topicId | Unidades | primary/full | Lacunas |
|---|---:|---:|---:|
| engsoft-ciclos | 6 | 6 | 0 |
| engsoft-requisitos-arquitetura | 9 | 9 | 0 |
| engsoft-modelagem-qualidade | 7 | 7 | 0 |
| devsistemas-fundamentos | 4 | 4 | 0 |
| devsistemas-linguagens-web | 9 | 9 | 0 |
| devsistemas-apis-identidade | 10 | 10 | 0 |
| ia-agentivos-llm | 3 | 3 | 0 |
| ia-agentivos-contexto | 2 | 2 | 0 |
| ia-agentivos-ciclo-mcp | 7 | 7 | 0 |
| devops-cicd | 4 | 4 | 0 |
| devops-iac-observabilidade | 5 | 5 | 0 |
| devops-git-containers | 7 | 7 | 0 |
| bd-modelagem | 3 | 3 | 0 |
| bd-sql | 7 | 7 | 0 |
| bd-tecnologias-operacao | 10 | 10 | 0 |
| ia-dados-ml | 5 | 5 | 0 |
| ia-dados-generativa | 5 | 5 | 0 |
| ia-dados-rag-etica | 9 | 9 | 0 |

## Evidência e limites editoriais


Os campos evidence e locator de cada fonte registram o conteúdo lido e as seções. As seguintes decisões merecem atenção na integração:

- SWEBOK v4.0a, IEEE, PDF411p, agosto2026: requisitos, casos de uso, histórias, ciclos, coesão/acoplamento e testes receberam recortes. Fundamentos receberam complemento Introduction§1/Ch.7/Ch.10; SOLID/KISS/DRY/YAGNI receberam candidato Rheinwerk em alemão, registrado full na revisão factual do Orchestrator, com QA independente de integração pendente.
- Normalização: fonte Janusz R. Getta/UOW lida para1FN, dependências parciais/2FN e3FN. Não usar explicação defeituosa de2FN do BCcampus com chave simples nem confusão BCNF/4FN da Microsoft. BCcampus foi aprovado apenas no recorte de ER e relações, com FKNULL complementada pelo PostgreSQL.
- PostgreSQL17: procedimentos, triggers e views possuem recortes distintos; SQL tutorial, transações, índices/EXPLAIN, comparação backup lógico/físico/PITR, recuperação específica §25.3.5 e standby/failover foram lidos. Não foi executado banco, benchmark ou restauração: é revisão documental. Administração PostgreSQL recebeu complemento integral nesta retomada; Álgebra clássica de conjuntos recebeu slides dos autores Ramakrishnan/Gehrke, com QA independente; Oracle 19c foi aprovado no escopo conceitual da unidade, com limites de versão e produto registrados.
- NoSQL: Cassandra (colunas amplas) e Neo4j (grafos) foram lidos anteriormente; MongoDB documentos/embedding/references/CRUD, Redis chave/estruturas/TTL e Qdrant vetores/métricas/HNSW foram lidos neste fechamento. Excluem-se anúncios/funcionalidades novas não necessárias aos objetivos.
- EBIA: PDF MCTI52p obtido por GET pelo Orchestrator e reinspecionado independentemente; objetivos p.7, nove eixos/ações pp.17–50, governança e perspectivas. Documento2021 e metas históricas não demonstram execução atual da política. O PDF da Câmara reproduz apenas parte da Portaria e não substitui a EBIA integral.
- Big Data: NIST SP1500-1r2 v3/2019, §§3.1–3.2.4,3.3.2,4.1–4.1.3 foram reinspecionados no PDF primário: Vs, escala, partição/coordenação, arquivos/blocos, localidade, replicação e processamento distribuído; sem promessa universal de desempenho.
- Estatística: oito páginas NIST/SEMATECH lidas, inclusive fim de Measures of Scale e capítulos de amostragem; descrição/dispersão/distribuições, IC frequentista e testes t. Tradução deve preservar a distinção entre confiança do procedimento e probabilidade do parâmetro.
- RAG Lewis v4: a questão original conserva evidência restrita ao abstract. Nesta retomada foi aberto o PDF19p v4 e lido o método/limites (Fig1/§§2–2.5 pp2–4 e §§4.2–4.3/§6 pp6/8/9), fechando as duas unidades de RAG. PyTorch, Spinning Up, Hugging Face, pandas e scikit-learn fecharam deep learning, reforço, multimodalidade, PLN, preparação e avaliação.
- JavaScript: tipos/controle/laços/funções/escopo/objetos/promises/erros foram lidos em MDN; Python funcional foi complementado com funções de ordem superior map/filter/starmap. Nenhum exemplo foi executado nesta curadoria.
- Disponibilidade: alguns GET diretos retornaram403 (Redis/NIST); os corpos necessários foram acessíveis e lidos pela ferramenta web no mesmo dia. Portal Pro Git403 teve alternativa GET200 no repositório oficial dos autores, agora aprovado nos recortes específicos. O timeout anterior do Planalto foi corrigido na leitura do Orchestrator; a lei continua referência normativa. Radar ANPD e NT27 foram reinspecionados para aplicação em IA e estão pendentes de QA. Uma falha não significa link definitivamente quebrado.

### Recortes adicionais da retomada


Uma referência de livro/manual HTML pode conter seções em páginas distintas da mesma publicação. Complementos de outro provedor não devem ser fundidos como um recurso focal. Todos permanecem delivery:link; não há conteúdo externo servido localmente.

- **tech-pytorch-deep-learning** — [PyTorch — Build the Neural Network, Automatic Differentiation e Optimization](https://docs.pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html). Unidades: ia-dados-ml-redes-deep-unit. Recorte: Build Model: NeuralNetwork/Model Layers/Model Parameters, linhas293–465; autogradqs_tutorial.html: Computing Gradients/More on Computational Graphs, linhas297–390; optimization_tutorial.html: Hyperparameters/Loss Function/Optimizer/Full Implementation, linhas363–462.

- **tech-claude-skills-mcp-tools** — [Claude Code — Skills e permissões; MCP Tools 2025-06-18](https://code.claude.com/docs/en/skills). Unidades: ia-agentivos-ciclo-mcp-skills-tools-unit. Recorte: Skills: Create your first skill linhas148–191, frontmatter390–414, supporting files512–529, permissions587–599; https://code.claude.com/docs/en/permissions linhas64–85; https://modelcontextprotocol.io/specification/2025-06-18/server/tools: tools/list, tools/call, schema, consentimento e Security Considerations, corpo integral25–415.

- **tech-google-code-review** — [Google Engineering Practices — What to look for in a code review](https://google.github.io/eng-practices/review/reviewer/looking-for.html). Unidades: engsoft-modelagem-qualidade-revisao-unit. Recorte: Corpo integral: Design, Functionality, Complexity, Tests, Naming, Comments, Style, Consistency, Documentation, Every Line, Context e Summary.

- **tech-fowler-refactoring-debt** — [Martin Fowler — Definition of Refactoring e Technical Debt](https://martinfowler.com/bliki/DefinitionOfRefactoring.html). Unidades: engsoft-modelagem-qualidade-refatoracao-unit. Recorte: Definition of Refactoring (1 Sep2004), parágrafos definidores linhas72–76; https://martinfowler.com/bliki/TechnicalDebt.html (21 May2019), corpo integral linhas74–101.

- **tech-progit-basics-remotes** — [Pro Git 2nd edition — Recording Changes, Basic Branching e Working with Remotes](https://raw.githubusercontent.com/progit/progit2/main/book/02-git-basics/sections/recording-changes.asc). Unidades: devsistemas-apis-identidade-git-basico-unit, devops-git-containers-git-distribuido-unit. Recorte: Recording Changes: status/tracked/untracked/staging/git add/diff e Committing Your Changes/Skipping the Staging Area; https://raw.githubusercontent.com/progit/progit2/main/book/03-git-branching/sections/basic-branching-and-merging.asc: Basic Branching até reintegração hotfix; https://raw.githubusercontent.com/progit/progit2/main/book/02-git-basics/sections/remotes.asc: corpo integral.

- **tech-hf-pln-generativa** — [Hugging Face LLM Course — Pipelines, Transformers, Tokenizers e Bias](https://huggingface.co/learn/llm-course/chapter1/3). Unidades: ia-dados-generativa-pln-unit, ia-dados-generativa-generativa-unit. Recorte: chapter1/3: Working with pipelines, Zero-shot classification, Text generation, Mask filling, Named entity recognition, Question answering, Summarization, Translation e Conclusion; chapter2/4: Word/Character/Subword, Encoding/Tokenization/Input IDs/Decoding; chapter1/4: language modeling, encoder/decoder e attention; chapter1/9: corpo integral.

- **tech-hf-multimodal** — [Transformers — Multimodal chat templates](https://huggingface.co/docs/transformers/main/en/chat_templating_multimodal). Unidades: ia-dados-generativa-multimodal-unit. Recorte: Corpo integral: ImageTextToTextPipeline, Using apply_chat_template, Video inputs e Passing decoded video objects.

- **tech-sklearn-unsupervised** — [scikit-learn User Guide — Clustering e Principal Component Analysis](https://scikit-learn.org/stable/modules/clustering.html). Unidades: ia-dados-ml-nao-supervisionado-unit. Recorte: §2.3 introdução, §2.3.1 overview e §2.3.2 K-means; https://scikit-learn.org/stable/modules/decomposition.html §§2.5.1.1–2.5.1.3.

- **tech-spinningup-rl** — [Spinning Up — Key Concepts in Reinforcement Learning](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html). Unidades: ia-dados-ml-reforco-unit. Recorte: Introduction linhas14–19; Key Concepts and Terminology28–105; Trajectories/Reward and Return/RL Problem127–180.

- **tech-anthropic-context-prompts** — [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). Unidades: ia-agentivos-contexto-prompts-unit, ia-agentivos-contexto-contexto-unit, ia-dados-rag-etica-prompts-contexto-unit. Recorte: 29 Sep2025: Context engineering vs. prompt engineering linhas18–35, Anatomy of effective context36–50, Context retrieval51–65, long-horizon/Compaction/Structured note-taking66–81; complementar https://code.claude.com/docs/en/best-practices: critérios/exemplos67–82, prompts146–171, memória184–210, especificação352–362.

- **tech-claude-coding-workflows** — [Claude Code — Common workflows e Best practices para tarefas de software](https://code.claude.com/docs/en/common-workflows). Unidades: ia-agentivos-llm-intencao-unit, ia-agentivos-llm-assistencia-unit. Recorte: Common workflows: overview/find relevant code53–129, bugs136–164, refactor171–206, tests213–244, PR251–277, documentation282–317; https://code.claude.com/docs/en/best-practices: critérios67–82, explore/plan/implement88–127, contexto146–171, security reviewer299–315 e interview/spec352–362.

- **tech-claude-terminal-ide** — [Claude Code — Arquitetura e terminal versus extensão VS Code](https://code.claude.com/docs/en/how-claude-code-works). Unidades: ia-agentivos-ciclo-mcp-cli-ide-unit. Recorte: How works: ciclo31–35, Models/Tools40–64, acesso69–78, interfaces83–104; https://code.claude.com/docs/en/vs-code: apresentação74–86, prompt/seleção123–138, comparação563–572, CLI integrado588–597.

- **tech-hf-llm-inference** — [Hugging Face LLM Course — Text Generation Inference](https://huggingface.co/learn/llm-course/chapter1/8). Unidades: ia-agentivos-llm-llm-unit. Recorte: Understanding the Basics102, Context Length110–123, Prefill130–139, Decode144–154; chapter2/4 tokenização lida em tech-hf-pln-generativa; Anthropic Best practices https://code.claude.com/docs/en/best-practices linhas57–61,67–82,146–171.

- **tech-copilot-validation** — [GitHub — Responsible use of Copilot agents e validação do código assistido](https://docs.github.com/en/copilot/responsible-use/agents). Unidades: ia-agentivos-ciclo-mcp-validacao-unit. Recorte: §10 Best practices linhas254–272; Claude Best practices https://code.claude.com/docs/en/best-practices linhas67–82,74–76; Common workflows https://code.claude.com/docs/en/common-workflows testes213–244.

- **tech-postgres-administration** — [PostgreSQL17 — Configuração, roles, manutenção e monitoramento](https://www.postgresql.org/docs/17/config-setting.html). Unidades: bd-tecnologias-operacao-postgres-unit. Recorte: §§19.1.1–19.1.3; https://www.postgresql.org/docs/17/database-roles.html §21.1 integral e role-membership.html §21.3 integral; routine-vacuuming.html intro/§24.1.1–2 e §24.1.3 integral; monitoring-stats.html §§27.2.1–2 (conceitos/coleta/cache) e §27.2.3 tabela27.3 e nota state/wait_event.

- **tech-poole-mackworth-agents** — [Artificial Intelligence: Foundations of Computational Agents 3E — agentes e ambientes](https://artint.info/3e/html/ArtInt3e.Ch2.S1.html). Unidades: ia-dados-generativa-agentes-unit, ia-dados-ml-fundamentos-unit. Recorte: §2.1 integral, exemplos2.1–2.3, §§2.1.1–2.1.3; https://artint.info/3e/html/ArtInt3e.Ch1.S1.html definição inicial de AI/agentes/limitações e inteligência orientada a objetivos.; §1.3 integral em https://artint.info/3e/html/ArtInt3e.Ch1.S3.html confirma autonomia/semi-autonomia; §1.5.3 representação estados/features e §1.5.5 aprendizagem em https://artint.info/3e/html/ArtInt3e.Ch1.S5.html; §1.6.2 Tasks linhas43–87 em https://artint.info/3e/html/ArtInt3e.Ch1.S6.html.

- **tech-rag-lewis-v4-method** — [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks — v4 método](https://arxiv.org/pdf/2005.11401v4). Unidades: ia-agentivos-ciclo-mcp-rag-vetores-unit, ia-dados-rag-etica-rag-unit. Recorte: PDF19p, arXivv4 12 Apr2021: §1 pp1–2, Fig1p2, §§2–2.5 pp2–4, §3intro p4, §§4.2–4.3 p6, efeitoK/trocaíndice p8 e §6 p9.

- **tech-pandas-sklearn-preparation** — [pandas e scikit-learn — coleta tabular, limpeza, exploração, imputação e split](https://pandas.pydata.org/docs/getting_started/intro_tutorials/02_read_write.html). Unidades: ia-dados-rag-etica-preparacao-unit. Recorte: 02_read_write corpo56–190; 06_calculate_statistics.html §§Aggregating statistics linhas69–115; https://pandas.pydata.org/docs/user_guide/missing_data.html: valores/isna primeiros3k e Dropping missing data/fillna; https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.drop_duplicates.html parâmetros/exemplos; https://scikit-learn.org/stable/modules/impute.html §§8.4–8.4.2; cross_validation.html intro/§3.1.1/Data transformation with held-out data.

- **tech-sklearn-model-evaluation** — [scikit-learn — escolha de métricas e cross-validation](https://scikit-learn.org/stable/modules/model_evaluation.html). Unidades: ia-dados-rag-etica-avaliacao-unit. Recorte: §3.4.1 Which scoring function should I use? completo com exemplo quantil99%; §3.4.4.4 Balanced accuracy; §3.4.4.9 intro/Binary classification; §§3.4.6.2–3 MAE/MSE/RMSE; https://scikit-learn.org/stable/modules/cross_validation.html introdução, §3.1.1 e Data transformation with held-out data.

- **tech-driessen-dora-branching** — [Git-flow de Vincent Driessen e DORA Trunk-based development](https://nvie.com/posts/a-successful-git-branching-model/). Unidades: devops-git-containers-branching-unit. Recorte: Driessen artigo2010: The main branches/Supporting/Feature/Release/Hotfix/Creating/Finishing, corpo37–221 e nota2020linhas9–19; https://dora.dev/capabilities/trunk-based-development/: corpo integral/práticas/limites/mensuração.

- **tech-environments-artifact-promotion** — [Environments e promoção do mesmo artefato — Microsoft, Twelve-Factor e Google Cloud](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/considerations/environments). Unidades: devops-git-containers-ambientes-unit. Recorte: Microsoft: tabela dev/test/staging/UAT/prod linhas31–56; https://12factor.net/config, /build-release-run, /dev-prod-parity corpos integrais; https://docs.cloud.google.com/architecture/blueprints/enterprise-application-blueprint/deployment-methodology: Application CI/CD pipeline/Continuous integration/Continuous deployment.

- **tech-npm-packages** — [npm CLI v10: package.json, package-lock.json, publish; SemVer 2.0.0](https://docs.npmjs.com/cli/v10/configuring-npm/package-json/). Unidades: devsistemas-apis-identidade-pacotes-unit. Recorte: package.json §§name/version/files/scripts/dependencies/devDependencies/private; https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json/ §Description; https://docs.npmjs.com/cli/v10/commands/npm-publish/ §§Description/Files included in package; https://semver.org/ §§Summary/Specification regras1–11, Why Use Semantic Versioning.

- **tech-owasp-copilot-agent-risks** — [OWASP LLM Top10:2025 LLM01/LLM02; complemento GitHub Copilot](https://genai.owasp.org/llmrisk/llm01-prompt-injection/). Unidades: ia-agentivos-ciclo-mcp-riscos-unit. Recorte: OWASP LLM01:2025 §§Definition, Direct/Indirect Prompt Injections, Prevention1–7, Example scenarios1–9; https://docs.github.com/en/copilot/responsible-use/agents §§7 Limitations (Security risks/Public code matches),9 mitigations (permissions/exfiltration),10 best practices (IP scanning/review).; OWASP https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/ §§Definition/CommonExamples/AccessControls/Scenarios1–3.

- **tech-wisconsin-relational-algebra** — [Database Management Systems, 3rd edition: Chapter4 PartA, Relational Algebra](https://pages.cs.wisc.edu/~dbbook/openAccess/thirdEdition/slides/slides3ed-english/Ch4_Algebra.pdf). Unidades: bd-sql-algebra-unit. Recorte: PDF7p, Ch.4A: pp.2–4 slides4–12 (closure, selection/projection, union compatibility, difference/union, product, theta/equi/natural joins); pp.6–7 slides16–19 (composed Sailors/Reserves/Boats examples).

- **tech-shu-practical-uml** — [Practical UML: A Hands-On Introduction](https://teaching.shu.ac.uk/aces/pc/LEC_NOTE/CSSD/Tutorials/Java4/UMLonLine/index.html). Candidato pending para `engsoft-modelagem-qualidade-uml-unit`: diretamente lidos use case, class, sequence, statechart e activity. É recurso legado (última revisão 30/08/2002), copyright TogetherSoft, licença de reprodução desconhecida; aguardando conferência de notação UML 2.x e QA independente. Mantém o gap e não é entregue como recurso aprovado.

- **tech-camunda-bpmn-symbol-reference** — [BPMN 2.0 Symbol Reference](https://camunda.com/bpmn/reference/). Unidade: `engsoft-modelagem-qualidade-bpmn-unit`. Recorte aprovado independentemente para identificação/interpretação: Participants 63–137; Activities 140–204; Gateways 291–370; Events 34–61 e 373–576. Limites: referência didática de fornecedor, não especificação normativa OMG; convenções/engine-specific advice não são requisitos universais. Acesso gratuito observado, licença de reprodução desconhecida, link-only.

- **tech-refactoringguru-patterns** — [Refactoring.Guru: design patterns catalog and original teaching examples](https://refactoring.guru/design-patterns/catalog). Unidades: engsoft-modelagem-qualidade-patterns-unit. Recorte: Catálogo §§Creational/Structural/Behavioral; /design-patterns/factory-method §§Intent–Pseudocode/ProsCons; /design-patterns/adapter §§Intent–Pseudocode/ProsCons; /design-patterns/strategy §§Intent–Pseudocode/ProsCons.

## Reinspeção adicional de 2026-10-08 — candidatos pendentes

### tech-anpd-radar3-lgpd-ia

[Radar Tecnológico nº3 — Inteligência Artificial Generativa (1ª edição, novembro2024)](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/radar_tecnologico_ia_generativa_anpd.pdf/@@display-file/file). Unidade: `ia-dados-rag-etica-lgpd-ia-unit`.

Fonte didática focal em análise. Distingue hipótese de tratamento, finalidade e minimização nos dados de treino/prompts, além de riscos do ciclo. Não é inventário completo das bases legais nem posição vinculante. Autores e recortes constam no JSON; manter partial/pending até QA consolidado.

Recorte: PDF37p: pp.16–20 (proteção, dados pessoais, coleta/scraping e hipótese arts.7/11); pp.23–27 (compartilhamento/finalidades, eliminação/consentimento, transparência e necessidade/minimização).

Acesso/licença: unknown; acesso gratuito observado sem cadastro; reprodução não verificada; delivery:link only

### tech-anpd-nt27-2024-meta-ia

[Nota Técnica nº27/2024/FIS/CGF/ANPD — tratamento de dados para IA generativa](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/nt-27.pdf/@@display-file/file). Unidade: `ia-dados-rag-etica-lgpd-ia-unit`.

PDF integral11p lido visualmente após renderização local: caso concreto Meta, bases para dados sensíveis, expectativas/finalidade, direitos e segurança. Junho2024, análise preliminar; necessidade não recebe explicação completa. Complemento, sem inferir resultado atual do processo.

Recorte: PDF11p integral, renderizado e lido visualmente: §§3.7–3.13 pp.4–6; §§3.14–3.17 pp.6–7; §§3.21–3.24 pp.8–9; conclusão/assinaturas pp.10–11.

Acesso/licença: unknown; acesso gratuito observado sem cadastro; reprodução não verificada; delivery:link only

### tech-ms-architecture-quality-attributes

[Microsoft Application Architecture Guide — Chapter16: Quality Attributes](https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ee658094(v=pandp.10)). Unidade: `engsoft-modelagem-qualidade-atributos-unit`.

GET200 em2026-10-08; cinco atributos e cenários lidos. Há erro na frase que mede disponibilidade por downtime: a proporção operacional usa uptime/tempo total. QA deve decidir se exclusão explícita dessa frase permite recorte focal. Edição2010; não recomendar produtos legados nem tratar corpo200 como garantia pedagógica.

Recorte: Chapter16: Overview/Common Quality Attributes; subseções Availability, Maintainability, Performance, Reliability e Scalability (definições e key issues). Metadado ms.date2010-01-13.

Acesso/licença: unknown; acesso gratuito observado sem cadastro; reprodução não verificada; delivery:link only

### tech-vp-uml-guide-five-diagrams

[Visual Paradigm UML Guide — class, use case, sequence, activity and state machine](https://www.visual-paradigm.com/guide/uml-unified-modeling-language/what-is-class-diagram/). Unidade: `engsoft-modelagem-qualidade-uml-unit`.

Lidas cinco lições coesas, com exemplos textuais e notações. Figuras não reinspecionadas visualmente nesta rodada. Ressalvas registradas: extends/extend; region/critical; herança chamada de associação. Candidato contemporâneo para confrontar SHU2002; não aprovado apenas por enumerar tipos de diagrama.

Recorte: Mesma coleção /guide/uml-unified-modeling-language/: what-is-class-diagram linhas37–214; what-is-use-case-diagram32–123,147–174; what-is-sequence-diagram33–150; what-is-activity-diagram28–108; what-is-state-machine-diagram26–145,160–187.

Acesso/licença: Copyright2026 Visual Paradigm, all rights reserved; HTML gratuito sem cadastro; delivery:link only, sem reprodução.

### tech-purview-governance-security-candidate

[Microsoft Purview documentation — governance, permissions, SQL sources and Data Map history](https://learn.microsoft.com/en-us/purview/data-governance-get-started). Unidade: `bd-tecnologias-operacao-seguranca-governanca-unit`.

Lidas responsabilidades de owners/stewards, RBAC/menor privilégio, exemplo SQL de role para coleta, catálogo e histórico de quem/quando/o quê. Auditoria de metadados/atribuições não equivale a auditoria de todas as consultas. Documentação gratuita; conta/licença do produto é requisito separado. QA de adequação ao objetivo pendente.

Recorte: /purview/data-governance-get-started §§Business concepts/Basic setup/Weekly planning; data-governance-roles-permissions §§Unified Catalog roles/Data asset lifecycle; purview-permissions §§RBAC/Relationship/Temporary permissions; data-map-history §§Prerequisites/Which assets/How to use/REST/Limitations; register-scan-azure-sql-database linhas199–257,385–390.

Acesso/licença: unknown; acesso gratuito observado sem cadastro; reprodução não verificada; delivery:link only

## Fechamentos adicionais — 2026-10-08

### tech-anpd-voto11-2024-lgpd-ia

[Voto nº11/2024/DIR-MW/CD — aplicação da LGPD ao treinamento de IA generativa](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-determina-suspensao-cautelar-do-tratamento-de-dados-pessoais-para-treinamento-da-ia-da-meta/SEI_0130047_Voto_11.pdf/@@display-file/file). Unidade: `ia-dados-rag-etica-lgpd-ia-unit`. Decisão de domínio: primary/full; QA de integração pendente.

Recorte: PDF24p, §§4.21–4.25 pp.8–10 (bases arts.7/11 e princípios); §§4.26–4.32 pp.10–11 (expectativa, finalidade, necessidade e aplicação ao treino); §§4.33–4.36 p.12 (transparência); §§4.53–4.59 pp.17–18 (salvaguardas/riscos); assinatura p.24, 01/07/2024.

GET200, PDF24p/187750bytes lido diretamente nos recortes. O voto distingue hipótese legal adequada dos princípios e dos direitos/segurança durante coleta até descarte. Contrasta legítimo interesse art.7IX com exigência de hipótese art.11 para dados sensíveis; define finalidade específica/compatibilidade e necessidade/mínimo proporcional, aplicando ambas ao uso indiscriminado de posts para treinar IA. Explica expectativas, oposição, transparência, acesso indevido e riscos de exposição em outputs/deepfakes. Fonte focal única de análise primária aplicada ensina os quatro conceitos do objetivo; não depende de somar Radar/NT/lei. Limites: cognição preliminar e caso datado de2024, sem afirmar resultado ou obrigação atual específica da Meta; não é inventário de todas as bases, nem autorização geral para treino. Conferidos separadamente arts.6/7 da LGPD consolidada no Planalto em2026-10-08; lei é referência normativa, não conteúdo fundido ao focal. QA independente de integração pendente.

Acesso/licença: unknown; PDF oficial gratuitamente acessível sem cadastro; licença do anexo não verificada; delivery:link only.

### tech-sei-2026-quality-attributes

[Managing Architectural Risk During Agile Development](https://sei.cmu.edu/documents/6469/Managing_Architectural_Risk_During_Agile_Development.pdf). Unidade: `engsoft-modelagem-qualidade-atributos-unit`. Decisão de domínio: primary/full; QA de integração pendente.

Recorte: Relatório17/03/2026, PDF60p: Apêndice2 pp.24–25/PDF33–34 (métricas, desempenho, manutenção); Apêndice3 tabela4 p.28/PDF37 (exemplos de propriedades, lida visualmente); Apêndice4 tabela6 p.31/PDF40 (manutenibilidade/desempenho/confiabilidade) e tabela9 p.36/PDF45 (disponibilidade/escalabilidade/modificabilidade). Licença PDFp.2.

GET200, PDF60p/1488042bytes. Leitura direta distingue manutenção como eficácia/eficiência de modificar, desempenho relativo a recursos com exemplos throughput/responsividade, e confiabilidade como realizar funções sob condições durante período. Tabela9 define disponibilidade pela fração de tempo disponível e escalabilidade como suportar carga maior, vertical/horizontal; relaciona modificabilidade à manutenção após implantação. Tabela4 foi renderizada/lida: modularidade facilita mudanças mas pode afetar desempenho; disponibilidade conecta continuidade; exemplos de escala e tradeoffs. Um relatório coeso cobre os cinco atributos sem a fórmula defeituosa Microsoft. Limites: introdução conceitual de arquitetura/risco, não garante qualidades por escolher padrão; tabela6 atribui taxonomia antiga a ISO25010:2023, portanto não usar o relatório como reprodução normativa atual dessa norma nem estender a classificação completa ISO. Conceitos selecionados permanecem explícitos e corretos para o objetivo. QA independente de integração pendente.

Acesso/licença: CC BY-NC 4.0 declarada no verso da capa; copyright2026 Carnegie Mellon University and David Root; acesso gratuito GET200; delivery:link.

### tech-databricks-unity-catalog-governance

[Databricks on AWS documentation — Unity Catalog governance and access control](https://docs.databricks.com/aws/en/data-governance/unity-catalog/). Unidade: `bd-tecnologias-operacao-seguranca-governanca-unit`. Decisão de domínio: primary/full; QA de integração pendente.

Recorte: Manual Databricks AWS: /data-governance/unity-catalog/ §§Object model/Capabilities; /access-control/ §§Models/Mechanisms; /access-control/permissions-concepts §§Securable objects/Privileges/Usage privileges/BROWSE/Ownership (linhas13–152); /manage-privileges/admin-privileges §§Admin roles at a glance/Workspace catalog privileges (linhas9–44,100–108); /manage-privileges/ §§Show/Grant/Revoke (linhas29–154); /admin/system-tables/audit-logs §§Considerations/Schema/Identity metadata (linhas17–97); /catalog-explorer/ §§Functions (linhas10–20). Páginas de conceitos atualizadas11/09/2026; audit05/10/2026.

Lidas páginas do mesmo manual público Databricks AWS, conectadas pelo capítulo Unity Catalog e controle de acesso, sem bundle de provedores. Papéis account/workspace/metastore admin possuem responsabilidades/escopos distintos; owners delegam privilégios e responsabilidade pelo objeto. SELECT/MODIFY e USE CATALOG/SCHEMA são separados; exemplos SHOW GRANTS, GRANT/REVOKE para grupo financeiro ensinam acesso efetivo e herança. Catálogo organiza metadados/ativos, descoberta não implica leitura (BROWSE). Auditoria system.access.audit registra ator, ação, tempo, objeto/parâmetros e resposta; concessões administrativas também são auditadas. Cada cláusula do objetivo RELACIONAR é ensinada no mesmo manual, incluindo relação entre autorização, ownership e rastreabilidade. Limites: regras/SQL específicos de Unity Catalog, sem universalizar sintaxe ou privilégios; tabela de auditoria em Public Preview, limites regionais/retenção/mascaramento explícitos, sem prometer log completo eterno. Leitura é gratuita, executar produto requer conta/recursos; não executado. QA independente de integração pendente.

Acesso/licença: Copyright2026 Databricks, all rights reserved; documentação HTML gratuita sem cadastro; licença de reprodução não concedida; delivery:link only.

### tech-omg-uml251-notation-examples

[OMG Unified Modeling Language (OMG UML), Version2.5.1 — Notation and Examples](https://www.omg.org/spec/UML/2.5.1/PDF). Unidade: `engsoft-modelagem-qualidade-uml-unit`. Decisão de domínio: proposta primary/full; QA pedagógica independente pendente.

Recorte: formal/2017-12-05, dezembro2017, PDF796p. Classes: §§11.4.4–5 pp.195–196 e §§11.5.4–5 pp.201–204 (PDF237–238,243–246), Figs11.16/17/27/28. Estados: §14.2.4.1–4 pp.319–320, §14.2.4.8 p.331, §14.2.5 pp.335–336 (PDF361–362,373,377–378), Fig14.36. Atividades: §§15.2.4–5 pp.379–383 e §§15.3.4–5 pp.391–392 (PDF421–425,433–434), Figs15.12/13. Sequência: §§17.2.4 pp.568–569,17.3.3–5 pp.572–573,17.4.4–5 pp.576–578 e17.8 pp.595–599 (PDF610–611,614–615,618–620,637–641), Fig17.25. Casos de uso: §§18.1.4–5 pp.641–643 (PDF683–685), Figs18.2/3; definição include/extend pp.641–642.

GET200, PDF796p/18069510bytes, SHA256416b57e1933780eb48bd60fe513e031da220c28a521bdd334a366bebc78a463e. Recortes de Notation/Examples lidos diretamente; renderizados e conferidos visualmente PDF238,246,378,424,641,685. O mesmo documento explica compartimentos/atributos/operações/visibilidade e relações/multiplicidades; estados/transições com trigger[guard]/effect no telefone; nós/arestas, decisões, fork/join no processamento de pedidos; sequência, lifelines, mensagens/retornos e ordenação temporal sem duração inferida; atores/fronteira/use cases/include/extend no ATM. Os exemplos comentados explicam como interpretar os cinco diagramas, sustentando o verbo LER do objetivo em recurso focal único; não é mero índice nem soma de diagramas de provedores distintos. Limites: referência normativa técnica extensa em inglês, leitura intermediária/avançada, não curso introdutório ou exercícios resolvidos; não declarar inspeção de todo PDF ou de toda UML. Não importa extensões OML/EA nem erros dos candidatos Visual Paradigm/Sparx2010. Versão2.5.1/dezembro2017 explícita. Proposta primary/full de domínio sujeita à QA pedagógica independente antes de integração.

Acesso/licença: OMG specification limited permission, PDFpp.ii–iii; copyright holders listed, informational use with conditions, no modified/network redistribution inferred; acesso público gratuito GET200; delivery:link only.

## Decisão explícita das quatro lacunas desta retomada

| Unidade | Fonte focal única | Decisão e limite |
|---|---|---|
| engsoft-modelagem-qualidade-uml-unit | OMG UML 2.5.1, Notation/Examples | Proposta primary/full: interpretação dos cinco diagramas, texto e figuras conferidos. Referência técnica em inglês; adequação pedagógica sujeita à QA independente. |
| engsoft-modelagem-qualidade-atributos-unit | SEI, Managing Architectural Risk During Agile Development (2026) | Proposta primary/full: os cinco atributos explicitamente diferenciados. Não usar atribuição defeituosa da taxonomia ISO como referência normativa atual. |
| bd-tecnologias-operacao-seguranca-governanca-unit | Databricks AWS, Unity Catalog manual | Proposta primary/full: roles, privilégios, acesso, auditoria, catálogo e ownership relacionados. Regras do produto; auditoria Public Preview, limites de região, retenção e mascaramento. |
| ia-dados-rag-etica-lgpd-ia-unit | ANPD, Voto 11/2024, Miriam Wimmer | Proposta primary/full: finalidade, necessidade, bases legais e proteção aplicadas ao treino de IA. Caso preliminar datado; não afirma desfecho ou obrigação atual específica da Meta. |

## Lacunas e pendências

`gaps: []` registra ausência de objetivos sem fonte focal proposta nesta revisão de domínio. Não representa aprovação independente nem publicação. As quatro novas decisões aguardam QA independente sobre estes recortes exatos; eventual rejeição deverá reabrir a lacuna correspondente. Os seis candidatos pending foram preservados e não contam como fechamento: SHU, Radar ANPD, NT27 ANPD, atributos Microsoft, Visual Paradigm e Purview.

Triagem adicional de UML: [Sparx UML Dictionary (2010)](https://sparxsystems.com/downloads/resources/booklets/uml_dictionary.pdf) foi lido em recortes e figuras, mas mistura extensões OML no toolbox e chama FinalState de pseudostate; não escolhido como focal. [Scott Ambler, Activity Diagrams](https://agilemodeling.com/artifacts/activityDiagram.htm) admite atalhos e erros nos exemplos; não escolhido como focal. O OMG sustenta a decisão por seus próprios recortes comentados, sem somar esses candidatos nem presumir leitura de todas as 796 páginas.

## QA do domínio — congelamento 2026-10-08

Validação estrutural executada nos artefatos salvos: 112 IDs curriculares únicos, 18 topicIds, objetivos e decomposição preservados; 108 IDs de fonte únicos; todas as fontes possuem autoria, provedor, idioma, tipo, acesso/licença, data de checagem, URL, locator e evidência. As 132 relações coverage referenciam unidades existentes; as 112 unidades têm ao menos uma proposta primary/full. Os seis candidatos pending não fornecem primary/full; o candidato SHU legado usa candidateForUnitIds, sem inventar coverage. Prerrequisitos e syllabusRefs.source válidos; nenhum sourceId legado nas referências. Zero gaps documentais, status partial por QA independente pendente.

SHA256 da decomposição canônica (json.dumps de proposedUnits com ensure_ascii=False e sort_keys=True): `296a10d50377ac116454d53708b72f3b0af94148ea0342960168654db4edd1ca`.

SHA256 do TECH_SOURCES_REVIEW.json congelado: `1480177774ca353c0a9574afdea1e6285197909958682ddddeef4aa1ed60fd42`.

QA realizada: consistência estrutural e revisão documental/gráfica nos recortes descritos. Não executados produto, banco, benchmark ou testes runtime; não inferida licença por acesso gratuito. Nenhuma edição de stage, pack, baseline, ledger ou arquivos de QA. O hash deste MD é entregue ao Orchestrator separadamente para evitar autorreferência.
