// Update the source-backed legal candidate and its auditable study paths.
// This only edits the research review; stage-expansion.mjs still writes a candidate.
import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('./LEGAL_SOURCES_REVIEW.json', import.meta.url);
const review = JSON.parse(await readFile(file, 'utf8'));
const checkedAt = '2026-10-08';
const reviewedAt = new Date().toISOString();
const find = id => review.sources.find(source => source.id === id);
const definitions = [
  {
    id: 'legal-lei15122-carreira',
    title: 'Lei 15.122/2005 — quadro e carreira dos servidores do TCE-GO',
    url: 'https://legisla.casacivil.go.gov.br/api/v2/pesquisa/legislacoes/80023/pdf',
    type: 'law', locator: 'Art. 2º, § 2º, redação dada pela Lei 23.500/2025; conferir texto consolidado e alterações aplicáveis até o corte editalício',
    evidence: 'A fonte oficial consolidada identifica a carreira de Auditor e Técnico de Controle Externo e dispõe que esses cargos são regidos pela Lei 15.122 e, subsidiariamente, pela Lei 20.756/2020. A Lei 23.500/2025 deu a redação vigente ao § 2º. A antiga exclusão do art. 1º, parágrafo único, da Lei 20.756 foi revogada pela Lei 20.943/2020. A leitura deste registro delimita a relação de incidência; não presume que todos os dispositivos estaduais se apliquem sem exame da lei especial.',
    coverage: [
      { unitId: 'unit-leginst-servidor-carreira', role: 'primary', extent: 'full', locator: 'Arts. 1–16-K e 24–31; quadro, estrutura, desenvolvimento e remuneração; anexos I–VII, segundo leitura e parecer existentes' },
      { unitId: 'unit-leginst-servidor-regime', role: 'primary', extent: 'partial', locator: 'Art. 2º, § 2º, redação atual; aplicação subsidiária da Lei 20.756 aos cargos efetivos de Auditor e Técnico de Controle Externo' }
    ]
  },
  {
    id: 'legal-cge-regime-disciplinary-overview',
    title: 'Regime disciplinar — trilha didática da Secretaria da Economia de Goiás',
    url: 'https://espacocolaborador.economia.go.gov.br/Paginas/RegimeDisciplinar.aspx',
    type: 'lesson', locator: 'Página inicial e páginas vinculadas: deveres, proibições, penalidades, TAC e instrumentos de apuração',
    evidence: 'Página pedagógica do Governo de Goiás que organiza o estudo do Estatuto por deveres, proibições, penalidades, TAC e instrumentos de apuração. As páginas vinculadas foram abertas e conferidas. É material do Poder Executivo: serve como apoio didático para o conteúdo da Lei 20.756, mas não substitui a legislação especial do TCE-GO nem autoriza transferir automaticamente competências do Executivo ao Tribunal.',
    coverage: [{ unitId: 'unit-leginst-servidor-regime', role: 'primary', extent: 'partial', locator: 'Trilha de deveres, proibições, penalidades, TAC e apuração; distinguir órgãos do Executivo e do TCE' }]
  },
  {
    id: 'legal-cge-server-duties',
    title: 'Deveres do servidor — Secretaria da Economia de Goiás',
    url: 'https://espacocolaborador.economia.go.gov.br/Paginas/Dos-Deveres.aspx',
    type: 'lesson', locator: 'Art. 192 da Lei 20.756/2020; lista didática dos deveres',
    evidence: 'A página lista os onze deveres do art. 192 e remete ao Estatuto. O texto foi comparado ao art. 192 da fonte normativa. Material do Executivo, utilizado como explicação de apoio para conteúdo legal subsidiário; não se transpõe competência administrativa do Executivo ao TCE.',
    coverage: [{ unitId: 'unit-leginst-servidor-regime', role: 'primary', extent: 'partial', locator: 'Lista dos deveres do art. 192; comparar com o texto consolidado' }]
  },
  {
    id: 'legal-cge-server-prohibitions',
    title: 'Proibições e transgressões — Secretaria da Economia de Goiás',
    url: 'https://espacocolaborador.economia.go.gov.br/Paginas/Das-Proibi%C3%A7%C3%B5es.aspx',
    type: 'lesson', locator: 'Art. 202: 74 incisos; arquivo de transgressões e penalidades vinculado na página',
    evidence: 'A página identifica o art. 202, informa que contém 74 incisos e oferece o arquivo de transgressões e penalidades. É material do Poder Executivo; ler em conjunto com a lei consolidada e com a norma especial do TCE, sem extrapolar competência institucional.',
    coverage: [{ unitId: 'unit-leginst-servidor-regime', role: 'primary', extent: 'partial', locator: 'Apresentação e link do art. 202; conferir redação na lei consolidada e alterações' }]
  },
  {
    id: 'legal-cge-server-penalties',
    title: 'Penalidades disciplinares — Secretaria da Economia de Goiás',
    url: 'https://espacocolaborador.economia.go.gov.br/Paginas/Das-Penalidades.aspx',
    type: 'lesson', locator: 'Arts. 193–199: espécies, parâmetros, cancelamento e inabilitação',
    evidence: 'Página didática organiza as penalidades do art. 193 e relaciona inabilitação do art. 199 e cancelamento de registros. Comparada ao texto legal aberto; material do Poder Executivo, sem presumir aplicação automática de sua organização ao TCE-GO.',
    coverage: [{ unitId: 'unit-leginst-servidor-regime', role: 'primary', extent: 'partial', locator: 'Resumo de penalidades e referência aos arts. 193 e 199; validar no texto legal' }]
  },
  {
    id: 'legal-cge-server-disciplinary-instruments',
    title: 'Instrumentos de apuração disciplinar — Secretaria da Economia de Goiás',
    url: 'https://espacocolaborador.economia.go.gov.br/Paginas/Instrumentos-de-Apura%C3%A7%C3%A3o.aspx',
    type: 'lesson', locator: 'Art. 212 e Título VI: notícia de irregularidade, sindicância, sindicância patrimonial e PAD',
    evidence: 'Página didática descreve o fluxo da notícia inicial, arquivamento, sindicâncias e PAD e remete ao Título VI da Lei 20.756. O próprio texto se refere ao contexto do Executivo estadual; a competência e a estrutura correcional do TCE devem ser estudadas em seus atos próprios.',
    coverage: [{ unitId: 'unit-leginst-servidor-regime', role: 'primary', extent: 'partial', locator: 'Fluxo esquemático dos instrumentos de apuração; validar arts. 212 e seguintes na lei' }]
  },
  {
    id: 'legal-tcego-ra13-2025-capacitacao',
    title: 'RA 13/2025 — licença-capacitação e GIF no TCE-GO',
    url: 'https://gnoi.tce.go.gov.br/atoNormativo/Publicado?id=25877',
    type: 'law', locator: 'Arts. 1–23 e anexo único; redação do anexo atualizada pela Portaria 853/2026, de 13/08/2026',
    evidence: 'A fonte oficial liga a licença-capacitação do art. 162 da Lei 20.756 e o art. 16-A da Lei 15.122, além da GIF do art. 16-I da Lei 15.122, e define análise de pertinência, instrução e decisão no TCE-GO. A nota oficial registra atualização do anexo único pela Portaria 853/2026 em 13/08/2026, dentro do corte de conteúdo de 25/08/2026.',
    coverage: [{ unitId: 'unit-leginst-servidor-regime', role: 'primary', extent: 'partial', locator: 'Arts. 1–23; relação concreta entre a Lei 20.756 e o regime especial do TCE para capacitação/GIF' }]
  },
  {
    id: 'legal-tcego-organogram-current-2026',
    title: 'Organograma vigente do TCE-GO',
    url: 'https://portal.tce.go.gov.br/organograma',
    type: 'document', locator: 'Organograma oficial; página declara a RA 14/2025 como norma da estrutura vigente',
    evidence: 'Página institucional identifica a Resolução Administrativa 14/2025 como norma da estrutura funcional vigente e apresenta o organograma. Usar como visão relacional para acompanhar a leitura das competências normativas, sem substituir os artigos da resolução.',
    coverage: [{ unitId: 'unit-leginst-servidor-organizacao', role: 'primary', extent: 'partial', locator: 'Organograma vigente e declaração da RA 14/2025 como base normativa' }]
  },
  {
    id: 'legal-tcego-ra11-2025-escoex-structure',
    title: 'RA 11/2025 — nova estrutura organizacional da ESCOEX',
    url: 'https://gnoi.tce.go.gov.br/atoNormativo/Publicado?id=25689',
    type: 'law', locator: 'Arts. 1–6 e anexo; estrutura aprovada em 2025',
    evidence: 'Ato oficial organiza a Escola em Diretoria, Coordenação Geral, Coordenação Administrativa, Coordenação Acadêmico-Pedagógica e Serviços de Capacitação e Biblioteca/Gestão da Informação. Complementa a ESCOEX citada na RA 14/2025; não deve ser confundida com a estrutura antiga prevista na RA 03/2021.',
    coverage: [{ unitId: 'unit-leginst-servidor-organizacao', role: 'primary', extent: 'partial', locator: 'Arts. 1–6 e anexo; estrutura especializada da ESCOEX' }]
  },
  {
    id: 'legal-tcego-ra16-2025-escoex-regulation',
    title: 'RA 16/2025 — Regulamento vigente da ESCOEX',
    url: 'https://gnoi.tce.go.gov.br/atoNormativo/Publicado/26239',
    type: 'law', locator: 'Arts. 1–3 e Regulamento da ESCOEX; art. 2 revoga expressamente a RA 03/2021',
    evidence: 'Ato oficial aprova o Regulamento da ESCOEX e revoga expressamente a RA 03/2021. A página contém o regulamento vigente, cuja leitura acompanha a nova estrutura da RA 11/2025. Esta revogação corrige o índice institucional, que ainda lista a resolução antiga.',
    coverage: [{ unitId: 'unit-leginst-servidor-organizacao', role: 'primary', extent: 'partial', locator: 'Arts. 1–3 e Regulamento; revogação expressa da RA 03/2021' }]
  },
  {
    id: 'legal-tcego-rn11-2016-monitoring-decisions',
    title: 'RN 11/2016 — monitoramento das decisões do TCE-GO',
    url: 'https://portal.tce.go.gov.br/documents/20181/104564/Resolu%C3%A7%C3%A3o%20Normativa%20-%20011-2016/5f438964-32ac-43d8-b7aa-6f880280b451',
    type: 'pdf', locator: 'Arts. 1–21 e alterações indicadas de 2017 e 2018; procedimentos de monitoramento, não norma geral da estrutura atual',
    evidence: 'Texto oficial lido diretamente. A RN disciplina monitoramento das decisões e recebe as alterações apontadas no próprio texto; os capítulos descrevem escopo, classificação, procedimento e responsabilidades do Serviço de Monitoramento/Secretaria Geral. Deve ser lida como norma operacional correlata e conciliada com as competências posteriores da RA 14/2025, não como ato estrutural autônomo atual.',
    coverage: [{ unitId: 'unit-leginst-servidor-organizacao', role: 'primary', extent: 'partial', locator: 'Arts. 1–21; conciliar as atribuições operacionais com a RA 14/2025' }]
  },
  {
    id: 'legal-tcego-rn13-2016-ceti',
    title: 'RN 13/2016 — Comitê Estratégico de Tecnologia da Informação',
    url: 'https://portal.tce.go.gov.br/documents/20181/79021/Resolu%C3%A7%C3%A3o%20Normativa%20-%20013-2016/1bed9d89-fd76-48e0-aac5-450b5c618238',
    type: 'pdf', locator: 'Arts. 1–9 e alterações indicadas; instituição e competências do CETI',
    evidence: 'O texto oficial do ato confirma que a RN 13/2016 institui o Comitê Estratégico de TI (CETI), de natureza consultiva e permanente, e lista competências de planejamento, priorização, recursos, desempenho e segurança da informação. Corrige a descrição do índice, que a resume como alteração de atribuições de unidades de TI. É ato colegiado correlato, a conciliar com RA 14/2025 e normativos atuais de TI.',
    coverage: [{ unitId: 'unit-leginst-servidor-organizacao', role: 'primary', extent: 'partial', locator: 'Arts. 1–9 e texto de alterações; CETI e governança de TI' }]
  },
  {
    id: 'legal-tcego-rn09-2016-lrf-documents',
    title: 'RN 9/2016 — remessa de relatórios da Lei de Responsabilidade Fiscal',
    url: 'https://gnoi.tce.go.gov.br/atoNormativo/Publicado?id=9975',
    type: 'law', locator: 'Arts. 1–3 no texto compilado, com RN 4/2023; remessa de RREO/RGF e assinatura digital',
    evidence: 'Leitura direta do texto compilado corrige a descrição abreviada do índice: a RN 9/2016 trata da remessa de demonstrativos e documentos de responsabilidade fiscal, foi alterada pela RN 4/2023 e não é regimento do Serviço de Informações Estratégicas. É norma de processo institucional correlata, não fonte da estrutura organizacional.',
    coverage: [{ unitId: 'unit-leginst-servidor-organizacao', role: 'reference', extent: 'partial', locator: 'Arts. 1–3, redação da RN 4/2023; remessa RREO/RGF' }]
  }
];

