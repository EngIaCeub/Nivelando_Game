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

  #button(label, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', handler);
    return button;
  }

  #screen(title, description) {
    this.#root.replaceChildren();
    const heading = document.createElement('h2');
    heading.textContent = title;
    const text = document.createElement('p');
    text.textContent = description;
    this.#root.append(heading, text);
    return this.#root;
  }

  #renderIntro() {
    const screen = this.#screen('Diagnóstico inicial', 'Responda algumas questões para estimar seu domínio. Você pode pausar e continuar depois.');
    screen.append(this.#button('Começar diagnóstico', () => this.#renderQuestion()), this.#button('Reiniciar diagnóstico', () => this.start()));
  }

  #renderQuestion() {
    const nextId = this.#run.questionIds.find((questionId) => !this.#run.responses.some((response) => response.questionId === questionId));
    if (!nextId) return this.#renderResult();
    const question = this.#questionMap.get(nextId);
    const screen = this.#screen('Questão diagnóstica', `Progresso: ${this.#run.responses.length} de ${this.#run.questionIds.length}`);
    const stem = document.createElement('p');
    stem.textContent = question.stem;
    screen.append(stem);
    for (const option of question.options ?? []) screen.append(this.#button(option.text, async () => {
      const correct = option.id === question.correctOptionId;
      this.#run = await this.#engine.answer({ examId: this.#examId, assessmentRunId: this.#run.assessmentRunId, questionId: question.id, canonicalConceptIds: question.canonicalConceptIds, correct });
      this.#renderQuestion();
    }));
    screen.append(this.#button('Pausar e continuar depois', () => this.#renderProgress()));
  }

  #renderProgress() {
    const screen = this.#screen('Diagnóstico pausado', `Sua avaliação foi salva com ${this.#run.responses.length} resposta(s).`);
    screen.append(this.#button('Continuar', () => this.#renderQuestion()), this.#button('Reiniciar com nova avaliação', async () => { this.#run = await this.#engine.restart({ examId: this.#examId, questions: this.#questions }); this.#renderIntro(); }));
  }

  async #renderResult() {
    const result = await this.#engine.complete({ examId: this.#examId, assessmentRunId: this.#run.assessmentRunId });
    const screen = this.#screen('Diagnóstico concluído', 'O domínio estimado foi salvo globalmente por conceito. O plano pode ser recalculado com esse contexto.');
    const list = document.createElement('ul');
    for (const record of result.mastery) {
      const item = document.createElement('li');
      item.textContent = `${record.canonicalConceptId}: ${Math.round(record.masteryEstimate * 100)}% (confiança ${Math.round(record.confidence * 100)}%)`;
      list.append(item);
    }
    screen.append(list, this.#button('Revisar resultado', () => this.#renderResult()), this.#button('Reiniciar diagnóstico', () => this.start()));
    this.#onComplete(result);
  }
}
