import test from 'node:test';
import assert from 'node:assert/strict';
import { createSupabaseWorkspaceSync } from '../supabase-sync.js';

const config = { url: 'https://studyos.example', publishableKey: 'public-key' };
const userId = '123e4567-e89b-42d3-a456-426614174000';

test('workspace load scopes the query to the authenticated owner', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify([{ revision: 4, payload: { schemaVersion: 1 } }]), { status: 200 });
  };
  const sync = createSupabaseWorkspaceSync({ config, userId, accessToken: () => 'access-token' });
  assert.deepEqual(await sync.load(), { revision: 4, payload: { schemaVersion: 1 } });
  assert.match(request.url, /user_id=eq\./);
  assert.match(request.url, new RegExp(userId));
  assert.equal(request.options.headers.Authorization, 'Bearer access-token');
  assert.equal(request.options.headers.apikey, 'public-key');
});

test('workspace commit sends revision, idempotency id, and snapshot through the RPC', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify({ revision: 5, replayed: false }), { status: 200 });
  };
  const sync = createSupabaseWorkspaceSync({ config, userId, accessToken: 'access-token' });
  const operation = { expectedRevision: 4, operationId: '223e4567-e89b-42d3-a456-426614174000', payload: { schemaVersion: 1, exams: {}, globalData: { version: 1, records: [] } } };
  assert.deepEqual(await sync.commit(operation), { revision: 5, replayed: false });
  assert.equal(request.url, 'https://studyos.example/rest/v1/rpc/commit_studyos_workspace');
  assert.deepEqual(JSON.parse(request.options.body), { expected_revision: 4, operation_id: operation.operationId, workspace_payload: operation.payload });
});

test('workspace errors preserve PostgREST error codes for conflict handling', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => new Response(JSON.stringify({ code: '40001', message: 'workspace revision conflict' }), { status: 400 });
  const sync = createSupabaseWorkspaceSync({ config, userId, accessToken: 'access-token' });
  await assert.rejects(sync.commit({ expectedRevision: 0, operationId: crypto.randomUUID(), payload: {} }), error => error.payload?.code === '40001');
});