for (const item of definitions) {
  const existing = review.sources.find(source => source.id === item.id);
  const source = {
    id: item.id, title: item.title, url: item.url, finalUrl: item.url,
    provider: item.url.includes('tce.go.gov.br') || item.url.includes('tce.go.gov.br') || item.url.includes('gnoi.tce.go.gov.br') ? 'TCE-GO' : item.url.includes('economia.go.gov.br') ? 'Secretaria de Estado da Economia de Goiás' : 'Casa Civil do Estado de Goiás',
    authors: [item.url.includes('economia.go.gov.br') ? 'Secretaria de Estado da Economia de Goiás' : item.url.includes('tce.go.gov.br') || item.url.includes('gnoi.tce.go.gov.br') ? 'Tribunal de Contas do Estado de Goiás' : 'Casa Civil do Estado de Goiás'],
    language: 'pt-BR', type: item.type, license: 'unknown; acesso público gratuito verificado; somente link; sem autorização de reprodução',
    checkedAt, access: 'free', locator: item.locator, evidence: item.evidence,
    coverage: item.coverage, reviewer: '/root; leitura e curadoria da fonte', reviewedAt,
    status: 'active', verification: 'reachable', finalUrl: item.url
  };
  if (existing) Object.assign(existing, source);
  else review.sources.push(source);
}
review.sources = review.sources.filter(source => !['legal-tcego-pccr-15122-current', 'legal-ra6-2026-tcego-code-ethics'].includes(source.id));

