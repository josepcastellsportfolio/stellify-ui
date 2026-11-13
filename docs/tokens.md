# Design tokens (v2)

Source of truth: [`registry/stellify/stellify-base.css`](../registry/stellify/stellify-base.css).
`npm run tokens` copies it into `registry.json` and Storybook; `npm test` fails if they drift.
Storybook shows every token under **Foundations**.

## Rules

- **Tone, not boxes.** Containers are told apart by `surface-1/2/3`. A 1px `hairline` only between rows and sections, never around a box.
- **No glows.** No translucent focus halos, `ring-offset`, colored shadows, `backdrop-blur` or gradients.
- **One shadow.** `--shadow-overlay`, only for things that float (popover, menu, dialog, tooltip). Use `shadow-(--shadow-overlay)`.
- **Filled fields.** `bg-field`, `hover:bg-field-hover`, and a 1px `border-b border-field-edge` underline so the control is visible (WCAG 1.4.11). Invalid = `bg-danger-subtle` + `text-danger` message, no red border.
- **One focus style.** A 2px solid `--focus` (ink) outline, offset 2px, set globally by the base layer. Components add none of their own.
- **Two radii.** 4px controls (`rounded-sm`/`rounded-md`), 8px containers (`rounded-lg`/`rounded-xl`). Pill (`--radius-pill`) only for chips and the segmented control.
- **Status ≠ brand.** `success / warning / danger / info` each have a strong tone, a `-subtle` tint and a `-foreground`. Always with an icon or label, never color alone.
- **Interruptible motion.** A new input never waits for the previous animation. CSS transitions on `transform`; GSAP with `overwrite: "auto"`. Reduced motion cuts durations to near zero.

## Tokens

| Group | Tokens |
|---|---|
| Brand (override per product) | `--brand`, `--brand-foreground`, `--brand-subtle` |
| Surfaces | `--surface-1` page, `--surface-2` raised, `--surface-3` hover/selected, `--surface-overlay` |
| Ink | `--foreground`, `--muted-foreground`, `--hairline` (dividers only) |
| Fields | `--field`, `--field-hover`, `--field-edge` (underline of a field, unchecked switch track; `--input` points at it) |
| Status | `--{success,warning,danger,info}`, `-foreground`, `-subtle` |
| Charts | `--chart-1` … `--chart-5`; `data-chart-palette="mono"` swaps in a brand ramp |
| Shape | `--radius-control` 4px, `--radius-container` 8px, `--radius-pill` |
| Elevation | `--shadow-overlay` |
| Focus | `--focus`, `--focus-width` 2px, `--focus-offset` 2px |
| Motion | `--duration-fast` 120ms, `--duration-base` 240ms, `--duration-slow` 400ms, `--ease-out`, `--ease-in-out` |
| Type | `--font-sans` Inter, `--font-mono` Geist Mono, `--tracking-display`, `--tracking-mono-caps` |
| Site layout | `--container-max`, `--container-pad` |

The shadcn names (`background`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`,
`border`, `input`, `ring`, `sidebar-*`) stay, mapped onto the tokens above, because upstream shadcn components
read them. `destructive` = `danger`.

## Checks

`tests/tokens.test.ts` computes WCAG contrast from the oklch values, in both modes:

- text pairs ≥ 4.5:1: ink on every surface, `brand-foreground` on `brand`, `brand` on `brand-subtle`,
  each status on its `-subtle` and its `-foreground` on it;
- `field-edge` (and `input`) ≥ 3:1 against `surface-1/2/3` and `surface-overlay`: what identifies a control;
- every chart color ≥ 3:1 against the page.

The categorical palette also passed the dataviz validator (lightness band, chroma floor, colour-blind
separation ΔE ≥ 8 between neighbours, normal-vision floor) on `surface-1` and `surface-2` in both modes,
and the mono ramp passed the ordinal checks (monotone lightness, ΔL ≥ 0.06, light end ≥ 2:1).
