// Run only after signed independent JSON reviews exist and match proposal hashes.
import { readFile, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const dir = new URL('./', import.meta.url), pack = new URL('../../exam-packs/tce-go-ti-2026/', dir);
const read = async (base, file) => JSON.parse(await readFile(new URL(file, base), 'utf8'));
const save = async (base, file, value) => writeFile(new URL(file, base), JSON.stringify(value,null,2)+'\n');
const hash = async file => createHash('sha256').update(await readFile(new URL(file,dir))).digest('hex');
const proposal = await read(dir,'CURATION_DRAFT.json'), questionDraft = await read(dir,'QUESTIONS_DRAFT.json');
const factual = await read(dir,'FACTUAL_REVIEW.json'), editorial = await read(dir,'SOURCES_REVIEW.json');
if (factual.curationDraftSha256?.toLowerCase() !== await hash('CURATION_DRAFT.json') ||
    factual.questionsDraftSha256?.toLowerCase() !== await hash('QUESTIONS_DRAFT.json') ||
    editorial.draftSha256?.toLowerCase() !== await hash('CURATION_DRAFT.json')) throw new Error('Reviews must match the effective proposal hashes');
const approval = (review, evidence) => ({status:'approved',reviewer:review.reviewer,reviewedAt:review.reviewedAt,evidence});
if (!factual.reviewer || !factual.reviewedAt || !editorial.reviewer || !editorial.reviewedAt) throw new Error('Missing independent reviewer');
let history;
try { await access(new URL('content-history.json',pack)); history = await read(pack,'content-history.json'); }
catch (e) { if (e.code !== 'ENOENT') throw e; history = {schemaVersion:1,examId:'tce-go-ti-2026',archivedAt:new Date().toISOString(),purpose:'Exact legacy lookup for existing sessions only; excluded from new activity selection.',questions:await read(pack,'questions.json'),cards:(await read(pack,'flashcards.json')).cards,resources:await read(pack,'resources.json'),simulations:await read(pack,'simulations.json')}; await save(pack,'content-history.json',history); }
const sources = proposal.sources.filter(s => editorial.approvedSourceIds.includes(s.id));
const sourceIds = new Set(sources.map(s=>s.id));
// Metadata corrections read and confirmed in the independent integration QA.
for (const s of sources) {
 if(s.id==='curated-funag-comma') s.authors=['Celso Cunha','Luís F. Cintra','FUNAG (compilação)'];
 if(s.id==='curated-rfc6749') s.finalUrl='https://www.rfc-editor.org/info/rfc6749/';
 if(s.id==='curated-rfc7519') s.finalUrl='https://www.rfc-editor.org/info/rfc7519/';
}
const cards = proposal.cards.filter(c => factual.approvedCardIds.includes(c.id) && sourceIds.has(c.provenance.source)).map(c => ({...c,status:'validated',reviewStatus:'approved',editorialReview:approval(factual,'docs/content-review/QUESTIONS_INDEPENDENT_REVIEW.md; '+c.id)}));
const questions = questionDraft.filter(q => factual.approvedQuestionIds.includes(q.id)).map(q => ({...q,status:'validated',reviewStatus:'approved',editorialReview:approval(factual,'docs/content-review/QUESTIONS_INDEPENDENT_REVIEW.md; '+q.id)}));
if (!questions.length || !cards.length || !sources.length) throw new Error('Empty independently approved bank');
const resources = sources.map(s => ({id:s.id,examId:'tce-go-ti-2026',libraryVersion:2,title:s.title,type:s.type,topicIds:s.topicIds,url:s.url,source:s.provider,
  provider:s.provider,authors:s.authors,language:s.language,difficulty:'beginner',estimatedMinutes:null,status:'active',free:true,verified:true,verifiedAt:s.checkedAt,
  access:{mode:'free',requiresRegistration:false,notes:s.limitations},rights:{license:s.license,delivery:'link',evidenceUrl:s.license==='unknown'?null:s.url},
  verification:{result:'reachable',checkedAt:s.checkedAt,finalUrl:s.finalUrl??s.url,method:'GET'},
  editorialReview:approval(editorial,'docs/content-review/LIBRARY_INDEPENDENT_REVIEW.md; '+s.id+'; '+(editorial.advisoryMetadata?.find(a=>a.id===s.id&&a.field==='evidence')?.recommendedValue??s.evidence)),
  coverage:s.topicIds.map(id=>({unitId:id+'-study',role:s.role,extent:'partial',locator:s.locator})),
  provenance:{sourceType:s.type,title:s.title,url:s.url,retrievedAt:s.checkedAt.slice(0,10),locator:s.locator},versionNotes:s.limitations}));
const library = await read(pack,'library.json'); library.status='partial';
const reviewText = await readFile(new URL('LIBRARY_INDEPENDENT_REVIEW.md',dir),'utf8');
const matrix = new Map([...reviewText.matchAll(/^\| `([^`]+)` \| ([^|]+) \| ([^|]+) \|$/gm)].map(m=>[m[1],{locator:m[2].trim(),objectives:m[3].trim()}]));
for (const unit of library.units) {
 const row=matrix.get(unit.topicId); if (!row) throw new Error('Missing audited topic '+unit.topicId);
 unit.syllabusRefs=[{source:'official-edital-01-2026',locator:row.locator}];
 // Keep current user-facing objectives until the syllabus matrix is decomposed
 // into precise pedagogical units. Audit instructions are not learning objectives.
}
// Matrix is an audit of missing subitems, not a final editorial endorsement of redesigned units.
library.scopeReview={status:'pending',reviewer:null,reviewedAt:null,evidence:'45 tópicos auditados no Anexo II; matriz incorporada de docs/content-review/LIBRARY_INDEPENDENT_REVIEW.md. Refinamento pedagógico integral e novo parecer de escopo pendentes; recortes parciais.'};
const simulations=await read(pack,'simulations.json'); simulations.generatedAt=new Date().toISOString();
simulations.simulations=[{id:'practice-curated-r2',type:'practice-set',title:'Treino revisado — '+questions.length+' questões originais (parcial)',examId:'tce-go-ti-2026',questionIds:questions.map(q=>q.id),questionCount:questions.length,pool:'curated-original-r2',selection:{method:'explicit-ids',seed:'curation-r2'},status:'validated',reviewStatus:'approved',note:'Não reproduz uma prova FCC e não atende à distribuição de um simulado completo.'}];
simulations.gaps=['Simulado completo indisponível: banco aprovado não cobre a distribuição do edital.'];
const coverage=await read(pack,'content-coverage.json'); coverage.generatedAt=new Date().toISOString();
coverage.coverageMethod='Contagem de itens aprovados disponíveis; não mede cobertura integral, mastery, XP ou score. LOW indica recortes parciais.';
for (const row of coverage.topics) {
 const qs=questions.filter(q=>q.topicIds.includes(row.topicId)), rs=resources.filter(r=>r.topicIds.includes(row.topicId)), cs=cards.filter(c=>c.topicIds.includes(row.topicId));
 Object.assign(row,{resourceCount:rs.length,videoCount:0,questionCount:qs.length,originalQuestionCount:qs.length,reviewQuestionCount:qs.length,flashcardCount:cs.length,presentInSimulation:qs.length>0,simulationIds:qs.length?['practice-curated-r2']:[],explanationPresent:qs.length>0&&qs.every(q=>q.explanation),coverageStatus:rs.length+qs.length+cs.length?'LOW':'EMPTY',exception:'Cobertura parcial. '+(!rs.length?'Sem recurso didático aprovado. ':'')+(!qs.length?'Sem questões aprovadas. ':'')+(!cs.length?'Sem flashcards aprovados. ':'')+'Todos os subitens exigem complemento e revisão.'});
}
const sourceMap=await read(pack,'source-map.json');
sourceMap.sources=sourceMap.sources.filter(s=>!sourceIds.has(s.id)).concat(sources.map(s=>({id:s.id,sourceType:s.type,title:s.title,url:s.url,file:null,retrievedAt:s.checkedAt.slice(0,10),locator:s.locator})));
await save(pack,'questions.json',questions);
const flashcards=await read(pack,'flashcards.json'); flashcards.cards=cards; flashcards.generatedAt=new Date().toISOString().slice(0,10); await save(pack,'flashcards.json',flashcards);
await save(pack,'resources.json',resources); await save(pack,'library.json',library); await save(pack,'simulations.json',simulations); await save(pack,'content-coverage.json',coverage); await save(pack,'source-map.json',sourceMap);
await save(dir,'CURATION_RESULT.json',{reviewedAt:new Date().toISOString(),questions:questions.length,cards:cards.length,resources:resources.length,legacyQuestions:history.questions.length,legacyCards:history.cards.length,gaps:coverage.topics.filter(t=>!t.questionCount||!t.resourceCount||!t.flashcardCount),rejected:[...(factual.rejected??[]),...(editorial.rejected??[])]});
await save(dir,'LEGACY_REVIEW.json',{reviewedAt:new Date().toISOString(),archive:'exam-packs/tce-go-ti-2026/content-history.json',archiveSha256:createHash('sha256').update(await readFile(new URL('content-history.json',pack))).digest('hex'),
 questions:history.questions.map(q=>({id:q.id,decision:q.id.includes('-o3-')?'rejected':'superseded',reason:q.id.includes('-o3-')?'Template sem problema disciplinar; identificador interno na resposta; distratores invariantes.':'Nova revisão factual e documental r2; texto histórico preservado.',evidence:'docs/content-review/QUESTIONS_INDEPENDENT_REVIEW.md'})),
 cards:history.cards.map(c=>({id:c.id,decision:'rejected',reason:'Resposta instrucional genérica, sem definição atômica verificável; edital não demonstra a resposta.',evidence:c.front+' / '+c.back})),
 resources:history.resources.map(r=>({id:r.id,decision:'retired_from_active_selection',reason:'Recurso legado sem mapeamento v2 e parecer; consultar classificação individual e novos recortes.',evidence:'docs/content-review/LIBRARY_INDEPENDENT_REVIEW.md'}))});
console.log(JSON.stringify({questions:questions.length,cards:cards.length,resources:resources.length}));
