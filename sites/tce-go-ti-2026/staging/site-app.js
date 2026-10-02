const status = document.querySelector('#pack-status');
const subjects = document.querySelector('#subjects p');

async function loadPack() {
  try {
    const [manifest, curriculum] = await Promise.all([
      fetch('./exam-pack/manifest.json').then((response) => response.json()),
      fetch('./exam-pack/curriculum.json').then((response) => response.json())
    ]);
    document.title = `StudyOS — ${manifest.title}`;
    status.textContent = `${manifest.title} · prova prevista em ${manifest.examDate} · pacote ${manifest.status}.`;
    subjects.textContent = `${curriculum.disciplines.length} disciplinas carregadas. Escolha uma atividade no plano para começar.`;
  } catch {
    status.textContent = 'Não foi possível carregar o Exam Pack neste momento.';
  }
}

loadPack();
