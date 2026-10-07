# Pixel UI Migration Plan

## Current baseline and platform V2

The initial Pixel UI migration below is the historical rollout, already published
on 2026-10-06. It is not a fresh TODO list. The next rollout is defined in
`PLATFORM_PIXEL_PLAN.md`: V0 concept, V1 shared foundation/assets, V2 Today pilot,
V3 navigation, V4 library, V5 study views and V6 release validation.

Keep each stage reviewable. Navigation is a separate COMPLEX change. Library UI
depends on B5 of the didactic-library plan and must expose planned/partial coverage.
The concept is isolated and does not approve production release.

## Phase 0 — Audit

Goal:
- inventory screens;
- inventory shared components;
- identify CSS/style architecture;
- map all visible state to application state;
- identify high-risk behavioral components.

No redesign yet.

Deliverable:
- migration inventory;
- dependency map;
- risks;
- recommended first pilot screen.

## Phase 1 — Foundation

Create:
- tokens;
- typography rules;
- borders;
- shadows;
- focus states;
- base surfaces;
- buttons;
- badges;
- progress/meter primitives.

Do not migrate all screens.

## Phase 2 — Shell

Migrate:
- page background;
- header;
- nav;
- sidebars;
- global status surfaces.

Validate responsiveness and PWA behavior.

## Phase 3 — Dashboard pilot

Map real data to:
- XP;
- level if the product already derives one;
- mastery;
- streak;
- today/recommended study;
- completion.

Use this as the visual acceptance baseline.

## Phase 4 — Flashcards

Add collectible-card styling while preserving:
- spaced review logic;
- existing answer/reveal semantics;
- scheduling state.

## Phase 5 — Quiz

Migrate:
- question surface;
- answer options;
- feedback;
- locked first-attempt state;
- score/progress surfaces.

This is high behavioral risk. Use GPT-6.1 Sol if implementation crosses UI/business boundaries.

## Phase 6 — Remaining screens

- curriculum;
- diagnostics;
- analytics;
- settings;
- import/export;
- backup/restore.

## Phase 7 — Polish

- achievements;
- micro-interactions;
- pixel icon consistency;
- reduced motion;
- responsive cleanup;
- accessibility audit.

## Gate for every phase

A phase is complete only when:
- relevant tests pass;
- regression risk is reviewed;
- desktop is visually inspected;
- narrow/mobile layout is visually inspected;
- keyboard focus is verified;
- no fake progress data was introduced.
