// Reconcile candidate, gap ledger, and QA gate without changing active pack data.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const base = new URL('./', import.meta.url);
const packRoot = new URL('../../../exam-packs/tce-go-ti-2026/', base);
const read = async (root, name) => JSON.parse(await readFile(new URL(name, root), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const save = async (name, value) => writeFile(new URL(name, base), JSON.stringify(value, null, 2) + '\n');
const stagedBytes = await readFile(new URL('STAGED_PACK.json', base));
const staged = JSON.parse(stagedBytes);
const candidateSha256 = hash(stagedBytes);
const previousQa = await read(base, 'INTEGRATION_QA.json');
const priorApprovals = [...(previousQa.priorApprovals ?? [])];
const priorReviews = [...(previousQa.priorReviews ?? [])];
if (previousQa.stagedSha256 && previousQa.stagedSha256 !== candidateSha256 &&
    !priorReviews.some(review => review.stagedSha256 === previousQa.stagedSha256)) {
  priorReviews.push({ status: previousQa.status, reviewer: previousQa.reviewer ?? null,
    reviewedAt: previousQa.reviewedAt ?? null, stagedSha256: previousQa.stagedSha256,
    completeApproved: previousQa.completeApproved === true, evidence: previousQa.evidence ?? null });
}
if (previousQa.status === 'approved' && previousQa.stagedSha256 !== candidateSha256) {
  priorApprovals.push({
    status: previousQa.status,
    reviewer: previousQa.reviewer,
    reviewedAt: previousQa.reviewedAt,
    stagedSha256: previousQa.stagedSha256,
    completeApproved: previousQa.completeApproved,
    evidence: previousQa.evidence
  });
}
const totals = staged.libraryAudit.totals;
await save('INTEGRATION_QA.json', {
  status: 'pending',
  reviewer: null,
  reviewedAt: null,
  stagedSha256: candidateSha256,
  completeApproved: false,
  evidence: 'Candidate regenerated from reviewed domain-source inputs. Structural validation is recorded separately. Independent integration QA of this exact SHA-256 has not been performed; do not promote or treat the candidate as release-approved.',
  checks: {
    candidateStatus: staged.pack.library.status,
    units: staged.pack.library.units.length,
    coveredUnits: totals.coveredUnits,
    uncoveredUnits: staged.libraryAudit.uncoveredUnitIds.length,
    documentedGaps: staged.gaps.length,
    resources: staged.pack.resources.length,
    studyPaths: staged.libraryAudit.pathResults.length,
    questions: staged.pack.questions.length
  },
  priorApprovals,
  priorReviews
});

const previousLedger = await read(base, 'GAP_LEDGER.json');
const previousBaseline = await read(base, 'CURATION_BASELINE_2026-10-08.json');
const openGaps = staged.gaps.map(gap => ({
  ...gap,
  topicId: staged.pack.library.units.find(unit => unit.id === gap.unitId)?.topicId ?? null
}));
await save('GAP_LEDGER.json', {
  schemaVersion: 1,
  candidateSha256,
  generatedAt: staged.createdAt,
  coveredUnits: totals.coveredUnits,
  totalUnits: staged.pack.library.units.length,
  count: openGaps.length,
  openCount: openGaps.length,
  entries: openGaps,
  priorSnapshot: {
    candidateSha256: previousLedger.candidateSha256,
    generatedAt: previousLedger.generatedAt,
    openCount: previousLedger.openCount,
    entries: previousLedger.entries
  }
});

const activeFiles = ['library', 'resources', 'questions', 'flashcards'];
const activeHashes = Object.fromEntries(await Promise.all(activeFiles.map(async name => [
  name + 'Sha256', hash(await readFile(new URL(name + '.json', packRoot)))
])));
const sourceGroups = ['LEGAL', 'TECH', 'LANGUAGE_SECURITY'];
const sourceReviewHashes = Object.fromEntries(await Promise.all(sourceGroups.map(async group => [
  group,
  hash(await readFile(new URL(group + '_SOURCES_REVIEW.json', base)))
])));
await save('CURATION_BASELINE_2026-10-08.json', {
  schemaVersion: 1,
  capturedAt: staged.createdAt,
  examId: staged.pack.manifest.examId,
  candidate: {
    file: 'STAGED_PACK.json',
    sha256: candidateSha256,
    status: staged.pack.library.status,
    coveredUnits: totals.coveredUnits,
    totalUnits: staged.pack.library.units.length,
    gaps: staged.gaps.length,
    resources: staged.pack.resources.length,
    questions: staged.pack.questions.length,
    studyPaths: staged.libraryAudit.pathResults.length
  },
  active: {
    ...activeHashes,
    libraryStatus: (await read(packRoot, 'library.json')).status,
    questionCount: (await read(packRoot, 'questions.json')).length,
    flashcardCount: (await read(packRoot, 'flashcards.json')).cards.length,
    resourceCount: (await read(packRoot, 'resources.json')).length
  },
  qa: { status: 'pending', candidateSha256, completeApproved: false, reviewer: null },
  sourceReviewHashes,
  priorSnapshot: {
    candidateSha256: previousBaseline.candidate?.sha256,
    coveredUnits: previousBaseline.candidate?.coveredUnits,
    gaps: previousBaseline.candidate?.gaps,
    resources: previousBaseline.candidate?.resources,
    capturedAt: previousBaseline.capturedAt
  }
});
console.log(JSON.stringify({ candidateSha256, coveredUnits: totals.coveredUnits, totalUnits: staged.pack.library.units.length,
  openGaps: openGaps.length, resources: staged.pack.resources.length, active: activeHashes, qaStatus: 'pending' }));
