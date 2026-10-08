# Parecer independente — linguagem, matemática, segurança, sistemas, redes, nuvem e inglês

Revisor: /root/language_security_completion (GPT-6.1 Sol / high). Data: 2026-10-07.

## Veredito

Revisão de 49 unidades: **18 têm fonte primary/full aprovada e 31 permanecem com gap documentado**. O registro contém 47 fontes, incluindo materiais parciais. **Biblioteca completa não aprovada.** Este encerramento significa que cada unidade recebeu uma decisão, não que todos os objetivos já tenham material integral.

Mantidos os 16 topicIds, as 49 unidades, seus objetivos originais e referências do edital. Base: AGENTS.md, resource-curation, question-ingestion, contracts/DIDACTIC_LIBRARY.md, contrato de validação de conteúdo, ADR004 e matriz LIBRARY_INDEPENDENT_REVIEW.md. Anexo II do edital local, pp.19,21,22, efetivamente lido. Corte normativo auxiliar: 25/08/2026, data reportada de publicação; data de checagem: 07/10/2026. Reinspecionadas ROOT_RESEARCH_NOTES.md na retomada; notas de outro domínio não foram aprovadas por associação.

## Método e limites

Aprovação exige corpo efetivamente lido, autoria/editor identificados, acesso gratuito observado, localização útil e objetivo ensinável. HTTP, título, sumário e resultado de busca não sustentam full. Leitura de recortes não equivale a leitura de todo site, execução de laboratórios ou teste de restauração. Recursos estrangeiros não substituem normas nacionais; conteúdo conceitual histórico não certifica vigência de algoritmos, produtos ou estatísticas.

Fontes completas com vários capítulos/páginas exigem todos os recortes listados. Para OWASP, o índice é apenas a entrada: o material aprovado são os dez artigos A01–A10. Para CERT.br, **o registro composto só é integral com os três PDFs e respectivos recortes obrigatórios**; entregar apenas o índice ou um dos PDFs deve converter a unidade para partial/gap. Essa condição deve ser verificada pelo Orchestrator na integração.

Todos os PDFs temporários foram usados exclusivamente para leitura; não foram adicionados ao Exam Pack. Gratuidade e direitos são campos separados. UECE/CECIERJ/OBMEP com restrições ou licença desconhecida permitem apenas link neste parecer. Livro CERT2012 informa CC BY-NC-ND3.0 Brasil; fascículos usam CC BY-NC-ND4.0. Não adaptar/reproduzir páginas, letras, tirinhas ou ilustrações. Manual da Presidência possui permissão própria não comercial com atribuição, mas a entrega atual permanece link.

## Cobertura primária integral

