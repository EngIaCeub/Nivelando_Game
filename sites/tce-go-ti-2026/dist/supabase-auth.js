const SESSION_KEY = 'studyos-auth-session-v1';

function sessionStore() {
  try { return globalThis.sessionStorage; } catch { return null; }
}
function readSession() {
  try { return JSON.parse(sessionStore()?.getItem(SESSION_KEY) ?? 'null'); } catch { return null; }
}
function saveSession(value) {
  const store = sessionStore();
  if (value) store?.setItem(SESSION_KEY, JSON.stringify(value));
  else store?.removeItem(SESSION_KEY);
}
function validUser(session) { return typeof session?.user?.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(session.user.id); }

export function createSupabaseAuth(config) {
  const configured = Boolean(config?.url && config?.publishableKey);
  const base = String(config?.url ?? '').replace(/\/$/, '');
  const headers = { apikey: config?.publishableKey ?? '', 'Content-Type': 'application/json' };
  async function request(path, body, token) {
    const response = await fetch(`${base}/auth/v1/${path}`, {
      method: 'POST', headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(payload.msg ?? payload.message ?? payload.error_description ?? 'Não foi possível autenticar. Confira os dados e tente novamente.'), { status: response.status });
    return payload;
  }
  return Object.freeze({
    configured,
    current() { return configured ? readSession() : null; },
    async register({ email, password, displayName }) {
      if (!configured) throw new Error('Login ainda não foi configurado para este site.');
      const callback = new URL(config.confirmationRedirect || './', location.href);
      callback.searchParams.set('auth_callback', '1');
      const redirect = encodeURIComponent(callback.href);
      const result = await request(`signup?redirect_to=${redirect}`, { email, password, data: { display_name: displayName } });
      if (result.access_token && result.user?.id) saveSession({ access_token: result.access_token, refresh_token: result.refresh_token, expires_at: Date.now() + Number(result.expires_in ?? 3600) * 1000, user: result.user });
      return result;
    },
    async signIn({ email, password }) {
      if (!configured) throw new Error('Login ainda não foi configurado para este site.');
      const result = await request('token?grant_type=password', { email, password });
      if (!result.access_token || !validUser(result)) throw new Error('A confirmação do e-mail é necessária antes de entrar.');
      const session = { access_token: result.access_token, refresh_token: result.refresh_token, expires_at: Date.now() + Number(result.expires_in ?? 3600) * 1000, user: result.user };
      saveSession(session);
      return session;
    },
    async recover(email) {
      if (!configured) throw new Error('Login ainda não foi configurado para este site.');
      const callback = new URL(config.recoveryRedirect || './', location.href);
      callback.searchParams.set('auth_callback', '1');
      const redirect = encodeURIComponent(callback.href);
      return request(`recover?redirect_to=${redirect}`, { email });
    },
    async consumeRedirect() {
      if (!configured) return null;
      const params = new URLSearchParams(location.hash.slice(1));
      const token = params.get('access_token');
      if (!token) return null;
      const response = await fetch(`${base}/auth/v1/user`, { headers: { apikey: headers.apikey, Authorization: `Bearer ${token}` } });
      const user = response.ok ? await response.json() : null;
      if (!user?.id) throw new Error('O link de acesso expirou. Solicite outro e tente novamente.');
      const session = { access_token: token, refresh_token: params.get('refresh_token') ?? '', expires_at: Date.now() + Number(params.get('expires_in') ?? 3600) * 1000, user };
      saveSession(session);
      history.replaceState(null, '', `${location.pathname}${location.search}#login`);
      return { session, type: params.get('type') };
    },
    async updatePassword(password) {
      const session = readSession();
      if (!session?.access_token) throw new Error('A sessão de recuperação expirou. Solicite outro link.');
      const response = await fetch(`${base}/auth/v1/user`, { method: 'PUT', headers: { ...headers, Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ password }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.msg ?? 'Não foi possível atualizar a senha.');
      saveSession(null);
      return payload;
    },
    async resume() {
      const session = configured ? readSession() : null;
      if (!validUser(session)) return null;
      if (!navigator.onLine) return session;
      try {
        if (session.expires_at > Date.now() + 60000) {
          const response = await fetch(`${base}/auth/v1/user`, { headers: { apikey: headers.apikey, Authorization: `Bearer ${session.access_token}` } });
          if (response.ok) { session.user = await response.json(); saveSession(session); return session; }
        }
        if (!session.refresh_token) throw new Error('A sessão expirou. Entre novamente.');
        const result = await request('token?grant_type=refresh_token', { refresh_token: session.refresh_token });
        const refreshed = { access_token: result.access_token, refresh_token: result.refresh_token, expires_at: Date.now() + Number(result.expires_in ?? 3600) * 1000, user: result.user ?? session.user };
        if (!refreshed.access_token || !validUser(refreshed)) throw new Error('A sessão expirou. Entre novamente.');
        saveSession(refreshed); return refreshed;
      } catch (error) {
        if (error.status === 400 || error.status === 401 || error.status === 403) { saveSession(null); throw error; }
        return session;
      }
    },
    async signOut() {
      const session = readSession();
      try { if (configured && session?.access_token && navigator.onLine) await request('logout', {}, session.access_token); } catch { /* Local sign-out must still revoke this browser session. */ }
      finally { saveSession(null); }
    }
  });
}