const statute = review.sources.find(source => source.id === 'legal-lei20756');
statute.locator = 'Lei consolidada completa, Títulos I–VI e arts. 281-A–282; recortes examinados nos arts. 5–67 (provimento/vacância), 88–190 (direitos e vantagens), 192–211 (regime disciplinar) e 212–262-D (processo disciplinar); relacionar ao art. 2º, § 2º, da Lei 15.122/2005 e ao corte 25/08/2026';
statute.evidence = 'Leitura dirigida da consolidação oficial consultada em PDF de 218 páginas, para os recortes do edital: requisitos/provimento, estágio e vacância (arts. 5–67); direitos e vantagens (arts. 88–190, incluindo licenças e afastamentos); deveres, penalidades, proibições/transgressões e responsabilidades (arts. 192–211); sindicância, PAD, recursos e TAC (arts. 212–262-D). O total de páginas descreve o arquivo compilado atual e não significa leitura integral de todas as notas, remissões ou peças reunidas nele. O art. 1º, parágrafo único, que excluía carreiras do TCE, foi revogado pela Lei 20.943/2020; a Lei 15.122, art. 2º, § 2º, na redação da Lei 23.500/2025, estabelece aplicação subsidiária para Auditor e Técnico de Controle Externo. Não tratar o regime do Executivo (inclusive SISCOR-GO do art. 191) como competência automaticamente transferida ao TCE. Texto está linkado; não houve reprodução.';
statute.coverage = [{ unitId: 'unit-leginst-servidor-regime', role: 'primary', extent: 'partial', locator: statute.locator }];
statute.reviewer = '/root; leitura direta da consolidação legal, conferência da aplicabilidade institucional e curadoria';
statute.reviewedAt = reviewedAt;
const pccr = find('legal-lei15122-carreira');
pccr.locator = 'Arts. 1–16-K e 24–31; estrutura/evolução/remuneração e anexos I–VII; art. 2º, § 2º, redação da Lei 23.500/2025 para aplicação subsidiária da Lei 20.756 aos cargos efetivos de Auditor e Técnico';
pccr.evidence = 'A leitura previamente registrada examinou os arts. 1–37 e tabelas de estrutura, classes/níveis/graus, evolução horizontal/vertical, vencimento, gratificações, adicionais e transições; Anexo VIII p.17 também consultado. Leis 22.973/2024, 23.237/2025, 23.500/2025 e 23.753/2025 estavam antes do corte. Valores de tabela não são promessa de salário atualizado; anexos de atribuições por especialidade não são reivindicados como integralmente lidos. Complemento desta curadoria: o texto oficial consolidado confirma que o art. 2º, § 2º, submete Auditor e Técnico à Lei 15.122 e, subsidiariamente, à Lei 20.756. A antiga exceção geral do art. 1º, parágrafo único, da Lei 20.756 foi revogada pela Lei 20.943/2020. A subsidiariedade não autoriza importar automaticamente competências do Poder Executivo para o TCE-GO.';
const index = find('legal-tcego-structure-norm-index-2026');
index.locator = 'Seção “Legislações/Resoluções”; itens RA 14/2025, RA 06/2025, RA 23/2024, RA 15/2023, RA 19/2022, RA 03/2021, RN 11/2016, RN 13/2016, RN 9/2016 e Lei 16.168; conciliar com atos primários vigentes';
index.evidence = 'A página oficial se declara índice das normas relacionadas à estrutura, mas conserva entradas revogadas: a RA 14/2025 revoga expressamente RA 19/2022, RA 15/2023, RA 23/2024 e RA 6/2025; a RA 16/2025 revoga a RA 03/2021 da ESCOEX. A página também não lista a RA 11/2025 da nova estrutura da ESCOEX. A RN 11/2016 trata do monitoramento de decisões; a RN 13/2016 institui o CETI; e a RN 9/2016 disciplina a remessa de RREO/RGF, alterada pela RN 4/2023 — não são descritas corretamente como uma lista uniforme de unidades vigentes. O índice é porta de busca e precisa ser reconciliado com os textos primários.';

