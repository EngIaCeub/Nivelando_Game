# StudyOS Pixel UX Rules

## Study first, game second

The primary loop must remain:
understand -> answer/practice -> receive feedback -> review -> progress.

Gamification should reinforce this loop.

## Feedback hierarchy

1. correctness / study result;
2. explanation;
3. mastery/progress impact;
4. XP/game feedback.

Never make XP animation visually stronger than whether the learner was correct.

## Quiz

- First attempt immutability is a behavioral contract.
- A visual redesign cannot create a second editable "first attempt".
- Locked state after commit must be visually obvious.
- Explanations must remain readable.

## Flashcards

- Study controls should remain near the card.
- Avoid excessive card-flip choreography.
- Review state must come from actual spaced-repetition data.
- Keyboard controls are strongly preferred when the existing app supports or can safely support them.

## Dashboard

Prioritize:
1. what should I study now?
2. what is overdue?
3. how am I progressing?
4. what did I recently complete?

Decorative RPG status comes after these questions.

## Progress

Use both conventional and game representations when needed.

Example:
- `Português · 64% concluído`
- visual quest bar

rather than a mystery meter with no academic label.

## Focus sessions

During active study:
- reduce decorative animation;
- reduce unrelated achievement prompts;
- avoid persistent visual noise.

## Notifications

Use compact in-app feedback.

Avoid modal interruptions for routine XP or progress updates.

## Platform direction V2

Follow `PLATFORM_PIXEL_PLAN.md` for the current composition and rollout.
Scenery must not push the next study action out of reach on mobile; shorten scenery
before shortening content. Offer a focus view with reduced decoration.
Academic names and full unit titles remain accessible; recommendation reasoning may
use a disclosure. World navigation has an equivalent semantic list and no invented locks.
Group navigation only after auditing hash links, focus, mounts and active sessions.
Library coverage describes editorial work, never learner mastery or completion.
