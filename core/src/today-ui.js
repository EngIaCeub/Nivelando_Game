export class TodayDashboard {
  #root;
  #onStart;
  #onMinutes;
  #onExtra;
  constructor({ root, onStart = () => {}, onMinutes = () => {}, onExtra = () => {} }) {
    if (!root) throw new TypeError('root is required');
    this.#root = root; this.#onStart = onStart; this.#onMinutes = onMinutes; this.#onExtra = onExtra;
  }
  render({ exam = {}, plan, summary = {}, weekly = {}, metrics = {}, streak = 0, xp = 0, availableMinutes = 120 }) {
    this.#root.replaceChildren();
    const title = document.createElement('h2'); title.textContent = exam.title ?? 'Hoje'; this.#root.append(title);
    if (exam.examDate) { const countdown = document.createElement('p'); const days = Math.max(0, Math.ceil((Date.parse(exam.examDate) - Date.now()) / 86_400_000)); countdown.textContent = `Prova em ${days} dias`; this.#root.append(countdown); }
    const goal = document.createElement('p'); goal.textContent = `Meta diária: ${availableMinutes} min · ${summary.completedMinutes ?? 0} / ${availableMinutes} min`; this.#root.append(goal);
    const progress = document.createElement('progress'); progress.max = availableMinutes; progress.value = Math.min(availableMinutes, summary.completedMinutes ?? 0); progress.setAttribute('aria-label', 'Progresso de estudo de hoje'); this.#root.append(progress);
    const next = plan?.activities?.find((activity) => activity.status !== 'completed');
    if (next) {
      const card = document.createElement('article'); card.className = 'today-next card';
      const heading = document.createElement('h3'); heading.textContent = 'Próxima atividade';
      const name = document.createElement('p'); name.textContent = `${next.type}: ${next.topicId ?? 'atividade'} — ${next.estimatedMinutes} min`;
      const reason = document.createElement('p'); reason.textContent = next.reason;
      const button = document.createElement('button'); button.type = 'button'; button.textContent = 'COMEÇAR'; button.addEventListener('click', () => this.#onStart(next));
      card.append(heading, name, reason, button); this.#root.append(card);
    } else { const done = document.createElement('p'); done.textContent = 'Meta diária concluída.'; const extra = document.createElement('button'); extra.type = 'button'; extra.textContent = 'ESTUDAR MAIS'; extra.addEventListener('click', () => this.#onExtra()); this.#root.append(done, extra); }
    const list = document.createElement('ol'); list.setAttribute('aria-label', 'Agenda de hoje');
    for (const activity of plan?.activities ?? []) { const item = document.createElement('li'); item.textContent = `${activity.topicId ?? activity.type} — ${activity.estimatedMinutes} min · ${activity.status}`; list.append(item); }
    this.#root.append(list);
    const settings = document.createElement('label'); settings.textContent = 'Hoje tenho: '; const select = document.createElement('select'); select.setAttribute('aria-label', 'Minutos disponíveis hoje');
    for (const minutes of [30, 60, 90, 120]) { const option = new Option(`${minutes} min`, String(minutes), false, minutes === availableMinutes); select.add(option); }
    select.add(new Option('Personalizado', 'custom')); select.addEventListener('change', () => { if (select.value !== 'custom') this.#onMinutes(Number(select.value)); }); settings.append(select); this.#root.append(settings);
    const custom = document.createElement('input'); custom.type = 'number'; custom.min = '1'; custom.max = '720'; custom.placeholder = 'minutos'; custom.setAttribute('aria-label', 'Minutos personalizados'); custom.hidden = true;
    const apply = document.createElement('button'); apply.type = 'button'; apply.textContent = 'Aplicar'; apply.hidden = true; apply.addEventListener('click', () => { if (Number(custom.value) > 0) this.#onMinutes(Number(custom.value)); });
    select.addEventListener('change', () => { custom.hidden = select.value !== 'custom'; apply.hidden = custom.hidden; }); settings.append(custom, apply); this.#root.append(settings);
    const metricsText = document.createElement('p'); metricsText.textContent = `Sequência: ${streak} dias · XP: ${xp} · Cobertura: ${Math.round((metrics.coverage?.rate ?? 0) * 100)}% · Mastery médio: ${metrics.mastery?.average == null ? 'n/d' : `${Math.round(metrics.mastery.average * 100)}%`}`; this.#root.append(metricsText);
    const week = document.createElement('details'); const summaryNode = document.createElement('summary'); summaryNode.textContent = 'Semana'; const weekText = document.createElement('p'); weekText.textContent = `${weekly.completedMinutes ?? 0} / ${weekly.plannedMinutes ?? 0} min realizados · ${weekly.questionActivities ?? 0} atividades de questões · ${weekly.reviewActivities ?? 0} revisões`; week.append(summaryNode, weekText); this.#root.append(week);
  }
}

