# Pixel UI QA Checklist

## Functional

- [ ] Existing tests pass.
- [ ] No scoring logic changed unintentionally.
- [ ] No XP duplication introduced.
- [ ] No mastery calculation moved into presentation code.
- [ ] First quiz attempt remains immutable.
- [ ] Spaced repetition state is preserved.
- [ ] Backup/restore behavior is preserved.
- [ ] PWA/offline behavior is preserved.

## Visual

- [ ] Shared tokens used.
- [ ] Borders consistent.
- [ ] Shadows consistent.
- [ ] Pixel effect is crisp at normal zoom.
- [ ] No horizontal overflow.
- [ ] Dense text remains readable.
- [ ] Mobile version removes nonessential decoration.
- [ ] Empty/loading/error states fit the same visual system.

## Accessibility

- [ ] Focus visible.
- [ ] Keyboard navigation works.
- [ ] Correct/incorrect not conveyed only by color.
- [ ] Contrast is sufficient.
- [ ] Meaningful icons have accessible names.
- [ ] Reduced motion is respected.
- [ ] Zoom does not break required controls.

## Data integrity

- [ ] XP displayed comes from real state.
- [ ] mastery displayed comes from real state.
- [ ] progress displayed comes from real state.
- [ ] streak displayed comes from real state.
- [ ] no placeholder statistics remain in production UI.
