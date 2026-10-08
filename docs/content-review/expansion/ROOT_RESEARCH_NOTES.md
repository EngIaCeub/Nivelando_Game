# Pesquisa complementar pendente de parecer editorial

Data: 2026-10-07. Estes achados não foram promovidos a `resources.json` nem
incluídos nos pareceres de domínio. Eles precisam de reinspeção do revisor que
assinará o mapeamento da unidade.

## IA, dados e automação

### Model Context Protocol

- URL: `https://modelcontextprotocol.io/specification/2025-06-18/architecture`
- Documento: especificação de arquitetura MCP, versão 2025-06-18.
- Recorte lido: arquitetura e componentes centrais, linhas 21–68; princípios de
  isolamento, linhas 75–97; negociação de capacidades, linhas 102–114.
- Evidência: a especificação descreve a arquitetura host-client-server, sessão
  por servidor, isolamento, resources/tools/prompts, sampling, permissões e
  negociação. É candidata a cobrir `ia-agentivos-ciclo-mcp-mcp-unit`.
- Direitos: documentação pública; licença de reprodução não foi verificada.
  Entregar somente por link até parecer editorial.

### Estratégia Brasileira de Inteligência Artificial

- URL: `https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/transformacaodigital/ebia.pdf`
- Documento: *Estratégia Brasileira de Inteligência Artificial*, MCTI, 52 páginas.
- Verificação: GET em 2026-10-07; PDF temporário lido com `pypdf`.
- Recorte lido: sumário p. 1; objetivos p. 7; estrutura com os nove eixos e
  respectivas ações nas pp. 17–50. A Portaria GM nº 4.617/2021 é reproduzida
  como anexo em fonte pública da Câmara, mas não substitui a leitura da EBIA.
- Possível unidade: `ia-dados-rag-etica-ebia-unit`.
- Direitos: publicação pública; licença de reprodução não verificada. Entregar
  somente por link.

### Big Data e processamento distribuído

- URL: `https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1500-1r2.pdf`
- Documento: *NIST SP 1500-1r2, NIST Big Data Interoperability Framework:
  Volume 1, Definitions*, versão 3, outubro de 2019, 53 páginas.
- Recorte lido: §§3.1–3.2.4 (pp. 9–12), §3.3.2 (p. 13) e §§4.1.1–4.1.3
  (pp. 17–18). O texto define volume, velocidade, variedade e variabilidade;
  explica paralelismo, divisão de tarefas e recursos, MapReduce, escala
  horizontal, sistemas de arquivos distribuídos, localidade e replicação.
- Possível unidade: `ia-dados-rag-etica-bigdata-unit`.
- Direitos: a publicação informa que obras oficiais do NIST não têm copyright
  nos EUA, com direitos estrangeiros reservados (p. ii). Entregar somente por
  link até uma análise de licença específica.

### Estatística aplicada

Fontes NIST/SEMATECH lidas diretamente:

- `https://www.itl.nist.gov/div898/handbook/eda/section3/eda351.htm` — média,
  mediana, moda e robustez.
- `https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm` —
  variância, desvio padrão, amplitude, MAD e IQR.
- `https://www.itl.nist.gov/div898/handbook/eda/section3/eda361.htm` —
  distribuições discretas e contínuas, PMF/PDF.
- `https://www.itl.nist.gov/div898/handbook/eda/section3/eda352.htm` —
  intervalo de confiança para a média e teste t de uma amostra.
- `https://www.itl.nist.gov/div898/handbook/eda/section3/eda353.htm` — teste t
  para duas amostras, inclusive dados pareados e variâncias desiguais.
- `https://www.itl.nist.gov/div898/handbook/ppc/section1/ppc134.htm` —
  população, amostra, representatividade e precisão.
- `https://www.itl.nist.gov/div898/handbook/ppc/section3/ppc332.htm` e
  `ppc333.htm` — esquema de amostragem, randomização, estratificação e tamanho
  amostral.

O conjunto aparenta cobrir a unidade `ia-dados-rag-etica-estatistica-unit`,
mas a aprovação depende da leitura final completa dos recortes e da decisão
editorial do domínio.

## Matemática

- `https://www.obmep.org.br/docs/aritmetica.pdf`: apostila pública da OBMEP,
  baixada temporariamente para leitura. Requer seleção cuidadosa dos capítulos
  para inteiros, frações e divisibilidade.
- `https://cdnportaldaobmep.impa.br/portaldaobmep/uploads/material_teorico/5h3krwas7mo0o.pdf`:
  porcentagem. A leitura integral identificou erro material no exercício 8:
  a pergunta pede o percentual da cor B, porém a solução conclui o percentual
  da cor A; e discrepância de redação no exercício 4. Se selecionado, excluir
  os exercícios 4 e 8 do recorte. Os §§1–2 e exercícios 1–3, 5–7 e 9 podem ser
  reavaliados para porcentagem, base, taxa, acréscimo e desconto.

### Reavaliação aprovada após parecer independente — operações com inteiros/racionais

