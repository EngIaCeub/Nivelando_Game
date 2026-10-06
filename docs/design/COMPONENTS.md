# Pixel UI Components

## Required primitives

Prefer a shared component layer with equivalents to:

- `PixelPanel`
- `PixelButton`
- `PixelIconButton`
- `PixelBadge`
- `PixelProgress`
- `PixelMeter`
- `PixelCard`
- `PixelModal`
- `PixelTooltip`
- `PixelTabs`
- `PixelToast`
- `PixelStat`
- `PixelStatus`
- `PixelQuestRow`
- `PixelEmptyState`

Names may be adapted to the project's framework and conventions.

## PixelProgress

Use for scalar progress such as:
- XP;
- curriculum completion;
- module completion;
- streak goal.

Props/concepts should cover:
- current;
- max;
- percentage;
- label;
- semantic state;
- accessible value text.

Never use fake percentages.

## PixelMeter

Use for mastery or other quality estimates.

Must distinguish:
- unknown/unseen;
- learning;
- reviewing;
- proficient;
- mastered.

Do not imply precision that the underlying model does not have.

## PixelCard

Base surface for:
- study modules;
- summaries;
- compact dashboards;
- supporting information.

Should support:
- default;
- selected;
- active;
- completed;
- locked;
- warning;
- disabled.

## Flashcard

Flashcard presentation should feel collectible without becoming visually noisy.

Required states:
- unseen;
- learning;
- reviewing;
- mastered;
- overdue.

Front:
- prompt/concept;
- subject/topic metadata;
- compact state.

Back:
- answer/explanation;
- optional memory cues;
- review actions.

The flip effect must respect reduced-motion.

## Quiz answer option

Required states:
- neutral;
- hover/focus;
- selected;
- correct;
- incorrect;
- locked after first-attempt commitment;
- disabled.

Correct/incorrect states must use iconography/text plus color.

## Quest row

A topic/module row may use quest language visually while retaining academic labels.

Recommended content:
- topic name;
- completion/mastery;
- review status;
- XP reward only if the real system defines it;
- locked/completed indicator;
- next recommended action.

## Achievement badge

Only display achievements supported by deterministic rules.

Badges should have:
- id;
- human-readable title;
- condition;
- earned timestamp if tracked;
- locked state.

No purely cosmetic fake achievements on the production progress screen.
