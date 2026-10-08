// Authorial questions. No item is active until an independent factual review.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const pack=new URL('../../../exam-packs/tce-go-ti-2026/',import.meta.url);
const curriculum=JSON.parse(await readFile(new URL('curriculum.json',pack),'utf8'));
const topics=new Map(curriculum.disciplines.flatMap(d=>d.modules.flatMap(m=>m.topics)).map(t=>[t.id,t]));
const rows=[];
function q(topic,stem,evidence,options){rows.push({topic,stem,evidence,options});}
q('lp-texto','Texto original: “A atualização corrigiu a falha de acesso, mas a lentidão permaneceu.” Qual informação está explicitamente afirmada?', 'Compreensão literal, contraste introduzido por mas',[
 ['A falha de acesso foi corrigida, embora a lentidão tenha continuado.','O texto afirma a correção do acesso e contrapõe a persistência da lentidão.'],
 ['A atualização resolveu tanto o acesso quanto a lentidão.','A segunda oração informa que a lentidão permaneceu, excluindo essa conclusão.'],
 ['A falha de acesso foi causada pela lentidão.','O texto não estabelece relação de causa entre esses problemas.'],
 ['A atualização introduziu uma nova falha de acesso.','O verbo corrigiu indica reparo da falha; não há afirmação de criação de outra.'],
 ['A lentidão foi resolvida antes da atualização.','Permaneceu indica continuidade, sem afirmar resolução anterior.']]);
q('lp-morfossintaxe','Na frase original “Os relatórios foram revisados pela equipe”, que construção verbal está presente?', 'Voz passiva analítica; auxiliar ser e particípio',[
 ['Voz passiva analítica: o sujeito recebe a ação e a locução contém ser e particípio.','Relatórios recebe a revisão; foram revisados contém auxiliar ser e particípio, com agente pela equipe.'],
 ['Voz ativa: o sujeito relatórios executa a ação de revisar.','Quem revisa é a equipe; relatórios é o paciente, não o agente.'],
 ['Voz reflexiva: os relatórios revisam a si próprios.','Não há pronome reflexivo nem ação do sujeito sobre si mesmo.'],
 ['Passiva sintética: a forma foram substitui a partícula se.','Passiva sintética usa se apassivador; essa frase usa locução ser + particípio.'],
 ['Sujeito indeterminado: não há termo expresso na oração.','Os relatórios é sujeito expresso e concorda com foram.']]);
q('lp-sintaxe-redacao','Em “Ana, confira o relatório antes da reunião”, por que a vírgula após Ana é adequada?', 'FUNAG Vírgula, vocativo',[
 ['Ela isola o vocativo, que identifica a pessoa a quem se dirige a ordem.','Ana é um chamamento ao destinatário da ordem; o vocativo deve ser isolado.'],
 ['Ela separa obrigatoriamente o sujeito do predicado.','Não se trata de separação entre sujeito e predicado; Ana funciona como vocativo.'],
 ['Ela marca a omissão do verbo principal.','Confira é o verbo principal expresso; não ocorre elipse que explique a vírgula.'],
 ['Ela transforma Ana em objeto direto de conferir.','O relatório é o objeto de conferir; Ana é destinatária do chamamento.'],
 ['Ela separa duas orações independentes já completas.','Ana não constitui uma oração completa nessa frase.']]);
q('mrl-aritmetica','Um reservatório contém 3/4 de sua capacidade. Retira-se 1/3 da capacidade total. Que fração da capacidade permanece?', 'Subtração de frações; denominador comum',[
 ['5/12','Usando denominador 12: 3/4 - 1/3 = 9/12 - 4/12 = 5/12.'],
 ['2/1','Subtrair numeradores e denominadores separadamente não é regra de subtração de frações.'],
 ['1/4','1/4 seria retirar metade da capacidade; aqui a retirada é 1/3 da capacidade total.'],
 ['2/3','3/4 corresponde a 9/12, e a retirada de 4/12 deixa 5/12, não 8/12.'],
 ['1/2','1/2 equivale a 6/12; a diferença calculada é 5/12.']]);
