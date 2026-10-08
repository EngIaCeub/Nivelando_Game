# Parecer independente das questões TCE-GO TI

Data da revisão: 2026-10-07. Revisor: agente factual independente `/root/factual_review` (GPT-6.1 Sol, high). Curador/integração: Orchestrator `/root`. Este revisor altera somente este parecer; não altera packs ou Core.

## Escopo e decisão

Foram examinados os 289 objetos de `exam-packs/tce-go-ti-2026/questions.json`, incluindo enunciado, alternativas, gabarito, explicação, tópico e origem. Hash SHA-256 do arquivo examinado antes de correções: `45029dcee9ac20b3d66c937a428fcb15589f3673bc2b88934d672fc5d423ae83`.

Os 10 itens b02 têm conteúdo substantivo e gabaritos sustentáveis com as fontes abaixo. Seis são aprováveis factualmente após adequação documental (001, 002, 004, 005, 006, 008); quatro requerem revisão textual (003, 007, 009, 010). **Nenhum item é promovido automaticamente por este parecer inicial.** A aprovação de uma versão corrigida exige conferir a proposta efetiva e seus metadados. Os 279 itens o3 são rejeitados editorialmente na forma atual: não apresentam uma pergunta factual do assunto, usam identificadores internos na resposta e permitem escolha por eliminação de quatro distratores invariantes.

Rejeição editorial não afirma que as frases genéricas sejam fatos falsos. A revisão integral da coleção produziu um diagnóstico por item; não produziu cobertura completa dos conhecimentos do edital.

Em todos os 289 objetos, `origin: generated_original` e a licença declaram autoria original. Nenhum contém identificação de concurso/caderno/número/gabarito definitivo que demonstre ser prova passada FCC. **Remover `board: FCC` e `year: 2026` da autoria da questão**; esses dados podem permanecer no manifesto do edital como contexto. Rotular como questão original de treino. O edital serve para escopo, não para demonstrar o gabarito didático. Registrar `reviewStatus`, `sourceRefs`, locator, responsável/data e `validAsOf`; manter o estado histórico em arquivo legado e preservar snapshots de sessões/primeiras tentativas. O schema atual não exige board/year.

## Parecer dos 10 itens substantivos

As fontes foram abertas e lidas em contexto nesta revisão em 2026-10-07. Acesso público não foi tratado como licença para reprodução; recomendam-se links e formulação original, sem transcrição de questões ou material protegido.

