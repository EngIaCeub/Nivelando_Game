# Prompt — Flashcards Migration

Use the `studyos-pixel-ui` skill.

Migrate flashcards to the Pixel UI system.

Visual direction:
- collectible knowledge card;
- restrained pixel border/shadow;
- clear subject/topic metadata;
- compact review state;
- optional flip animation respecting reduced motion.

Required states:
- unseen;
- learning;
- reviewing;
- mastered;
- overdue.

The review state must come from the existing spaced-repetition engine.

Do not modify scheduling/mastery logic for styling convenience.

Preserve keyboard/accessibility behavior.

Run relevant tests and inspect desktop/mobile rendering.