q('mrl-proporcoes','Um orçamento de R$ 900 será dividido entre duas equipes na razão 2:3. Qual valor recebe a equipe correspondente a 2 partes?', 'Divisão diretamente proporcional, soma de partes',[
 ['R$ 360','São cinco partes ao todo; cada uma vale 900/5=180. Duas partes valem 360.'],
 ['R$ 450','Dividir igualmente ignora a razão 2:3.'],
 ['R$ 540','540 corresponde a três partes e é o valor da outra equipe.'],
 ['R$ 600','Multiplicar 900 por 2/3 usa a razão entre as equipes como fração do total; a fração correta é 2/5.'],
 ['R$ 180','180 é o valor de uma parte, enquanto a equipe recebe duas.']]);
q('mrl-logica','Três tarefas A, B e C serão executadas uma única vez. A deve vir antes de B e C deve vir depois de B. Qual sequência atende às duas condições?', 'Dedução e ordenação com condições explícitas',[
 ['A, B, C','As condições impõem A antes de B e B antes de C, formando a ordem A-B-C.'],
 ['B, A, C','B precede A, violando a primeira condição.'],
 ['A, C, B','C precede B, violando a segunda condição.'],
 ['C, A, B','C ocorre antes de B, embora devesse ocorrer depois.'],
 ['B, C, A','A é colocada após B, contrariando a primeira condição.']]);
q('leginst-constituicao','No controle externo federal previsto no art. 71 da Constituição, qual relação institucional é estabelecida entre o Congresso Nacional e o TCU?', 'CF art.71 caput, corte25/08/2026',[
 ['O Congresso exerce o controle externo com auxílio do TCU.','O art.71 atribui o controle externo ao Congresso Nacional e prevê o auxílio do TCU.'],
 ['O TCU substitui integralmente o Congresso no exercício de sua função legislativa.','Auxílio no controle externo não transfere a função legislativa do Congresso.'],
 ['O Congresso é órgão subordinado ao TCU no processo legislativo.','O art.71 não estabelece subordinação legislativa do Congresso ao Tribunal.'],
 ['O controle externo federal é exercido exclusivamente por tribunais estaduais.','O dispositivo trata do Congresso Nacional com auxílio do Tribunal de Contas da União.'],
 ['O TCU exerce o controle externo mediante delegação de empresas privadas.','A relação prevista é entre órgãos constitucionais; a afirmação não consta no dispositivo.']]);
q('leginst-tce','Segundo a Lei estadual nº 16.168/2007, o controle externo exercido pelo TCE-GO auxilia qual órgão legislativo?', 'Lei16.168/2007 art.1, ConstituiçãoGO controleexterno',[
 ['A Assembleia Legislativa do Estado de Goiás.','A Lei Orgânica situa o TCE-GO no auxílio ao controle externo da Assembleia Legislativa estadual.'],
 ['O Congresso Nacional em todas as contas da União.','O controle externo federal envolve o TCU; o item trata da atuação estadual do TCE-GO.'],
 ['O Senado Federal no julgamento de todas as contas municipais.','A vinculação de auxílio indicada não é ao Senado Federal.'],
 ['A Câmara dos Deputados no controle de empresas estrangeiras.','Esse órgão e esse âmbito não correspondem ao dispositivo estadual.'],
 ['Uma câmara municipal designada pelo governador.','O auxílio do TCE-GO previsto na norma é à Assembleia Legislativa, sem essa designação.']]);
q('leginst-servidor','No regime estatutário estadual da Lei nº 20.756/2020, qual forma de provimento corresponde ao retorno do servidor estável ao cargo após invalidada sua demissão?', 'Lei20.756/2020 reintegração',[
 ['Reintegração.','A reintegração decorre da invalidação da demissão do servidor estável e restabelece sua investidura nos termos legais.'],
 ['Recondução por inabilitação em estágio probatório de outro cargo.','Essa hipótese caracteriza recondução; o caso descrito é invalidação de demissão.'],
 ['Reversão de aposentadoria.','Reversão trata de retorno do aposentado, não da demissão invalidada.'],
 ['Nomeação inicial em novo concurso.','O retorno descrito restaura o vínculo atingido pela demissão, sem exigir nova nomeação por concurso.'],
 ['Readaptação por limitação de capacidade.','Readaptação considera limitações de capacidade funcional; não é a causa informada.']]);
q('engsoft-ciclos','No Scrum Guide 2020, qual compromisso está associado ao Sprint Backlog?', 'ScrumGuide2020 SprintBacklog commitment SprintGoal',[
 ['Sprint Goal.','O Sprint Goal é o compromisso do Sprint Backlog; fornece o objetivo único do Sprint.'],
 ['Product Goal.','Product Goal é compromisso do Product Backlog, não do Sprint Backlog.'],
 ['Definition of Done.','Definition of Done é compromisso do Increment.'],
 ['Uma lista fixa de tarefas imposta por outro time.','O Sprint Backlog é plano dos Developers; a lista externa não é o compromisso formal definido.'],
 ['Uma previsão obrigatória de orçamento anual.','O guia não associa esse compromisso ao Sprint Backlog.']]);
