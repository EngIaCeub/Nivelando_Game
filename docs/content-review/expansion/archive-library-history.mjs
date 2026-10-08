import { createHash } from 'node:crypto';

const fingerprint = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Append the currently active library snapshot while preserving all prior history. */
export function appendLibrarySnapshot(history, activeSnapshot) {
  const existing = history?.snapshots ?? (history?.library || history?.resources ? [{
    archivedAt: history.archivedAt ?? null,
    reason: history.reason ?? 'Legacy library archive preserved during history migration.',
    library: history.library ?? null,
    resources: history.resources ?? [],
    activeStateSha256: null
  }] : []);
  const state = { library: activeSnapshot.library, resources: activeSnapshot.resources };
  const stateSha256 = fingerprint(state);
  if (existing.some(item => item.activeStateSha256 === stateSha256)) {
    return { changed: false, history };
  }

  const snapshot = {
    ...activeSnapshot,
    activeStateSha256: stateSha256,
    resources: activeSnapshot.resources.map(resource => ({ ...resource, status: 'archived' }))
  };
  const next = {
    ...(history ?? {}),
    schemaVersion: 2,
    examId: activeSnapshot.examId ?? history?.examId,
    archivedAt: snapshot.archivedAt,
    reason: snapshot.reason,
    library: snapshot.library,
    resources: snapshot.resources,
    snapshots: [...existing, snapshot]
  };
  return { changed: true, history: next };
}