find('legal-ra14-estrutura-dti').locator = 'Resolução completa, arts. 1–113; arts. 2–110 para composição, competências e obrigações; art. 112 revoga expressamente RA 19/2022, RA 15/2023, RA 23/2024 e RA 6/2025; art. 113 vigência';
find('legal-ra14-estrutura-dti').evidence = 'Leitura distribuída pelo corpo normativo oficial, arts. 1–113: grupos do art. 2º e competências dos órgãos/unidades nos arts. 3–110, incluindo DTI, controle externo, unidades básicas/colegiadas e obrigações comuns. Art. 112 revoga expressamente RA 19/2022, RA 15/2023, RA 23/2024 e RA 6/2025. O anexo I gráfico não é extraído no texto HTML; a página oficial atual do organograma entra no percurso para comparação visual. A RA 11/2025 e RA 16/2025 complementam e atualizam especificamente a ESCOEX.';
find('legal-ra14-estrutura-dti').coverage = [
  { unitId: 'unit-legti-pdti-dti', role: 'primary', extent: 'full', locator: 'Arts. 27–31, DTI e serviços' },
  { unitId: 'unit-leginst-servidor-organizacao', role: 'primary', extent: 'partial', locator: 'Arts. 1–113; art. 2º grupos, arts. 3–110 unidades/competências, art. 112 revogações; anexo I conferido com organograma oficial' }
];
const ra6 = find('legal-ra6-etica');
ra6.coverage = [...(ra6.coverage ?? []).filter(mapping => mapping.unitId !== 'unit-leginst-servidor-organizacao'),
  { unitId: 'unit-leginst-servidor-organizacao', role: 'primary', extent: 'partial', locator: 'Anexo II, arts. 1–55; Comissão de Ética como unidade integrante da governança de integridade' }
];