q('devsistemas-fundamentos','Uma pilha recebe, nesta ordem, os valores 10, 20 e 30. Qual valor deve ser removido na próxima operação pop?', 'Python tutorial5.1.1 pilha LIFO',[
 ['30','Pilha segue LIFO: o último valor inserido é o primeiro removido.'],
 ['10','10 seria o primeiro a sair em uma fila FIFO, não na pilha informada.'],
 ['20','20 fica abaixo de 30 e não é o topo após as três inserções.'],
 ['Todos os valores simultaneamente.','Uma operação pop remove o elemento do topo; não esvazia automaticamente toda a pilha.'],
 ['Nenhum valor, porque pop só pode inserir.','Pop é operação de remoção; a inserção é usualmente denominada push.']]);
q('devsistemas-linguagens-web','Em JavaScript, uma função retorna outra função que utiliza uma variável do escopo exterior. Como se chama a combinação que permite esse acesso ao ambiente léxico?', 'MDN Functions Closures',[
 ['Closure.','Closure associa a função ao ambiente léxico em que foi criada, permitindo acesso a variáveis desse ambiente.'],
 ['Hoisting que copia todos os valores para um servidor.','Hoisting trata de processamento de declarações; não é transferência de valores a um servidor.'],
 ['Coerção que transforma qualquer variável em constante.','Coerção converte tipos; não define a associação entre função e ambiente léxico.'],
 ['DOM que armazena apenas variáveis locais de funções.','DOM representa documentos; não é o mecanismo de closure.'],
 ['Garbage collection que proíbe funções aninhadas.','Coleta de lixo gerencia memória e não proíbe funções aninhadas.']]);
q('ia-agentivos-llm','Na distinção de engenharia apresentada em Building effective agents, qual característica diferencia um agente de um workflow com caminhos predefinidos?', 'Anthropic Buildingeffectiveagents Workflowsvsagents',[
 ['O modelo dirige dinamicamente seu processo e o uso de ferramentas, dentro de limites definidos.','A fonte distingue agentes, em que o modelo dirige o processo, de workflows com caminhos definidos pelo código.'],
 ['Um agente jamais utiliza ferramentas externas.','Uso de ferramentas é parte possível do processo do agente; sua ausência não define a categoria.'],
 ['Um workflow não pode utilizar modelos de linguagem.','Workflows podem utilizar LLMs em etapas predefinidas.'],
 ['Um agente garante automaticamente a verdade de toda resposta.','Autonomia de fluxo não garante correção factual; critérios, limites e avaliação continuam necessários.'],
 ['Todo workflow exige acesso irrestrito ao sistema operacional.','O tipo de fluxo não exige acesso irrestrito; ferramentas e permissões são escolhas de projeto.']]);
q('ia-agentivos-contexto','Um assistente recebe uma tarefa longa e complexa. Qual é a finalidade de dividi-la em uma cadeia de prompts para subtarefas verificáveis?', 'Anthropic Promptchaining gate verificações',[
 ['Permitir etapas delimitadas, com verificações intermediárias antes de seguir.','Prompt chaining decompõe a tarefa; verificações podem avaliar se uma etapa permite continuar.'],
 ['Eliminar todos os critérios de aceite para reduzir tokens.','Sem critérios não há base para as verificações intermediárias propostas.'],
 ['Garantir que nenhuma etapa precise de contexto.','Cada etapa precisa do contexto adequado, incluindo resultados anteriores quando necessários.'],
 ['Substituir toda avaliação por duplicação do mesmo prompt.','Repetição idêntica não demonstra qualidade nem corresponde à decomposição descrita.'],
 ['Conceder acesso a toda ferramenta existente sem autorização.','Decompor prompts não implica ampliar permissões de ferramentas.']]);