| unitId | Fonte primária e recorte obrigatório |
| --- | --- |
| `lp-texto-redacao-oficial-unit` | [expanded-presidencia-manual2018](https://www.ifac.edu.br/o-ifac/comunicacao/cerimonial-e-eventos/manual-de-redacao-da-presidencia-da-republica/manual-de-redacao-da-presidencia-da-republica_2018.pdf) — §§1–3 e5 pp.16–21,27–35 |
| `lp-sintaxe-redacao-pontuacao-unit` | [expanded-presidencia-manual2018](https://www.ifac.edu.br/o-ifac/comunicacao/cerimonial-e-eventos/manual-de-redacao-da-presidencia-da-republica/manual-de-redacao-da-presidencia-da-republica_2018.pdf) — §11.9 pp.78–81 |
| `lp-sintaxe-redacao-concordancia-unit` | [expanded-presidencia-manual2018](https://www.ifac.edu.br/o-ifac/comunicacao/cerimonial-e-eventos/manual-de-redacao-da-presidencia-da-republica/manual-de-redacao-da-presidencia-da-republica_2018.pdf) — §11.7 pp.66–73 |
| `mrl-aritmetica-multiplos-divisores-unit` | [expanded-obmep-aritmetica](https://www.obmep.org.br/docs/aritmetica.pdf) — §§2.4–2.5; §§3.1–3.5, excluindo exercícios 6,7,19,25 |
| `mrl-aritmetica-fracoes-unit` | [expanded-openstax-fracoes-reading](https://openstax.org/books/prealgebra-2e/pages/4-2-multiply-and-divide-fractions) — Recorte obrigatório dos três capítulos §§4.1,4.2,4.5 indicado em locator |
| `mrl-proporcoes-razoes-divisao-regra-unit` | [expanded-obmep-proporcionalidade](https://cdnportaldaobmep.impa.br/portaldaobmep/uploads/material_teorico/c89zmw0n6cgks.pdf) — §1 atéexercício5; excluir exercício6 |
| `mrl-proporcoes-porcentagens-unit` | [expanded-openstax-percent62](https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent) — §6.2 exemplos6.14–6.24; §6.3 Discount/markup; links do mesmo livro em Related sections<br>[expanded-obmep-percent](https://cdnportaldaobmep.impa.br/portaldaobmep/uploads/material_teorico/5h3krwas7mo0o.pdf) — §§1–2 e exercícios 1–3,5–7,9; excluir 4 e 8 |
| `mrl-logica-relacoes-deducao-unit` | [expanded-stanford-logic1](https://logical.stanford.edu/intrologic/chapters/chapter_01.html) — §§1.2–1.5 e exercícios1.1–1.7 |
| `seguranca-cripto-identidade-criptografia-unit` | [expanded-nist-crypto175](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-175Br1.pdf) — §§3.2–3.3 (introduções) e4.5 |
| `seguranca-cripto-identidade-pki-certificados-assinatura-unit` | [expanded-nist-crypto175](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-175Br1.pdf) — §4.2.3 e5.2.3 até5.2.3.2 |
| `seguranca-aplicacoes-continuidade-owasp2025-unit` | [expanded-owasp-top10-2025-complete](https://top10.owasp.org/2025/) — A01–A10 Description / How to prevent / Example attack scenarios, com exclusões registradas |
| `seguranca-aplicacoes-continuidade-malware-engenharia-social-unit` | [expanded-cert-malware-golpes-reading](https://cartilha.cert.br/fasciculos/) — Todos os três recortes obrigatórios descritos em locator; usar registros expanded-cert-cartilha2012, expanded-cert-malware2023, expanded-cert-golpes2026 |
| `seguranca-aplicacoes-continuidade-zero-trust-unit` | [expanded-nist207](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf) — Abstract; §2 pp.4–6 impressas (PDF13–15); §2.1 tenets1–3 |
| `ingles-compreensao-leitura-tecnica-unit` | [expanded-uece-english-2015](https://educapes.capes.gov.br/bitstream/capes/204085/2/Livro_Computacao_Ingles%20Instrumental.pdf) — cap.1 pp.9–13; cap.2 pp.15–17; cap.3 pp.21–22; cap.4 pp.23–24; copyright PDFp.3 |
| `ingles-estrategias-leitura-unit` | [expanded-uece-english-2015](https://educapes.capes.gov.br/bitstream/capes/204085/2/Livro_Computacao_Ingles%20Instrumental.pdf) — cap.1 pp.9–13; cap.2 pp.15–17; cap.3 pp.21–22; cap.4 pp.23–24; copyright PDFp.3 |
| `ingles-documentacao-vocabulario-unit` | [expanded-uece-english-2015](https://educapes.capes.gov.br/bitstream/capes/204085/2/Livro_Computacao_Ingles%20Instrumental.pdf) — cap.1 pp.9–13; cap.2 pp.15–17; cap.3 pp.21–22; cap.4 pp.23–24; copyright PDFp.3 |
| `lp-sintaxe-redacao-periodos-conectivos-unit` | [expanded-ufpa-sintaxe-coord-subord](https://livroaberto.ufpa.br/bitstream/prefix/850/1/Livro_Sintaxe.pdf) — Atividade 12 pp.149–152 impressas (PDF pp.148–151); Atividade 13 pp.155–160 (PDF pp.154–159) |

## Evidência e exclusões editoriais

- **Inglês UECE/CAPES:** Inglês Instrumental, Mauro Luiz Pinheiro, 3ª edição2015, 89 páginas. Lidos capítulos1–4 pp.9–13,15–17,21–24: leitura contextual, skimming/scanning, cognatos e grupos nominais com textos/exercícios de computação. Três objetivos completos; corpus variado de documentação/APIs permanece parcial. Histórico de tecnologia não é tratado como estado atual. Direitos do próprio PDF e metadados do repositório não autorizam reprodução presumida.
- **Redação/pontuação/concordância:** Manual de Redação da Presidência, 3ª edição2018, espelho público IFAC, §§1–3 e5 pp.16–21,27–35; §§11.7 e11.9 pp.66–73,78–81. Critérios de clareza/coesão, padrão ofício, concordância e pontuação lidos. Não aprovar automaticamente normas posteriores de tratamento ou capítulos não lidos. Manual Cidades com login não foi usado.
- **Matemática:** Encontros de Aritmética, Cadar/Dutenhefner, §§2.4–2.5 e3.1–3.5, ensina divisibilidade/fatoração/MDC/MMC com aplicações. Não cobre por associação todas as operações de inteiros/racionais. Excluir exercícios6,7,19,25 pelos limites descritos no JSON.
- **Porcentagem OBMEP:** PDF inteiro de5 páginas lido. Recorte §§1–2, exercícios1–3,5–7,9; **excluir exercícios4 e8**. O4 tem discrepância x/4x; o8 pergunta cor B e responde cor A. Não corrigir/adaptar a obra como se houvesse autorização de derivação.
- **Frações:** OBMEP é parcial para o objetivo irrestrito por limitar a frações positivas/subtrações sem resultado negativo. OpenStax §§4.1,4.2,4.5 efetivamente lidos nos blocos nomeados ensinam representação/equivalência/simplificação, quatro operações, sinais e restrições da divisão; não afirmar leitura de toda seção de exercícios.
- **Divisão proporcional:** OBMEP Números Diretamente e Inversamente Proporcionais, 4 páginas lidas, §1 atéexercício5. Exercício3 ensina repartição de total por pesos;2 e5 ensinam regra de três simples. Excluir exercício6 (produto13×13 no passo de1040). O outro PDF Regra de Três2025 é parcial e exclui exemplo2 por divergência12,5/13,5 na conclusão.
- **Dedução:** Stanford Introduction to Logic capítulo1 §§1.2–1.5 e exercícios1.1–1.7 lidos: condições/modelos/relações/consequência lógica. Não estender ao conjunto inteiro de raciocínio verbal, numérico, sequencial, espacial e temporal.
- **Criptografia/PKI:** NIST SP800-175B Rev.1, §§3.2–3.3,4.5,4.2.3,5.2.3 até5.2.3.2, conceitos clássicos, chaves, tradeoffs/híbrido, assinatura, CA/RA, cadeia/expiração/revogação. Excluir tabelas históricas de algoritmos aprovados e previsões pós-quânticas2020 como estado atual. NIST800-12 capítulo9 não foi promovido por simplificações sobre ciphertext/chaves.
- **OWASP2025:** dez artigos A01–A10 lidos em Description/How to prevent/Example attack scenarios, com causas e prevenção. Excluir associação rígida TLS=OSI4 e qualificação de STARTTLS como ausência de criptografia emA04, estatísticas não necessárias e equivalência imprecisa de password spraying/hybrid credential stuffing emA07. DevSecOps/APIs/containers/nuvem continua parcial.
- **Malware/golpes:** livro CERT2012 cap.2 e4, §§7.2 e12.2 lidos; fascículo malware julho2023 integralmente retornado, recorte pp.4–12,14–27; fascículo resposta maio2026,19p lidas, recorte pp.4–5,9–14. Juntos ensinam phishing/engenharia social, tipos/vetores, ransomware, prevenção e resposta inicial. Não presumir resposta corporativa completa, garantias de eliminação por reboot ou configurações allow-all saída. Detalhes financeiros/jurídicos do fascículo2026 excluídos.
- **Zero Trust:** NIST800-207 Abstract e§2 pp.4–6,§2.1 primeiros três princípios lidos; ausência de confiança por localização, decisão por recurso/solicitação e acesso mínimo sustentam objetivo conceitual. Não é validação de uma arquitetura implantada.
- **Sistemas/rede/nuvem:** RFC4512 DIT/DN/RDN; GNU Bash histórico§3.2.2 pipelines; Microsoft processos/AD/pipelines; Docker VM/container; NIST800-145 e CNP3 DNS/HTTP2/802.11 receberam apenas o escopo realmente lido. Pipelines na edição atualGNU é§3.2.3, mas a URL atual falhou; não alegar leitura dessa versão.
- **Português adicional:** CEJA2 pp.52–58: informação literal, registro, frase/oração/período/sujeito/predicado; CECIERJ fundamental3 pp.26–32: metáfora/comparação/acentuação. Permanecem parciais. Excluir tabela que escreve -os em vez de -ps (bíceps), e diálogo SEDU p.4 com formulação confusa.

## Linux: candidato não promovido

Em 08/10/2026 foram lidos os capítulos 3–6, 9–10 e 19 do [Textbook of Linux](https://www.textbookoflinux.com/): kernel/memória em nível introdutório, FHS, shell, arquivos, usuários/permissões, processos/job control e diagnósticos de RAM/swap. O autor tem perfil acadêmico verificável em informática em saúde e a publicação lista 92 referências, mas não demonstra especialização em engenharia Linux/kernel; simplificações de memória (inclusive a interpretação de si/so no vmstat) requerem checagem técnica. O candidato foi registrado como primary/partial, não aprovado como full; licença de reprodução não identificada, somente link e sem QA independente. O outline do curso oficial LFS101 cobre processos, filesystems, permissões e Bash, mas não lista memória virtual; não fecha sozinho a unidade. A lacuna permanece até revisão técnica e confirmação de cobertura integral. O material MEC/SEE-MG também continua complementar para shell/diretórios/permissões.

## Normas ABNT/ISO

[Catálogo ISO27000](https://www.iso.org/standard/27000) efetivamente lido: edição internacional2026 publicada03/07/2026;2018 retirada na mesma data, portanto mudança anterior ao corte auxiliar25/08/2026. **Adoção ABNT NBR correspondente não comprovada**. Não trocar edição nacional por internacional por inferência; não apresentar catálogo como conteúdo integral ou aula. A unidade ISO permanece gap com objetivo nacional preservado.

## Lacunas por unidade e objetivo

Cada linha abaixo corresponde a um gap do JSON. `unitLearningObjectives` preserva o objetivo integral; `missingObjectives` identifica o componente que ainda impede full. URLs efetivamente tentadas e motivos detalhados estão no JSON, sem afirmar que todas retornaram conteúdo.

| unitId | Objetivos/componentes ainda sem cobertura integral |
| --- | --- |
| `lp-texto-ortografia-acentuacao-unit` | Revisar grafias atuais, hiatos e exceções de acentuação em textos completos. |
| `lp-texto-leitura-generos-contexto-unit` | Distinguir inferência, finalidade e gêneros variados e relacionar interpretação ao contexto histórico. |
| `lp-texto-semantica-discursos-unit` | Distinguir denotação/conotação, sinonímia/antonímia e discursos direto/indireto/indireto livre; reconhecer intertextualidade. |
| `lp-morfossintaxe-estrutura-palavras-unit` | Identificar todas as classes/funções sintáticas pertinentes, morfemas e processos de formação de palavras. |
| `lp-morfossintaxe-pronomes-unit` | Identificar classes/referentes e emprego contextual de pronomes além dos demonstrativos. |
| `lp-morfossintaxe-flexoes-vozes-unit` | Reconhecer flexão nominal/verbal, correlação de tempos/modos e voz reflexiva. |
| `lp-morfossintaxe-figuras-unit` | Reconhecer as demais figuras de linguagem pertinentes e justificar seus efeitos de sentido. |
| `lp-sintaxe-redacao-regencia-crase-unit` | Justificar presença/ausência da crase de modo sistemático, com regência e aplicações. |
| `lp-sintaxe-redacao-reescrita-unit` | Reconhecer estruturas corretas/incorretas e transformar períodos preservando sentido e paralelismo em exercícios variados. |
| `mrl-aritmetica-inteiros-racionais-unit` | Calcular quatro operações/potência com inteiros e racionais, expressões e problemas envolvendo sinais. |
| `mrl-logica-raciocinios-unit` | Resolver todas as modalidades verbal/numérica/sequencial/espacial/temporal e formar conceitos/discriminar elementos por critérios. |
| `seguranca-principios-atributos-unit` | Aplicar os cinco atributos, em particular autenticidade e não repúdio, a cenários comparativos. |
| `seguranca-principios-riscos-vulnerabilidades-incidentes-unit` | Explicar o ciclo completo de gestão de vulnerabilidades e incidentes e relacioná-lo à avaliação/tratamento de riscos. |
| `seguranca-principios-classificacao-unit` | Classificar exemplos por sensibilidade/impacto e derivar controles/responsabilidades em cenários. |
| `seguranca-cripto-identidade-iam-unit` | Explicar provisionamento, mudanças, revisão e revogação de identidades/permissões no ciclo IAM. |
| `seguranca-aplicacoes-continuidade-devsecops-api-container-cloud-unit` | Aplicar controles e explicar ameaças específicas de APIs, containers e nuvem em todo o desenvolvimento/entrega. |
| `seguranca-aplicacoes-continuidade-backup-bc-dr-unit` | Testar restauração em procedimento didático completo e integrar resultados à continuidade de negócios/DR. |
| `seguranca-aplicacoes-continuidade-defesas-testes-unit` | Comparar IDS/IPS e limites das defesas; distinguir pentest de análise de vulnerabilidades com exemplos. |
| `seguranca-aplicacoes-continuidade-iso27000-unit` | Relacionar visão geral/requisitos SGSI/controles e comprovar edições nacionais ABNT pertinentes em25/08/2026. |
| `sistemas-os-shell-windows-unit` | Explicar administração básica, memória virtual e sistemas de arquivos/permissões Windows. |
| `sistemas-os-shell-linux-unit` | Explicar administração básica Linux, processos, memória e sistemas de arquivos/permissões. |
| `sistemas-os-shell-shell-powershell-unit` | Usar comandos/variáveis/controle de fluxo e redirecionamentos em PowerShell e completar prática de scripts Bash/PowerShell. |
| `sistemas-diretorios-ad-ldap-unit` | Relacionar domínio/floresta/controlador AD e explicar operações LDAP em exemplos didáticos. |
| `sistemas-diretorios-virtualizacao-containers-unit` | Explicar função de hipervisor e comparar fronteiras/limites de isolamento de VMs/containers e kernel compartilhado. |
| `redes-protocolos-tcpip-ip-dns-dhcp-unit` | Relacionar camadas TCP/IP, endereços/sub-redes IPv4/IPv6 e alocação DHCP. |
| `redes-protocolos-http-https-unit` | Explicar transporte HTTP/3/QUIC e proteção HTTPS/TLS comparativamente aHTTP/2. |
| `redes-protocolos-smtp-ftp-ssh-vpn-proxy-unit` | Explicar finalidade/operação básica de SMTP,FTP,SSH eVPN. |
| `redes-protocolos-sem-fio-unit` | Explicar bandas/canais e autenticação/segurança contemporânea de Wi-Fi, incluindoWPA2/WPA3. |
| `nuvem-arquitetura-balanceamento-firewalls-unit` | Explicar health checks,L4/L7 e filtragem por firewalls em arquitetura de distribuição de tráfego. |
| `nuvem-arquitetura-modelos-serverless-unit` | Explicar execução serverless orientada a eventos e suas responsabilidades. |
| `nuvem-arquitetura-escala-ha-hibrido-monitoramento-unit` | Comparar escalabilidade/disponibilidade, integrar local/nuvem e relacionar métricas/logs/alertas de infraestrutura. |
| `ingles-documentacao-corpus-unit` | Interpretar instruções/parâmetros/condições/unidades em corpus variado de manuais, artigos, software eAPIs. |

## Questões originais

Parecer separado: LANGUAGE_SECURITY_QUESTIONS_REVIEW.json. **13 questões aprovadas, nenhuma rejeitada**, com verificação manual de gabarito único, cinco alternativas/explicações e referências primárias. Enunciados LP/inglês e problemas matemáticos são originais StudyOS, não excertos das fontes. Aprovação desses itens não prova cobertura integral dos tópicos nem autoria FCC.

SHA256 de QUESTIONS_DRAFT.json reinspecionado: `9CF2A441F767479D5E901BC5140BBFAC98B978C2AF024605904DCD1A61B7405E`. Fonte de leitura literal LP foi aprimorada no parecer para CEJA2 pp.52–53; repartição proporcional recebeu também OBMEP exercício3. Nenhum gabarito/alternativa do draft foi alterado. Restrições SQL a valores parametrizáveis, distinção DN/RDN e duração500ms=0,5s preservadas nas justificativas.

## Suplemento factual do Orchestrator — 2026-10-08

Foram lidos diretamente e adicionados ao registro de fontes dois livros CECIERJ/CEDERJ e uma apostila UERJ/eduCAPES:

- `expanded-cecierj-portugues-iv-volume1-flexion-voices-2014`: aulas 6–10, flexões nominais/verbais e vozes; a voz passiva sintética é apenas mencionada como tópico não tratado. Classificação `partial`, link-only por aviso de copyright.
- `expanded-cecierj-portugues-i-volume2-voices-times-2011`: aulas 16–17 e 24, correlação semântica de tempos/modos, vozes e exercícios de passiva sintética. Continua `partial` para a unidade composta, pois não cobre isoladamente todos os objetivos morfológicos; link-only por aviso de copyright.
- `expanded-educapes-uerj-figuras-linguagem-2019`: atividade contextualizada sobre metáfora e efeitos de sentido, mas não sistematiza a amplitude de figuras exigida. `partial`; a licença declarada é CC BY-NC-SA 4.0, sem extensão presumida a imagens de terceiros.

A unidade de flexões/vozes permanece com lacuna: uma sequência de fontes parciais não foi reclassificada como um recurso `primary/full`. A unidade de figuras também permanece parcial. Após corrigir Wi-Fi e revisar os capítulos 4–5 e 9 do livro UECE, o registro JSON contém 104 fontes, 32 unidades `primary/full` e 17 gaps. Os capítulos 4–5 fecham reescrita/paralelismo; o capítulo 9 fecha ortografia/acentuação. As unidades de leitura/contexto e semântica/discursos receberam o mesmo livro como fonte parcial. Não houve mudança de `topicIds`, objetivos, questões, nem promoção para o Exam Pack ativo.

Uma QA independente rejeitou o candidato SHA `803d71d0884a4d399658b7f83cdd71147c152c0dddd97ca1bcb1fd405d5efd52` por uma sequência Wi-Fi composta sob uma única URL, contrariando a proveniência exigida. O recurso agrupado foi retirado do próximo stage e a unidade sem fio volta a ser gap. Parecer e motivo estão em `INTEGRATION_QA.md`; qualquer novo candidato precisa de QA do hash exato.

## Encerramento para integração

Ownership respeitado: somente os três pareceres LANGUAGE_SECURITY foram escritos. Nenhuma alteração no Core, Exam Pack ou QUESTIONS_DRAFT. Schema, auditoria runtime, testes, QA e promoção pertencem ao Orchestrator; este parecer não afirma que tenham sido executados aqui. Revisão encerrada com status `partial`: todas as 49 unidades receberam decisão, mas **não publicar biblioteca como complete** enquanto restarem esses 31 gaps ou enquanto os recortes compostos obrigatórios não forem representados e verificados na entrega.

## Suplemento do Orchestrator — OpenStax matemática

Em 2026-10-07, o Orchestrator adicionou `expanded-openstax-integers-rationals`
para `mrl-aritmetica-inteiros-racionais-unit`, após leitura dos recortes em inglês
e revisão independente de conteúdo por `/root/integration_qa` (GPT-6.1 Sol/high).
Veredito: `primary/full`, desde que todos os capítulos §§3.1–3.4, Ch.3 Key
Concepts, §§4.1–4.6, Ch.4 Key Concepts, §9.1, §10.4 e §10.5 permaneçam listados
no locator. O acesso é gratuito; a página registra CC BY-NC-SA 4.0, então o pack
oferece somente links externos e não reproduz o conteúdo. Permanece o limite de
idioma inglês. Contagem suplementar: 17 unidades primary/full, 32 lacunas; o
parecer de domínio original acima continua parcial e não aprova a biblioteca toda.


## Suplemento do Orchestrator — candidato CEJA rejeitado para conectivos

Em 2026-10-07, foi lido diretamente o *Língua Portuguesa — Fascículo 12,
Unidades 27–28*, da Fundação CECIERJ/CEJA
(https://cejarj.cecierj.edu.br/ava_arquivos/material_impresso/lingua_portuguesa/ceja_fundamental_lingua_portuguesa_fasciculo_12.pdf),
nas pp.4,10–11,13–14,17–19,21–25 impressas. A revisão independente de
`/root/integration_qa` rejeitou `primary/full`: o gabarito da p.23 (PDF p.24)
classifica incorretamente “por isso” como conjunção coordenativa explicativa,
erro diretamente pertinente ao objetivo da unidade; além disso, o recorte não
apresenta sistematicamente a taxonomia de coordenação e subordinação. A obra
identifica autores e informa em sua página de direitos que reprodução exige
autorização escrita; não reproduzir nem promover. A lacuna
`lp-sintaxe-redacao-periodos-conectivos-unit` permanece aberta.

### Candidato CEJA de conectivos — partial, não fecha a unidade

O Fascículo 10, Unidade 24, foi lido nas pp.51–56 impressas. Revisão independente
aprovou apenas o recorte da p.52 até o início da p.53 (PDF p.51): conjunções
coordenativas aditivas, adversativas e alternativas, com efeitos e exemplos.
O mesmo revisor rejeitou `primary/full` por erros posteriores: classifica “por
fim” como conclusiva, “na verdade” como explicativa, usa exemplo causal com
“porque” em coordenativa explicativa e o gabarito chama “quando” de “atemporal”.
A fonte entrou como `primary/partial`; a lacuna permanece. Ver registro detalhado
em LANGUAGE_SECURITY_SOURCES_REVIEW.json. Copyright exige autorização escrita;
uso exclusivamente por link externo.

### Histórico de curadoria UFPA — conectivos

O livro *Sintaxe* (Ferreira, Abdon e Brito, EDUFPA, 2009), disponível no repositório Livro Aberto da UFPA, foi lido nas Atividades 12–13: pp.150–153 impressas (PDF pp.149–152) e pp.156–159 impressas (PDF pp.155–158). A Atividade 12 apresenta coordenação, formas sindética/assindética, classes de conectores e exercício que pede identificar construções coordenadas e explicar as ideias expressas. A Atividade 13 define subordinação/dependência e a diferencia da coordenação; o texto associado distingue efeitos aditivo, adversativo, alternativo, explicativo e conclusivo, com exercícios. Naquele momento, o mapeamento aguardava QA. O parecer posterior consta em “Aprovação independente — conectivos e períodos” abaixo. A UFPA declara acesso aberto; a licença específica do item não foi recuperada, portanto apenas link externo.

### Aprovação independente — conectivos e períodos

QA independente aprovou o livro *Sintaxe* da UFPA como `primary/full` para `lp-sintaxe-redacao-periodos-conectivos-unit`. O recorte diferencia coordenação e subordinação, inclui coordenação sindética/assindética, apresenta relações semânticas de conectores e oferece exercícios de classificação, interpretação e reescrita. A revisão não encontrou erros materiais na cobertura; ressalta corretamente a proximidade semântica entre explicativas e causais. Locator final: Atividade 12, pp.149–152 impressas (PDF pp.148–151); Atividade 13, pp.155–160 impressas (PDF pp.154–159), com foco nas pp.156–157. A UFPA declara acesso aberto; variante da licença anexada não confirmada, então entrega somente por link. Contagem de pesquisa: 18/49 `primary/full`, 31 lacunas; isso não aprova a biblioteca inteira nem promove ao pack ativo.

### Triagem CEJA — classes e pronomes

O Fascículo 9, Unidade 23 (edição revisada 2016; [PDF da Fundação CECIERJ](https://cejarj.cecierj.edu.br/ava_arquivos/material_impresso/lingua_portuguesa/ceja_lingua_portuguesa_unidade_23.pdf)) foi lido diretamente. A QA independente considerou o recorte de pronomes **partial**: PDF pp.20–23 lista usos pontuais; p.29 distingue o pronome que substitui substantivo daquele que o acompanha e relaciona o uso a sujeito/adjunto adnominal. Faltam classificação sistemática e emprego contextual abrangente. Busca no fascículo de 46 páginas não localizou morfema, prefixo ou sufixo; por isso a unidade `lp-morfossintaxe-estrutura-palavras-unit` permanece sem fonte aprovada de cobertura parcial para formação vocabular. Autores e edição constam do front matter; licença de reprodução não foi identificada, então o uso registrado é apenas por link. Recurso parcial incorporado ao relatório JSON; não reduz as 31 lacunas nem fecha nenhuma unidade.

### Triagem Cisco — rádio Wi-Fi (partial)

A QA independente aprovou o [Wireless RF Reference Guide da Cisco](https://www.cisco.com/c/en/us/td/docs/wireless/controller/9800/technical-reference/wireless-rf-reference-guide.html) apenas como `primary/partial` para bandas, canais, largura, sobreposição/interferência e condicionantes regulatórios. O recorte abrange 2,4/5/6 GHz, canais de 20–160 MHz e DFS. É documentação de fornecedor, com exemplos de produtos Cisco/Meraki e referências explícitas aos EUA/FCC; não aplicar canais/potências como regra do Brasil sem fonte Anatel. Não cobre WPA2/WPA3, autenticação ou criptografia, então o gap permanece. Licença de reprodução não apurada; apenas link externo.


## Suplemento de revisão — fundamentos de redes TCP/IP (2026-10-08)

A unidade `redes-protocolos-tcpip-ip-dns-dhcp-unit` recebeu fonte `primary/full` candidata baseada em *An Introduction to Computer Networks* (2ª ed., Loyola University Chicago). Os recortes lidos cobrem modelo TCP/IP, IPv4/CIDR/sub-redes, endereçamento e sub-redes IPv6, resolução DNS e alocação DHCP. Os exemplos datados e afirmações universalizantes sobre prefixos foram excluídos do escopo factual. O recurso está em inglês e sob CC BY-NC-ND 3.0: consulta aberta, link-only, sem reprodução/adaptação. QA independente do candidato SHA final continua necessária.

## Suplemento de revisão — Linux introdutório (2026-10-08)

Leitura direta do curso texto *Introduction to Linux*, de Beau Carnes/freeCodeCamp, derivado do LFS101 da Linux Foundation. Os capítulos 3, 9, 10 e 12 explicam inicialização/kernel e noções de memória, processos e monitoramento de RAM/swap, sistemas de arquivos/operações, usuários/grupos e permissões/ownership; capítulo 18 acrescenta princípios de segurança local. O próprio material declara acesso gratuito e CC BY 4.0. O recurso fica em inglês e somente por link no catálogo; não foi copiado. Delimitações: exemplos introdutórios e alguns detalhes históricos de boot não devem ser tratados como comportamento universal das versões atuais. Candidato `primary/full` para `sistemas-os-shell-linux-unit`; falta QA independente na integração final.

### Supplemento de revisão — modelos de serviço cloud e serverless (2026-10-08)

Leitura direta dos artigos do Google Cloud sobre [modelos de serviço](https://cloud.google.com/discover/types-of-cloud-computing) e [computação serverless](https://cloud.google.com/discover/what-is-serverless-computing). O primeiro compara IaaS/PaaS/SaaS/FaaS por responsabilidades e usa analogia; o segundo descreve FaaS acionado por eventos, provisionamento/escala pelo provedor e diferenças frente a PaaS, containers e VMs. Ambos são explicativos, gratuitos, em inglês e de fornecedor; não trate preço, escala ou exemplos Google como regras universais. Licença de reprodução desconhecida: somente links. Fonte candidata `primary/full` para a unidade de modelos; QA independente ainda necessária.

## Sequência didática AD DS + LDAP — 2026-10-08

**Candidata fechada no escopo editorial:** `sistemas-diretorios-ad-ldap-unit`. A unidade reúne o módulo Microsoft Learn *Introduction to AD DS* e o modelo lógico oficial para floresta/domínio/controlador, objetos e relações; documentação Microsoft de busca e filtros LDAP mostra fluxo, operadores e exemplos; RFC4512 define DIT, entradas, atributos, DN/RDN; o guia OpenLDAP 2.6 §1.2/§1.5 apresenta pesquisa e operações básicas. As fontes são relacionadas diretamente pela sequência AD → consulta LDAP → modelo/operadores de diretório. As operações específicas do guia OpenLDAP são estudo de LDAP, não inferência de comandos exclusivos de AD.

Todos os recortes declarados foram consultados diretamente. Módulo Microsoft é intermediário e pressupõe Windows Server/redes; o guia OpenLDAP pressupõe conhecimento básico, então a sequência deve começar pelos fundamentos. Conteúdo em inglês, acesso gratuito, licença de reprodução desconhecida no conjunto e guia OpenLDAP com licença própria e avisos adicionais: manter somente links externos. Nenhum texto foi copiado. A unidade sai da lista de lacunas somente no candidato; QA independente do hash exato segue obrigatório antes de qualquer promoção.

## Shell, Bash e PowerShell — sequência candidata completa — 2026-10-08

**Candidata fechada no escopo editorial:** `sistemas-os-shell-shell-powershell-unit`. GNU Bash Reference Manual 5.3 (§§3.2.2–3.2.5,3.4–3.6,3.8) contém comandos/pipelines, variáveis/parâmetros, condições, loops, scripts e redirecionamentos com descritores; PowerShell 101 capítulos 2,4–6 cobre descoberta/cmdlets, pipeline de objetos, variáveis/arrays e controle de fluxo; documentação `about_Redirection`/`about_Output_Streams` completa streams e redirecionamentos PowerShell, incluindo o comportamento nativo atualizado no PS 7.4.

As semânticas de redirecionamento diferem entre shells e foram explicitamente mantidas distintas. O material está em inglês, gratuito e link-only; nenhuma licença conjunta de reprodução foi presumida. O fetch direto das páginas HTML/PDF do GNU expirou; a evidência veio de texto indexado das seções oficiais e da página oficial de edição (5.3, 18/05/2025). A limitação de acesso está gravada no recurso e deve ser revalidada antes de promoção. A unidade sai do ledger somente no candidato; QA independente do hash permanece obrigatório.

## Administração Windows — sequência de recursos oficiais — 2026-10-08

**Candidata fechada no escopo editorial:** `sistemas-os-shell-windows-unit`. A rota reúne documentação Microsoft Learn para contas locais/administração básica, processos e threads, diagnóstico por Task Manager, memória virtual/working set/pagefile, conceitos de volume/diretório/arquivo, NTFS e controle de acesso (ACL, permissões, proprietário, herança, direitos e auditoria). Cada página tem recorte explícito e aplicabilidade por edição Windows/Server. A página de memória é de 2021 e limites/recursos variam por versão, então não foram generalizados; o foco é explicar os mecanismos e os passos básicos.

Conteúdo em inglês, gratuito e link-only; licença de reprodução desconhecida. Não foi copiado texto. A unidade sai do ledger apenas no candidato e aguarda QA independente do hash antes de integração.

## Atributos de segurança e cenários comparativos — 2026-10-08

**Candidata fechada no escopo editorial:** `seguranca-principios-atributos-unit`. NIST SP 800-12 Rev.1 define confidencialidade, integridade e disponibilidade, e relaciona autenticidade/não repúdio à integridade. O glossário CSRC/NIST separa prova de origem, proteção contra negar uma ação e papel da assinatura digital; a assinatura dá suporte a autenticidade, integridade e não repúdio, mas não confidencialidade. O NIST SP 1800-26 usa exemplos de inserção, remoção e alteração não autorizadas para incidentes de integridade. A sequência permite comparar os cinco atributos sem confundir identidade/origem com segredo, nem não repúdio com disponibilidade.

Fontes oficiais NIST gratuitas, inglês, licença de reprodução não confirmada; apenas links. Os exemplos de cenário são originais e os referenciais NIST não são tratados como legislação brasileira. Unidade removida apenas do candidato; QA independente do hash ainda necessário.

### Candidato Wi-Fi atualizado — sequência bandas/canais e WPA2/WPA3 (QA pendente)

Em 2026-10-08 foram lidos diretamente o Wireless RF Reference Guide da Cisco, o WPA3 Deployment Guide (atualizado em 2025-10-06) e a página Microsoft Learn sobre segurança de rede Wi-Fi. O conjunto cobre bandas 2,4/5/6 GHz, larguras/sobreposição/DFS e modos WPA2/WPA3-Personal/Enterprise, OWE e PMF. A Cisco distingue alocações dos EUA e reconhece variação por domínio regulatório; nenhum canal listado como americano é adotado como regra brasileira. O corte/regulamento brasileiro deve continuar ligado à fonte Anatel separada. A licença de reprodução permanece desconhecida e a entrega é somente por links. O registro de cobertura integral é candidato editorial composto, não aprovação da unidade; fica pendente parecer independente no hash candidato exato.