const statutePath = {
  id: 'path-tcego-supplemental-server-statute-2026', unitId: 'unit-leginst-servidor-regime',
  title: 'Regime funcional: estatuto estadual subsidiário e normas especiais do TCE-GO',
  steps: [
    { resourceId: 'legal-lei15122-carreira', objectiveIndices: [0], locator: 'Art. 2º, § 2º: cargos efetivos de Auditor e Técnico regidos pela Lei 15.122 e, subsidiariamente, pela Lei 20.756' },
    { resourceId: 'legal-lei20756', objectiveIndices: [0], locator: 'Títulos I–VI; provimento/vacância arts. 5–67; direitos/benefícios arts. 88–190; deveres e disciplina arts. 192–262-D' },
    { resourceId: 'legal-cge-regime-disciplinary-overview', objectiveIndices: [0], locator: 'Trilha pedagógica e páginas relacionadas; conferir cada ponto no texto legal e distinguir regras próprias do Executivo' },
    { resourceId: 'legal-cge-server-duties', objectiveIndices: [0], locator: 'Art. 192, lista de deveres' },
    { resourceId: 'legal-cge-server-prohibitions', objectiveIndices: [0], locator: 'Art. 202 e arquivo vinculado com transgressões/penalidades' },
    { resourceId: 'legal-cge-server-penalties', objectiveIndices: [0], locator: 'Arts. 193–199, espécies e efeitos das penalidades' },
    { resourceId: 'legal-cge-server-disciplinary-instruments', objectiveIndices: [0], locator: 'Arts. 212 e seguintes: apuração, sindicância e PAD' },
    { resourceId: 'legal-tcego-ra13-2025-capacitacao', objectiveIndices: [0], locator: 'Arts. 1–23: exemplo de interface entre licença do estatuto estadual e lei/norma específica do TCE' }
  ],
  practice: {
    title: 'Como aplicar o estatuto sem confundir órgãos',
    reading: 'Comece pela norma especial da carreira. A Lei 15.122/2005, art. 2º, § 2º (redação da Lei 23.500/2025), diz que Auditor e Técnico de Controle Externo são regidos por ela e, subsidiariamente, pela Lei 20.756/2020. A exclusão que existia no art. 1º, parágrafo único, da Lei 20.756 foi revogada pela Lei 20.943/2020. Portanto, não se deve afirmar nem que o estatuto estadual está integralmente afastado nem que toda regra administrativa do Executivo migra para o TCE. Na Lei 20.756, estude o Título II para provimento, estágio, exercício e vacância (arts. 5–67); o Título III para direitos e vantagens (arts. 88–190); o Título V para deveres, penalidades, proibições e responsabilidades (arts. 192–211); e o Título VI para sindicância, PAD, recursos e TAC (arts. 212–262-D). Ao responder, cite a regra estadual e confira se há lei, resolução ou ato próprio do TCE. O art. 191 descreve o SISCOR do Poder Executivo, então não o use como prova de competência correcional do TCE. As páginas de treinamento da Secretaria da Economia são apoio didático de conteúdo, não fonte para transpor órgãos ou competências.',
    questions: [{
      id: 'practice-tcego-statute-supplemental-scope',
      stem: 'Para um Auditor de Controle Externo do TCE-GO, qual leitura descreve corretamente a relação entre a Lei 15.122/2005 e a Lei 20.756/2020?',
      options: [
        'A Lei 20.756 não alcança servidores do TCE em hipótese alguma.',
        'A Lei 20.756 substitui integralmente a Lei 15.122 e toda norma própria do TCE.',
        'Aplica-se a Lei 15.122 e, subsidiariamente, a Lei 20.756, respeitadas as normas próprias do Tribunal.',
        'A Lei 20.756 só pode ser usada para servidores do Poder Executivo.'
      ],
      correctOptionIndex: 2,
      explanation: 'O art. 2º, § 2º, da Lei 15.122, na redação dada pela Lei 23.500/2025, prevê aplicação subsidiária da Lei 20.756 aos cargos efetivos de Auditor e Técnico. Isso não transforma as competências do Executivo em competências do TCE.',
      sourceResourceId: 'legal-lei15122-carreira',
      locator: 'Art. 2º, § 2º, redação da Lei 23.500/2025; conferir texto consolidado oficial'
    }]
  },
  editorialReview: { status: 'approved', reviewer: '/root; leitura e curadoria editorial; QA independente da integração pendente', reviewedAt, evidence: 'Leitura do Estatuto oficial completo por títulos e recortes; conferência da regra especial da Lei 15.122 com a redação da Lei 23.500/2025; comparação direta das páginas pedagógicas vinculadas com arts. 192, 202, 193–199 e 212 e distinção explícita entre a estrutura do Executivo e a do TCE. O parecer independente de integração ainda não foi emitido.' }
};

