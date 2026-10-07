---
name: studyos-pixel-ui
description: Design, implement, migrate and review StudyOS/Nivelando_Game interfaces using its pixel-art system, retro platform scenery and readable study surfaces. Use for UI components, dashboards, navigation, progress, flashcards, quizzes, responsive styling, visual QA and accessibility.
---

# StudyOS Pixel UI Skill

## Purpose

Apply a coherent pixel-art visual system to StudyOS without changing study logic.

Read only the supporting reference needed for the current task:

- `references/tokens.md` for visual tokens.
- `references/state-mapping.md` for mapping study data to game visuals.
- `references/qa-checklist.md` for review/testing.
- `../../../docs/design/PLATFORM_PIXEL_PLAN.md` for platform-game art direction, scenery, navigation planning and the V2 rollout.
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

For the platform direction, begin with a compact Dashboard scene and original assets.
Keep study text on quiet surfaces; treat biome colors as decoration and consume real state.
The isolated `docs/design/platform-concept/` uses illustrative data and standalone CSS;
do not move its sample metrics or parallel CSS system into production.
Navigation regrouping crosses hash/focus/session boundaries and is a separate COMPLEX task.

Production composition now uses `core/src/platform-shell.js`, the existing Today dashboard,
and `LibraryUI`/`createLibraryCatalog`. Keep native anchors and explicit destination focus,
including links to the current hash. Library retry must refresh only the catalog, preserving
study forms/sessions. Rank resource roles within the selected topic/discipline. The CLI and
runtime share `library-coverage.js`; do not fork eligibility or safe external URL policies.
Read `../../../docs/design/PLATFORM_IMPLEMENTATION_REPORT.md` for the current acceptance limits.

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
