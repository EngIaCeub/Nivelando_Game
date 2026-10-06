const menuToggle = document.querySelector('#menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const startButton = document.querySelector('#start-button');
const sessionStatus = document.querySelector('#session-status');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  primaryNav?.classList.toggle('is-open', !isOpen);
});
startButton?.addEventListener('click', () => {
  if (sessionStatus) sessionStatus.textContent = 'Sessão pronta. Selecione um Exam Pack para carregar atividades.';
});

// pause() resolves after persistence commits and clears data-study-active.
let sessionGuard = null;
let updateRequested = false;
let reloadStarted = false;
const isStudyActive = () => document.documentElement.dataset.studyActive === 'true' || Boolean(sessionGuard?.isActive?.());
window.studyosUpdates = Object.freeze({
  setSessionGuard(guard) {
    if (guard !== null && (typeof guard?.pause !== 'function' || typeof guard?.isActive !== 'function')) throw new TypeError('session guard requires isActive() and async pause()');
    sessionGuard = guard;
  }
});
window.dispatchEvent(new CustomEvent('studyos:updates-ready'));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updateRequested && !reloadStarted) { reloadStarted = true; window.location.reload(); }
  });
  const base = new URL('./', import.meta.url);
  navigator.serviceWorker.register(new URL('sw.js', base).href, { scope: base.href, updateViaCache: 'none' }).then((registration) => {
    const showWaiting = () => {
      if (!registration.waiting) return;
      const banner = document.querySelector('#update-banner');
      if (!banner) return;
      banner.hidden = false;
      banner.replaceChildren();
      const message = document.createElement('span'); message.textContent = 'Nova versão disponível. ';
      const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Atualizar agora';
      button.addEventListener('click', async () => {
        if (updateRequested || button.disabled) return;
        button.disabled = true;
        try {
          if (isStudyActive()) {
            if (!window.confirm('Há uma sessão ativa. Pausar e salvar a sessão antes de atualizar?')) return;
            const pending = [];
            // Listeners synchronously register their persistence promises.
            document.dispatchEvent(new CustomEvent('studyos:before-update', { detail: { waitUntil: (promise) => pending.push(Promise.resolve(promise)) } }));
            if (sessionGuard) pending.push(Promise.resolve(sessionGuard.pause()));
            if (!pending.length) throw new Error('Pause a sessão e salve seu progresso antes de atualizar.');
            await Promise.all(pending);
            if (isStudyActive()) throw new Error('A sessão ainda está ativa. Conclua a pausa antes de atualizar.');
          }
          const worker = registration.waiting;
          if (!worker) { message.textContent = 'A atualização já foi aplicada. Reabra o aplicativo quando terminar a sessão.'; return; }
          updateRequested = true;
          worker.postMessage({ type: 'SKIP_WAITING' });
          message.textContent = 'Atualizando… ';
        } catch (error) {
          updateRequested = false;
          message.textContent = error.message + ' ';
        } finally { if (!updateRequested) button.disabled = false; }
      });
      banner.append(message, button);
    };
    const watchInstalling = () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed') showWaiting(); });
      showWaiting();
    };
    registration.addEventListener('updatefound', watchInstalling);
    watchInstalling();
  }).catch(() => {
    if (sessionStatus) sessionStatus.textContent = 'Modo offline indisponível neste contexto.';
  });
}