const organizationPath = {
  id: 'path-tcego-organization-controls-integrity-2026', unitId: 'unit-leginst-servidor-organizacao',
  title: 'Estrutura vigente, controle interno e integridade no TCE-GO',
  steps: [
    { resourceId: 'legal-ra14-estrutura-dti', objectiveIndices: [0], locator: 'Arts. 1–113; mapear grupos do art. 2º e competências arts. 3–110; conferir revogações do art. 112' },
    { resourceId: 'legal-tcego-organogram-current-2026', objectiveIndices: [0], locator: 'Organograma vigente da página oficial; usar para conferir relações visuais com a RA 14' },
    { resourceId: 'legal-ra10-controle', objectiveIndices: [0], locator: 'Arts. 1–16: sistema de controle interno, instâncias, responsabilidades e Diretoria de Controle Interno' },
    { resourceId: 'legal-ra13-integridade', objectiveIndices: [0], locator: 'Arts. 1–11: política, modelo, fases, eixos e unidades que compõem a governança de integridade' },
    { resourceId: 'legal-portaria-58-2025-integrity-compiled', objectiveIndices: [0], locator: 'Arts. 1–4, compilado com alterações até Portaria 455/2026' },
    { resourceId: 'legal-portaria-348-2026-committees', objectiveIndices: [0], locator: 'Arts. 1–2: coordenação geral e auxiliar de comitês; efeitos a partir de 01/05/2026' },
    { resourceId: 'legal-ra6-etica', objectiveIndices: [0], locator: 'Anexo II: Código de Ética vigente e papel da Comissão de Ética' },
    { resourceId: 'legal-tcego-ra11-2025-escoex-structure', objectiveIndices: [0], locator: 'Arts. 1–6 e anexo: estrutura especializada vigente da ESCOEX' },
    { resourceId: 'legal-tcego-ra16-2025-escoex-regulation', objectiveIndices: [0], locator: 'Regulamento e art. 2º, revogação expressa da RA 03/2021' },
    { resourceId: 'legal-tcego-structure-norm-index-2026', objectiveIndices: [0], locator: 'Índice oficial de normas relacionadas; confrontar cada item com revogações e escopos dos atos primários' },
    { resourceId: 'legal-tcego-rn11-2016-monitoring-decisions', objectiveIndices: [0], locator: 'Procedimento de monitoramento de decisões; conciliar papéis operacionais com a estrutura RA 14/2025' },
    { resourceId: 'legal-tcego-rn13-2016-ceti', objectiveIndices: [0], locator: 'CETI e governança de TI; distinguir ato colegiado do desenho das unidades na RA 14/2025' },
    { resourceId: 'legal-tcego-rn09-2016-lrf-documents', objectiveIndices: [0], locator: 'Remessa de demonstrativos RREO/RGF; texto compilado com RN 4/2023, não estrutura de inteligência' }
  ],
  practice: {
    title: 'Ler a estrutura por camadas e reconciliar atos',
    reading: 'A RA 14/2025 é a âncora estrutural: art. 2º agrupa o Tribunal em órgãos colegiados, corpo diretivo, órgãos superiores, independência funcional, apoio à segurança, unidades básicas e colegiados; os arts. 3–110 detalham atribuições. O art. 112 revoga expressamente RA 19/2022, RA 15/2023, RA 23/2024 e RA 6/2025. Use o organograma oficial como mapa visual e a resolução como fonte de competência. A ESCOEX recebeu estrutura própria pela RA 11/2025 e regulamento pela RA 16/2025, que revogou a RA 03/2021 — apesar de o índice institucional ainda listar essa norma antiga. O controle interno é distribuído: RA 10/2019 define o sistema, a Diretoria de Controle Interno e deveres das unidades; integridade é articulada pela RA 13/2024 e atos de implementação (Portaria 58/2025 compilada e Portaria 348/2026), com a Comissão de Ética atualizada pela RA 6/2026. Ao auditar atos que o índice mantém, leia o escopo: RN 11/2016 disciplina monitoramento de decisões; RN 13/2016 institui o CETI; RN 9/2016 trata da remessa de RREO/RGF e foi alterada pela RN 4/2023. O índice descreve alguns desses atos de modo abreviado e também conserva entradas revogadas; não o use sozinho como prova de vigência ou de competência.',
    questions: [{
      id: 'practice-tcego-org-reconcile-current-acts',
      stem: 'O índice oficial ainda lista a RA 03/2021 da ESCOEX e a RA 19/2022 da estrutura do TCE-GO. Como verificar o quadro vigente?',
      options: [
        'Tratar as duas como vigentes porque aparecem no índice.',
        'Usar a RA 14/2025 para a estrutura geral, observar suas revogações expressas e usar a RA 16/2025 para a ESCOEX, que revoga a RA 03/2021.',
        'Ignorar todos os atos anteriores a 2026 e usar só o organograma gráfico.',
        'Presumir que a RA 11/2025 revogou todas as resoluções sobre estrutura e controle interno.'
      ],
      correctOptionIndex: 1,
      explanation: 'A RA 14/2025 revoga expressamente a RA 19/2022 e outros atos estruturais. A RA 16/2025 aprova o regulamento atual da ESCOEX e revoga expressamente a RA 03/2021. O índice conserva itens antigos e deve ser conciliado com os atos primários.',
      sourceResourceId: 'legal-tcego-ra16-2025-escoex-regulation',
      locator: 'Art. 2º da RA 16/2025; confrontar com art. 112 da RA 14/2025 e índice oficial'
    }]
  },
  editorialReview: { status: 'approved', reviewer: '/root; leitura e curadoria editorial; QA independente da integração pendente', reviewedAt, evidence: 'Conferência do texto integral arts. 1–113 da RA 14/2025, do organograma oficial, RA 10/2019, RA 13/2024, Portaria 58/2025 compilada, Portaria 348/2026, RA 6/2026 e dos atos residuais RN 11/2016, RN 13/2016 e RN 9/2016. Verificadas as revogações da RA 14/2025 e a revogação da RA 03/2021 pela RA 16/2025. QA independente do hash final continua pendente.' }
};

