# StudyOS Pixel UI System

## 1. Visual goal

Create a modern, readable, professional study application that borrows the visual grammar of pixel-art RPGs and classic game interfaces.

The target is not an exact recreation of an old console UI.

Desired blend:
- modern productivity/study UX;
- retro RPG progression feedback;
- pixel-art geometry;
- disciplined spacing;
- strong hierarchy;
- restrained animation.

## 2. Core visual vocabulary

Prefer:
- crisp 1px or 2px borders;
- stepped/block shadows;
- low-radius or square surfaces;
- 4px/8px spatial rhythm;
- pixel or block-inspired icons;
- limited semantic palette;
- small decorative motifs;
- clear text hierarchy;
- subtle texture/dithering only when it does not hurt readability.

Avoid:
- glassmorphism;
- oversized SaaS pill controls;
- excessive gradients;
- huge border radii;
- neon everywhere;
- tiny pixel fonts for long text;
- decorative animation during focused study;
- fake CRT distortion over reading content.

## 3. Typography

Use a highly readable UI/body font for study content.

A pixel/display font may be used selectively for:
- section titles;
- small badges;
- level indicators;
- achievements;
- short labels.

Do not use a low-resolution pixel font for:
- long questions;
- explanations;
- legal text;
- dense analytics;
- long flashcard answers.

## 4. Shape language

Primary container:
- square or subtly rounded corners;
- visible border;
- optional stepped shadow;
- clear selected/focused state.

Buttons:
- visibly pressable;
- distinct hover, active, focus and disabled states;
- small stepped movement is allowed on press;
- no interaction should depend only on color.

## 5. Gamification mapping

StudyOS data -> visual metaphor:

- XP -> experience bar.
- Mastery -> mastery meter.
- Topic -> quest.
- Module -> quest line / region.
- Discipline -> campaign.
- Diagnostic -> tutorial / calibration stage.
- Spaced review -> review quest / return encounter.
- Mastered concept -> mastery badge.
- Simulated exam -> boss challenge.
- Flashcard -> collectible knowledge card.
- Study sequence -> streak.
- Locked content -> locked area/quest.
- Overall curriculum progress -> campaign/world progress.

These metaphors must not obscure the academic meaning. Pair game vocabulary with conventional labels where ambiguity could occur.

Example:
`Mastery 78% · Lv. 4`
is better than only:
`Lv. 4`.

## 6. Motion

Motion should communicate state.

Allowed:
- short progress fill;
- card flip;
- button press;
- XP increment;
- badge unlock;
- compact success feedback.

Avoid:
- continuous bouncing;
- long victory sequences;
- flashing;
- screen shake during ordinary study;
- animation that delays the next question.

Respect reduced-motion preferences.

## 7. Accessibility

Requirements:
- semantic HTML;
- visible keyboard focus;
- WCAG-appropriate contrast;
- no color-only answer feedback;
- text alternatives for meaningful icons;
- reduced-motion support;
- controls remain usable at zoom;
- no tiny mandatory hit targets.

Pixel art is decorative. Accessibility wins every conflict.

## 8. Responsive behavior

Pixel aesthetic must scale without bitmap-looking layout breakage.

Desktop:
- richer side panels allowed;
- progress HUD may be persistent.

Tablet:
- simplify secondary status panels.

Mobile:
- keep primary study action in reach;
- collapse decorative HUD;
- preserve progress and status in compact form;
- avoid horizontal overflow.

## 9. Empty/loading/error states

All reusable components should define:
- loading;
- empty;
- error;
- disabled;
- locked;
- completed;
- overdue when relevant.

Do not use random retro copy that hides the real error.

## 10. Visual consistency test

Before considering a screen done, ask:

- Does it look like the same product as the other migrated screens?
- Are tokens reused?
- Are progress semantics consistent?
- Are button states consistent?
- Are borders and shadows consistent?
- Does the pixel styling improve hierarchy rather than merely add decoration?
