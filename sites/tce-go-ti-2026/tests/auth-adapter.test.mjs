import test from 'node:test';
import assert from 'node:assert/strict';
import { createSupabaseAuth } from '../supabase-auth.js';

test('Supabase auth keeps credentials out of browser storage and supports account lifecycle', async () => {
  const original = { fetch: globalThis.fetch, sessionStorage: globalThis.sessionStorage, location: globalThis.location, navigator: globalThis.navigator };
  const memory = new Map();
  const calls = [];
  const id = '2f0c5427-a58b-4cee-ae97-4bc9fdf2de31';
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) } });
  Object.defineProperty(globalThis, 'location', { configurable: true, value: { href: 'https://example.test/StudyOS/', pathname: '/StudyOS/', search: '', hash: '' } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    let body = {};
    if (String(url).includes('grant_type=password')) body = { access_token: 'access', refresh_token: 'refresh', expires_in: 3600, user: { id, email: 'learner@example.test' } };
    else if (String(url).endsWith('/auth/v1/user')) body = { id, email: 'learner@example.test' };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const auth = createSupabaseAuth({ url: 'https://project.supabase.co', publishableKey: 'sb_publishable_public_only' });
    assert.equal(auth.configured, true);
    const session = await auth.signIn({ email: 'learner@example.test', password: 'private-password' });
    assert.equal(session.user.id, id);
    assert.equal(auth.current().access_token, 'access');
    assert.equal(JSON.stringify([...memory]), JSON.stringify([['studyos-auth-session-v1', JSON.stringify(auth.current())]]));
    assert.equal(JSON.stringify([...memory]).includes('private-password'), false);
    assert.equal(calls[0].options.headers.apikey, 'sb_publishable_public_only');
    assert.equal(calls[0].options.headers.Authorization, undefined);
    assert.equal((await auth.resume()).user.id, id);
    await auth.signOut();
    assert.equal(auth.current(), null);
  } finally {
    globalThis.fetch = original.fetch;
    for (const [key, value] of Object.entries(original)) if (key !== 'fetch') {
      if (value === undefined) delete globalThis[key]; else Object.defineProperty(globalThis, key, { configurable: true, value });
    }
  }
});

test('account forms fail closed when the site has no auth provider configuration', async () => {
  const auth = createSupabaseAuth({});
  assert.equal(auth.configured, false);
  await assert.rejects(auth.signIn({ email: 'x@example.test', password: 'password123' }), /não foi configurado/);
});
