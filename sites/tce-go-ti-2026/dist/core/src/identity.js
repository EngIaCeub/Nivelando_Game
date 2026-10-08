const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function ownerStorageName(examId, ownerId = null) {
  if (typeof examId !== 'string' || !/^[a-z0-9][a-z0-9-]*$/i.test(examId)) throw new TypeError('examId inválido');
  if (ownerId !== null && (typeof ownerId !== 'string' || !uuid.test(ownerId))) throw new TypeError('ownerId inválido');
  return ownerId ? `studyos-user-${ownerId}-v2` : `studyos-${examId}-v2`;
}
