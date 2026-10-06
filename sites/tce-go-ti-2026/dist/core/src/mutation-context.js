// Tokens are capabilities, not flags on an engine/store. Only this module can
// issue one, and its lifetime is exactly the awaited lock callback.
const contexts = new WeakMap();

export function requireMutationContext(store, context) {
  const operation = context && contexts.get(context);
  if (!operation || operation.store !== store || !operation.active) {
    throw new Error('Contexto de mutação inválido, expirado ou de outro armazenamento.');
  }
  return context;
}

export async function runMutation(store, context, work) {
  if (typeof work !== 'function') throw new TypeError('mutation callback is required');
  if (context !== undefined && context !== null) {
    requireMutationContext(store, context);
    return work(context);
  }
  if (typeof store?.withExclusiveMutation !== 'function') {
    throw new Error('Armazenamento não suporta coordenação segura de mutações.');
  }
  return store.withExclusiveMutation(async () => {
    const token = Object.freeze(Object.create(null));
    const operation = { store, active: true };
    contexts.set(token, operation);
    try { return await work(token); }
    finally { operation.active = false; }
  }, { requireCrossContext: true });
}
