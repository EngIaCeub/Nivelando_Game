# Prompt — Pixel UI QA / Release Review

Use the `studyos-pixel-ui` skill.

Review the current Pixel UI migration as a release gate.

Do not assume passing tests mean visual correctness.

Check:
- design-token consistency;
- duplicate styles;
- responsive behavior;
- keyboard navigation;
- visible focus;
- reduced motion;
- contrast;
- loading/empty/error/locked/completed states;
- data/state integrity;
- XP/mastery/progress sources;
- quiz first-attempt immutability;
- spaced repetition;
- backup/restore;
- PWA/offline behavior.

Run the existing automated suite.

Classify findings:
BLOCKER / HIGH / MEDIUM / LOW.

Use GPT-6.1 Sol for the review if failures cross multiple subsystems or require architectural diagnosis.

Do not deploy or tag a release while BLOCKER/HIGH findings remain unresolved.
