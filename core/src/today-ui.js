import { PixelBadge, PixelButton, PixelMeter, PixelPanel, PixelProgress, PixelStat, PixelWorldTile } from './pixel-ui.js';

const ACTIVITY_LABELS = Object.freeze({
  theory: 'Leitura guiada', questions: 'Questões', review: 'Revisão vencida',
  error_review: 'Revisão de erros', simulation: 'Simulado', reading: 'Leitura',
  diagnostic_check: 'Diagnóstico'
});
const STATUS_LABELS = Object.freeze({ planned: 'Planejada', in_progress: 'Em andamento', paused: 'Pausada', completed: 'Concluída', skipped: 'Ignorada' });

const make = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
};

export class TodayDashboard {
  #root;
  #onStart;
  #onMinutes;
  #onExtra;
  #onLibrary;
  constructor({ root, onStart = () => {}, onMinutes = () => {}, onExtra = () => {}, onLibrary = null }) {
    if (!root) throw new TypeError('root is required');
    this.#root = root; this.#onStart = onStart; this.#onMinutes = onMinutes; this.#onExtra = onExtra;
    this.#onLibrary = onLibrary;
  }
  render({ exam = {}, plan, summary = {}, weekly = {}, metrics = {}, streak = 0, xp = 0, availableMinutes = 120, topics = [], mode = 'today', resourceTopicIds = [] }) {
    this.#root.replaceChildren();
    const isPlan = mode === 'plan';
    const heading = make(isPlan ? 'h3' : 'h2', 'today-heading', isPlan ? 'O que estudar hoje' : 'Sua agenda de hoje');
    this.#root.append(heading);

    const hud = make('div', 'pixel-grid pixel-grid--stats today-hud');
    const safeXp = Math.max(0, Number(xp) || 0);
    const level = Math.floor(safeXp / 100) + 1;
    const levelProgress = safeXp % 100;
    const xpPanel = PixelPanel({ className: 'pixel-panel--compact', children: [
      make('h3', '', 'Experiência'),
      PixelBadge(`Nível ${level}`, 'info'),
      PixelProgress({ label: `${safeXp} XP · próximo nível`, current: levelProgress, max: 100, valueText: `${levelProgress}/100 XP` })
    ] });
    const mastery = metrics.mastery?.average;
    const masteryValue = mastery == null ? null : Math.round(Math.min(1, Math.max(0, Number(mastery))) * 100);
    const masteryPanel = PixelPanel({ className: 'pixel-panel--compact', children: [
      make('h3', '', 'Domínio médio'),
      PixelMeter({ label: 'Domínio estimado', value: masteryValue, state: masteryValue == null ? 'unknown' : masteryValue >= 80 ? 'mastered' : masteryValue >= 50 ? 'reviewing' : 'learning', valueText: masteryValue == null ? 'Sem dados ainda' : `${masteryValue}%` })
    ] });
    const streakPanel = PixelStat({ label: 'Sequência de estudo', value: `${Math.max(0, Number(streak) || 0)} dias` });
    hud.append(xpPanel, masteryPanel, streakPanel);

    if (exam.examDate) {
      const days = Math.max(0, Math.ceil((Date.parse(exam.examDate) - Date.now()) / 86_400_000));
      this.#root.append(PixelBadge(`Prova em ${days} dias`, 'warning'));
    }

    const currentMinutes = Math.max(0, Number(summary.completedMinutes) || 0);
    const dailyGoal = Math.max(0, Number(availableMinutes) || 0);
    const goalPanel = PixelPanel({ className: 'pixel-panel--compact today-goal', children: [
      make('h3', '', `Meta diária: ${dailyGoal} min`),
      PixelProgress({ label: 'Tempo de estudo', current: currentMinutes, max: dailyGoal, valueText: `${currentMinutes} / ${dailyGoal} min` })
    ] });

    const activityList = make('ol', 'pixel-quest-list');
    activityList.setAttribute('aria-label', 'Agenda de hoje');
    const topicTitles = new Map(topics.map((topic) => [topic.id, topic.displayTitle ?? topic.title ?? topic.id]));
    const fullTitles = new Map(topics.map(topic => [topic.id, topic.title]));
    for (const activity of plan?.activities ?? []) {
      const item = make('li', `pixel-quest${activity.status === 'completed' ? ' pixel-quest--completed' : ['in_progress', 'paused'].includes(activity.status) ? ' pixel-quest--active' : ''}`);
      const content = make('div');
      const topic = activity.topicId ? topicTitles.get(activity.topicId) ?? activity.topicId : 'Estudo do dia';
      const activityLabel = ACTIVITY_LABELS[activity.type] ?? activity.type;
      content.append(make('p', 'pixel-quest__name', topic));
      if (fullTitles.get(activity.topicId) && fullTitles.get(activity.topicId) !== topic) { const detail = make('details', 'quest-reason'); detail.append(make('summary', '', 'Conteúdo completo'), make('p', '', fullTitles.get(activity.topicId))); content.append(detail); }
      content.append(make('p', 'pixel-quest__meta', `${activityLabel} · ${activity.estimatedMinutes} min`));
      if (activity.reason) { const details = make('details', 'quest-reason'); details.append(make('summary', '', 'Por que estudar agora?'), make('p', 'pixel-quest__meta', activity.reason)); content.append(details); }
      const statusTone = activity.status === 'completed' ? 'success' : ['in_progress', 'paused'].includes(activity.status) ? 'info' : 'neutral';
      item.append(content, PixelBadge(STATUS_LABELS[activity.status] ?? activity.status, statusTone));
      if (isPlan) {
        if (!['completed', 'skipped'].includes(activity.status)) item.append(PixelButton({ label: ['paused', 'in_progress'].includes(activity.status) ? 'Retomar atividade' : 'Iniciar atividade', onClick: () => this.#onStart(activity) }));
        if (this.#onLibrary && activity.topicId) content.append(PixelButton({ label: resourceTopicIds.includes(activity.topicId) ? 'Ver materiais' : 'Consultar lacuna de material', variant: 'secondary', onClick: () => this.#onLibrary(activity.topicId) }));
        if (['theory', 'reading'].includes(activity.type) && !resourceTopicIds.includes(activity.topicId)) content.append(make('p', 'pixel-quest__meta', 'Sem material associado neste catálogo. Consulte a biblioteca para ver a lacuna.'));
      }
      activityList.append(item);
    }

    const next = plan?.activities?.find((activity) => activity.status !== 'completed' && activity.status !== 'skipped');
    if (next) {
      const topic = next.topicId ? topicTitles.get(next.topicId) ?? next.topicId : 'atividade de hoje';
      const heading = make('h3', 'eyebrow', ['paused', 'in_progress'].includes(next.status) ? 'Atividade pendente' : 'Próximo passo');
      const card = PixelPanel({ className: 'today-next pixel-panel--selected', children: [
        heading,
        make('p', 'today-next__topic', topic),
        ...(fullTitles.get(next.topicId) && fullTitles.get(next.topicId) !== topic ? [(() => { const detail = make('details', 'quest-reason'); detail.append(make('summary', '', 'Conteúdo completo'), make('p', '', fullTitles.get(next.topicId))); return detail; })()] : []),
        make('p', 'today-next__meta', `${ACTIVITY_LABELS[next.type] ?? next.type} · estimativa de ${next.estimatedMinutes} min`),
        ...(next.reason ? [(() => { const detail = make('details', 'quest-reason'); detail.append(make('summary', '', 'Por que estudar agora?'), make('p', '', next.reason)); return detail; })()] : []),
        PixelButton({ label: isPlan && ['paused', 'in_progress'].includes(next.status) ? 'RETOMAR' : 'COMEÇAR', onClick: () => this.#onStart(next) })
      ] });
      if (this.#onLibrary && next.topicId) card.append(PixelButton({ label: 'Ver materiais', variant: 'secondary', onClick: () => this.#onLibrary(next.topicId) }));
      this.#root.append(card);
    } else {
      const goalComplete = Boolean(summary.goalCompleted);
      this.#root.append(PixelPanel({ className: 'pixel-panel--selected', children: [
        make('h3', '', goalComplete ? 'Meta diária concluída' : 'Sem atividades programadas'),
        make('p', '', goalComplete ? 'A meta de estudo de hoje foi alcançada.' : 'O plano de hoje não tem atividades pendentes.'),
        PixelButton({ label: 'ESTUDAR MAIS', variant: 'secondary', onClick: () => this.#onExtra() })
      ] }));
    }

    this.#root.append(...(isPlan ? [make('p', '', `Disponível hoje: ${dailyGoal} min · Agenda: ${(plan?.activities ?? []).filter(a => a.status !== 'skipped').reduce((total, a) => total + (Number(a.estimatedMinutes) || 0), 0)} min estimados · Concluídos: ${currentMinutes} min estimados`), goalPanel] : [hud, goalPanel]));

    if (activityList.childElementCount) {
      const questPanel = PixelPanel({ children: [make('h3', '', 'Linha de missões · Agenda de hoje'), activityList] });
      this.#root.append(questPanel);
    } else {
      this.#root.append(PixelPanel({ className: 'pixel-panel--compact', children: [make('p', '', 'Nenhuma missão foi adicionada ao plano de hoje.')] }));
    }

    const settings = make('label', 'pixel-settings');
    settings.append(document.createTextNode('Hoje tenho: '));
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Minutos disponíveis hoje');
    for (const minutes of [30, 60, 90, 120]) select.add(new Option(`${minutes} min`, String(minutes), false, minutes === availableMinutes));
    select.add(new Option('Personalizado', 'custom'));
    select.addEventListener('change', () => { if (select.value !== 'custom') this.#onMinutes(Number(select.value)); });
    settings.append(select);
    const custom = document.createElement('input'); custom.type = 'number'; custom.min = '1'; custom.max = '720'; custom.placeholder = 'minutos'; custom.setAttribute('aria-label', 'Minutos personalizados'); custom.hidden = true;
    const apply = PixelButton({ label: 'Aplicar', variant: 'secondary', onClick: () => { if (Number(custom.value) > 0) this.#onMinutes(Number(custom.value)); } }); apply.hidden = true;
    select.addEventListener('change', () => { custom.hidden = select.value !== 'custom'; apply.hidden = custom.hidden; });
    settings.append(custom, apply);
    this.#root.append(settings);

    const coverage = metrics.coverage?.rate;
    const coverageLabel = coverage == null ? 'Sem dados' : `${Math.round(Math.min(1, Math.max(0, Number(coverage))) * 100)}%`;
    if (!isPlan) this.#root.append(PixelPanel({ className: 'pixel-panel--compact', children: [
      make('h3', '', 'Visão da semana'),
      make('p', '', `Cobertura do currículo: ${coverageLabel}`),
      (() => { const details = make('details'); const summaryNode = make('summary', '', 'Resumo semanal'); const text = make('p', '', `${weekly.completedMinutes ?? 0} / ${weekly.plannedMinutes ?? 0} min realizados · ${weekly.questionActivities ?? 0} atividades de questões · ${weekly.reviewActivities ?? 0} revisões`); details.append(summaryNode, text); return details; })()
    ] }));
  }
}