const paths = new Map((review.studyPaths ?? []).map(path => [path.id, path]));
paths.set(statutePath.id, statutePath);
paths.set(organizationPath.id, organizationPath);
review.studyPaths = [...paths.values()];
review.closedUnitIds = [...new Set([...(review.closedUnitIds ?? []), statutePath.unitId, organizationPath.unitId])];
review.reviewer = '/root; curadoria editorial de fontes legais primárias e apoios didáticos; revisão independente final pendente';
review.reviewedAt = reviewedAt;
review.status = 'reviewed';
review.summary = 'Candidata de curadoria atualizada para todos os 209 tópicos/unidades do edital. As lacunas legais de regime funcional e organização foram cobertas por percursos com objetivos, locators, leitura didática original, questões de prática e fontes gratuitas link-only. A Lei 20.756 é contextualizada como subsidiária para os cargos efetivos do TCE-GO conforme Lei 15.122, art. 2º, §2º (Lei 23.500/2025); o índice organizacional é conciliado com revogações e atos atuais. Não promover nem declarar aprovada até validação de schema/auditoria e parecer independente do hash final.';
await writeFile(file, JSON.stringify(review, null, 2) + '\n');
console.log(JSON.stringify({sources: review.sources.length, studyPaths: review.studyPaths.length, closedUnitIds: review.closedUnitIds, status: review.status}));
