# Pixel UI Token Reference

Use the project's actual naming convention when one already exists.

Suggested semantic token families:

```css
:root {
  --pixel-grid: 4px;

  --pixel-border-width: 2px;
  --pixel-radius-sm: 0;
  --pixel-radius-md: 0;

  --pixel-shadow-x: 4px;
  --pixel-shadow-y: 4px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  --motion-fast: 100ms;
  --motion-normal: 160ms;
}
```

Do not blindly paste these tokens if the project already has equivalents.

Color tokens should be semantic:

- `--surface-base`
- `--surface-raised`
- `--surface-selected`
- `--border-default`
- `--border-strong`
- `--text-primary`
- `--text-secondary`
- `--accent-primary`
- `--status-success`
- `--status-warning`
- `--status-danger`
- `--status-info`
- `--focus-ring`

Avoid coupling components to raw hex values when a semantic token is appropriate.