- OpenStax *Prealgebra 2e*, https://openstax.org/books/prealgebra-2e/pages/1-introduction,
  oferece acesso aberto aos capítulos relevantes. A própria página identifica os
  autores Lynn Marecek, MaryAnne Anthony-Smith e Andrea Honeycutt Mathis, data de
  publicação 11/03/2020 e licença CC BY-NC-SA; entrega proposta continua somente
  por link, sem copiar ou redistribuir conteúdo.
- Recortes abertos e lidos: §§3.1–3.4 (inteiros, sinais, operações e expressões),
  §§4.1–4.6 (representação e operações com racionais/frações), §9.1 (estratégia e
  problemas numéricos com valores negativos/frações), §10.4 (potência de quociente)
  e §10.5 (expoentes inteiros e propriedades, incluindo quociente para potência).
- QA independente aprovou `primary/full` em 2026-10-07 após conferir objetivo e
  locators; registro detalhado em LANGUAGE_SECURITY_REVIEW.md e no parecer QA de
  integração. A cobertura permanece link-only e não autoriza cópia/incorporação.

## Português — candidato CEJA rejeitado

O Fascículo 12, Unidades 27–28, da Fundação CECIERJ/CEJA foi lido diretamente
(pp.4,10–11,13–14,17–19,21–25 impressas) para a unidade
`lp-sintaxe-redacao-periodos-conectivos-unit`. QA independente rejeitou-o como
`primary/full`: o gabarito da p.23 chama “por isso” de conjunção coordenativa
explicativa, erro material no objetivo avaliado; a taxonomia também não é
sistematizada. A página de direitos exige autorização escrita para reprodução.
Fonte não promovida e lacuna mantida. Registro do parecer em
LANGUAGE_SECURITY_REVIEW.md e no campo `gaps` de
LANGUAGE_SECURITY_SOURCES_REVIEW.json.

## Português — recorte parcial do Fascículo 10

A revisão independente aprovou somente o trecho do Fascículo 10, Unidade 24,
pp.52–início da p.53 impressas, que explica aditivas, adversativas e alternativas.
Não há cobertura integral: o restante apresenta classificações imprecisas,
incluindo “na verdade” como coordenativa explicativa, “por fim” como conclusiva,
exemplo causal com “porque” classificado como explicativo e “quando” descrito como
“atemporal” no gabarito. O candidato foi incluído como primary/partial e não
reduz o total de lacunas. Reprodução depende de autorização; distribuir somente
link externo.

### Corpus inglês técnico candidato — não fecha a unidade no contrato B1

Foi inspecionado um conjunto do Pro Git (§§1.5,1.7,8.1), tutorial oficial Python
(§4.1, §§4.4–4.5 e §4.9.7), documentação do GitHub REST (endpoint de issues e
artigo de boas práticas) e MDN `setTimeout` (parâmetros, condições e ms), junto
com o livro instrumental da UECE já catalogado. A QA independente considerou o
conjunto factual e representativo dos gêneros pretendidos, porém insuficiente
para marcar `primary/full`: cada fonte continua um recurso individual, B1 não
suporta bundle e falta material autoral de interpretação com gabarito/rubrica.
Não promover o conjunto como um só recurso, nem mudar IDs estáveis da unidade.
A tentativa e o motivo estão no registro da lacuna
`ingles-documentacao-corpus-unit` em LANGUAGE_SECURITY_SOURCES_REVIEW.json.

### Candidato UFPA — conectivos, parecer independente pendente

Leitura direta de *Sintaxe* (Ferreira, Abdon e Brito, EDUFPA/UFPA, 2009), Atividades 12–13, páginas impressas 150–159 (PDF pp.149–158). A atividade de coordenação traz definição, tipos e classificação sindética/assindética, exemplos e exercício que pede explicar relações semânticas; a de subordinação descreve dependência/hierarquia e compara com coordenação; o trecho didático de pp.156–157 explicita efeitos de conectores aditivos, adversativos, alternativos, explicativos e conclusivos. Enviado para QA independente como possível `primary/full` para `lp-sintaxe-redacao-periodos-conectivos-unit`; manter lacuna e resumo em 17/32 até aprovação. Repositório marca acesso aberto, mas licença específica anexada não foi recuperada; somente link externo, sem redistribuição.

### Aprovação independente — conectivos e períodos

QA independente aprovou o livro *Sintaxe* (EDUFPA/UFPA) como `primary/full` para `lp-sintaxe-redacao-periodos-conectivos-unit`; atividades 12–13 ensinam coordenação, subordinação, conectivos, classificação em contexto e exercícios. Locator: Atividade 12 pp.149–152 impressas (PDF pp.148–151); Atividade 13 pp.155–160 (PDF pp.154–159). Marcação atualizada no registro de pesquisa: 18/49 aprovadas, 31 gaps. Acesso aberto confirmado, mas variante da licença específica continua não confirmada; somente link externo. A biblioteca completa e promoção ao pack ainda aguardam todas as lacunas e QA final.


## Retomada de lacunas técnicas e LGPD — 2026-10-08

### SOLID, DRY, KISS e YAGNI — candidato para QA, ainda gap