q('devops-iac-observabilidade','Uma investigação precisa acompanhar o caminho de uma requisição por vários serviços. Qual sinal de observabilidade descreve operações vinculadas nessa execução?', 'OpenTelemetry signals traces spans',[
 ['Trace, composto por spans relacionados.','Um trace registra o percurso da requisição em operações representadas por spans e seus relacionamentos.'],
 ['Uma métrica agregada sem identidade de execução.','Métricas agregam medidas, mas sozinhas não descrevem a sequência específica de operações dessa requisição.'],
 ['Somente uma configuração declarativa de infraestrutura.','Configuração de infraestrutura não é registro do percurso da requisição.'],
 ['Uma imagem de container sem instrumentação.','A imagem empacota o software; não registra por si só operações de execução distribuída.'],
 ['Um inventário de versões do repositório.','O inventário de versões não representa os spans de uma requisição.']]);
q('devops-git-containers','Sobre containers e máquinas virtuais, qual afirmação expressa a distinção básica de isolamento apresentada pela documentação Docker?', 'Docker whatisacontainer kernel VM',[
 ['Containers isolam processos e compartilham o kernel do ambiente hospedeiro.','Containers compartilham o kernel do host em que executam; esse ambiente pode ser uma VM, como em plataformas Desktop.'],
 ['Todo container precisa executar um kernel convidado próprio.','Esse requisito é típico de uma VM com sistema convidado; não descreve o modelo básico de container.'],
 ['Containers não oferecem isolamento entre processos.','A documentação descreve processos isolados; compartilhar kernel não equivale à ausência de isolamento.'],
 ['Uma imagem de container é sempre um sistema operacional físico completo.','Imagem é um pacote de execução do container, sem exigir sistema físico completo.'],
 ['Containers só funcionam quando o host não tem kernel.','Os processos precisam do kernel do ambiente hospedeiro; a afirmação inverte a relação.']]);
q('bd-modelagem','Uma tabela de pedidos tem coluna cliente_id referenciando clientes.id. Qual restrição expressa a obrigação de referenciar um cliente existente para valores não nulos?', 'PostgreSQL18 FK tutorial3.3 ddl5.5.5',[
 ['Chave estrangeira.','A chave estrangeira estabelece integridade referencial; o tratamento de NULL depende das restrições e do modo de correspondência.'],
 ['Um índice não exclusivo, sem restrição referencial.','Índice sozinho não impõe a existência do cliente em outra tabela.'],
 ['Uma ordenação alfabética da coluna.','Ordenar valores não verifica a existência da linha referenciada.'],
 ['Uma instrução SELECT sem restrição no schema.','Uma consulta isolada não cria a obrigação de integridade referencial para inserções futuras.'],
 ['A exclusão de todas as chaves primárias.','Remover chaves não impõe a correspondência descrita.']]);
q('bd-tecnologias-operacao','Na documentação PostgreSQL, qual abordagem combina backup-base com arquivos WAL para permitir recuperação a um ponto no tempo?', 'PostgreSQL continuousarchiving PITR',[
 ['Arquivamento contínuo de WAL e recuperação a partir do backup-base.','A sequência de WAL arquivados pode ser reproduzida a partir do backup-base até o ponto desejado, conforme os requisitos da recuperação.'],
 ['Apenas uma captura da tela de uma consulta.','Uma imagem de tela não contém estado e registros necessários para recuperar o banco.'],
 ['Somente um índice B-tree da tabela mais acessada.','Índice não substitui backup-base e registros WAL para recuperar todo o banco.'],
 ['Um SQL dump isolado, sem histórico de WAL.','O dump representa uma exportação; sozinho não oferece a reprodução temporal da sequência WAL descrita.'],
 ['A remoção dos WAL antes da obtenção do backup-base.','Eliminar registros necessários compromete a recuperação pretendida.']]);
q('ia-dados-ml','Em um problema supervisionado, o alvo assume as categorias “fraude” ou “não fraude”. Qual tipo de tarefa é descrito?', 'scikit-learn gettingstarted classificationregression',[
 ['Classificação.','Predizer uma categoria discreta do alvo corresponde à classificação supervisionada.'],
 ['Regressão de um valor contínuo.','Regressão contínua prevê valores numéricos, enquanto o alvo apresentado tem categorias.'],
 ['Agrupamento sem alvos conhecidos.','O caso é supervisionado e dispõe de categorias de referência; não é a descrição de clustering.'],
 ['Aprendizado por reforço com recompensa por ação.','Não há agente, sequência de ações e recompensa na definição apresentada.'],
 ['Compressão que dispensa conjunto de treinamento.','Compressão não é o tipo de predição supervisionada solicitado.']]);
