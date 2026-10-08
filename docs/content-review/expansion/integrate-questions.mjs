import { readFile, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root=new URL('./',import.meta.url),pack=new URL('../../../exam-packs/tce-go-ti-2026/',root);
const load=async(base,file)=>JSON.parse(await readFile(new URL(file,base),'utf8'));
const save=async(base,file,data)=>writeFile(new URL(file,base),JSON.stringify(data,null,2)+'\n');
const bytes=await readFile(new URL('QUESTIONS_DRAFT.json',root)),draft=JSON.parse(bytes),digest=createHash('sha256').update(bytes).digest('hex');
const reviews=await Promise.all(['LEGAL','TECH','LANGUAGE_SECURITY'].map(g=>load(root,g+'_QUESTIONS_REVIEW.json')));
for(const r of reviews)if(r.draftSha256?.toLowerCase()!==digest||!r.reviewer||!r.reviewedAt)throw new Error('Effective proposal needs matching independent reviews');
let baseline;
try{await access(new URL('BASELINE_PACK.json',root));baseline=await load(root,'BASELINE_PACK.json');}
catch(e){if(e.code!=='ENOENT')throw e;baseline=Object.fromEntries(await Promise.all(['manifest','curriculum','questions','resources','library','source-map','content-coverage','simulations'].map(async n=>[n,await load(pack,n+'.json')])));await save(root,'BASELINE_PACK.json',baseline);}
const pendingTopics=baseline['content-coverage'].topics.filter(t=>!t.questionCount).map(t=>t.topicId);
if(pendingTopics.length!==35)throw new Error('Expected frozen baseline of 35 empty topics');
const approved=new Map();
for(const review of reviews)for(const id of review.approvedQuestionIds){if(approved.has(id))throw new Error('Duplicated review ownership '+id);approved.set(id,review);}
const newQuestions=draft.filter(q=>approved.has(q.id)).map(q=>{
 const r=approved.get(q.id),refs=r.sourceRefsByQuestionId[q.id];if(!refs?.length||refs.some(ref=>!ref.url||!ref.locator))throw new Error('Missing factual evidence '+q.id);
 const application=new Set(['lp-texto','lp-sintaxe-redacao','mrl-aritmetica','mrl-proporcoes','mrl-logica','governanca-alinhamento','ingles-compreensao','ingles-documentacao']);
 const legal=q.topicIds.some(id=>id.startsWith('leginst-')||id.startsWith('legti-')||id==='governanca-publica');
 const {requestedEvidence,...content}=q;
 return {...content,status:'validated',reviewStatus:'approved',cognitiveLevel:application.has(q.topicIds[0])?'application':'understanding',validAsOf:legal?'2026-08-25':q.validAsOf,
 sourceRefs:refs,provenance:{...q.provenance,source:refs[0].title,url:refs[0].url,locator:refs[0].locator},
 editorialReview:{status:'approved',reviewer:r.reviewer,reviewedAt:new Date(r.reviewedAt).toISOString(),evidence:r.evidenceByQuestionId[q.id]}};
});
if(newQuestions.length!==35||pendingTopics.some(id=>!newQuestions.some(q=>q.topicIds.includes(id))))throw new Error('Every original gap requires a reviewed question');
const questions=[...baseline.questions,...newQuestions];
if(new Set(questions.map(q=>q.id)).size!==questions.length)throw new Error('ID reuse');
const coverage=structuredClone(baseline['content-coverage']);coverage.generatedAt=new Date().toISOString();
for(const row of coverage.topics){const selected=questions.filter(q=>q.topicIds.includes(row.topicId));row.questionCount=selected.length;row.originalQuestionCount=selected.length;row.reviewQuestionCount=selected.length;row.explanationPresent=selected.every(q=>q.explanation);row.coverageStatus='LOW';row.exception='Cobertura parcial: há questão original aprovada para o tópico; cobertura integral dos subitens e materiais segue em auditoria.';row.simulationIds=[...new Set([...row.simulationIds,'practice-expanded-45'])];row.presentInSimulation=true;}
const simulations=structuredClone(baseline.simulations);simulations.generatedAt=new Date().toISOString();
simulations.simulations.push({id:'practice-expanded-45',type:'practice-set',title:'Treino dos 45 tópicos — 45 questões originais',examId:'tce-go-ti-2026',pool:'expanded-original-45',questionIds:questions.map(q=>q.id),questionCount:questions.length,selection:{method:'explicit-ids',seed:'expanded-45'},status:'validated',reviewStatus:'approved',note:'Treino com pelo menos uma questão por tópico; não representa cobertura de todas as unidades nem simulado integral na distribuição oficial.'});
await save(pack,'questions.json',questions);await save(pack,'content-coverage.json',coverage);await save(pack,'simulations.json',simulations);
await save(root,'QUESTIONS_RESULT.json',{reviewedAt:new Date().toISOString(),draftSha256:digest,approvedNewQuestionIds:newQuestions.map(q=>q.id),activeQuestions:questions.length,topicsWithQuestions:coverage.topics.filter(t=>t.questionCount).length,reviewers:reviews.map(r=>r.reviewer),libraryStillUnderReview:true});
console.log(JSON.stringify({newQuestions:newQuestions.length,activeQuestions:questions.length,topics:45}));
