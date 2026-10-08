// Build a reviewable candidate. This script never writes the active Exam Pack.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { auditLibrary } from '../../../core/src/library-coverage.js';
import { reconcileSourceMap, reconcileStudyPathResourceIds, sourceVerification } from './staging-metadata.mjs';
const base=new URL('./',import.meta.url),packRoot=new URL('../../../exam-packs/tce-go-ti-2026/',base);
const load=async(root,name)=>JSON.parse(await readFile(new URL(name,root),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const draftBytes=await readFile(new URL('QUESTIONS_DRAFT.json',base)),draft=JSON.parse(draftBytes);
const sourceReviews=[],questionReviews=[];
for(const group of ['LEGAL','TECH','LANGUAGE_SECURITY']){
 const source=await load(base,group+'_SOURCES_REVIEW.json'),questions=await load(base,group+'_QUESTIONS_REVIEW.json');
 if(source.status==='in_progress'||!source.reviewer||!source.reviewedAt)throw new Error(group+': source review unfinished');
 if(questions.draftSha256?.toLowerCase()!==hash(draftBytes))throw new Error(group+': questions review differs from draft');
 const primaryFull=new Set(source.sources.flatMap(item=>item.coverage??[]).filter(mapping=>mapping.role==='primary'&&mapping.extent==='full').map(mapping=>mapping.unitId));
 const resourcesById=new Map(source.sources.map(item=>[item.id,item]));
 const pathClosures=new Set((source.studyPaths??[]).filter(path=>{
   const unit=source.proposedUnits.find(item=>item.id===path.unitId);
   if(!unit||path.editorialReview?.status!=='approved'||!path.editorialReview.reviewer||!path.editorialReview.reviewedAt)return false;
   if(!Array.isArray(path.steps)||path.steps.length<2||new Set(path.steps.map(step=>step.resourceId)).size<2)return false;
   const objectives=new Set();
   for(const step of path.steps){
     const resource=resourcesById.get(step.resourceId);
     if(!resource||!(resource.coverage??[]).some(mapping=>mapping.unitId===unit.id)||!step.objectiveIndices?.length)return false;
     for(const index of step.objectiveIndices){if(!Number.isInteger(index)||index<0||index>=unit.learningObjectives.length)return false;objectives.add(index);}
   }
   return objectives.size===unit.learningObjectives.length;
 }).map(path=>path.unitId));
 const declaredClosures=new Set((source.closedUnitIds??[]).map(item=>typeof item==='string'?item:item?.unitId).filter(Boolean));
 const uncovered=source.proposedUnits.filter(unit=>!primaryFull.has(unit.id)&&!pathClosures.has(unit.id)&&!declaredClosures.has(unit.id));
 const documented=new Set((source.gaps??[]).map(gap=>gap.unitId));
 if(uncovered.some(unit=>!documented.has(unit.id))) throw new Error(group+': every unit without primary/full needs a documented gap');
 for(const gap of source.gaps??[]) if(!gap.unitId||!Array.isArray(gap.missingObjectives)||!gap.missingObjectives.length) throw new Error(group+': gap needs unitId and missing objectives');
 sourceReviews.push(source);questionReviews.push(questions);
}
const supplemental=await load(base,'ROOT_SUPPLEMENTAL_REVIEW.json');
if(!supplemental.reviewer||!supplemental.reviewedAt||supplemental.status==='in_progress')throw new Error('Supplemental source review unfinished');
sourceReviews.push(supplemental);
const pack=Object.fromEntries(await Promise.all(['manifest','curriculum','resources','questions','library','source-map','content-coverage','simulations'].map(async name=>[name==='source-map'?'sourceMap':name,await load(packRoot,name+'.json')])));
const frozen=await load(base,'BASELINE_PACK.json');
const baseline={library:frozen.library,resources:frozen.resources,questions:frozen.questions};
const units=sourceReviews.flatMap(r=>r.proposedUnits).map(u=>({...u,syllabusRefs:u.syllabusRefs.map(ref=>({source:ref.source??ref.sourceId,locator:ref.locator}))}));
const studyPaths=sourceReviews.flatMap(r=>r.studyPaths??[]);
const topicIds=new Set(pack.curriculum.disciplines.flatMap(d=>d.modules.flatMap(m=>m.topics)).map(t=>t.id));
if(topicIds.size!==45||[...topicIds].some(id=>!units.some(u=>u.topicId===id)))throw new Error('Syllabus decomposition must include every original topic');
if(new Set(units.map(u=>u.id)).size!==units.length)throw new Error('Duplicate unit IDs');
const unitMap=new Map(units.map(u=>[u.id,u])),resources=[],resourceIdBySourceId=new Map();
for(const report of sourceReviews)for(const s of report.sources){
 if(s.status==='pending'||s.editorialReview?.status==='pending'||!s.coverage?.length)continue;
 if(s.access?.mode&&s.access.mode!=='free')continue;
 if(!s.evidence||!s.locator||!s.checkedAt||!s.url)throw new Error('Missing concrete source evidence '+s.id);
 const mappings=s.coverage.map(c=>({unitId:c.unitId,role:c.role==='supplementary'?'complementary':c.role,extent:c.extent,locator:c.locator}));
 if(mappings.some(c=>!unitMap.has(c.unitId)))throw new Error('Unknown unit in '+s.id);
 const previous=baseline.resources.find(r=>r.url===s.url);
 // Preserve distinct source records even when one review cites another URL in
 // its locator. A resource represents exactly one publication at exactly one URL.
 const id=previous?.id??resources.find(r=>r.url===s.url)?.id??s.id;
 resourceIdBySourceId.set(s.id,id);
 const type=({ legislation:'law', law:'law', documentation:'docs', document:'pdf',
   guide:'docs', specification:'docs', lesson:'course', lecture:'course',
   paper:'article', article:'article', book:'book', pdf:'pdf', video:'video', course:'course' })[s.type]??'other';
 const license=s.license??'unknown';
 const editorialReviewer=s.reviewer??report.reviewer;
 const editorialReviewedAt=s.reviewedAt??report.reviewedAt;
 const verification=sourceVerification(s,previous);
 const item={id,examId:pack.manifest.examId,libraryVersion:2,title:s.title,type,url:s.url,source:s.provider,provider:s.provider,authors:s.authors,language:s.language,difficulty:s.difficulty??'beginner',estimatedMinutes:null,
 topicIds:[...new Set(mappings.map(c=>unitMap.get(c.unitId).topicId))],status:verification.result==='broken'?'broken':'active',verified:verification.result==='reachable',verifiedAt:verification.result==='reachable'?verification.checkedAt:null,free:true,
 access:{mode:'free',requiresRegistration:false,notes:s.limitations??'Consulta externa requer internet; cobertura delimitada aos objetivos e recortes apresentados.'},
 rights:{license,delivery:'link',evidenceUrl:/^(unknown|desconhecida)/i.test(license)?null:s.rightsEvidenceUrl??s.url},
 verification,
 editorialReview:{status:'approved',reviewer:editorialReviewer,reviewedAt:new Date(editorialReviewedAt).toISOString(),evidence:s.evidence},coverage:mappings,
 provenance:{sourceType:s.type??'docs',title:s.title,url:s.url,retrievedAt:new Date(s.checkedAt).toISOString().slice(0,10),locator:s.locator}};
 const same=resources.find(r=>r.id===id);
 if(same){if(same.url!==item.url)throw new Error('Resource ID used for different URLs '+id);same.coverage.push(...mappings.filter(c=>!same.coverage.some(old=>JSON.stringify(old)===JSON.stringify(c))));same.topicIds=[...new Set([...same.topicIds,...item.topicIds])];same.editorialReview.evidence+='; '+s.evidence;if(!same.editorialReview.reviewer.includes(editorialReviewer))same.editorialReview.reviewer+='; '+editorialReviewer;}
 else resources.push(item);
}
const approved=new Map();
for(const review of questionReviews)for(const id of review.approvedQuestionIds){
 if(approved.has(id))throw new Error('Duplicate question verdict '+id);approved.set(id,review);
}
const questions=draft.filter(q=>approved.has(q.id)).map(q=>{
 const review=approved.get(q.id),refs=review.sourceRefsByQuestionId[q.id];
 if(!refs?.length||refs.some(r=>!r.url||!r.locator))throw new Error('Question lacks approved source recorte '+q.id);
 const applied=new Set(['mrl-aritmetica','mrl-proporcoes','mrl-logica','lp-texto','lp-sintaxe-redacao','governanca-alinhamento','ingles-compreensao','ingles-documentacao']);
 const legal=q.topicIds.some(id=>id.startsWith('leginst-')||id.startsWith('legti-')||id==='governanca-publica');
 const {requestedEvidence,...content}=q;
 return {...content,cognitiveLevel:applied.has(q.topicIds[0])?'application':'understanding',validAsOf:legal?'2026-08-25':q.validAsOf,status:'validated',reviewStatus:'approved',sourceRefs:refs,provenance:{...q.provenance,source:refs[0].title,url:refs[0].url,locator:refs[0].locator},editorialReview:{status:'approved',reviewer:review.reviewer,reviewedAt:new Date(review.reviewedAt).toISOString(),evidence:review.evidenceByQuestionId[q.id]}};
});
const originalGaps=baseline['questions'].length===10? [...topicIds].filter(id=>!baseline.questions.some(q=>q.topicIds.includes(id))):[];
if(originalGaps.length!==35||originalGaps.some(id=>!questions.some(q=>q.topicIds.includes(id))))throw new Error('All 35 originally empty topics require independently approved questions');
// Questions were promoted in an earlier, independently reviewed operation. A
// source-review refresh may add useful references, but may never rewrite the
// approved active question payload during library staging.
const activeQuestionIds=new Set(pack.questions.map(question=>question.id));
if(activeQuestionIds.size!==pack.questions.length||questions.some(question=>!activeQuestionIds.has(question.id))||pack.questions.length!==baseline.questions.length+questions.length) throw new Error('Staging must preserve the exact approved active question bank');
// Only resources whose exact URL was observed reachable can enter the active
// release inventory. Keep every other reviewed record in the staging candidate
// queue so it remains reviewable without being presented as a released link.
const activeResources=resources.filter(resource=>resource.verification.result==='reachable');
const resourceCandidates=resources.filter(resource=>resource.verification.result!=='reachable');
const activeResourceIds=new Set(activeResources.map(resource=>resource.id));
const reconciledStudyPaths=reconcileStudyPathResourceIds(studyPaths,resourceIdBySourceId);
pack.resources=activeResources;
const reviewDate=new Date().toISOString();
pack.library={...pack.library,units,studyPaths:reconciledStudyPaths.filter(path=>path.steps.every(step=>activeResourceIds.has(step.resourceId))),status:'partial',scopeReview:{status:'reviewed',reviewer:sourceReviews.map(r=>r.reviewer).join('; '),reviewedAt:reviewDate,evidence:'Anexo II p19–22 decomposto por subitem em três pareceres de domínio em docs/content-review/expansion; QA final de integração separado.'}};
const closedUnitIds=new Set(sourceReviews.flatMap(r=>r.closedUnitIds??[]));
const gaps=sourceReviews.flatMap(r=>r.gaps??[]).filter(gap=>!closedUnitIds.has(gap.unitId));
pack.sourceMap=reconcileSourceMap(pack.sourceMap,activeResources);
const audit=auditLibrary(pack);if(audit.errors.length)throw new Error(audit.errors.join('; '));
const effectiveGaps=[...gaps];
for(const unitId of audit.uncoveredUnitIds)if(!effectiveGaps.some(gap=>gap.unitId===unitId)){
 const unit=unitMap.get(unitId);
 effectiveGaps.push({unitId,missingObjectives:unit.learningObjectives,evidence:'Reaberta automaticamente: fontes associadas não têm verificação de acesso elegível ou cobertura primária suficiente no candidato gerado.'});
}
if(gaps.some(gap=>!audit.uncoveredUnitIds.includes(gap.unitId)))throw new Error('A documented open gap is already covered; reconcile its decision: '+gaps.find(gap=>!audit.uncoveredUnitIds.includes(gap.unitId)).unitId);
// Complete is proposed only with coverage for every unit and no editorial gap.
if(audit.isComplete&&!effectiveGaps.length)pack.library.status='complete';
const staged={schemaVersion:1,createdAt:reviewDate,draftSha256:hash(draftBytes),pack,resourceCandidates,baseline,gaps:effectiveGaps,libraryAudit:audit,approvedNewQuestions:questions.length};
await writeFile(new URL('STAGED_PACK.json',base),JSON.stringify(staged,null,2)+'\n');
console.log(JSON.stringify({units:units.length,resources:activeResources.length,resourceCandidates:resourceCandidates.length,newQuestions:questions.length,libraryStatus:pack.library.status,gaps:effectiveGaps.length,coveredUnits:audit.totals.coveredUnits}));
