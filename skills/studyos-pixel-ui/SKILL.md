---
name: studyos-pixel-ui
description: Design, implement, migrate and review StudyOS/Nivelando_Game interfaces using the project's modern pixel-art and retro-RPG visual language. Use for UI components, dashboards, navigation, progress, XP, mastery, flashcards, quizzes, achievements, responsive styling, visual QA and accessibility.
---

# StudyOS Pixel UI Skill

## Purpose

Apply a coherent pixel-art visual system to StudyOS without changing study logic.

Read only the supporting reference needed for the current task:

- `references/tokens.md` for visual tokens.
- `references/state-mapping.md` for mapping study data to game visuals.
- `references/qa-checklist.md` for review/testing.
- `../../../docs/design/PIXEL_UI_SYSTEM.md` for the full visual language.
- `../../../docs/design/COMPONENTS.md` for component conventions.
- `../../../docs/ai/MODEL_ROUTING.md` before delegating substantial work.

## Workflow

### 1. Inspect before editing

Identify:
- current component;
- current styles;
- state dependencies;
- shared dependencies;
- tests;
- accessibility behavior.

### 2. Classify the task

Use the model-routing policy.

Do not use a heavier model simply because it is available.

Escalate when the task crosses protected behavior or requires architectural decisions.

### 3. Reuse the system

Prefer:
- tokens;
- shared primitives;
- existing semantic state.

Do not create a one-off pixel theme per page.

### 4. Preserve semantics

The UI must consume existing state.

Do not invent progress.

Do not rewrite scoring/mastery/XP logic merely to simplify rendering.

### 5. Implement the smallest coherent slice

Good:
- add tokens + primitives;
- migrate one screen;
- validate;
- continue.

Bad:
- restyle the entire application in one pass.

### 6. Validate

Run relevant automated tests.

Visually inspect:
- desktop;
- narrow/mobile;
- keyboard focus;
- reduced motion where relevant;
- loading;
- empty;
- error;
- disabled;
- locked;
- completed states.

## Design summary

Use:
- crisp borders;
- stepped shadows;
- restrained palette;
- limited pixel font use;
- game-like progress feedback;
- collectible-card influence for flashcards;
- encounter/challenge influence for quiz questions.

Avoid:
- unreadable nostalgia;
- fake CRT overlays;
- heavy motion;
- giant rounded SaaS cards;
- fake game statistics.

## Output expectation

When implementing:
- edit code, not just propose it;
- report changed files;
- report tests run;
- report remaining risks;
- do not claim visual QA if no rendered inspection occurred.
