import { ScoringEngine } from './scoring.js';
import { MasteryStore } from './mastery.js';
import { DiagnosticEngine } from './diagnostics.js';
import { EventLog } from './storage.js';
import { GamificationEngine } from './gamification.js';
import { RevisionEngine } from './revision.js';
import { TodayPlanEngine } from './today-planner.js';
import { runMutation, requireMutationContext } from './mutation-context.js';

// One cached promise per bank, with retry after a failed request.
export function lazyQuestions(load) {
  let promise;
  return () => promise ??= Promise.resolve().then(load).then((questions) => {
    if (!Array.isArray(questions)) throw new Error('Banco de questões inválido.');
    return questions;
  }).catch((error) => { promise = undefined; throw error; });
}

export function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

export function safeResourceLink(resource) {
  let url;
  try { url = new URL(resource.url); } catch { return node('span', 'Recurso com endereço inválido.'); }
  if (url.protocol !== 'https:') return node('span', 'Recurso indisponível: endereço não seguro.');
  const link = node('a', resource.title);
  link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
  return link;
}

// All DOM handlers consume rejections and only announce success after awaited writes.
export function action(label, handler, report) {
  const button = node('button', label); button.type = 'button';
  button.addEventListener('click', async () => {
    if (button.disabled) return;
    button.disabled = true;
    try { await handler(); } catch (error) { report(error); }
    finally { button.disabled = false; }
  });
  return button;
}

export function selectSimulationQuestions(simulation, questions) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const ids = [...new Set(simulation.questionIds ?? [])];
  if (!ids.length || ids.some((id) => !byId.has(id))) throw new Error('Pool do simulado indisponível nesta versão.');
  return ids.map((id) => byId.get(id));
}

