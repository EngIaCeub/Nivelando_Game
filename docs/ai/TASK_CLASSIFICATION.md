# Task Classification Cheatsheet

## Basic

Characteristics:
- one or two files;
- obvious desired output;
- no architectural decision;
- no business-state changes;
- low regression radius.

Model:
GPT-6 Luna.

## Intermediate

Characteristics:
- several files but one subsystem;
- established patterns exist;
- clear acceptance criteria;
- modest state handling;
- implementation is mostly local.

Model:
GPT-6 Luna, usually medium/high reasoning.

## Advanced-intermediate

Characteristics:
- many related components;
- significant responsive/state combinations;
- moderate refactor;
- uncertain regression radius;
- needs broader inspection before editing.

Preferred:
GPT-6 Terra if officially available.

Current:
Luna high if still tightly scoped, otherwise GPT-6.1 Sol.

## Complex

Characteristics:
- architecture;
- cross-subsystem behavior;
- persistence/storage;
- scoring/mastery;
- restore/import/export;
- curriculum schema;
- PWA/offline/cache;
- unclear test failures;
- migration coordination;
- release-level QA.

Model:
GPT-6.1 Sol.

## Hard stop rule

If a visual request unexpectedly requires changing a protected behavior, reclassify upward before editing.
