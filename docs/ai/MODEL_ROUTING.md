# Model Routing Policy

## Objective

Use the lightest model that can reliably complete the task while reserving GPT-6.1 Sol for work where architectural judgment, broad coordination or high-risk code changes justify it.

## Current model aliases

```yaml
models:
  basic: gpt-6-luna
  intermediate: gpt-6-luna
  advanced_intermediate_preferred: gpt-6-terra
  advanced_intermediate_bounded_current: gpt-6-luna-high
  advanced_intermediate_escalation: gpt-6.1-sol
  complex: gpt-6.1-sol
```

`gpt-6-terra` is intentionally a future-facing preference, not a claim that the model currently exists.

As of 2026-10-06, the public OpenAI model catalog lists GPT-6 Luna and GPT-6.1 Sol but does not list GPT-6 Terra.

Do not invent or call `gpt-6-terra` unless the runtime/model selector actually exposes it.

If a GPT-6 Terra becomes available later:
- place it between Luna and GPT-6.1 Sol;
- use it for advanced-intermediate implementation/review;
- keep GPT-6.1 Sol for complex/high-risk tasks.

## BASIC -> GPT-6 Luna

Examples:
- rename a component;
- modify copy;
- adjust spacing using existing tokens;
- add a simple badge using an existing primitive;
- update documentation;
- add a straightforward CSS state;
- fix a clearly localized style bug.

Suggested reasoning:
- low or medium.

## INTERMEDIATE -> GPT-6 Luna

Examples:
- create a component from an established design system;
- migrate one simple screen;
- implement responsive variants;
- add flashcard visual states without changing scheduling logic;
- refactor repetitive CSS into tokens;
- update tests with clear acceptance criteria.

Suggested reasoning:
- medium;
- high when multiple files or edge cases are involved.

## ADVANCED_INTERMEDIATE

Intended future model:
- GPT-6 Terra if officially available.

Current behavior:
- first try GPT-6 Luna with high reasoning if the work is still well-scoped;
- escalate to GPT-6.1 Sol when the task requires broader architectural context, crosses UI/business boundaries, or has material regression risk.

Examples:
- migrate a state-rich screen with several components;
- reconcile responsive behavior across multiple layout layers;
- refactor a component family used throughout the app;
- investigate a non-obvious visual/state regression.

## COMPLEX -> GPT-6.1 Sol

Use GPT-6.1 Sol when one or more are true:

- changes span several subsystems;
- task involves architecture;
- task can break persistence, scoring, restore, mastery or curriculum rules;
- requirements conflict or are incomplete;
- visual work requires redesigning the component architecture;
- multiple agents need coordination;
- regression cause is unclear;
- test failures require non-local reasoning;
- a release gate/review is being performed;
- code must be changed in areas where data/state semantics are not obvious.

Suggested reasoning:
- medium for normal complex work;
- high for migration/integration;
- xhigh only for unusually difficult debugging or cross-system review.

## Escalation rule

Start cheap. Escalate on evidence.

Escalate from Luna when:
- it cannot produce a safe plan from the available context;
- it needs to alter business logic to finish a UI request;
- the same regression survives one focused correction pass;
- more than one critical subsystem is implicated;
- the task requires reconciling conflicting architectural constraints.

Do not repeatedly retry a failing complex task with Luna just to avoid escalation.

## De-escalation rule

A GPT-6.1 Sol task may delegate well-scoped subwork to Luna:
- file inventory;
- component catalog;
- CSS duplication scan;
- documentation updates;
- isolated test additions;
- accessibility checklist review.

The Sol coordinator must integrate the results.