export class StudySession {
  constructor(store, examId) {
    this.store = store; this.examId = examId;
    this.scoring = new ScoringEngine(store); this.mastery = new MasteryStore(store);
    this.diagnostics = new DiagnosticEngine(store); this.revisions = new RevisionEngine(store);
    this.events = new EventLog(store); this.xp = new GamificationEngine(store);
    this.plans = new TodayPlanEngine(store);
  }
  async exclusive(work, context) {
    return runMutation(this.store, context, work);
  }
  async save(run, context) {
    return this.exclusive(async () => {
      await this.store.put(this.examId, 'study-sessions', run.id, run);
      return structuredClone(run);
    }, context);
  }
  async setCursor(id, { cursor, itemId } = {}, context) {
    return this.exclusive(ctx => this.#updateWhenSettled(id, current => {
      const ids = current.kind === 'flashcards' ? current.cardIds : current.questionIds;
      const next = itemId === undefined ? cursor : ids.indexOf(itemId);
      if (!Number.isInteger(next) || next < 0 || next >= ids.length) throw new Error('Item fora da sessão.');
      current.cursor = next;
      return current;
    }, ctx), context);
  }
  async get(id) { return this.store.get(this.examId, 'study-sessions', id); }
  async list() { return this.store.query(this.examId, 'study-sessions'); }
  async #updateWhenSettled(id, update, context) {
    requireMutationContext(this.store, context);
    for (let attempt = 0; attempt < 5; attempt++) {
      let run = await this.get(id);
      if (!run) throw new Error('Sessão não encontrada.');
      if (run.pending) await this.#applyPending(run, context);
      const outcome = await this.store.update(this.examId, 'study-sessions', id, (current) => {
        if (!current) throw new Error('Sessão não encontrada.');
        if (current.pending) return current;
        return update(current) ?? current;
      });
      run = outcome.value;
      if (!run.pending) return structuredClone(run);
      await this.#applyPending(run, context);
    }
    throw new Error('A sessão recebeu respostas concorrentes; tente novamente.');
  }
  async start(args, context) {
    return this.exclusive(ctx => this.#start(args, ctx), context);
  }
  async #start({ id = `study-${globalThis.crypto.randomUUID()}`, kind = 'quiz', questions = [], cards = [], title = 'Estudo', activity = null, date = null, contentVersion = null }, context) {
    const existing = await this.get(id);
    if (existing) return existing;
    if (!(kind === 'flashcards' ? cards.length : questions.length)) throw new Error('Nenhum conteúdo disponível para esta sessão.');
    const run = { id, kind, title, examId: this.examId, status: 'pending', cursor: 0, questionIds: questions.map((q) => q.id), cardIds: cards.map((c) => c.id), responses: [], revealedIds: [], activity, date, contentVersion, startedAt: new Date().toISOString(), schemaVersion: 1 };
    await this.save(run, context);
    if (kind === 'diagnostic') {
      const diagnostic = await this.diagnostics.start({ examId: this.examId, questions, assessmentRunId: id }, context);
      run.questionIds = diagnostic.questionIds;
      await this.save(run, context);
    }
    return run;
  }
  async resume(id, context) {
    return this.exclusive(async ctx => {
      const initial = await this.get(id);
      if (!initial) throw new Error('Sessão não encontrada.');
      const diagnostic = initial.kind === 'diagnostic' ? await this.diagnostics.getRun(this.examId, id) : null;
      if (initial.kind === 'diagnostic' && !diagnostic) throw new Error('Diagnóstico incompleto; inicie uma nova avaliação.');
      const run = await this.#updateWhenSettled(id, (current) => {
        if (current.kind === 'diagnostic') {
          const latestDiagnostic = diagnostic;
          if (!latestDiagnostic) throw new Error('Diagnóstico incompleto; inicie uma nova avaliação.');
          current.questionIds = latestDiagnostic.questionIds;
          // Imported legacy runs may have responses without a UI cursor.
          if (!current.responses.length) current.cursor = latestDiagnostic.responses.length;
        }
        if (current.status !== 'completed') current.status = 'in_progress';
        return current;
      }, ctx);
      if (run.activity && run.status !== 'completed') await this.plans.resumeActivity({ examId: this.examId, date: run.date, activityId: run.activity.activityId }, ctx);
      return run;
    }, context);
  }
  async pause(id, context) {
    return this.exclusive(async ctx => {
      const run = await this.#updateWhenSettled(id, (current) => {
        if (current.status !== 'completed') current.status = 'paused';
        return current;
      }, ctx);
      if (run.activity && run.status !== 'completed') await this.plans.pauseActivity({ examId: this.examId, date: run.date, activityId: run.activity.activityId }, ctx);
      return run;
    }, context);
  }
  async reveal(id, cardId, context) {
    return this.exclusive(async () => {
      const outcome = await this.store.update(this.examId, 'study-sessions', id, (run) => {
        if (!run || run.kind !== 'flashcards' || run.cardIds[run.cursor] !== cardId) throw new Error('Cartão fora da sessão.');
        run.revealedIds = [...new Set([...run.revealedIds, cardId])];
        return run;
      });
      return structuredClone(outcome.value);
    }, context);
  }
  async applyAnswerEffects(args, context) {
    return this.exclusive(ctx => this.#applyAnswerEffects(args, ctx), context);
  }
  async #applyAnswerEffects({ item, response, operationId, runId, firstAttempt = response.retake !== true }, context) {
    requireMutationContext(this.store, context);
    const appliedKey = operationId ?? `study-answer:${this.examId}:${runId ?? 'legacy'}:${response.timestamp}:${item.id}`;
    const first = firstAttempt;
    for (const canonicalConceptId of item.canonicalConceptIds ?? []) {
      await this.mastery.applyStudyAnswer({ canonicalConceptId, correct: response.correct, firstAttempt: first, assessedAt: response.timestamp, operationId: appliedKey });
    }
    for (const topicId of item.topicIds ?? []) {
      await this.revisions.reviewOnce({ examId: this.examId, topicId, quality: response.correct ? 4 : 2, reviewedAt: response.timestamp, operationId: appliedKey });
    }
  }
  async answer(id, item, optionId, { retake = false, quality = null } = {}, context) {
    if (context !== undefined && context !== null) requireMutationContext(this.store, context);
    // This read identifies the user's optimistic retake intent only. All state
    // decisions and writes below use the current record under the command lock.
    const baseline = retake ? await this.get(id) : null;
    if (retake && !baseline) throw new Error('Sessão não encontrada.');
    const baselineResponseCount = baseline?.responses.filter((response) => response.itemId === item.id).length ?? 0;
    return this.exclusive(async ctx => {
      const timestamp = new Date().toISOString();
      const claimed = await this.store.update(this.examId, 'study-sessions', id, (current) => {
        if (!current) throw new Error('Sessão não encontrada.');
        if (current.pending) return current;
        const itemId = current.kind === 'flashcards' ? current.cardIds[current.cursor] : current.questionIds[current.cursor];
        if (itemId !== item.id || current.status !== 'in_progress') throw new Error('Resposta fora da sessão ativa.');
        const previous = current.responses.filter((response) => response.itemId === item.id);
        if (previous.length && !retake) return current;
        // A second tab may have completed the same retake while this request was
        // queued on the cross-tab write lock. Do not turn one simultaneous intent
        // into a second artificial attempt.
        if (retake && previous.length > baselineResponseCount) return current;
        if (current.kind === 'flashcards') {
          if (!current.revealedIds.includes(item.id) || ![2, 4].includes(quality)) throw new Error('Revele a resposta antes de avaliar o cartão.');
        } else if (!(item.options ?? []).some((option) => option.id === optionId)) throw new Error('Alternativa inválida.');
        if (retake && (current.kind === 'diagnostic' || !previous.length)) throw new Error('Retentativa indisponível.');
        const correct = current.kind === 'flashcards' ? quality >= 3 : optionId === item.correctOptionId;
        const actualRetake = previous.length > 0;
        const response = { itemId: item.id, optionId: optionId ?? null, correct, retake: actualRetake, timestamp };
        current.pending = {
          response, item,
          operationId: `study-answer:${this.examId}:${current.id}:${item.id}:${timestamp}`,
          // Kept as empty arrays for compatibility with the persisted pending schema.
          ...(current.kind === 'diagnostic' ? {} : { targets: [], reviewTargets: [] })
        };
        return current;
      });
      const run = claimed.value;
      if (!run?.pending) return structuredClone(run);
      return this.#applyPending(run, ctx);
    }, context);
  }
  async applyPending(run, context) {
    return this.exclusive(async ctx => {
      const current = await this.get(run.id);
      if (!current) throw new Error('Sessão não encontrada.');
      return this.#applyPending(current, ctx);
    }, context);
  }
  async #applyPending(run, context) {
    requireMutationContext(this.store, context);
    const pending = run.pending;
    if (!pending) return run;
    const { item, response } = pending;
    if (run.kind === 'diagnostic') {
      const diagnostic = await this.diagnostics.answer({ examId: this.examId, assessmentRunId: run.id, questionId: item.id, canonicalConceptIds: item.canonicalConceptIds, correct: response.correct, answeredAt: response.timestamp }, context);
      run.questionIds = diagnostic.questionIds;
    } else {
      let scoreResult;
      if (run.kind !== 'flashcards') {
        // Every durable intent, including the first attempt, is replay-safe.
        // Legacy pending rows without a token keep their old first-attempt guard.
        const firstAttempt = await this.scoring.getFirstAttempt(this.examId, run.id, item.id);
        if (pending.operationId || response.retake || !firstAttempt) scoreResult = await this.scoring.submitAnswer({
          examId: this.examId, simulationRunId: run.id, questionId: item.id,
          correct: response.correct, timestamp: response.timestamp,
          ...(pending.operationId ? { operationId: pending.operationId } : {})
        });
        else scoreResult = { firstAttempt: !response.retake };
      }
      const firstAttempt = run.kind === 'flashcards' ? false : scoreResult.firstAttempt;
      await this.#applyAnswerEffects({ item, response, operationId: pending.operationId, runId: run.id, firstAttempt }, context);
      const event = { eventId: `study-answer:${this.examId}:${response.timestamp.slice(0, 10)}:${item.id}`, type: run.kind === 'flashcards' ? 'review_completed' : 'question_answered', examId: this.examId, entityId: item.id, timestamp: response.timestamp, payload: { correct: response.correct, isRetake: response.retake }, schemaVersion: 1 };
      if (firstAttempt || run.kind === 'flashcards') { await this.events.append(event); await this.xp.awardForEvent(event); }
    }
    const committed = await this.store.update(this.examId, 'study-sessions', run.id, (current) => {
      if (!current) throw new Error('Sessão não encontrada durante a confirmação da resposta.');
      const sameResponse = current.responses.some((saved) => saved.itemId === response.itemId && saved.timestamp === response.timestamp);
      const sameIntent = current.pending?.operationId === pending.operationId || (!pending.operationId && current.pending?.response?.timestamp === response.timestamp);
      if (!sameResponse) current.responses.push(response);
      if (sameIntent) delete current.pending;
      if (run.kind === 'diagnostic') current.questionIds = run.questionIds;
      return current;
    });
    return structuredClone(committed.value);
  }
  async next(id, context) {
    return this.exclusive(async () => {
      const outcome = await this.store.update(this.examId, 'study-sessions', id, (run) => {
        if (!run) throw new Error('Sessão não encontrada.');
        if (run.pending) throw new Error('A resposta ainda precisa ser salva. Retome a sessão.');
        const ids = run.kind === 'flashcards' ? run.cardIds : run.questionIds;
        if (!run.responses.some((response) => response.itemId === ids[run.cursor])) throw new Error('Responda antes de continuar.');
        run.cursor += 1;
        return run;
      });
      return structuredClone(outcome.value);
    }, context);
  }
  async finish(id, context) {
    return this.exclusive(async ctx => {
      let run = await this.#updateWhenSettled(id, (current) => {
        const ids = current.kind === 'flashcards' ? current.cardIds : current.questionIds;
        if (!ids.every((itemId) => current.responses.some((response) => response.itemId === itemId))) throw new Error('Conclua todas as respostas antes de finalizar.');
        current.completedAt ??= new Date().toISOString();
        return current;
      }, ctx);
      if (run.kind === 'diagnostic') {
        await this.diagnostics.complete({ examId: this.examId, assessmentRunId: id }, ctx);
      }
      const timestamp = run.completedAt;
      if (run.activity) {
        // Stable timestamp is the idempotency key used by TodayPlanEngine.
        await this.plans.completeActivity({ examId: this.examId, date: run.date, activityId: run.activity.activityId, timestamp }, ctx);
        await this.events.append({ eventId: `topic-completed:${run.activity.activityId}`, type: 'topic_completed', examId: this.examId, entityId: run.activity.topicId, timestamp, payload: { activityId: run.activity.activityId }, schemaVersion: 1 });
      }
      if (run.kind === 'simulation') {
        const event = { eventId: `simulation-finished:${this.examId}:${timestamp.slice(0, 10)}:${run.title}`, type: 'simulation_finished', examId: this.examId, entityId: id, timestamp, payload: {}, schemaVersion: 1 };
        await this.events.append(event); await this.xp.awardForEvent(event);
      }
      return this.#updateWhenSettled(id, (current) => {
        const ids = current.kind === 'flashcards' ? current.cardIds : current.questionIds;
        if (!ids.every((itemId) => current.responses.some((response) => response.itemId === itemId))) throw new Error('Conclua todas as respostas antes de finalizar.');
        current.status = 'completed';
        current.completedAt ??= timestamp;
        return current;
      }, ctx);
    }, context);
  }
  async startReading({ activity, date }, context) {
    return this.exclusive(async ctx => {
      const id = `theory:${activity.activityId}`;
      const outcome = await this.store.update(this.examId, 'study-reading', id, current => {
        if (current?.status === 'completed') return current;
        return { ...(current ?? { id, activity, date, completedAt: null }), status: 'in_progress' };
      });
      const reading = outcome.value;
      if (reading.status !== 'completed') await this.plans.resumeActivity({ examId: this.examId, date: reading.date, activityId: reading.activity.activityId }, ctx);
      return reading;
    }, context);
  }
  async pauseReading(id, context) {
    return this.exclusive(async ctx => {
      const outcome = await this.store.update(this.examId, 'study-reading', id, current => {
        if (!current) throw new Error('Leitura não encontrada.');
        if (current.status !== 'completed') current.status = 'paused';
        return current;
      });
      const reading = outcome.value;
      if (reading.status !== 'completed') await this.plans.pauseActivity({ examId: this.examId, date: reading.date, activityId: reading.activity.activityId }, ctx);
      return reading;
    }, context);
  }
  async completeReading(id, context) {
    return this.exclusive(async ctx => {
      const claimed = await this.store.update(this.examId, 'study-reading', id, current => {
        if (!current) throw new Error('Leitura não encontrada.');
        current.completedAt ??= new Date().toISOString();
        return current;
      });
      const reading = claimed.value;
      const { activity, date, completedAt: timestamp } = reading;
      await this.plans.completeActivity({ examId: this.examId, date, activityId: activity.activityId, timestamp }, ctx);
      await this.events.append({ eventId: `topic-completed:${activity.activityId}`, type: 'topic_completed', timestamp, examId: this.examId, entityId: activity.topicId, payload: { activityId: activity.activityId }, schemaVersion: 1 });
      const committed = await this.store.update(this.examId, 'study-reading', id, current => {
        if (!current) throw new Error('Leitura não encontrada.');
        current.status = 'completed';
        return current;
      });
      return committed.value;
    }, context);
  }
}

