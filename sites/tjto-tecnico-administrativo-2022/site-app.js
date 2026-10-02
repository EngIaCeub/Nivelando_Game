const packPath = './exam-pack';

async function loadJson(file) {
  const response = await fetch(`${packPath}/${file}`);
  if (!response.ok) throw new Error(`Exam Pack unavailable: ${file}`);
  return response.json();
}

const status = document.querySelector('#pack-status');
try {
  const [manifest, curriculum] = await Promise.all([loadJson('manifest.json'), loadJson('curriculum.json')]);
  status.textContent = `${manifest.title} · ${curriculum.disciplines.length} disciplinas · pack validated.`;
} catch (error) {
  status.textContent = `Falha ao carregar o Exam Pack: ${error.message}`;
}