- Fonte: Christian Ullenboom, *Java ist auch eine Insel*, capítulo aberto 14.1.1–14.1.2. URL: https://openbook.rheinwerk-verlag.de/javainsel/14_001.html
- Abertura/leitura direta dos trechos em 2026-10-08: DRY, KISS e YAGNI, incluindo a motivação do YAGNI (§14.1.1); SRP com exemplo de classe/person e validações; SOLID e respectivos princípios (§14.1.2; LSP e demais itens listados no texto). A página identifica o autor Christian Ullenboom.
- Acesso ao texto aberto observado; conteúdo em alemão. Edição e licença de reprodução não foram confirmadas. Distribuição só por link; requer revisão independente da cobertura e atualidade antes de contar cobertura integral.

### Atributos de qualidade — complemento parcial, ainda gap

- Fonte: Barbacci, Klein, Longstaff e Weinstock, *Quality Attributes*, CMU/SEI-95-TR-021, https://www.sei.cmu.edu/library/quality-attributes/ (PDF direto: https://www.sei.cmu.edu/documents/1142/1995_005_001_16427.pdf). Relatório oficial de 68 páginas do Software Engineering Institute/CMU, publicado em dezembro de 1995.
- Leitura direta: desempenho como responsividade e latência/throughput/capacidade (§§3.1.1–3.2, pp.8–9); disponibilidade como prontidão e confiabilidade como continuidade do serviço (§§4.1.1–4.2.2, pp.14–16); manutenibilidade como aptidão a reparo e evolução (§4.2.3, p.16). Exemplos diferenciam disponibilidade pontual de continuidade temporal.
- Busca integral no PDF não encontrou “scalability”. O relatório é um recorte técnico valioso, mas não cobre escalabilidade e é antigo para servir como material completo e atual. Somente link; direito de reprodução não verificado; sem QA independente.

### Segurança e governança de dados — complemento parcial, ainda gap

- Fonte: Microsoft Learn, “Get started with data governance in Microsoft Purview”, https://learn.microsoft.com/en-us/purview/data-governance-get-started. Página oficial consultada diretamente em 2026-10-08.
- Recortes: papéis de administrador e owner; domínios/produtos de dados, catálogo e glossário (linhas 40–62); nomeação de responsáveis e registro/scan de fontes (65–82); stewards, qualidade e profiling (83–113); planejamento com papéis e prestação de contas (116–130).
- Limite: foco no produto Purview; não é tutorial neutro de privilégios/grants de SGBD nem ensina auditoria de consultas. Complemento parcial, licença de reprodução desconhecida, link-only e sem QA independente.

### LGPD aplicada à IA — lei primária agora acessível; unidade continua gap

- Fonte: texto consolidado da Lei 13.709/2018 na Presidência da República, https://presidencia.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm, aberto em 2026-10-08.
- Recortes lidos: art.6, princípios de finalidade, adequação, necessidade, transparência, segurança e prestação de contas (linhas 94–109); art.7, hipóteses legais (117–143); art.20, revisão e informação sobre decisões automatizadas (309–312); arts.46–49, medidas de segurança desde a concepção, incidentes e estruturação de sistemas (488–513). Isso corrige o timeout anterior do Planalto e fundamenta normativamente as quatro áreas.
- Limite: lei é texto normativo primário e não um recurso de ensino de aplicação a IA; a EBIA também não substitui a lei. Falta fonte didática que traduza finalidade/necessidade/bases/proteções em cenários de IA, revisão independente e validação do corte legal. Link-only, licença de reprodução desconhecida.


### Linux — candidato didático melhor caracterizado, ainda gap

- Fonte: Chris Paton, *Textbook of Linux*, https://www.textbookoflinux.com/ (acesso web sem login observado). Perfil público do autor: https://www.ndm.ox.ac.uk/team/chris-paton; ele é pesquisador/professor de informática em saúde, não especialista identificado em Linux kernel. O livro lista 92 referências: https://www.textbookoflinux.com/references.html.
- Leitura direta em 2026-10-08: Ch.3 kernel (funções de processo/memória, espaço usuário/kernel, boot, pseudo-filesystems), Ch.4 FHS, Ch.5 shell, Ch.6 arquivos/diretórios/caminhos, Ch.9 usuários/grupos/permissões, Ch.10 PID/PPID/estados/sinais/ps/top/job control, Ch.19 memória operacional com free/top/vmstat/proc/meminfo/swap. As unidades têm objetivos explícitos, tabelas, comandos, exemplos e FAQ.
- Limite factual: memória conceitual do Ch.3 é breve e a aula de Ch.19 é diagnóstica. O texto afirma que qualquer atividade si/so no vmstat indica estar sem memória, regra excessiva: atividade de swap precisa de contexto e não prova, sozinha, exaustão. Requer leitura independente técnica dos conteúdos e versão atual da Linux; foi inscrito apenas como primary/partial, não reduz gap. Autor/edital não documentam licença de reprodução, link-only.
- Comparação: a página da Linux Foundation descreve o curso LFS101 como gratuito e lista processos, filesystems, permissões, ambiente, shell e Bash; porém o outline de 2017 não lista gestão de memória/VM. Como seu PDF avisa “Do Not Distribute”, não distribuir o documento nem usá-lo como prova de licença; a página oficial do curso permite referência por link. Fonte: https://training.linuxfoundation.org/training/introduction-to-linux/; outline consultado: https://courses.edx.org/asset-v1:LinuxFoundationX%2BLFS101x%2B1T2017%2Btype%40asset%2Bblock/LFS101x_-_Introduction_to_Linux_Outline.pdf.