export class StudyUI {
  constructor({ root, session, ensureQuestions, ensureCards, report, onComplete = async () => {} }) {
    Object.assign(this, { root, session, ensureQuestions, ensureCards, report, onComplete });
  }
  button(label, handler) { return action(label, handler, this.report); }
  async open(id) {
    if (document.documentElement.dataset.studyActive === 'true') throw new Error('Pause a sessão atual antes de retomar outra.');
    this.retake = false;
    this.run = await this.session.resume(id);
    document.documentElement.dataset.studyActive = 'true';
    await this.render(); this.root.scrollIntoView?.({ block: 'start' });
  }
  async render() {
    const run = this.run;
    this.root.replaceChildren(node('h2', run.title));
    const heading = this.root.querySelector('h2'); heading.tabIndex = -1; heading.focus();
    const ids = run.kind === 'flashcards' ? run.cardIds : run.questionIds;
    if (run.cursor >= ids.length) {
      this.root.append(node('p', 'Todas as respostas registradas. Finalize para atualizar a agenda.'), this.button('Finalizar sessão', async () => {
        this.run = await this.session.finish(run.id);
        document.documentElement.dataset.studyActive = 'false';
        const score = ['quiz', 'simulation'].includes(run.kind) ? await this.session.scoring.getScore(this.session.examId, run.id) : null;
        this.root.replaceChildren(node('h2', 'Sessão concluída'), node('p', score == null ? 'Revisão e domínio atualizados.' : `Score da primeira tentativa: ${Math.round(score)}%. Retentativas preservam este resultado.`));
        await this.onComplete(this.run);
      }));
      return;
    }
    const items = run.kind === 'flashcards' ? await this.ensureCards() : await this.ensureQuestions();
    const item = items.find((candidate) => candidate.id === ids[run.cursor]) ?? (run.kind === 'diagnostic' ? await this.session.store.get(this.session.examId, 'diagnostic-question-bank', ids[run.cursor]) : null);
    if (!item) throw new Error('Conteúdo desta sessão indisponível. Importe um backup ou use a versão correspondente do pacote.');
    const responses = run.responses.filter((response) => response.itemId === item.id);
    const response = responses.at(-1);
    this.root.append(node('p', `${run.cursor + 1} / ${ids.length} · ${run.status === 'completed' ? 'Revisão da sessão' : 'Sessão em andamento'}`), node('p', item.front ?? item.stem));
    if (run.kind === 'flashcards') {
      if (!run.revealedIds.includes(item.id)) this.root.append(this.button('Revelar resposta', async () => { this.run = await this.session.reveal(run.id, item.id); await this.render(); }));
      else {
        this.root.append(node('p', item.back, 'flashcard-answer'));
        if (!response) for (const [label, quality] of [['Preciso revisar', 2], ['Lembrei', 4]]) this.root.append(this.button(label, async () => { this.run = await this.session.answer(run.id, item, null, { quality }); await this.render(); }));
      }
    } else {
      const options = node('div', undefined, 'question-options'); options.setAttribute('role', 'group'); options.setAttribute('aria-label', 'Alternativas');
      for (const option of item.options ?? []) {
        const button = this.button(option.text, async () => {
          this.run = await this.session.answer(run.id, item, option.id, { retake: this.retake === true });
          this.retake = false; await this.render();
        });
        button.disabled = Boolean(response && !this.retake); button.setAttribute('aria-pressed', String(response?.optionId === option.id)); options.append(button);
      }
      this.root.append(options);
    }
    if (response && !this.retake) {
      const feedback = node('p', `${response.correct ? 'Correta.' : 'Precisa revisar.'} ${item.explanationByOption?.[response.optionId] ?? item.explanation ?? ''} Resposta registrada.`, 'study-feedback'); feedback.setAttribute('role', 'status'); this.root.append(feedback);
      if (run.kind !== 'diagnostic' && run.kind !== 'flashcards') this.root.append(this.button('Tentar novamente (preserva score e XP)', async () => { this.retake = true; await this.render(); }));
      this.root.append(this.button('Continuar', async () => { this.run = await this.session.next(run.id); await this.render(); }));
    }
    if (item.provenance) {
      const source = node('details'); source.append(node('summary', 'Fonte e proveniência'), node('p', `${item.provenance.source ?? ''} · ${item.provenance.license ?? ''}`));
      if (item.provenance.url) source.append(safeResourceLink({ title: 'Abrir fonte (internet)', url: item.provenance.url }));
      this.root.append(source);
    }
    this.root.append(this.button('Pausar e continuar depois', async () => {
      this.run = await this.session.pause(run.id); this.retake = false;
      document.documentElement.dataset.studyActive = 'false';
      this.root.replaceChildren(node('h2', 'Sessão pausada'), node('p', 'Progresso salvo neste dispositivo.'), this.button('Retomar sessão', () => this.open(run.id)));
    }));
  }
}
