import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootArg = process.argv.slice(2).find(arg => arg !== '--json');
const root = rootArg ? resolve(rootArg) : fileURLToPath(new URL('..', import.meta.url));
const json = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const packsRoot = resolve(root, 'exam-packs');
const packs = [];
const generatedAnswer = /^(explique\b|.+\bdeve ser estudado por meio de\b)/i;
const templateFront = /^(revisão rápida:|qual é a ideia central de)\s*/i;

for (const entry of await readdir(packsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const base = `exam-packs/${entry.name}`;
  let flashcards;
  try { flashcards = await json(`${base}/flashcards.json`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const curriculum = await json(`${base}/curriculum.json`);
  const questions = await json(`${base}/questions.json`);
  const resources = await json(`${base}/resources.json`);
  const topics = new Map(curriculum.disciplines.flatMap(d => d.modules.flatMap(m => m.topics)).map(topic => [topic.id, topic.title]));
  const cards = flashcards?.cards ?? [];
  const flagged = cards.map(card => {
    const reasons = [];
    if (generatedAnswer.test(card.back.trim())) reasons.push('resposta_instrucional_generica');
    if (templateFront.test(card.front.trim())) reasons.push('frente_de_template');
    if (card.provenance?.source === 'StudyOS original generator') reasons.push('origem_de_gerador_sem_fonte_didatica');
    if (card.provenance?.url && /edital/i.test(card.provenance.url) && reasons.length) reasons.push('edital_comprova_escopo_nao_resposta');
    if (!card.provenance?.locator && card.provenance?.url) reasons.push('fonte_sem_recorte_locator');
    if (card.reviewStatus !== 'approved') reasons.push('sem_aprovacao_editorial_registrada');
    const missingTopics = (card.topicIds ?? []).filter(id => !topics.has(id));
    if (missingTopics.length) reasons.push('topicId_inexistente');
    return { id: card.id, topicIds: card.topicIds ?? [], topics: (card.topicIds ?? []).map(id => topics.get(id) ?? id), reasons, missingTopics };
  }).filter(item => item.reasons.length);
  const questionFlags = questions.map(question => {
    const reasons = [];
    const source = question.provenance?.source ?? '';
    if (source === 'StudyOS original generator') reasons.push('origem_gerada_nao_e_prova_anterior');
    if (question.board && question.year && (source === 'StudyOS original generator' || /edital/i.test(source))) reasons.push('banca_ano_sem_identificacao_de_prova');
    if (!question.explanation?.trim()) reasons.push('sem_justificativa');
    if (!question.provenance?.locator) reasons.push('fonte_sem_locator');
    if (question.license === undefined && question.provenance?.license === undefined) reasons.push('licenca_nao_informada');
    if (!question.reviewStatus || question.reviewStatus !== 'approved') reasons.push('sem_aprovacao_editorial_registrada');
    return { id: question.id, board: question.board ?? null, year: question.year ?? null, source, reasons };
  }).filter(item => item.reasons.length);
  const resourceReviewed = resource => (resource.libraryVersion === 2 ? resource.editorialReview?.status : resource.reviewStatus) === 'approved';
  const resourceFlags = resources.filter(resource => !resource.provenance?.locator || !resourceReviewed(resource))
    .map(resource => ({ id: resource.id, reasons: [
      ...(!resource.provenance?.locator ? ['fonte_sem_locator_didatico'] : []),
      ...(!resourceReviewed(resource) ? ['sem_revisao_editorial_registrada'] : [])
    ] }));
  packs.push({ examId: flashcards?.examId ?? entry.name, cardCount: cards.length, flaggedCount: flagged.length, cards: flagged,
    questionCount: questions.length, questionFlaggedCount: questionFlags.length, questions: questionFlags,
    resourceCount: resources.length, resourceFlaggedCount: resourceFlags.length, resources: resourceFlags });
}

const report = { schemaVersion: 1, generatedAt: new Date().toISOString(), kind: 'content-audit', packs };
if (process.argv.includes('--json')) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
else for (const pack of packs) {
  console.log(`${pack.examId}: ${pack.cardCount} flashcards (${pack.flaggedCount} com alertas), ${pack.questionCount} questões (${pack.questionFlaggedCount} com alertas), ${pack.resourceCount} recursos (${pack.resourceFlaggedCount} sem revisão editorial registrada)`);
  for (const item of [...pack.cards, ...pack.questions, ...pack.resources]) console.log(`- ${item.id} [${item.reasons.join(', ')}]`);
}
