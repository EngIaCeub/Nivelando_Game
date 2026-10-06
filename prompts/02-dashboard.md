# Prompt — Dashboard Migration

Use the `studyos-pixel-ui` skill.

Migrate the StudyOS dashboard to the approved pixel-art design system.

Before editing:
1. inspect current dashboard implementation;
2. identify all state dependencies;
3. identify existing progress/XP/mastery/streak sources;
4. confirm reusable Pixel UI primitives exist.

Represent real application state as:
- XP -> experience bar;
- mastery -> mastery meter;
- modules/topics -> quest groups/rows;
- streak -> compact streak indicator;
- completion -> completed quest state;
- recommended study -> primary next quest/action.

Do not create placeholder or fake progress statistics.

Keep conventional academic labels visible.

Preserve all behavior.

Validate:
- desktop;
- narrow/mobile;
- keyboard focus;
- loading/empty states;
- relevant automated tests.

If implementation requires changing protected business logic, stop that part and reclassify it as COMPLEX for GPT-6.1 Sol rather than casually rewriting it.
