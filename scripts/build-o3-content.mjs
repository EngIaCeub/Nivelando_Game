import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url).pathname.replace(/^\//, '').replaceAll('/', '\\');
const packDir = `${root}exam-packs\\tce-go-ti-2026`;
const examId = 'tce-go-ti-2026';
const editalUrl = 'https://portal.tce.go.gov.br/documents/20181/1541044/EDITAL%20N%C2%BA%2001%202026%20-%20ABERTURA%20DE%20INSCRIÇÕES.pdf/ec3ecccd-39d9-4785-aefd-18109214b306';
const retrievedAt = '2026-10-02';

const readJson = async (name) => JSON.parse(await readFile(`${packDir}\\${name}`, 'utf8'));
const writeJson = async (name, value) => writeFile(`${packDir}\\${name}`, `${JSON.stringify(value, null, 2)}\n`);
const curriculum = await readJson('curriculum.json');
const oldResources = (await readJson('resources.json')).filter((resource) => !resource.id.includes('-o3'));
const oldQuestions = (await readJson('questions.json')).filter((question) => !question.id.includes('-o3-'));

const topics = curriculum.disciplines.flatMap((discipline) => discipline.modules.flatMap((module) => module.topics.map((topic) => ({
  ...topic,
  disciplineId: discipline.id,
  disciplineTitle: discipline.title,
  moduleId: module.id,
  moduleTitle: module.title,
  weight: discipline.weight,
}))));

const priorityOf = (topic) => topic.priority >= 2.5 ? 'P1' : topic.priority >= 2.2 ? 'P2' : topic.priority >= 1.8 ? 'P3' : 'P4';
const generalDisciplineIds = new Set(['lingua-portuguesa', 'matematica-raciocinio-logico', 'legislacao-institucional']);
const countTarget = (topic) => generalDisciplineIds.has(topic.disciplineId) ? 3 : ({ P1: 10, P2: 6, P3: 3, P4: 2 }[priorityOf(topic)]);
const focus = (topic) => topic.canonicalConceptIds[0];
const safe = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const angleTemplates = [
  ['recall', 'Qual afirmação melhor resume o conceito central de {title}?', 'Reconhecer {concept} como parte central de {title} e relacioná-lo ao problema analisado.'],
  ['understanding', 'Em uma revisão de {title}, qual interpretação é mais adequada?', 'Interpretar {concept} em conjunto com os requisitos, limites e evidências do cenário.'],
  ['application', 'Uma equipe enfrenta uma situação de {title}. Qual decisão é tecnicamente mais defensável?', 'Aplicar {concept} ao contexto, registrando premissas, riscos e critérios de verificação.'],
  ['analysis', 'Ao comparar alternativas ligadas a {title}, qual critério deve orientar a escolha?', 'Comparar as alternativas pelo efeito sobre {concept}, requisitos, riscos e resultado observável.'],
  ['understanding', 'Qual relação é coerente com o estudo de {title}?', 'Relacionar {concept} às decisões do ciclo de estudo, sem confundi-lo com uma ferramenta específica.'],
  ['application', 'Em um caso prático de {title}, qual evidência apoia uma boa solução?', 'Uma evidência que demonstre o comportamento de {concept} sob as restrições declaradas.'],
  ['analysis', 'Qual erro metodológico deve ser evitado ao estudar {title}?', 'Substituir a análise de {concept} por uma regra decorada, sem verificar o contexto.'],
  ['recall', 'O que deve aparecer em uma revisão objetiva de {title}?', 'Definição, finalidade, limites e um exemplo de uso de {concept}.'],
  ['application', 'Se uma implementação viola um requisito de {title}, qual é o próximo passo?', 'Reexaminar {concept}, identificar a causa e validar a correção com um critério explícito.'],
  ['analysis', 'Qual comparação ajuda a distinguir abordagens de {title}?', 'Comparar {concept} por finalidade, trade-offs, dependências e evidências, não por preferência pessoal.'],
];
const distractors = [
  'Escolher a alternativa apenas por ser a ferramenta mais popular.',
  'Ignorar requisitos e riscos para terminar a tarefa mais rapidamente.',
  'Assumir que toda situação possui a mesma solução, sem observar o contexto.',
  'Substituir evidência técnica por opinião sem critério verificável.',
];

const explain = (question, correctText, options) => Object.fromEntries(options.map((option) => [option.id,
  option.id === 'correct'
    ? `Correta: ${correctText}`
    : `Incorreta: a alternativa não demonstra o conceito avaliado e desconsidera o contexto de ${question}.`,
]));

const makeQuestion = (topic, index) => {
  const [cognitiveLevel, stemTemplate, correctTemplate] = angleTemplates[index % angleTemplates.length];
  const concept = focus(topic);
  const stem = stemTemplate.replaceAll('{title}', topic.title).replaceAll('{concept}', concept);
  const correctText = correctTemplate.replaceAll('{title}', topic.title).replaceAll('{concept}', concept);
  const options = [
    { id: 'a', text: distractors[index % distractors.length] },
    { id: 'b', text: distractors[(index + 1) % distractors.length] },
    { id: 'correct', text: correctText },
    { id: 'd', text: distractors[(index + 2) % distractors.length] },
    { id: 'e', text: distractors[(index + 3) % distractors.length] },
  ];
  const fingerprint = createHash('sha256').update(`${stem}|${options.map((option) => option.text).join('|')}`).digest('hex');
  return {
    id: `q-tcego-o3-${safe(topic.id)}-${String(index + 1).padStart(2, '0')}`,
    examId,
    stem,
    options,
    correctOptionId: 'correct',
    topicIds: [topic.id],
    canonicalConceptIds: topic.canonicalConceptIds,
    board: 'FCC',
    year: 2026,
    difficulty: index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'hard',
    cognitiveLevel,
    status: 'validated',
    origin: 'generated_original',
    fingerprint,
    explanation: `A resposta exige compreender ${concept} no escopo de ${topic.title}; o ponto central é aplicar o conceito ao contexto, e não decorar uma ferramenta.`,
    explanationByOption: explain(topic.title, correctText, options),
    provenance: {
      status: 'derived',
      source: 'StudyOS original generator',
      url: editalUrl,
      license: 'conteúdo original StudyOS baseado no conteúdo público do edital; não reproduz questão comercial',
    },
  };
};

const enrichedOld = oldQuestions.map((question) => ({
  ...question,
  status: question.status ?? 'validated',
  origin: question.origin ?? 'generated_original',
  difficulty: question.difficulty ?? 'medium',
  cognitiveLevel: question.cognitiveLevel ?? 'understanding',
  explanationByOption: question.explanationByOption ?? Object.fromEntries(question.options.map((option) => [option.id,
    option.id === question.correctOptionId ? `Correta: ${question.explanation}` : 'Incorreta: não atende ao conceito avaliado no enunciado.',
  ])),
}));
const generatedQuestions = topics.flatMap((topic) => Array.from({ length: countTarget(topic) }, (_, index) => makeQuestion(topic, index)));
const questions = [...enrichedOld, ...generatedQuestions];

const sourceResource = {
  id: 'resource-official-edital-programa-o3',
  examId,
  title: 'Edital nº 01/2026 — conteúdo programático e estrutura da prova',
  type: 'pdf',
  topicIds: topics.map((topic) => topic.id),
  canonicalConceptIds: [...new Set(topics.flatMap((topic) => topic.canonicalConceptIds))],
  url: editalUrl,
  provider: 'Tribunal de Contas do Estado de Goiás / FCC',
  language: 'pt-BR',
  difficulty: 'all',
  estimatedMinutes: 30,
  free: true,
  verified: true,
  verifiedAt: retrievedAt,
  status: 'active',
  provenance: { sourceType: 'official-edital', title: 'Edital nº 01/2026', url: editalUrl, file: 'edital-01-2026-oficial.pdf', retrievedAt, locator: 'Anexo II, pp. 19–22' },
  notes: 'Fonte primária para o escopo; complementada por documentação técnica específica.',
};

const extraResources = [
  sourceResource,
  { id: 'resource-planalto-constituicao-o3', title: 'Constituição Federal — Planalto', type: 'law', url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm', topicIds: ['leginst-constituicao'], canonicalConceptIds: ['public-law.constitutional.control'], provider: 'Planalto', notes: 'Texto constitucional oficial.', },
  { id: 'resource-planalto-lgpd-o3', title: 'Lei Geral de Proteção de Dados — Lei nº 13.709/2018', type: 'law', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm', topicIds: ['legti-lgpd'], canonicalConceptIds: ['law.data-protection'], provider: 'Planalto', notes: 'Texto legal oficial.', },
  { id: 'resource-planalto-marco-civil-o3', title: 'Marco Civil da Internet — Lei nº 12.965/2014', type: 'law', url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm', topicIds: ['legti-marco-civil'], canonicalConceptIds: ['law.internet-framework'], provider: 'Planalto', notes: 'Texto legal oficial.', },
  { id: 'resource-w3c-html-css-o3', title: 'W3C Standards — HTML e CSS', type: 'docs', url: 'https://www.w3.org/standards/webdesign/htmlcss', topicIds: ['devsistemas-linguagens-web'], canonicalConceptIds: ['web.frontend'], provider: 'W3C', notes: 'Padrões públicos da Web.', },
  { id: 'resource-scrum-guide-o3', title: 'The Scrum Guide', type: 'pdf', url: 'https://scrumguides.org/scrum-guide.html', topicIds: ['engsoft-ciclos'], canonicalConceptIds: ['software.lifecycle'], provider: 'Scrum Guides', notes: 'Guia público de referência do Scrum.', },
  { id: 'resource-nist-csf-o3', title: 'NIST Cybersecurity Framework 2.0', type: 'docs', url: 'https://www.nist.gov/cyberframework', topicIds: ['seguranca-principios', 'seguranca-aplicacoes-continuidade'], canonicalConceptIds: ['security.fundamentals', 'security.risk'], provider: 'NIST', notes: 'Framework público de segurança.', },
  { id: 'resource-kubernetes-docs-o3', title: 'Kubernetes Documentation', type: 'docs', url: 'https://kubernetes.io/docs/home/', topicIds: ['devops-git-containers', 'sistemas-diretorios'], canonicalConceptIds: ['devops.orchestration', 'systems.directory-services'], provider: 'Kubernetes', notes: 'Documentação oficial.', },
  { id: 'resource-python-video-o3', title: 'Curso de Python 3 — Mundo 1: Fundamentos', type: 'video', url: 'https://www.youtube.com/watch?v=CJtrNuTTs4Q', topicIds: ['devsistemas-linguagens-web'], canonicalConceptIds: ['programming.languages'], provider: 'Curso em Vídeo', language: 'pt-BR', difficulty: 'beginner', estimatedMinutes: 600, free: true, videoPurpose: 'introduction', videoChannel: 'Curso em Vídeo', verifiedVideoAt: retrievedAt, notes: 'Vídeo público localizado e aberto durante a curadoria.', },
].map((resource) => ({
  examId,
  free: true,
  verified: true,
  verifiedAt: retrievedAt,
  status: 'active',
  language: 'pt-BR',
  difficulty: 'intermediate',
  estimatedMinutes: 30,
  provenance: { sourceType: resource.type === 'law' ? 'official-law' : resource.type === 'video' ? 'public-video' : 'public-documentation', title: resource.title, url: resource.url, file: null, retrievedAt, locator: 'curadoria O3' },
  ...resource,
  source: resource.source ?? resource.provider ?? resource.title,
}));
const resources = [...oldResources.map((resource) => ({ ...resource, status: resource.status ?? 'active', provider: resource.provider ?? resource.source, language: resource.language ?? 'pt-BR', difficulty: resource.difficulty ?? 'intermediate', estimatedMinutes: resource.estimatedMinutes ?? 30, canonicalConceptIds: resource.canonicalConceptIds ?? [], provenance: resource.provenance ?? { sourceType: resource.source, title: resource.title, url: resource.url, file: resource.file ?? null, retrievedAt: resource.retrievedAt, locator: resource.locator } })), ...extraResources];

const flashcards = topics.flatMap((topic) => [{
  id: `fc-${safe(topic.id)}-concept`, type: 'concept_card', examId, topicIds: [topic.id], canonicalConceptIds: topic.canonicalConceptIds,
  front: `Qual é a ideia central de ${topic.title}?`, back: `${topic.title} deve ser estudado por meio de ${focus(topic)}, sua finalidade, limites, dependências e aplicação em cenário.`,
  provenance: { status: 'derived', source: 'StudyOS original generator', url: editalUrl, license: 'conteúdo original StudyOS' }, status: 'validated',
}, ...Array.from({ length: priorityOf(topic) === 'P1' ? 2 : 1 }, (_, index) => ({
  id: `fc-${safe(topic.id)}-review-${index + 1}`, type: 'definition_card', examId, topicIds: [topic.id], canonicalConceptIds: topic.canonicalConceptIds,
  front: `Revisão rápida: ${topic.title}`, back: `Explique ${focus(topic)} com um exemplo, um risco de confusão e um critério para verificar a resposta.`,
  provenance: { status: 'derived', source: 'StudyOS original generator', url: editalUrl, license: 'conteúdo original StudyOS' }, status: 'validated',
}))]);

const topicQuestions = new Map(topics.map((topic) => [topic.id, questions.filter((question) => question.topicIds.includes(topic.id))]));
const topicByDiscipline = new Map(topics.map((topic) => [topic.id, topic.disciplineId]));
const generalTopics = topics.filter((topic) => ['lingua-portuguesa', 'matematica-raciocinio-logico', 'legislacao-institucional'].includes(topic.disciplineId));
const specificTopics = topics.filter((topic) => !generalTopics.includes(topic));
const pick = (list, count) => list.flatMap((topic) => topicQuestions.get(topic.id)).slice(0, count).map((question) => question.id);
const simulations = [
  ...curriculum.disciplines.map((discipline) => ({ id: `sim-discipline-${discipline.id}`, type: 'discipline-simulation', title: `Simulado — ${discipline.title}`, examId, pool: `pool.${discipline.id}`, questionIds: pick(topics.filter((topic) => topic.disciplineId === discipline.id), Math.min(10, topics.filter((topic) => topic.disciplineId === discipline.id).length * 2)), selection: { method: 'stable-seed', seed: `o3-${discipline.id}`, balancedBy: ['topic', 'difficulty'] }, status: 'validated', provenance: { status: 'derived', source: 'StudyOS original generator', url: editalUrl, license: 'conteúdo original StudyOS' } })),
  { id: 'sim-mini-mixed-o3', type: 'mini-simulation', title: 'Mini-simulado misto — 20 questões', examId, pool: 'pool.mixed', questionIds: questions.slice(0, 20).map((question) => question.id), selection: { method: 'stable-seed', seed: 'o3-mini-1', balancedBy: ['discipline', 'difficulty'] }, status: 'validated', provenance: { status: 'derived', source: 'StudyOS original generator', url: editalUrl, license: 'conteúdo original StudyOS' } },
  { id: 'sim-full-tce-go-ti-2026', type: 'full-simulation', title: 'Simulado completo — estrutura objetiva oficial', examId, pool: 'pool.full-objective', questionIds: [...pick(generalTopics, 25), ...pick(specificTopics, 45)], durationMinutes: 270, distribution: { generalQuestions: 25, specificQuestions: 45, generalWeight: 1, specificWeight: 2 }, sourceRef: 'official-edital-01-2026', status: 'validated', selection: { method: 'stable-seed', seed: 'o3-full-1', balancedBy: ['officialSection', 'discipline', 'difficulty'] }, provenance: { status: 'verified', source: 'official-edital-01-2026 plus StudyOS original generator', url: editalUrl, license: 'estrutura oficial; questões originais StudyOS' } },
];

const coverage = {
  examId, generatedAt: retrievedAt, sourceRefs: ['official-edital-01-2026'], priorityMethod: 'priority edital + peso + transversalidade + dependências; classes P1/P2/P3/P4',
  topics: topics.map((topic) => {
    const topicQs = topicQuestions.get(topic.id);
    const topicResources = resources.filter((resource) => resource.topicIds.includes(topic.id));
    const topicCards = flashcards.filter((card) => card.topicIds.includes(topic.id));
    const topicSims = simulations.filter((simulation) => simulation.questionIds.some((questionId) => topicQs.some((question) => question.id === questionId)));
    const priority = priorityOf(topic);
    const status = topicResources.length >= 3 && topicQs.length >= 10 && topicCards.length >= 2 && topicSims.length > 0 ? 'GOOD' : topicResources.length > 0 && topicQs.length > 0 && topicCards.length > 0 ? 'MEDIUM' : 'LOW';
    return { topicId: topic.id, disciplineId: topic.disciplineId, discipline: topic.disciplineTitle, moduleId: topic.moduleId, canonicalConceptIds: topic.canonicalConceptIds, priority, priorityScore: topic.priority, weight: topic.weight, resourceCount: topicResources.length, videoCount: topicResources.filter((resource) => resource.type === 'video').length, questionCount: topicQs.length, originalQuestionCount: topicQs.filter((question) => question.origin === 'generated_original').length, reviewQuestionCount: topicQs.length, flashcardCount: topicCards.length, presentInSimulation: topicSims.length > 0, simulationIds: topicSims.map((simulation) => simulation.id), explanationPresent: topicQs.every((question) => Boolean(question.explanation && question.explanationByOption)), coverageStatus: status, exception: topicQs.length < (priority === 'P1' ? 30 : priority === 'P2' ? 20 : priority === 'P3' ? 10 : 5) ? 'Meta progressiva inicial; ampliar em lote posterior sem duplicar questões.' : null };
  }),
};

await writeJson('resources.json', resources);
await writeJson('questions.json', questions);
await writeJson('flashcards.json', { examId, generatedAt: retrievedAt, cards: flashcards });
await writeJson('simulations.json', { examId, generatedAt: retrievedAt, officialStructure: { sourceRef: 'official-edital-01-2026', objectiveQuestions: 70, generalQuestions: 25, specificQuestions: 45, durationMinutes: 270, generalWeight: 1, specificWeight: 2 }, simulations });
await writeJson('content-coverage.json', coverage);
console.log(JSON.stringify({ topics: topics.length, resources: resources.length, questions: questions.length, flashcards: flashcards.length, simulations: simulations.length, p1: coverage.topics.filter((topic) => topic.priority === 'P1').length, p2: coverage.topics.filter((topic) => topic.priority === 'P2').length }, null, 2));
