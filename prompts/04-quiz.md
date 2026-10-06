# Prompt — Quiz Migration

Use the `studyos-pixel-ui` skill.

This screen has high behavioral importance.

Inspect the quiz state machine before editing.

Migrate:
- question surface;
- answer options;
- selected state;
- committed correct/incorrect states;
- explanation surface;
- progress;
- completion/result feedback.

Preserve the immutable first-attempt contract exactly.

A committed first attempt must be visually and behaviorally locked.

Correct/incorrect feedback must not depend only on color.

Do not change scoring, XP or mastery calculation.

If UI and business logic are tightly coupled and a safe separation/refactor is required, classify the refactor as COMPLEX and use GPT-6.1 Sol.

Run all relevant quiz/scoring tests after changes.
