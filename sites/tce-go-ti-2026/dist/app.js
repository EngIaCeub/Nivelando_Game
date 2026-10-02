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
  sessionStatus.textContent = 'Sessão pronta. Selecione um Exam Pack para carregar atividades.';
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          const banner = document.querySelector('#update-banner');
          if (!banner) return;
          banner.hidden = false;
          banner.textContent = 'Nova versão disponível. ';
          const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Atualizar agora';
          button.addEventListener('click', () => window.location.reload());
          banner.append(button);
        }
      });
    });
  }).catch(() => {
    sessionStatus.textContent = 'Modo offline indisponível neste contexto.';
  });
}