q('ia-dados-generativa','No modelo RAG do trabalho de Lewis e colaboradores, qual memória não paramétrica é consultada para obter contexto externo?', 'RAGpaper2005.11401 abstractv4 indexvector',[
 ['Um índice vetorial de documentos consultado por um recuperador.','A proposta combina memória paramétrica do modelo com índice vetorial recuperável como memória não paramétrica.'],
 ['Apenas os pesos do modelo seq2seq, sem recuperação.','Os pesos correspondem à memória paramétrica; o item pergunta a componente não paramétrica.'],
 ['Uma garantia matemática de que toda resposta será verdadeira.','A arquitetura de recuperação não é garantia absoluta de correção factual.'],
 ['Um sorteio de palavras sem documentos associados.','O recuperador consulta representações de documentos; não se resume a sorteio de palavras.'],
 ['Um registro que impede qualquer contexto adicional.','A recuperação acrescenta contexto documental, em vez de proibi-lo.']]);
q('ia-dados-rag-etica','Um pipeline calcula parâmetros de normalização usando treino e teste juntos antes de medir a qualidade do modelo. Que risco está presente?', 'scikit-learn commonpitfalls12.2 dataleakage',[
 ['Vazamento de dados do teste para o treinamento ou pré-processamento.','Estimar parâmetros com dados de teste pode informar o processo de treino e produzir avaliação otimista; ajuste o transformador apenas no treino.'],
 ['Separação adequada, porque qualquer pré-processamento é isento de vazamento.','Pré-processamento aprendido dos dados também pode vazar informações do teste.'],
 ['Redução garantida do erro em dados futuros, sem necessidade de avaliação.','O vazamento prejudica a confiabilidade da avaliação, sem garantir desempenho futuro.'],
 ['Transformação automática em aprendizado por reforço.','O vazamento não muda o tipo de aprendizado para reforço.'],
 ['Anonimização garantida dos dados pessoais utilizados.','Normalização e separação treino/teste não garantem anonimização.']]);
q('seguranca-cripto-identidade','Uma política permite ao usuário autenticado consultar relatórios, mas impede excluí-los. Qual decisão diferencia essas duas operações?', 'OWASP Authorizationcheatsheet permissions',[
 ['Autorização para cada recurso e operação.','Autenticação reconhece a identidade; autorização aplica as permissões distintas de consulta e exclusão.'],
 ['Somente a confirmação da identidade, sem política de permissões.','Conhecer a identidade não implica que todas as operações estejam autorizadas.'],
 ['Compressão dos relatórios antes da leitura.','Compressão não decide permissões para consultar ou excluir.'],
 ['Mudança da cor da tela após o login.','A aparência da interface não determina autorização no servidor.'],
 ['Uso de criptografia como substituto de todas as verificações de acesso.','Criptografia não substitui a aplicação da política de autorização por operação.']]);
q('seguranca-aplicacoes-continuidade','Uma aplicação concatena diretamente texto recebido do usuário em uma consulta SQL. Qual medida principal recomendada pela OWASP evita tratar esse texto como código SQL?', 'OWASP SQLInjectionPrevention preparedstatements',[
 ['Usar consultas parametrizadas com vinculação de parâmetros.','A parametrização mantém a separação entre a estrutura SQL e os dados fornecidos.'],
 ['Conceder privilégios administrativos à conexão da aplicação.','Privilégio excessivo aumenta o impacto de uma exploração e não separa código de dados.'],
 ['Trocar apenas a mensagem de erro exibida ao usuário.','Ocultar mensagens não remove a concatenação insegura na construção da consulta.'],
 ['Aceitar a entrada sem validação e sem parâmetros.','A proposta mantém o texto não confiável interpretável como parte da consulta.'],
 ['Desativar os logs e conservar a consulta concatenada.','Desativar logs não corrige a construção SQL vulnerável.']]);
q('sistemas-os-shell','No shell Bash, qual operador conecta a saída padrão de um comando à entrada padrão do seguinte?', 'GNU Bash manual pipelines3.2.3',[
 ['|','O pipe conecta a saída padrão de um comando à entrada padrão do próximo na pipeline.'],
 ['>','O operador > redireciona saída para arquivo; não é o conector de pipeline entre os comandos.'],
 ['<','O operador < redireciona entrada de arquivo para um comando.'],
 [';','O ponto e vírgula separa comandos em sequência, sem conectar seus fluxos padrão.'],
 ['#','Em contexto de comentário, # não conecta os fluxos de dois comandos.']]);