### Linux — complemento conceitual OpenStax, ainda gap

- Fonte: Jean-Claude Franchitti, *Introduction to Computer Science*, OpenStax/Rice University (2024), §§6.4–6.5: https://openstax.org/books/introduction-computer-science/pages/6-4-memory-management e https://openstax.org/books/introduction-computer-science/pages/6-5-file-systems. Acesso gratuito e CC BY-NC-SA confirmado na página.
- Leitura direta: memória virtual e física, isolamento, paginação sob demanda, page faults, page replacement, swap e thrashing; arquivos/diretórios, hierarquia Unix/Linux, inodes e operações de sistema de arquivos.
- Limites: recurso conceitual, não ensina administração Linux, processos/comandos nem permissões. Revisão técnica necessária: §6.4 define page fault estreitamente como página no backing store e confunde em trecho a heap de alocação com heap como árvore. Registrado como primary/partial; não reduz lacuna. Link externo; nenhuma cópia/reprodução no pack.


### HTTP/2, HTTP/3 e HTTPS — candidato MDN aparentemente integral, QA independente pendente

- Recortes lidos: MDN *HTTP messages* (HTTP/1.x, frames/multiplexação HTTP/2 em TCP, bloqueio residual TCP e HTTP/3/QUIC/UDP com streams independentes); *Evolution of HTTP* (HTTP/3/QUIC); *Transport Layer Security* (HTTPS, confidencialidade/integridade/autenticação, certificado e handshake). Links: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages ; https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP ; https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security .
- O objetivo da unidade requer comparar multiplexação/transporte HTTP/2 e HTTP/3 e explicar proteção HTTPS/TLS. Os recortes parecem suficientes para primary/full. A política MDN declara documentação CC BY-SA 2.5 ou posterior: https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license .
- O candidato permanece pendente de QA factual/editorial independente; não altera gap count nem foi promovido ao pack. Apenas links externos nesta etapa.


### Windows — conjunto Microsoft Learn ampliado, permanece parcial

