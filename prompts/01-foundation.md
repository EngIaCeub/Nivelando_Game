# Prompt — Pixel UI Foundation

Use the `studyos-pixel-ui` skill.

Implement the Pixel UI foundation only.

Read:
- `docs/design/PIXEL_UI_SYSTEM.md`
- `docs/design/COMPONENTS.md`
- the current styling architecture.

Create or adapt:
- semantic design tokens;
- borders;
- stepped shadows;
- typography roles;
- focus styles;
- base panel;
- base button;
- base badge;
- progress primitive;
- mastery/meter primitive.

Do not migrate every screen.

Do not change scoring, mastery, XP, storage, curriculum, backup/restore, PWA or quiz semantics.

Prefer integrating with the project's current token/component architecture instead of creating a parallel system.

Add focused tests where the project has component/style tests.

Run relevant tests and report:
- files changed;
- primitives added;
- compatibility risks;
- next recommended migration.