| ID | Veredito inicial | Gabarito | Fonte primária e localização | Parecer e correção requerida |
| --- | --- | --- | --- | --- |
| q-tcego-b02-001 | Aprovável após metadados | b | [Microsoft, Event-driven architecture style](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven), Architecture; Benefits; Event schema evolution | Produtor publica, consumidor reage sem conhecer a implementação interna. Dependência do contrato/esquema de evento continua existindo; não afirmar ausência total de acoplamento. A alternativa b já é adequada. Trocar fonte do gabarito, remover board/year e explicar individualmente os distratores: conhecimento interno, transação compartilhada obrigatória, comunicação exclusivamente síncrona e alteração obrigatória do produtor não são requisitos do modelo. |
| q-tcego-b02-002 | Aprovável após metadados | d | [PostgreSQL 18, 3.4 Transactions](https://www.postgresql.org/docs/18/tutorial-transactions.html), parágrafos sobre transação confirmada/permanently recorded e COMMIT | Durabilidade é o compromisso de persistência após confirmação. A questão conceitual é correta; não apresentar como garantia de uma implantação com persistência desabilitada. Atomicidade trata tudo-ou-nada, consistência preserva restrições, isolamento separa concorrência, idempotência trata efeito de repetição. |
| q-tcego-b02-003 | Revisão | b após precisão | [AWS, Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/), Customer responsibility Security in the Cloud; Applying the AWS Shared Responsibility Model in Practice | O serviço selecionado e seu modelo definem parte essencial da divisão; uso concreto, configuração e obrigações legais também contam. Contrato não elimina obrigações legais. Recomenda-se enunciado “Na análise técnica da responsabilidade compartilhada, qual informação é essencial para identificar a divisão de controles entre provedor e cliente?” e b “O serviço utilizado, seu modelo e a divisão de responsabilidades documentada pelo provedor, observadas as obrigações aplicáveis.” Explicar IaaS versus serviços gerenciados, sem afirmar que SaaS transfere todas as responsabilidades. |
| q-tcego-b02-004 | Aprovável após metadados/explicação | a | [Lei 13.709/2018, texto consolidado](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm), art. 6º, III (necessidade) | Minimização é uma prática coerente com o princípio legal da necessidade. A resposta é única entre as alternativas atuais. Explicação deve dizer que a LGPD chama o princípio de “necessidade” e inclui pertinência, proporcionalidade e não excesso; minimização não é uma base legal autônoma. Se o enunciado passar a perguntar o nome do princípio na lei, trocar alternativa para “Necessidade”, criando a versão correspondente. |
| q-tcego-b02-005 | Aprovável após metadados | b | [NIST CSRC, integrity](https://csrc.nist.gov/glossary/term/integrity), definição vinculada a NIST SP 800-152/Data integrity | Integridade compreende ausência de alteração não autorizada. A expressão “objetivo associado” não promete um mecanismo perfeito. Disponibilidade trata acesso oportuno; elasticidade trata capacidade; observabilidade trata estado por sinais; portabilidade trata transferência entre ambientes. |
| q-tcego-b02-006 | Aprovável após metadados | b | [GitHub Docs, Understanding GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions), Overview; Jobs | Automação de build e testes fornece feedback às integrações. Reescrever explicação sem obrigar execução de todos os testes em todo evento: pipeline pode configurar gatilhos/conjunto de verificações. Distratores negam automação, controle de versão e revisão sem fundamento. |
| q-tcego-b02-007 | Revisão | a somente com contexto | [Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), Workflow: Evaluator-optimizer; Agents | Verificação com critérios e evidências é sustentada; a fonte não define “Verificação autônoma” como etapa universal obrigatória de todo sistema. Remover explicação que usa só o edital como prova da resposta. Recomenda-se contextualizar: “Em um fluxo agentivo com critérios de aceite explícitos, qual atividade avalia o resultado usando evidências antes de concluir a tarefa?”; a “Verificar o resultado em relação aos critérios e, se necessário, corrigir e repetir a avaliação.” Não alegar que autoavaliação assegura correção factual. |
| q-tcego-b02-008 | Aprovável após metadados | a | [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034.html#section-2.4), §2.4 Elements of the DNS | DNS consulta registros associados a nomes; registros de endereço retornam endereços de hosts. É correto não limitar todo DNS ao mapeamento nome/IP. SMTP transfere correio, FTP transfere arquivos, SSH estabelece acesso/comunicação segura, DHCP fornece configuração de rede; DHCP pode informar servidor DNS, mas não realiza sua função de resolução. |
| q-tcego-b02-009 | Revisão da explicação | a | [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749.html#section-1.1), §1.1 Roles; §1.2 Protocol Flow | Determinar permissões sobre recursos/operações é autorização. Evitar regra geral “após a identidade ter sido autenticada”: APIs podem autorizar acesso público/anonimizado segundo política, e OAuth delega acesso, não é um protocolo de autenticação de usuário. Explicação proposta: “Autorização aplica a política de acesso para decidir quais recursos e operações são permitidos ao sujeito ou cliente no contexto da requisição.” |
| q-tcego-b02-010 | Revisão de precisão | a | [Coverage.py 7.10.7, Branch coverage measurement](https://coverage.readthedocs.io/en/7.10.7/branch.html), How to measure branch coverage; How it works | A relação é correta para cobertura de código, mas “cobertura de testes” pode medir também requisitos, e a explicação mistura universos. Delimitar enunciado a “métrica de cobertura de código” e manter a “Código ou caminhos exercitados pelos testes em relação ao universo medido.” Explicar linhas e decisões/branches; não garante qualidade dos asserts, ausência de bugs ou exercício de todos os caminhos só porque linhas=100%. |

## Exame integral dos 279 templates o3

O inventário foi lido por tópico e conteúdo normalizado. Todos os 279 itens contêm os mesmos quatro distratores, cada um ocorrendo exatamente 279 vezes: escolher ferramenta popular; ignorar requisitos e riscos; presumir solução única; substituir evidência por opinião. As 279 respostas esperadas distribuem-se em dez formas, sempre contendo o primeiro `canonicalConceptId`, e a explicação repete “A resposta exige compreender <concept> no escopo de <tópico>...”. Nenhum oferece caso concreto, cálculo, texto de interpretação, regra normativa ou mecanismo técnico que possa sustentar uma discriminação de conhecimento.

Verificação das formas: 45 “Reconhecer”, 45 “Interpretar”, 45 “Aplicar”, 32 “Comparar alternativas pelo efeito”, 32 “Relacionar”, 32 “Uma evidência”, 12 “Substituir análise por regra decorada”, 12 “Definição/finalidade”, 12 “Reexaminar” e 12 “Comparar finalidade/trade-offs”; total 279. Essa contagem documenta a inspeção, não é o motivo único da rejeição. O motivo editorial é a ausência de objetivo avaliável e de informação disciplinar concreta no objeto.

Cada ID abaixo recebe a decisão **rejeitado editorialmente / reautoria necessária**. O locator é o ID no array legado; fonte externa factual não se aplica a uma resposta sem proposição disciplinar específica. Autoria do gerador/edital é evidência de origem e tema, não de resposta. Preservar histórico, remover da seleção de sessões novas, reescrever com fonte primária e submeter novamente à revisão independente. Reescrita com novo objetivo não deve substituir silenciosamente o mesmo ID em sessões antigas.

| ID | Tópico | Forma | Veredito | Motivo |
| --- | --- | --- | --- | --- |
| q-tcego-o3-lp-texto-01 | lp-texto | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-lp-texto-02 | lp-texto | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-lp-texto-03 | lp-texto | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-lp-morfossintaxe-01 | lp-morfossintaxe | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-lp-morfossintaxe-02 | lp-morfossintaxe | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-lp-morfossintaxe-03 | lp-morfossintaxe | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-lp-sintaxe-redacao-01 | lp-sintaxe-redacao | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-lp-sintaxe-redacao-02 | lp-sintaxe-redacao | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-lp-sintaxe-redacao-03 | lp-sintaxe-redacao | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-mrl-aritmetica-01 | mrl-aritmetica | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-mrl-aritmetica-02 | mrl-aritmetica | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-mrl-aritmetica-03 | mrl-aritmetica | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-mrl-proporcoes-01 | mrl-proporcoes | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-mrl-proporcoes-02 | mrl-proporcoes | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-mrl-proporcoes-03 | mrl-proporcoes | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-mrl-logica-01 | mrl-logica | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-mrl-logica-02 | mrl-logica | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-mrl-logica-03 | mrl-logica | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-leginst-constituicao-01 | leginst-constituicao | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-leginst-constituicao-02 | leginst-constituicao | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-leginst-constituicao-03 | leginst-constituicao | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-leginst-tce-01 | leginst-tce | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-leginst-tce-02 | leginst-tce | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-leginst-tce-03 | leginst-tce | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-leginst-servidor-01 | leginst-servidor | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-leginst-servidor-02 | leginst-servidor | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-leginst-servidor-03 | leginst-servidor | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-ciclos-01 | engsoft-ciclos | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-ciclos-02 | engsoft-ciclos | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-ciclos-03 | engsoft-ciclos | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-ciclos-04 | engsoft-ciclos | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-ciclos-05 | engsoft-ciclos | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-ciclos-06 | engsoft-ciclos | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-requisitos-arquitetura-01 | engsoft-requisitos-arquitetura | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-requisitos-arquitetura-02 | engsoft-requisitos-arquitetura | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-requisitos-arquitetura-03 | engsoft-requisitos-arquitetura | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-requisitos-arquitetura-04 | engsoft-requisitos-arquitetura | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-requisitos-arquitetura-05 | engsoft-requisitos-arquitetura | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-requisitos-arquitetura-06 | engsoft-requisitos-arquitetura | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-requisitos-arquitetura-07 | engsoft-requisitos-arquitetura | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-requisitos-arquitetura-08 | engsoft-requisitos-arquitetura | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-requisitos-arquitetura-09 | engsoft-requisitos-arquitetura | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-requisitos-arquitetura-10 | engsoft-requisitos-arquitetura | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-modelagem-qualidade-01 | engsoft-modelagem-qualidade | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-modelagem-qualidade-02 | engsoft-modelagem-qualidade | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-modelagem-qualidade-03 | engsoft-modelagem-qualidade | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-modelagem-qualidade-04 | engsoft-modelagem-qualidade | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-modelagem-qualidade-05 | engsoft-modelagem-qualidade | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-modelagem-qualidade-06 | engsoft-modelagem-qualidade | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-modelagem-qualidade-07 | engsoft-modelagem-qualidade | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-modelagem-qualidade-08 | engsoft-modelagem-qualidade | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-modelagem-qualidade-09 | engsoft-modelagem-qualidade | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-engsoft-modelagem-qualidade-10 | engsoft-modelagem-qualidade | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-fundamentos-01 | devsistemas-fundamentos | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-fundamentos-02 | devsistemas-fundamentos | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-fundamentos-03 | devsistemas-fundamentos | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-fundamentos-04 | devsistemas-fundamentos | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-fundamentos-05 | devsistemas-fundamentos | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-fundamentos-06 | devsistemas-fundamentos | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-linguagens-web-01 | devsistemas-linguagens-web | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-linguagens-web-02 | devsistemas-linguagens-web | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-linguagens-web-03 | devsistemas-linguagens-web | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-linguagens-web-04 | devsistemas-linguagens-web | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-linguagens-web-05 | devsistemas-linguagens-web | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-linguagens-web-06 | devsistemas-linguagens-web | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-apis-identidade-01 | devsistemas-apis-identidade | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-apis-identidade-02 | devsistemas-apis-identidade | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-apis-identidade-03 | devsistemas-apis-identidade | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-apis-identidade-04 | devsistemas-apis-identidade | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-apis-identidade-05 | devsistemas-apis-identidade | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-apis-identidade-06 | devsistemas-apis-identidade | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-apis-identidade-07 | devsistemas-apis-identidade | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-apis-identidade-08 | devsistemas-apis-identidade | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-apis-identidade-09 | devsistemas-apis-identidade | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devsistemas-apis-identidade-10 | devsistemas-apis-identidade | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-llm-01 | ia-agentivos-llm | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-llm-02 | ia-agentivos-llm | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-llm-03 | ia-agentivos-llm | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-contexto-01 | ia-agentivos-contexto | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-contexto-02 | ia-agentivos-contexto | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-contexto-03 | ia-agentivos-contexto | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-contexto-04 | ia-agentivos-contexto | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-contexto-05 | ia-agentivos-contexto | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-contexto-06 | ia-agentivos-contexto | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-ciclo-mcp-01 | ia-agentivos-ciclo-mcp | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-ciclo-mcp-02 | ia-agentivos-ciclo-mcp | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-ciclo-mcp-03 | ia-agentivos-ciclo-mcp | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-ciclo-mcp-04 | ia-agentivos-ciclo-mcp | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-ciclo-mcp-05 | ia-agentivos-ciclo-mcp | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-ciclo-mcp-06 | ia-agentivos-ciclo-mcp | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-ciclo-mcp-07 | ia-agentivos-ciclo-mcp | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-ciclo-mcp-08 | ia-agentivos-ciclo-mcp | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-ciclo-mcp-09 | ia-agentivos-ciclo-mcp | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-agentivos-ciclo-mcp-10 | ia-agentivos-ciclo-mcp | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-cicd-01 | devops-cicd | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-cicd-02 | devops-cicd | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-cicd-03 | devops-cicd | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-cicd-04 | devops-cicd | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-cicd-05 | devops-cicd | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-cicd-06 | devops-cicd | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-iac-observabilidade-01 | devops-iac-observabilidade | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-iac-observabilidade-02 | devops-iac-observabilidade | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-iac-observabilidade-03 | devops-iac-observabilidade | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-iac-observabilidade-04 | devops-iac-observabilidade | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-iac-observabilidade-05 | devops-iac-observabilidade | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-iac-observabilidade-06 | devops-iac-observabilidade | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-git-containers-01 | devops-git-containers | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-git-containers-02 | devops-git-containers | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-git-containers-03 | devops-git-containers | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-git-containers-04 | devops-git-containers | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-git-containers-05 | devops-git-containers | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-devops-git-containers-06 | devops-git-containers | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-modelagem-01 | bd-modelagem | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-modelagem-02 | bd-modelagem | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-modelagem-03 | bd-modelagem | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-modelagem-04 | bd-modelagem | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-modelagem-05 | bd-modelagem | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-modelagem-06 | bd-modelagem | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-sql-01 | bd-sql | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-sql-02 | bd-sql | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-sql-03 | bd-sql | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-sql-04 | bd-sql | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-sql-05 | bd-sql | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-sql-06 | bd-sql | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-sql-07 | bd-sql | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-sql-08 | bd-sql | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-sql-09 | bd-sql | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-sql-10 | bd-sql | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-tecnologias-operacao-01 | bd-tecnologias-operacao | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-tecnologias-operacao-02 | bd-tecnologias-operacao | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-tecnologias-operacao-03 | bd-tecnologias-operacao | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-tecnologias-operacao-04 | bd-tecnologias-operacao | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-tecnologias-operacao-05 | bd-tecnologias-operacao | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-bd-tecnologias-operacao-06 | bd-tecnologias-operacao | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-ml-01 | ia-dados-ml | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-ml-02 | ia-dados-ml | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-ml-03 | ia-dados-ml | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-ml-04 | ia-dados-ml | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-ml-05 | ia-dados-ml | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-ml-06 | ia-dados-ml | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-generativa-01 | ia-dados-generativa | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-generativa-02 | ia-dados-generativa | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-generativa-03 | ia-dados-generativa | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-generativa-04 | ia-dados-generativa | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-generativa-05 | ia-dados-generativa | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-generativa-06 | ia-dados-generativa | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-rag-etica-01 | ia-dados-rag-etica | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-rag-etica-02 | ia-dados-rag-etica | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-rag-etica-03 | ia-dados-rag-etica | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-rag-etica-04 | ia-dados-rag-etica | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-rag-etica-05 | ia-dados-rag-etica | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-rag-etica-06 | ia-dados-rag-etica | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-rag-etica-07 | ia-dados-rag-etica | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-rag-etica-08 | ia-dados-rag-etica | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-rag-etica-09 | ia-dados-rag-etica | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ia-dados-rag-etica-10 | ia-dados-rag-etica | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-principios-01 | seguranca-principios | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-principios-02 | seguranca-principios | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-principios-03 | seguranca-principios | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-principios-04 | seguranca-principios | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-principios-05 | seguranca-principios | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-principios-06 | seguranca-principios | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-cripto-identidade-01 | seguranca-cripto-identidade | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-cripto-identidade-02 | seguranca-cripto-identidade | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-cripto-identidade-03 | seguranca-cripto-identidade | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-cripto-identidade-04 | seguranca-cripto-identidade | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-cripto-identidade-05 | seguranca-cripto-identidade | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-cripto-identidade-06 | seguranca-cripto-identidade | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-cripto-identidade-07 | seguranca-cripto-identidade | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-cripto-identidade-08 | seguranca-cripto-identidade | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-cripto-identidade-09 | seguranca-cripto-identidade | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-cripto-identidade-10 | seguranca-cripto-identidade | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-aplicacoes-continuidade-01 | seguranca-aplicacoes-continuidade | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-aplicacoes-continuidade-02 | seguranca-aplicacoes-continuidade | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-aplicacoes-continuidade-03 | seguranca-aplicacoes-continuidade | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-aplicacoes-continuidade-04 | seguranca-aplicacoes-continuidade | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-aplicacoes-continuidade-05 | seguranca-aplicacoes-continuidade | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-aplicacoes-continuidade-06 | seguranca-aplicacoes-continuidade | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-aplicacoes-continuidade-07 | seguranca-aplicacoes-continuidade | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-aplicacoes-continuidade-08 | seguranca-aplicacoes-continuidade | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-aplicacoes-continuidade-09 | seguranca-aplicacoes-continuidade | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-seguranca-aplicacoes-continuidade-10 | seguranca-aplicacoes-continuidade | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-os-shell-01 | sistemas-os-shell | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-os-shell-02 | sistemas-os-shell | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-os-shell-03 | sistemas-os-shell | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-os-shell-04 | sistemas-os-shell | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-os-shell-05 | sistemas-os-shell | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-os-shell-06 | sistemas-os-shell | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-diretorios-01 | sistemas-diretorios | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-diretorios-02 | sistemas-diretorios | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-diretorios-03 | sistemas-diretorios | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-diretorios-04 | sistemas-diretorios | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-diretorios-05 | sistemas-diretorios | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-sistemas-diretorios-06 | sistemas-diretorios | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-redes-protocolos-01 | redes-protocolos | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-redes-protocolos-02 | redes-protocolos | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-redes-protocolos-03 | redes-protocolos | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-redes-protocolos-04 | redes-protocolos | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-redes-protocolos-05 | redes-protocolos | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-redes-protocolos-06 | redes-protocolos | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-redes-protocolos-07 | redes-protocolos | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-redes-protocolos-08 | redes-protocolos | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-redes-protocolos-09 | redes-protocolos | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-redes-protocolos-10 | redes-protocolos | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-nuvem-arquitetura-01 | nuvem-arquitetura | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-nuvem-arquitetura-02 | nuvem-arquitetura | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-nuvem-arquitetura-03 | nuvem-arquitetura | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-nuvem-arquitetura-04 | nuvem-arquitetura | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-nuvem-arquitetura-05 | nuvem-arquitetura | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-nuvem-arquitetura-06 | nuvem-arquitetura | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-alinhamento-01 | governanca-alinhamento | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-alinhamento-02 | governanca-alinhamento | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-alinhamento-03 | governanca-alinhamento | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-alinhamento-04 | governanca-alinhamento | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-alinhamento-05 | governanca-alinhamento | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-alinhamento-06 | governanca-alinhamento | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-servicos-01 | governanca-servicos | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-servicos-02 | governanca-servicos | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-servicos-03 | governanca-servicos | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-servicos-04 | governanca-servicos | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-servicos-05 | governanca-servicos | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-servicos-06 | governanca-servicos | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-modelos-01 | governanca-modelos | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-modelos-02 | governanca-modelos | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-modelos-03 | governanca-modelos | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-modelos-04 | governanca-modelos | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-modelos-05 | governanca-modelos | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-modelos-06 | governanca-modelos | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-modelos-07 | governanca-modelos | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-modelos-08 | governanca-modelos | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-modelos-09 | governanca-modelos | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-modelos-10 | governanca-modelos | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-publica-01 | governanca-publica | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-publica-02 | governanca-publica | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-publica-03 | governanca-publica | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-publica-04 | governanca-publica | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-publica-05 | governanca-publica | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-governanca-publica-06 | governanca-publica | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-lgpd-01 | legti-lgpd | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-lgpd-02 | legti-lgpd | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-lgpd-03 | legti-lgpd | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-lgpd-04 | legti-lgpd | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-lgpd-05 | legti-lgpd | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-lgpd-06 | legti-lgpd | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-lgpd-07 | legti-lgpd | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-lgpd-08 | legti-lgpd | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-lgpd-09 | legti-lgpd | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-lgpd-10 | legti-lgpd | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-marco-civil-01 | legti-marco-civil | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-marco-civil-02 | legti-marco-civil | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-marco-civil-03 | legti-marco-civil | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-marco-civil-04 | legti-marco-civil | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-marco-civil-05 | legti-marco-civil | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-marco-civil-06 | legti-marco-civil | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-normas-tce-01 | legti-normas-tce | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-normas-tce-02 | legti-normas-tce | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-normas-tce-03 | legti-normas-tce | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-normas-tce-04 | legti-normas-tce | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-normas-tce-05 | legti-normas-tce | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-normas-tce-06 | legti-normas-tce | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-normas-tce-07 | legti-normas-tce | T07 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-normas-tce-08 | legti-normas-tce | T08 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-normas-tce-09 | legti-normas-tce | T09 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-normas-tce-10 | legti-normas-tce | T10 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-pdti-01 | legti-pdti | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-pdti-02 | legti-pdti | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-pdti-03 | legti-pdti | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-pdti-04 | legti-pdti | T04 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-pdti-05 | legti-pdti | T05 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-legti-pdti-06 | legti-pdti | T06 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ingles-compreensao-01 | ingles-compreensao | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ingles-compreensao-02 | ingles-compreensao | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ingles-compreensao-03 | ingles-compreensao | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ingles-estrategias-01 | ingles-estrategias | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ingles-estrategias-02 | ingles-estrategias | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ingles-estrategias-03 | ingles-estrategias | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ingles-documentacao-01 | ingles-documentacao | T01 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ingles-documentacao-02 | ingles-documentacao | T02 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |
| q-tcego-o3-ingles-documentacao-03 | ingles-documentacao | T03 | rejeitado editorialmente | Identificador interno na resposta; caso/requisito disciplinar ausente; distratores invariantes. |

## Revisão das propostas corrigidas r2 e dos 64 novos cartões

A proposta efetiva `QUESTIONS_DRAFT.json` foi relida após as correções de texto, explicações por alternativa e proveniência. Gabaritos das dez novas revisões: b, d, b, a, b, b, a, a, a, a. A aprovação corresponde somente aos IDs `*-r2`; não revalida as dez versões históricas b02, nem os 279 templates. A explicação de q004 agora distingue desnormalização, port scanning e balanceamento; q006 agora comenta a alternativa que efetivamente existe, em vez de mencionar integração manual fora da opção.

Todos os 64 cartões em `CURATION_DRAFT.json.cards` foram lidos frente/verso/explicação. As fontes indicadas foram consultadas nos recortes; detalhes da aprovação por ID, fontes e hashes dos drafts estão em `FACTUAL_REVIEW.json`. Esta aprovação é da proposição didática delimitada, não da abrangência total da biblioteca, não de eficácia pedagógica longitudinal, não de licença de reprodução da fonte e não de release do runtime.

Correções verificadas nesta rodada:

- JWT `exp`: critério inclui o próprio instante de expiração e admite pequena tolerância de relógio; §4.1.4 da RFC 7519 foi confrontado com a nova resposta.
- Chave estrangeira: adicionado [PostgreSQL §5.5.5](https://www.postgresql.org/docs/18/ddl-constraints.html#DDL-CONSTRAINTS-FK), que trata correspondência e exceções NULL; a fonte anterior §3.3 não detalhava NULL. A duplicação de uma referência não é falha factual.
- Índices: [§11.1](https://www.postgresql.org/docs/18/indexes-intro.html) sustenta custo de sincronização/atualização e escolha do planner. O cartão não promete desempenho melhor em todo cenário.
- Constituição: retirou-se a frase tangencial sobre pertencimento do TCU ao Judiciário; a resposta limita-se ao art.71 caput, preservando precisão do locator.
- Acesso público na autorização: [OWASP, Introduction](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) demonstra expressamente a possibilidade de autorização a recursos públicos para usuário não autenticado; fonte complementar à RFC 6749.

### Limites normativos e científicos conferidos

No recorte normativo de 25/08/2026, os dispositivos efetivamente revisados foram CF art.70 parágrafo único (redação EC19/1998) e art.71 caput; LGPD art.5 I, art.6 III e art.12 caput/§1; Marco Civil arts.9 caput/§1 I-II, 13 caput e 15 caput. As redações relevantes são anteriores ao corte, conforme texto e anotações do consolidado oficial. Não se aprovou o consolidado integral das leis, outras alterações, jurisprudência de responsabilização de plataformas ou competências específicas do TCE-GO. O fato de a página consolidada conter alterações de 2026 em outros dispositivos da LGPD não altera essas proposições delimitadas.

Os dois cartões RAG foram confrontados apenas com o resumo v4 de Lewis e colaboradores: memória paramétrica seq2seq e memória não paramétrica em índice vetorial, recuperador e passagens. Nenhum cartão promete melhoria factual garantida, resultados de benchmark ou cobre o artigo integral. MCP corresponde à versão fixa 2025-11-25; Scrum à edição 2020; OpenAPI à 3.1.1; NIST CSF à 2.0; NIST nuvem à SP800-145. Nenhuma dessas edições foi promovida como universal ou como última versão de toda a disciplina.

## Decisão final vinculada aos arquivos revisados

Parecer emitido em 2026-10-07T04:44:49.2299189Z pelo revisor independente /root/factual_review. As dez revisões r2 e os 64 cartões foram aprovados para as proposições delimitadas; nenhuma pendência factual remanescente nesses drafts. A classificação individual dos 279 templates históricos permanece rejeitada editorialmente conforme a tabela anterior.

- QUESTIONS_DRAFT.json SHA256: 68cce9b32590cf407d5a7cfecee82e2ce2dd8d2f4daf8b2c764d166c2006b3bc
- CURATION_DRAFT.json SHA256: a9b6d69b6eec0d47c517f3bb81f11d72a67a1874dec49f901603b14dc8f62902
- Decisões por ID, fontes, recortes e limites: FACTUAL_REVIEW.json.
- A aprovação requer bytes correspondentes aos hashes acima. Alterações posteriores exigem revisão do conteúdo alterado; não há promoção automática do pack por este parecer.
