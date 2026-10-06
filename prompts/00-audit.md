# Prompt — Pixel UI Audit

Use the `studyos-pixel-ui` skill.

Audit the current StudyOS/Nivelando_Game UI before making visual changes.

Do not edit production code in this task.

Inventory:
1. routes/screens;
2. shared layout components;
3. shared UI primitives;
4. styling strategy;
5. progress/XP/mastery rendering;
6. flashcards;
7. quiz;
8. diagnostics;
9. analytics;
10. settings/import/export/backup areas.

For each important screen identify:
- files;
- state dependencies;
- reusable components;
- visual migration complexity;
- regression risk.

Classify each migration as BASIC, INTERMEDIATE, ADVANCED_INTERMEDIATE or COMPLEX using `docs/ai/TASK_CLASSIFICATION.md`.

Recommend:
- the first foundation files;
- the best pilot screen;
- tasks suitable for GPT-6 Luna;
- tasks that should be reserved for GPT-6.1 Sol.

Do not invent GPT-6 Terra if it is not available in the runtime.

End with a migration backlog ordered by dependency and risk.
