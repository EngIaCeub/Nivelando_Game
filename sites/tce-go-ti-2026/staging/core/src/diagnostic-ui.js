import { PixelBadge, PixelButton, PixelMeter, PixelPanel, PixelProgress } from './pixel-ui.js';

export class DiagnosticUI {
  #root;
  #engine;
  #examId;
  #questions;
  #run;
  #questionMap;
  #onComplete;

  constructor({ root, engine, examId, questions, onComplete = () => {} }) {
    if (!root || !engine || !examId || !Array.isArray(questions)) throw new TypeError('root, engine, examId and questions are required');
    this.#root = root;
    this.#engine = engine;
    this.#examId = examId;
    this.#questions = questions;
    this.#questionMap = new Map(questions.map((question) => [question.id, question]));
    this.#onComplete = onComplete;
  }

  async start(assessmentRunId) {
    this.#run = await this.#engine.start({ examId: this.#examId, questions: this.#questions, assessmentRunId });
    this.#renderIntro();
  }

  async resume(assessmentRunId) {
    this.#run = await this.#engine.getRun(this.#examId, assessmentRunId);
    if (!this.#run) return this.start(assessmentRunId);
    this.#renderQuestion();
  }

  #button(label, handler, variant = 'primary') {
    return PixelButton({ label, onClick: handler, variant });
  }

  #screen(title, description, state, tone = 'info') {
    this.#root.replaceChildren();
    this.#root.classList.add('diagnostic-ui');
    const panel = PixelPanel({ className: 'diagnostic-screen', label: title });
    const heading = document.createElement('h2');
    heading.textContent = title;
    const text = document.createElement('p');
    text.textContent = description;
    text.className = 'diagnostic-screen__description';
    if (state) panel.append(PixelBadge(state, tone));
    panel.append(heading, text);
    this.#root.append(panel);
    return panel;
  }

  #progress() {
    return PixelProgress({
      label: 'Progresso do diagnóstico',
      current: this.#run.responses.length,
      max: this.#run.questionIds.length,
      valueText: `${this.#run.responses.length} de ${this.#run.questionIds.length} respondidas`,
    });
  }

  #actions(...buttons) {
    const actions = document.createElement('div');
    actions.className = 'diagnostic-actions';
    actions.append(...buttons);
    return actions;
  }

  #renderIntro() {
    const screen = this.#screen('Diagnóstico inicial', 'Responda algumas questões para estimar seu domínio. Você pode pausar e continuar depois.', 'Preparação');
    screen.append(this.#progress(), this.#actions(this.#button('Começar diagnóstico', () => this.#renderQuestion()), this.#button('Reiniciar diagnóstico', () => this.start(), 'secondary')));
  }

  #renderQuestion() {
    const nextId = this.#run.questionIds.find((questionId) => !this.#run.responses.some((response) => response.questionId === questionId));
    if (!nextId) return this.#renderResult();
    const question = this.#questionMap.get(nextId);
    const screen = this.#screen('Questão diagnóstica', `Progresso: ${this.#run.responses.length} de ${this.#run.questionIds.length}`, 'Avaliação em andamento');
    const stem = document.createElement('p');
    stem.textContent = question.stem;
    stem.className = 'diagnostic-question__stem';
    const options = document.createElement('div');
    options.className = 'diagnostic-options';
    screen.append(this.#progress(), stem, options);
    for (const option of question.options ?? []) {
      const button = this.#button(option.text, async () => {
        const correct = option.id === question.correctOptionId;
        this.#run = await this.#engine.answer({ examId: this.#examId, assessmentRunId: this.#run.assessmentRunId, questionId: question.id, canonicalConceptIds: question.canonicalConceptIds, correct });
        this.#renderFeedback(correct);
      }, 'secondary');
      button.classList.add('diagnostic-option');
      options.append(button);
    }
    screen.append(this.#actions(this.#button('Pausar e continuar depois', () => this.#renderProgress(), 'secondary')));
  }

  #renderProgress() {
    const screen = this.#screen('Diagnóstico pausado', `Sua avaliação foi salva com ${this.#run.responses.length} resposta(s).`, 'Pausado', 'warning');
    screen.append(this.#progress(), this.#actions(this.#button('Continuar', () => this.#renderQuestion()), this.#button('Reiniciar com nova avaliação', async () => { this.#run = await this.#engine.restart({ examId: this.#examId, questions: this.#questions }); this.#renderIntro(); }, 'secondary')));
  }

  #renderFeedback(correct) {
    const screen = this.#screen(correct ? 'Resposta correta' : 'Resposta incorreta', 'A resposta foi registrada como evidência diagnóstica; ela não altera o simulatedScore.', 'Resposta registrada', correct ? 'success' : 'warning');
    screen.classList.add(correct ? 'diagnostic-feedback--correct' : 'diagnostic-feedback--incorrect');
    screen.append(this.#progress(), this.#actions(this.#button('Continuar diagnóstico', () => this.#renderQuestion())));
  }

  async #renderResult() {
    const result = await this.#engine.complete({ examId: this.#examId, assessmentRunId: this.#run.assessmentRunId });
    const screen = this.#screen('Diagnóstico concluído', 'O domínio estimado foi salvo globalmente por conceito. O plano pode ser recalculado com esse contexto.', 'Concluído', 'success');
    const list = document.createElement('ul');
    list.className = 'diagnostic-mastery';
    for (const record of result.mastery) {
      const item = document.createElement('li');
      item.className = 'diagnostic-mastery__item';
      const title = document.createElement('p');
      title.className = 'diagnostic-mastery__concept';
      title.textContent = `${record.canonicalConceptId}: ${Math.round(record.masteryEstimate * 100)}% (confiança ${Math.round(record.confidence * 100)}%)`;
      item.append(title, PixelMeter({ label: 'Domínio estimado', value: record.masteryEstimate * 100 }));
      list.append(item);
    }
    screen.append(this.#progress(), list, this.#actions(this.#button('Revisar resultado', () => this.#renderResult()), this.#button('Reiniciar diagnóstico', () => this.start(), 'secondary')));
    this.#onComplete(result);
  }
}
