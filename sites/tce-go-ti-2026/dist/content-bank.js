// History resolves existing session IDs only. New sessions receive active banks.
export function withHistoricalContent(active, history) {
  const byId = new Map();
  for (const item of [...active, ...history]) {
    if (byId.has(item.id)) throw new Error(`Identificador de conteúdo reutilizado: ${item.id}`);
    byId.set(item.id, item);
  }
  return [...byId.values()];
}