- Fontes lidas em 2026-10-08: [Virtual Address Space and Physical Storage](https://learn.microsoft.com/en-us/windows/win32/memory/virtual-address-space-and-physical-storage) (working set, páginas, memória física/virtual e pagefile; atualização da página em 2021); [Task Manager](https://learn.microsoft.com/en-us/troubleshoot/windows-server/support-tools/support-tools-task-manager) (processos, serviços, usuários, recursos e wait chains; Windows Client/Server suportados); [Access Control Overview](https://learn.microsoft.com/en-us/windows/security/identity-protection/access-control/access-control) (ACL/NTFS, propriedade, herança, direitos e auditoria; atualização 2026-05-27); [Local accounts](https://learn.microsoft.com/en-us/windows/security/identity-protection/access-control/local-accounts) (Computer Management, NET.EXE e PowerShell); e percursos Microsoft Learn de [arquivos/armazenamento](https://learn.microsoft.com/en-us/training/paths/windows-server-file-servers-storage-management/) e [monitoramento de desempenho](https://learn.microsoft.com/en-us/training/modules/monitor-windows-server-performance/).
- O conjunto traz evidência primária para os quatro eixos (administração, processos, memória e arquivos/permissões), mas é fragmentado e em parte intermediário/Server. O texto específico de memória é de 2021; não foram reutilizados números de limites de 32-bit como regra atual. Os itens foram registrados como primary/partial. Falta sequência didática integral e QA independente; gap continua aberto. A política/licença de reprodução das páginas Microsoft não foi verificada, então somente link externo.


### PowerShell — conteúdo atual amplia somente metade da unidade

- Recortes lidos em 2026-10-08: Microsoft Learn PowerShell 101, cap.2 (Get-Help e descoberta), cap.4 (pipeline/objetos), cap.5 (operadores/provedores), cap.6 (scripts, variáveis e loops/condições), mais referência de arrays. URLs: https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/02-help-system?view=powershell-7.6 ; https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/04-pipelines?view=powershell-7.6 ; https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/05-formatting-aliases-providers-comparison?view=powershell-7.6 ; https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/06-flow-control?view=powershell-7.6 ; https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-arrays?view=powershell-7.6 .
- Esses recortes dão cobertura didática robusta à parcela PowerShell (cmdlets, variáveis, pipeline, redirecionamento/fluxo e controle), mas a unidade também exige Bash e prática de scripts nos dois shells. As tentativas de abrir o manual GNU Bash deram timeout; ausência de leitura não é evidência de cobertura. Registro primary/partial, sem mudança no gap. Licença de reprodução Microsoft não verificada; só link externo.


### AD DS e LDAP — conjunto candidato ampliado, ainda sem aprovação

- Microsoft Learn *Introduction to AD DS* (8 unidades com avaliação): https://learn.microsoft.com/en-us/training/modules/introduction-to-ad-ds/; e *Understanding the Active Directory Logical Model*: https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/understanding-the-active-directory-logical-model. Leitura confirma os objetivos do módulo sobre objetos, florestas/domínios, DCs, OUs e gestão; a página lógica explica domínio como partição, autenticação e replicação. Ambos são gratuitos como leitura; licença de reprodução não confirmada. Módulo intermediário e com pré-requisito de Windows Server/redes.
- OpenLDAP *Software 2.6 Administrator’s Guide*, §§1.2 e 1.5, pp.16–20 impressas: https://www.openldap.net/doc/admin26/OpenLDAP-Admin-Guide.pdf. Lidos: árvore DIT, entradas e atributos, DN/RDN, exemplos de busca e operações de pesquisa/inclusão/remoção/alteração/renomeação. O prefácio descreve o guia como material operacional e pressupõe conhecimento básico de LDAP. Apêndices K/L declaram OpenLDAP Public License 2.8 e avisos adicionais de copyright.
- Em conjunto com RFC4512 e a visão geral AD DS já inscritas, o conjunto pode cobrir o objetivo, mas as fontes não formam um curso unificado; uma parte é avançada e operacional. Mantidas como primary/partial por fonte, candidatas à conferência de sequência, pré-requisitos, cobertura acumulada e licença em QA independente. Lacuna continua aberta; link-only.


### Wi-Fi — bandas, regras brasileiras e segurança WPA, conjunto candidato

- Microsoft Support, [Wi-Fi e Layout da sua Página Inicial](https://support.microsoft.com/pt-br/windows/experience/connectivity-networking/wi-fi-and-your-home-layout): leitura direta em 2026-10-08 sobre bandas 2,4/5/6 GHz, diferenças aproximadas de alcance/obstáculos, coexistência e canais 2,4 GHz 1/6/11 (no contexto do guia), largura 20/40 MHz e causas práticas de interferência. É material de suporte ao consumidor, não fonte normativa nem substituto a uma explicação de RF. A página remete à segurança atual WPA3; licença de reprodução não verificada, somente link.
- Anatel, [Ato nº 14.448/2017, texto consolidado](https://informacoes.anatel.gov.br/legislacao/atos-de-certificacao-de-produtos/2017/1139-ato-14451), itens 11.1 e 11.7 e subsequentes; lido com o Ato nº 14.158/2025 e o Ato nº 4.746/2026. O item 11.7 ainda identifica operação de acesso sem fio para redes locais na faixa 5.925–7.125 MHz, com limites e condicionantes próprios (por exemplo, categorias de equipamento, potência e uso indoor). O Ato nº 14.158/2025 revisa itens de certificação, incluindo requisitos para 5 GHz; o Ato nº 4.746/2026 ajusta a transição/obrigatoriedade de alguns desses requisitos, sem alterar a faixa 6 GHz. A página oficial de atos de espectro de 2026 não mostrou o alegado Ato nº 10.400/2026. Portanto, não há evidência oficial encontrada para afirmar que a faixa brasileira foi reduzida para 5.925–6.425 MHz. Esta leitura é de requisito de produto/homologação e não deve ser convertida em lista de canais permitidos sem examinar a norma completa e suas condições. Link externo.
- Wi-Fi Alliance, [introdução ao WPA3](https://www.globenewswire.com/news-release/2018/06/26/1529297/0/en/Wi-Fi-Alliance-introduces-Wi-Fi-CERTIFIED-WPA3-security.html), comunicado primário de 2018 hospedado pela GlobeNewswire: distingue WPA3-Personal e Enterprise; associa SAE à autenticação baseada em senha com maior resistência a tentativas de adivinhação e requer PMF no WPA3; descreve força equivalente a 192 bits para Enterprise. O material explica o anúncio inicial, não o conjunto integral dos requisitos atuais nem análise de segurança independente.
- Wi-Fi Alliance, [certificado Wi-Fi CERTIFIED público, variante 133585](https://api.cert.wi-fi.org/api/certificate/download/public?variantId=133585), baixado em 2026-05-07: comprova certificação concreta de WPA3-Personal (2022-06), WPA3-Enterprise (2022-12), PMF e suporte a 6 GHz; é evidência de recursos de um produto específico, não norma geral nem conteúdo didático.
- O conjunto melhora o apoio aos objetivos de bandas/interferência e segurança, mas usa material com perfis diferentes (suporte ao consumidor, norma, anúncio histórico e certificado de equipamento). Cisco RF continua sendo apenas referência técnica parcial, com os exemplos regulatórios FCC expressamente excluídos para regras do Brasil. Mantidos como candidates primary/partial; falta explicar de modo didático e atual os mecanismos e opções WPA2/WPA3, selecionar canais conforme regra brasileira completa e fazer QA independente de cobertura/terminologia/licenças. Lacuna permanece aberta; nenhuma promoção ao pack.


### Balanceamento de carga e firewalls — conjunto de apoio AWS/NIST, ainda parcial

- AWS Elastic Load Balancing API reference, [overview](https://docs.aws.amazon.com/elasticloadbalancing/latest/APIReference/): define balanceamento, targets, listeners e health checks; distingue Application Load Balancer na camada de aplicação (L7), Network Load Balancer na camada de transporte (L4), e Gateway Load Balancer na camada de rede (L3). Documentação oficial recente e operacional de um fornecedor, com limitações próprias do produto.
- AWS, [health checks para grupos de destino Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html): explica verificações periódicas de disponibilidade, protocolos/portas/caminho, thresholds, status, código de resposta e encaminhamento para targets saudáveis. A própria doc observa o comportamento fail-open quando todos os targets estão insalubres, importante para evitar generalizar “remove sempre os destinos falhos”. Material de produto, não teoria geral.
- NIST SP 800-41 Rev.1, [Guidelines on Firewalls and Firewall Policy](https://csrc.nist.gov/pubs/sp/800/41/r1/final): publicação primária de 2009, descreve categorias de firewall (packet filters, stateful, proxies/aplicação), capacidades/limitações, políticas, seleção, configuração, teste e operação. Conteúdo conceitual robusto mas antigo; verificar limitações e terminologia contra materiais atuais antes de fixar como referência principal.
- O conjunto contribui para health checks, comparação L4/L7 e famílias de firewall, mas não é uma sequência didática integrada, AWS é fornecedor-específico e NIST 2009 requer atualização/QA. Mantido como partial; falta cobrir arquitetura cloud-neutral, regras/filtragem em cenários e diferenças L4/L7 com exercícios verificados. Lacuna permanece aberta.


### SMTP, FTP, SSH, VPN e proxies — candidatos didáticos combinados

- CNP3, [Electronic mail](https://beta.computer-networking.info/syllabus/default/protocols/email.html), leitura de linhas 236–305: distingue MUA/MSA/MTA/MDA e a entrega via MX, comandos de SMTP (EHLO, MAIL FROM, RCPT TO, DATA, QUIT), respostas e sessão completa. Leitura identifica referências históricas (por exemplo RFC 2821, atualizado por RFC 5321) e a associação de porta 25; não transportar esses detalhes para configurações modernas de submission sem fonte atualizada. Texto sob licença CC BY 3.0 indicada no prefácio, em inglês.
- CNP3, [Remote login](https://beta.computer-networking.info/syllabus/default/protocols/ssh.html), introdução básica a SSH, diferenças de Telnet em texto claro, mensagens cliente-servidor e negociação de algoritmos/chaves; também indica os usos de túnel e transferência de arquivos. Não substitui a especificação atual nem é tutorial de administração SSH. CC BY 3.0 conforme prefácio, inglês.
- Apache HTTP Server, [Introduction to the FTP Protocol](https://httpd.apache.org/mod_ftp/ftp/ftp_intro.html), §§ Overview paras.1–4: objetivo FTP, estado de sessão, canal de controle em TCP/21, canal de dados separado e modo ativo com os efeitos de NAT/firewalls. É recorte breve ligado a mod_ftp; licença específica de reprodução não inspecionada, link-only.
- NIST SP 800-77 Rev.1, [Guide to IPsec VPNs](https://csrc.nist.gov/pubs/sp/800/77/r1/final), 2020. Leitura direta do resumo oficial e PDF §§2.4.1–2.4.2 pp.27–30: distingue gateway-to-gateway e remote access, papel do IPsec/IKE e autenticação, split tunnel vs. full tunnel; destaca que VPN protege o trecho cliente-gateway e não automaticamente o trajeto após gateway. O PDF informa que a publicação não está sujeita a copyright nos EUA e que atribuição é apreciada. Foco em IPsec organizacional, não representa todo tipo de VPN.
- Combinados com o recorte de proxy/reverse proxy já registrado em `expanded-cnp3-http2`, os recursos agora tocam cada tecnologia do objetivo. Permanecem candidatos `partial`: fontes inglesas e fragmentadas, FTP é resumido, NIST é um guia técnico especializado, e alguns enunciados do CNP3 precisam de revisão em face de standards vigentes. QA independente deve validar sequência, precisão de cada distinção e cobertura completa antes de fechar unidade.


### TCP/IP, IPv4/IPv6, DNS e DHCP — novas fontes de apoio, ainda gap

- CNP3, [The reference models](https://beta.computer-networking.info/syllabus/default/principles/referencemodels.html), lido em 2026-10-08: compara o modelo pedagógico de cinco camadas com o TCP/IP de quatro camadas de RFC 1122 e relaciona bits, frames, packets, segments e SDUs. Didático e sob CC BY 3.0 conforme prefácio; não ensina endereçamento, subnetting, DNS ou DHCP.
- CNP3, [The network layer / IPv6](https://beta.computer-networking.info/syllabus/default/protocols/ipv6.html), lido em 2026-10-08 nas seções prefix notation e hierarquia de subnets: endereço 128 bits, hex/compressão `::`, endereço/prefixo e alocação hierárquica. Excluir na curadoria o trecho DHCPv6: usa referências substituídas e contém afirmação de máscara IPv4 no DHCPv6; também não tomar universalmente como atual a generalização de /64 e IID baseado em MAC. Inscrever apenas para prefixos e noções de subnet IPv6 após revisão técnica; CC BY 3.0 no prefácio.
- Microsoft Learn, [What is DHCP Server in Windows Server?](https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-top), atualizado em 2025-05-13 e aplicável a Windows Server atuais: definição cliente/servidor, leases/pool/opções, gateways/DNS, relay e integração v4/v6. O corpo não ensina DORA ou DHCPv6 em profundidade; orientação específica de produto Microsoft, licença não confirmada.
- DNS já é coberto parcialmente por `expanded-cnp3-dns`. Tentativa de abrir a página RIPE “Understanding IP Addressing and CIDR Charts” retornou `UnexpectedStatusCode`; seu trecho de busca descreve prefixo CIDR e exemplos, mas não foi inscrito como fonte lida. O objetivo de subnetting IPv4/CIDR e exercícios de cálculo permanece sem recurso revisado. Unidade continua aberta.

### Virtualização e containers — hipervisor e fronteiras de isolamento, ainda parcial

- Leitura direta em 2026-10-08: Microsoft Learn, [Hyper-V Architecture](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/architecture), definições de hypervisor, partições raiz/filhas, memória e acesso a dispositivos. Explica a função do hipervisor e ilustra uma arquitetura concreta; os detalhes do Hyper-V não devem ser generalizados para todo hypervisor.
- Docker, [Docker Engine security](https://docs.docker.com/engine/security/), §§ Kernel namespaces e risks: `docker run` configura namespaces e control groups; namespaces isolam visibilidade de processos e rede. A própria documentação alerta que capabilities/mounts e vulnerabilidades do kernel podem deixar isolamento incompleto. Fonte para Docker/Linux, não prova fronteira absoluta.
- Microsoft Learn, [Containers vs. virtual machines](https://learn.microsoft.com/en-us/virtualization/windowscontainers/about/containers-vs-vm), tabela de arquitetura/isolamento: VM contém sistema operacional completo e kernel; container executa a parte user-mode usando kernel do host; container oferece tipicamente isolamento mais leve, com Hyper-V isolation como modo alternativo. Contexto de Windows containers; a expressão “complete isolation” da tabela não deve ser convertida em promessa de invulnerabilidade.
- NIST SP 800-190, [Application Container Security Guide](https://csrc.nist.gov/pubs/sp/800/190/final), página oficial e resumo lidos: enquadra containers como virtualização de sistema operacional e packaging, com riscos e recomendações; não foram conferidos recortes internos específicos nesta rodada. NIST SP 800-125, [Guide to Security for Full Virtualization Technologies](https://csrc.nist.gov/pubs/sp/800/125/final), página e resumo lidos: sistemas convidados sobre hardware virtual e escopo de segurança. Ambos exigem cautela por data (2017 e 2011); recomendações operacionais devem ser atualizadas antes de material didático.
- Registros incluídos como `primary/partial`, com licença de reprodução não confirmada e uso somente por link. O conjunto amplia evidência para hipervisores, kernel compartilhado e riscos, mas ainda não é sequência didática em português, não contém exercício/laboratório executado e não passou por QA editorial independente. Lacuna permanece aberta; nenhum item da biblioteca publicada foi alterado.

### IaaS, PaaS, SaaS e serverless — recorte conceitual AWS adicionado, ainda parcial

- AWS, [What is Serverless Computing?](https://aws.amazon.com/what-is/serverless-computing/), leitura direta em 2026-10-08: definição de serverless e responsabilidades de infraestrutura gerenciada, arquitetura orientada a eventos (serviços que publicam/consomem/roteiam eventos), distinção FaaS/BaaS e modelo de responsabilidade compartilhada (§s da página registrados no ledger). Fonte didática conceitual de um fornecedor; exemplos e detalhes de custo, escala e serviços AWS não devem virar regra universal.
- O recorte complementa NIST SP 800-145 para os três modelos IaaS/PaaS/SaaS. Ambos permanecem `primary/partial`; a combinação parece atender conceitualmente aos objetivos, mas requer QA independente sobre limites entre responsabilidades, atualidade dos exemplos, sequência de aprendizagem e exercícios. Licença de reprodução AWS não confirmada; manter link-only. Gap permanece aberto até revisão.

### Escala, disponibilidade, híbrido e observabilidade — fontes oficiais adicionais, ainda parcial

- Microsoft Azure Well-Architected, [scaling strategy](https://learn.microsoft.com/en-us/azure/well-architected/reliability/scaling), lido em 2026-10-08: §§definitions/RE:06, padrões de carga, estado e afinidade, limites/gargalos, custo e monitoramento dos eventos de autoscaling. Define escalabilidade vertical/horizontal e autoscaling, mas a aplicação operacional é Azure-specific.
- AWS Prescriptive Guidance, [hybrid cloud best practices](https://docs.aws.amazon.com/prescriptive-guidance/latest/hybrid-cloud-best-practices/introduction.html), leitura direta da introdução: razões para integrar local e nuvem (latência, transferência, conformidade e migração) e necessidade de estratégia de posicionamento e gestão. Material de arquitetura AWS.
- OpenTelemetry, [Signals](https://opentelemetry.io/docs/concepts/signals/), leitura direta: diferencia traces (trajeto de requisição), métricas (medição em runtime) e logs (registro de evento); atualizado em março de 2026. É vocabulário de telemetria, não curso de operação/HA.
- Em conjunto com NIST SP800-145, esses recortes cobrem partes dos objetivos, mas ainda não formam sequência neutra e completa, não há exercícios de falha/disponibilidade e não houve QA independente. Permanecem primary/partial e a lacuna não foi fechada.

### IDS/IPS, pentest e vulnerabilidades — fontes NIST com ressalvas de idade

- NIST SP800-94, [Guide to Intrusion Detection and Prevention Systems](https://csrc.nist.gov/pubs/sp/800/94/final), página e resumo lidos em 2026-10-08: escopo/categorias de IDPS (rede, wireless, comportamento de rede e host). O próprio NIST registra publicação de 2007 e que o rascunho de revisão 2012 foi retirado porque tecnologias e modelos de ameaça não eram aplicáveis. Não usar suas recomendações como orientação contemporânea sem verificação atual.
- NIST SP800-115, [Technical Guide to Information Security Testing and Assessment](https://csrc.nist.gov/pubs/sp/800/115/final), página e resumo lidos: planejamento e condução de testes técnicos, análise/mitigação; lista pentest e varredura de vulnerabilidades, mas é uma visão geral de 2008, não programa completo. Ainda precisa leitura do PDF e atualização independente.
- Os dois registros permanecem primary/partial. O resumo não basta para ensinar diferenças operacionais ou limites atuais de IDS/IPS, e a unidade segue aberta até encontrar referência atual, confirmar conteúdos no texto integral e produzir exemplos seguros revisados.

### IPv4/CIDR/subnetting — fundamentos e exercícios encontrados, mas exigem limpeza factual

- IETF, [RFC 4632](https://www.rfc-editor.org/info/rfc4632/), BCP 122, lido diretamente em 2026-10-08: §3.1 define prefixo IPv4 classless como endereço de 32 bits seguido do tamanho do prefixo de 0 a 32 e dá exemplos (/16, /24). É fundamento normativo, não aula de subnetting nem gabarito de cálculos.
- Cisco Support, [Configure IP Addresses and Unique Subnets for New Users](https://www.cisco.com/c/en/us/support/docs/ip/routing-information-protocol-rip/13788-3.html), leitura dos exemplos VLSM: dimensiona sub-redes por quantidade de hosts e apresenta prefixos /28, /27, /30. O texto usa enquadramento Class C; só aproveitar cálculos revalidados e retirar modelo classful obsoleto.
- Microsoft Learn, [Understand TCP/IP addressing and subnetting basics](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/tcpip-addressing-and-subnetting), leitura direta da máscara binária, exemplo de 4 sub-redes /26 em /24 e troubleshooting. Também usa regras e nomenclatura classful antigas; excluir essas generalizações e não aplicar a regra broadcast/hosts sem ressalvas a todos os prefixos (ex.: /31).
- Registrei as três fontes como primary/partial para investigação, link-only. Combinadas às fontes de IPv6/DNS/DHCP já listadas, ampliam o material, mas falta compor uma sequência atual em CIDR com exercícios e gabaritos calculados/verificados, exemplos que evitem classes históricas e QA independente. Gap continua aberto.

### Firewall em cloud — regras de filtragem atuais, ainda parciais

- Microsoft Learn, [How network security groups filter network traffic](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works), lido diretamente em 2026-10-08: regras Azure NSG especificam origem/destino/porta/protocolo e são avaliadas em estágios subnet/NIC, com exemplos de allow/deny; documento atualizado em 2025-07-29. É camada de filtragem específica de Azure, não visão de todos os firewalls.
- AWS, [Network Firewall stateless and stateful rules engines](https://docs.aws.amazon.com/network-firewall/latest/developerguide/firewall-rules-engines.html), leitura direta: compara inspeção por pacote sem contexto (stateless) com avaliação do fluxo e direção (stateful), ações, logging e engine Suricata compatível com IPS. O próprio documento ressalta seleção conforme caso de uso; produto AWS.
- Esses recortes atualizam exemplos de filtragem e conectam regras a segurança cloud. Com ALB health checks e L4/L7 AWS já registrados, ainda falta uma unidade didática comparativa de arquitetura com cenários/gabaritos, distinções sem dependência de fabricante e QA independente. AWS também é apenas um exemplo de IPS para a lacuna de defesas; não substitui fonte contemporânea neutra.
