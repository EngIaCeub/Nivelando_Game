# State Mapping

## Progress

Source:
existing StudyOS progress data.

Presentation:
pixel progress bar + conventional text.

## Mastery

Source:
existing mastery engine.

Presentation:
meter, tier/badge and percentage/label when meaningful.

Never derive a new mastery formula inside UI code.

## XP

Source:
existing idempotent XP system.

Presentation:
experience bar, event feedback and level only when level derivation is deterministic.

## Flashcards

State mapping:
- new/unseen -> undiscovered;
- learning -> training;
- reviewing -> review;
- mastered -> mastered;
- overdue -> overdue/review needed.

Game labels are secondary. Academic status remains clear.

## Quiz

State mapping:
- unanswered -> neutral;
- chosen before commit -> selected;
- committed correct -> correct;
- committed incorrect -> incorrect;
- immutable first attempt -> locked/recorded.

Do not visually imply that a committed first attempt can be overwritten.

## Curriculum

Topic -> quest.
Module -> quest line.
Discipline -> campaign.

Keep original names visible.

## Diagnostic

Treat as calibration/tutorial visually, but do not make it seem optional if the product requires it.

## Simulated exam

May use a boss/challenge visual metaphor.

Always show conventional score/result information.
