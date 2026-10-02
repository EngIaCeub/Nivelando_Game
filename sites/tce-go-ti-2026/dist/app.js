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
  navigator.serviceWorker.register('./sw.js').catch(() => {
    sessionStatus.textContent = 'Modo offline indisponível neste contexto.';
  });
}
