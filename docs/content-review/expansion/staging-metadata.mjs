const methods = new Set(['HEAD', 'GET', 'browser']);
const results = new Set(['reachable', 'blocked', 'broken', 'unknown']);

/** Resolve source-review IDs to the canonical pack resource IDs in study paths. */
export function reconcileStudyPathResourceIds(studyPaths, resourceIdBySourceId) {
  return studyPaths.map(path => ({
    ...path,
    steps: path.steps.map(step => ({
      ...step,
      resourceId: resourceIdBySourceId.get(step.resourceId) ?? step.resourceId
    }))
  }));
}

/** Preserve an observed link check; otherwise represent availability as unknown. */
export function sourceVerification(source, previousResource = null) {
  const recorded = source.verification ?? previousResource?.verification ?? null;
  const checkedAt = recorded?.checkedAt ?? source.checkedAt ?? null;
  const finalUrl = recorded?.finalUrl ?? source.finalUrl ?? null;
  const method = recorded?.method ?? source.method;
  const observedReachability = recorded?.result === 'reachable' && checkedAt && finalUrl && methods.has(method);
  const rawResult = recorded?.result ?? source.result;
  const result = results.has(rawResult) ? rawResult : 'unknown';
  return {
    result: observedReachability ? 'reachable' : result === 'reachable' ? 'unknown' : result,
    checkedAt: checkedAt ? new Date(checkedAt).toISOString() : null,
    finalUrl: finalUrl && /^https?:\/\//.test(finalUrl) ? finalUrl : null,
    method: observedReachability ? method : 'unknown'
  };
}

/** Keep unrelated source-map records and refresh every staged resource locator. */
export function reconcileSourceMap(sourceMap, resources) {
  const priorSources = sourceMap.sources ?? [];
  const priorById = new Map(priorSources.map(source => [source.id, source]));
  const stagedIds = new Set(resources.map(resource => resource.id));
  return {
    ...sourceMap,
    sources: [
      ...priorSources.filter(source => !stagedIds.has(source.id)),
      ...resources.map(resource => ({
        ...(priorById.get(resource.id) ?? {}),
        id: resource.id,
        sourceType: resource.provenance.sourceType,
        title: resource.provenance.title,
        url: resource.provenance.url,
        retrievedAt: resource.provenance.retrievedAt,
        locator: resource.provenance.locator,
        file: priorById.get(resource.id)?.file ?? null
      }))
    ]
  };
}