q('sistemas-diretorios','No modelo LDAP, qual identificador localiza uma entrada por seu nome relativo e pela cadeia de entradas superiores?', 'RFC4512 DistinguishedName DN RDN',[
 ['Distinguished Name (DN).','DN reúne nomes relativos na hierarquia do diretório para identificar a entrada.'],
 ['Somente o endereço MAC da máquina do usuário.','MAC identifica interface de rede; não é o nome hierárquico de uma entrada LDAP.'],
 ['A quantidade de processos ativos no servidor.','Contagem de processos não identifica entrada no diretório.'],
 ['Um número de porta sem contexto de diretório.','Porta identifica um ponto de comunicação; não forma o nome da entrada LDAP.'],
 ['O tamanho do arquivo de log de autenticação.','Tamanho do log não representa a posição hierárquica da entrada.']]);
q('governanca-alinhamento','Uma iniciativa de TI deve contribuir para o objetivo institucional de reduzir o prazo de atendimento. Qual informação demonstra melhor esse alinhamento no planejamento?', 'TCU ReferencialBásicoGovernança estratégia indicadores resultados',[
 ['A relação entre a iniciativa, o resultado institucional esperado e um indicador de prazo.','Relacionar iniciativa, objetivo e medida de resultado permite avaliar sua contribuição à estratégia.'],
 ['A escolha da ferramenta mais recente, sem indicar o efeito no atendimento.','Novidade da ferramenta, isoladamente, não demonstra contribuição ao objetivo declarado.'],
 ['A quantidade de reuniões técnicas, sem resultado de serviço associado.','Uma atividade interna não demonstra por si só redução do prazo de atendimento.'],
 ['A aparência do logotipo do fornecedor, sem indicador institucional.','Identidade visual do fornecedor não mede contribuição à estratégia institucional.'],
 ['O número de arquivos criados, sem vínculo com o processo de atendimento.','Volume de arquivos sem relação de resultado não demonstra o alinhamento requerido.']]);
q('governanca-servicos','Em gestão de serviços, a equipe restaura um serviço após uma interrupção e depois investiga sua causa para reduzir recorrências. A que práticas correspondem essas duas finalidades?', 'ITIL4 incidentmanagement problemmanagement official',[
 ['Gestão de incidentes para restauração e gestão de problemas para causas e recorrências.','Incidentes priorizam restaurar o serviço; problemas tratam causas reais ou potenciais e seus efeitos recorrentes.'],
 ['Gestão financeira para restauração e licenciamento para causa técnica.','Essas práticas não descrevem diretamente as duas finalidades solicitadas.'],
 ['Gestão de problemas exclusivamente para comprar equipamentos e incidentes para criar contratos.','A descrição confunde práticas e desloca suas finalidades centrais.'],
 ['Catálogo de serviços para apagar a causa e orçamento para registrar a interrupção.','Catálogo descreve serviços; não substitui investigação causal e resposta ao incidente.'],
 ['Uma única ação de mudança de tema visual, sem analisar o serviço.','Alteração visual não corresponde às práticas de restauração e análise causal descritas.']]);
q('governanca-modelos','No COBIT 2019, qual distinção organiza a relação entre governança e gestão?', 'ISACA COBIT2019 governance EDM management APOBAIDSSDMEA',[
 ['Governança avalia, direciona e monitora; gestão planeja, constrói, executa e monitora conforme a direção.','COBIT separa o domínio EDM de governança dos domínios de gestão e das atividades correspondentes.'],
 ['Governança executa apenas suporte diário e gestão define exclusivamente a direção do conselho.','A afirmação inverte as responsabilidades centrais de governança e gestão.'],
 ['Governança e gestão são conceitos sempre idênticos, sem responsabilidades distintas.','O framework diferencia as atividades e responsabilidades desses componentes.'],
 ['Governança determina que toda organização adote as mesmas ferramentas e controles sem adaptação.','O COBIT prevê desenho de sistema de governança segundo contexto e fatores de projeto.'],
 ['Gestão dispensa objetivos institucionais quando utiliza um framework internacional.','A gestão opera dentro da direção e dos objetivos; o framework não dispensa esse vínculo.']]);
