export function createSupabaseWorkspaceSync({ config, userId, accessToken }) {
  const base = String(config?.url ?? '').replace(/\/$/, '');
  if (!base || !config?.publishableKey || !userId || !accessToken) throw new TypeError('Sync de conta não configurada.');
  const token = typeof accessToken === 'function' ? accessToken : () => accessToken;
  const headers = () => ({ apikey: config.publishableKey, Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });
  async function request(url, options) {
    const response = await fetch(url, options);
    const text = await response.text();
    let payload;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
    if (!response.ok) throw Object.assign(new Error(payload?.message ?? payload?.details ?? 'Não foi possível sincronizar agora.'), { status: response.status, payload });
    return payload;
  }
  return Object.freeze({
    async load() {
      const query = new URLSearchParams({ select: 'revision,payload', user_id: `eq.${userId}`, limit: '1' });
      const rows = await request(`${base}/rest/v1/user_workspaces?${query}`, { headers: headers() });
      if (!Array.isArray(rows) || rows.length > 1) throw new Error('Resposta de workspace inválida.');
      return rows[0] ?? null;
    },
    async commit({ expectedRevision, operationId, payload }) {
      return request(`${base}/rest/v1/rpc/commit_studyos_workspace`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ expected_revision: expectedRevision, operation_id: operationId, workspace_payload: payload })
      });
    }
  });
}