q('governanca-publica','Pela Lei nº 14.133/2021, qual documento caracteriza a primeira etapa do planejamento de uma contratação, identificando o interesse público envolvido e sua melhor solução?', 'Lei14133 art6XX estudo técnico preliminar',[
 ['Estudo técnico preliminar (ETP).','O art.6º, XX define o ETP como documento da primeira etapa do planejamento e base para os artefatos posteriores quando a contratação se mostrar viável.'],
 ['Um comprovante de pagamento emitido após a execução.','O pagamento é posterior e não caracteriza a etapa de análise inicial da necessidade.'],
 ['Uma ata de sorteio sem avaliação do interesse público.','A definição legal demanda análise do interesse e da solução, não esse documento.'],
 ['Uma nota fiscal do fornecedor escolhido antes do planejamento.','Nota fiscal não substitui a análise preliminar da necessidade e solução.'],
 ['Somente uma lista de marcas indicadas por preferência pessoal.','Preferência de marcas sem análise não corresponde à definição legal de ETP.']]);
q('legti-marco-civil','No art. 15 do Marco Civil, um provedor de aplicações pessoa jurídica, organizado profissionalmente e com fins econômicos, deve guardar registros de acesso às aplicações por qual prazo ordinário?', 'MCI art15caput condições sujeitos prazo6meses',[
 ['6 meses.','O art.15 caput prevê seis meses, sob sigilo e em ambiente controlado e de segurança, para o provedor com as características descritas.'],
 ['1 ano, aplicando automaticamente o prazo dos registros de conexão.','O prazo anual do art.13 é de registros de conexão, com sujeito e obrigação diferentes.'],
 ['24 horas, sem sigilo ou controle de acesso.','Esse prazo e essa forma de guarda não correspondem ao art.15.'],
 ['Prazo ilimitado para qualquer pessoa que acesse a internet.','A lei define um sujeito qualificado e prazo ordinário; não é obrigação irrestrita de todo usuário.'],
 ['Nenhum prazo, pois aplicações jamais geram obrigação de guarda.','O art.15 estabelece expressamente a obrigação na hipótese descrita.']]);
q('legti-normas-tce','Segundo a Lei Complementar estadual nº 205/2025, a que se refere a expressão inteligência artificial embarcada (Edge AI)?', 'LC205/2025 definiçãoEdgeAI local semnuvemcontinua',[
 ['Sistemas de IA integrados a dispositivos físicos, operando localmente sem depender de comunicação contínua com a nuvem.','A definição legal trata de integração em dispositivos e operação local, sem necessidade de comunicação externa contínua ou conexão permanente à nuvem.'],
 ['Qualquer sistema que só funciona com envio permanente de todos os dados à nuvem.','Dependência permanente da nuvem contraria o elemento de operação local da definição.'],
 ['Uma modalidade exclusiva de licitação para serviços de datacenter.','O termo descreve arquitetura de IA em dispositivos, não uma modalidade de licitação.'],
 ['Um banco de dados que proíbe o uso de algoritmos em dispositivos.','A definição envolve sistemas de IA integrados a dispositivos, não essa proibição.'],
 ['Uma obrigação de substituir todos os sistemas institucionais por serviços externos.','A definição não estabelece essa obrigação universal de substituição.']]);
q('legti-pdti','Na Política de Segurança da Informação do TCE-GO, RA nº 17/2024, as diretrizes abrangem apenas informações em ambiente informatizado?', 'RA17/2024 art5 ambientesinformatizados convencionais',[
 ['Não. Abrangem também meios convencionais de processamento, comunicação e armazenamento.','O art.5º inclui explicitamente ambiente informatizado e meios convencionais de tratamento da informação.'],
 ['Sim. Informações em papel ficam integralmente fora das diretrizes.','Meios convencionais também são abrangidos; o suporte papel não os exclui automaticamente.'],
 ['Sim. A política vale apenas para servidores que desenvolvem software.','A norma estabelece abrangência e responsabilidades para usuários e processos além de desenvolvedores.'],
 ['Não, porque a política se aplica exclusivamente a equipamentos pessoais sem relação institucional.','A abrangência não é exclusiva de equipamentos pessoais; trata de informação e processos do TCE-GO.'],
 ['Sim. A política exclui comunicação e armazenamento de informação.','Processamento, comunicação e armazenamento constam expressamente da abrangência.']]);
q('ingles-compreensao','Texto técnico original: “The service stores encrypted backups every night. Recovery tests run once a month.” According to the text, how often are recovery tests performed?', 'English technicalreading scanning informaçãoexplícita',[
 ['Once a month.','A segunda frase informa expressamente a frequência dos testes de recuperação: uma vez por mês.'],
 ['Every night.','Every night refere-se ao armazenamento de backups, não aos testes de recuperação.'],
 ['Only when encryption fails.','O texto não condiciona os testes a falha de criptografia.'],
 ['Twice every day.','A frequência diária de duas vezes não aparece no texto.'],
 ['Never, because the backups are encrypted.','A segunda frase afirma que os testes ocorrem; criptografia não elimina essa afirmação.']]);
q('ingles-estrategias','Um manual em inglês contém várias páginas e você precisa localizar apenas o limite máximo de conexões. Qual estratégia de leitura busca essa informação específica?', 'BritishCouncil readingexams scanningvs skimming',[
 ['Scanning: procurar termos, números e trechos relacionados ao limite solicitado.','Scanning busca informação específica; nesse caso, limite e conexões orientam a procura.'],
 ['Skimming exclusivamente para obter a ideia geral sem procurar o limite.','Skimming busca visão geral; a pergunta exige localizar um dado específico.'],
 ['Traduzir todas as palavras antes de procurar qualquer número.','Tradução integral não é requisito da estratégia de localização de informação específica.'],
 ['Ignorar títulos e tabelas mesmo que apresentem connection limit.','Títulos e tabelas podem indicar precisamente a informação procurada.'],
 ['Escolher um valor sem consultar o contexto do manual.','Uma leitura orientada por informação específica exige localizar e conferir o dado.']]);
q('ingles-documentacao','Em um manual de API, a instrução original diz: “Set timeout to 500 milliseconds.” Qual é a interpretação adequada?', 'English ITvocabulary timeout milliseconds unidades',[
 ['Configurar o limite de espera como 500 milissegundos, equivalentes a 0,5 segundo.','Timeout é limite de espera; 1000 milissegundos correspondem a um segundo.'],
 ['Configurar 500 segundos, porque milliseconds significa segundos.','Milliseconds são milissegundos, não segundos; a conversão proposta erra por fator 1000.'],
 ['Excluir qualquer limite de espera e bloquear a operação permanentemente.','Set timeout especifica um limite; não manda eliminar a limitação.'],
 ['Enviar obrigatoriamente 500 requisições por segundo.','A instrução define espera, não taxa de requisições.'],
 ['Alterar a porta de rede para o número 500.','O parâmetro informado é timeout, não port.']]);
const now=new Date().toISOString();
const drafts=rows.map((r,n)=>{
 const id='q-tcego-expanded-'+r.topic+'-01', seed=createHash('sha256').update(id).digest();
 const positions=[0,1,2,3,4]; for(let i=4;i>0;i--){const j=seed[i]%(i+1);[positions[i],positions[j]]=[positions[j],positions[i]];}
 const options=positions.map((p,i)=>({id:'abcde'[i],text:r.options[p][0]}));
 return {id,examId:'tce-go-ti-2026',topicIds:[r.topic],canonicalConceptIds:topics.get(r.topic).canonicalConceptIds,stem:r.stem,options,
 correctOptionId:options[positions.indexOf(0)].id,explanation:r.options[0][1],explanationByOption:Object.fromEntries(positions.map((p,i)=>['abcde'[i],r.options[p][1]])),
 origin:'generated_original',difficulty:['mrl-aritmetica','mrl-proporcoes','mrl-logica'].includes(r.topic)?'medium':'easy',cognitiveLevel:'application',
 fingerprint:createHash('sha256').update(r.topic+'|'+r.stem).digest('hex'),status:'draft',reviewStatus:'pending_review',contentVersion:1,validAsOf:now.slice(0,10),
 requestedEvidence:r.evidence,sourceRefs:[],provenance:{status:'derived',source:'StudyOS authorial proposal; primary evidence pending independent review',license:'Formulação original StudyOS; não reproduz questão de banca.'},
 editorialReview:{status:'pending',reviewer:null,reviewedAt:null,evidence:''}};
});
const gaps=JSON.parse(await readFile(new URL('content-coverage.json',pack),'utf8')).topics.filter(t=>!t.questionCount).map(t=>t.topicId);
if(gaps.length!==35||gaps.some(id=>!drafts.some(q=>q.topicIds.includes(id))))throw new Error('Draft does not address the 35 original gaps');
await writeFile(new URL('QUESTIONS_DRAFT.json',import.meta.url),JSON.stringify(drafts,null,2)+'\n');
console.log(drafts.length+' original proposals; pending independent review');
