# Migration guide

## v2, phase 2: the ui core (2026-11-13)

The `ui` items now follow the v2 rules: no box borders, no focus halos, no shadows except on overlays,
filled fields. Re-add what you use with `npx shadcn add @stellify/<item> --overwrite`.
`tests/registry.test.ts` fails if a ui item brings a halo or an outlined field back.

**New** (status `experimental`): `field`, `spinner`, `segmented-control`.

**Breaking props**: copy moves into a typed `labels` prop with Spanish defaults.

| Item | Before | Now |
|---|---|---|
| `confirm-dialog` | `confirmLabel`, `cancelLabel` (English defaults) | `labels={{ confirm, cancel }}`, defaults "Confirmar" / "Cancelar" |
| `date-range-picker` | `applyLabel`, `cancelLabel`, `timeToggleLabel`, `startTimeLabel`, `endTimeLabel`; English presets | `labels={{ apply, cancel, includeTime, startTime, endTime }}`; presets in Spanish ("Hoy", "Últimos 7 días"…) |
| `number-input` | `incrementLabel`, `decrementLabel` | `labels={{ increment, decrement }}` |
| `chip` | `removeLabel` | `labels={{ remove }}` |
| `collapse-toggle` | `openLabel`, `closedLabel` | `labels={{ open, closed }}` |
| `dialog` | sr-only "Close" | `<DialogContent labels={{ close }}>`, default "Cerrar" |
| `loading-state` | "n de N" hard-coded | `labels={{ progress: (done, total) => … }}` |
| `time-range-selector` | `all` label "All" | "Todo"; `labels.group` names the control (default "Periodo") |
| `loading-spinner` | `size` in px, label "Loading" | `size="sm" \| "md" \| "lg"`, label "Cargando" |

**Unified families**

- `badge` takes `tone` (neutral, brand, success, warning, danger, info) and `appearance` (subtle, solid, plain),
  plus `icon` and `withDot`. The shadcn `variant` names still work. It renders a `<span>` (was a `<div>`).
  `status-badge` is now a thin wrapper over it; `statusBadgeVariants` is gone (use `badgeVariants`).
- `spinner` is the only spinner: `button` (`loading`), `loading-spinner` and `loading-state` use it.
- `card` is a tonal surface (no border or shadow, 8px radius, 20px padding, 16px title) and also exposes
  `Card.Header`, `Card.Title`, `Card.Description`, `Card.Content`, `Card.Footer`. Fields inside a card use `surface-3`.
- `text-field` and `textarea-field` are built on `field`. For any other control, wrap it: `<Field label error><Select/></Field>`.
- `time-range-selector` and the default `tabs` use the `segmented-control` indicator; `time-range-selector`
  is now a `radiogroup` (was buttons with `aria-pressed`).

**Look changes worth checking in your screens**

- `button`: `secondary`/`outline` are tonal (no border); sizes are 32/36/40px (`sm`/default/`lg`, was 36/40/44).
- Inputs, selects, textareas and picker triggers are filled and 36px tall (was 40px, outlined).
- `checkbox` keeps a 1.5px edge (a control needs a visible boundary); `switch` and `slider` lose their shadows.
- `progress` is 8px tall by default (was 16px). `chip` is a pill.

## v2, phase 1: foundations (2026-11-12)

`stellify-base` has the v2 tokens ([docs/tokens.md](docs/tokens.md)). Re-run
`npx shadcn add @stellify/stellify-base --overwrite`, then:

1. Self-host the fonts: `npm i @fontsource-variable/inter @fontsource-variable/geist-mono` and import both once.
2. If you rebranded, move your color to `--brand`, `--brand-foreground` and `--brand-subtle` (both `:root` and `.dark`).
   `--primary`, `--ring` and the chart slot 1 follow it.
3. Replace the removed tokens:

| Removed | Use |
|---|---|
| `--shadow-card`, `--shadow-card-hover`, `--shadow-button` | Nothing in the flow casts a shadow. Separate with `bg-surface-2`. Overlays: `--shadow-overlay`. |
| `--radius-card` (22px), `--radius-icon` (16px) | `--radius-container` (8px) |
| `--duration` | `--duration-base` (240ms); also `-fast` / `-slow` |
| `--space-hero-top`, `--space-hero-bottom`, `--space-section`, `--leading-body` | Tailwind spacing / `leading-*` in the block itself. |

Values that changed meaning (same name):

- `--secondary` and `--accent` are neutral tones (`surface-3`), no longer teal and brand tint. Use `--brand-subtle` for a brand tint.
- `--border` and `--input` are a translucent hairline. `--ring` is ink, not brand.
- `--card` is `surface-2`: a card on the page is a step of tone, not white with a border.
- `--success` is green-teal (hue 160), no longer the brand; `--info` is blue, not teal; `--warning` text is darker so it passes AA on its tint.
- `--chart-1..5` are categorical (brand, blue, orange, violet, teal) instead of five greens. `data-chart-palette="mono"` restores a one-hue ramp.
- `--radius` is 8px (was 10px); `rounded-sm`/`md` are 4px, `rounded-lg`/`xl` 8px.

New: `--surface-1/2/3`, `--surface-overlay`, `--hairline`, `--field`, `--field-hover`, `--danger*` and every
`-subtle` status tint, `--focus*`, `--shadow-overlay`, `--ease-in-out`, `--tracking-mono-caps`.
The base layer now draws the focus outline and honours `prefers-reduced-motion` globally.

Components still carry v1 borders and halos; phase 2 removes them.

## v2, phase 0: catalogue cleanup (2026-11-12)

The registry now keeps only generic components (see the criterion in the README).
32 items are gone. If your app installed one of them, **you already have the code**:
`shadcn add` copied it, so nothing breaks until you re-run `shadcn add` on it. Keep your copy.

| Removed items | Where they live now |
|---|---|
| `business-card`, `map-view`, `outreach-card`, `search-form`, `coverage-matrix`, `quadrant-grid`, `quadrant-cell`, `reason-list`, `score-badge`, `onboarding-shell`, `step-heading`, `nav-footer`, `stacked-timeline`, `logo` | captationcenter `packages/ui` (synced to the registry's latest versions) |
| `offer-card`, `profile-intro`, `process-steps`, `closing-panel` | stellifyit-global / togent `components/ui` |
| `money-input` | Use `number-input`; a currency variant arrives with the v2 `number-field`. |
| `currency-display`, `use-currency-format` | `Intl.NumberFormat` directly, or `chart-formatters`. |
| `filter-bar` | `data-table-toolbar` + the `data-table-filter*` items. |
| `number-compare`, `month-year-picker`, `week-grid`, `week-dates`, `kanban`, `carousel`, `power-chart`, `slider-field`, `category-tag`, `form-modal` | Deleted (no consumer). Keep your copy if you have one. |

Other changes:

- Every item has `categories` (`foundations`, `ui`, `charts`, `data-table`, `blocks/app`,
  `blocks/site`, `blocks/assistant`, `motion`, `hooks`, `lib`) and `meta.status`.
- `intelui-*`, `actionable` and `intelui-highlight` are `blocks/assistant`, status `experimental`.
- The registry no longer depends on `leaflet`, `react-leaflet` or `@hookform/resolvers`.

Phases 1 to 4 (tokens, borderless core, charts and blocks, illustrations) will add their own
sections here. Rows below that mention removed items are historical.

How to replace existing usage with `@stellify` registry components. Pull each one
with `npx shadcn@latest add @stellify/<item>` (after `stellify-base`).

> Run `@stellify/stellify-base` **once per app** before any component.

## stellifyit-global/apps/web-app (source of truth)

The registry was extracted from this app, so most items have a direct origin.
Migrating here is optional (you'd be replacing the originals with normalized
copies); it's mainly useful to dogfood the registry.

| Registry item | Current usage in web-app | Notes |
|---|---|---|
| `@stellify/metric-card` | `src/components/Cards/CardSlider/cards/MetricCard.tsx` | Registry version is standalone (props instead of a `card` object) and adds `invertDelta`. |
| `@stellify/chart-card` | `src/components/Training/stats/StatChartCard.tsx` | i18n strings now passed as props (was `useTranslation` inside). |
| `@stellify/empty-state` | `src/components/ui/empty-state.tsx` | Same component, portable copy. |
| `@stellify/status-badge` | `ui/badge` used ad-hoc with `variant="destructive"` | New semantic `status` prop (success/warning/danger/info/neutral). |
| `@stellify/confirm-dialog` | `ui/alert-dialog` wired by hand per call site | Wraps it with title/description/confirm props + `destructive`. |
| `@stellify/data-table` | `src/components/DataGrid/DataGrid.tsx` | **Presentational only.** Keep your `useDataGrid` hook; feed its `data`/`sort` into `DataTable` and put search into `toolbar`, pagination into `footer`. |
| `@stellify/page-header` | (extracted from `Navigation/AdminHeader.tsx`) | Title block only — auth menu / theme / locale switchers stay in `AdminHeader`. |
| `@stellify/section-card` | `Panels/*` Card+Header pattern | Generic titled panel. |
| `@stellify/currency-display` / `@stellify/use-currency-format` | inline `value.toFixed(2) + ' EUR'` (e.g. `Panels/RecurringAlertsPanel.tsx`) | Replaces the ad-hoc string with `Intl.NumberFormat`. |
| `@stellify/week-grid` + `@stellify/week-dates` | `Planner/WeekView.tsx`, `DayColumn.tsx`, `EventBlock.tsx` | Generalized grid — no time gutter / drag-reschedule. Use for simple weekly layouts; keep the rich planner as-is. |
| `@stellify/progress-ring` | (none — new) | — |
| `@stellify/money-input` | `FormModal` number fields | Optional, for standalone money fields outside FormModal. |
| `@stellify/use-persisted-state` | pattern in `context/ThemeContext.tsx` | Generic localStorage state. |
| `@stellify/button` | `src/components/ui/button.tsx` | **Overwrite.** Superset API — adds `primary`/`secondary`/`base`, `loading`, CRUD `mode`. `default`/`outline`/`ghost` kept as aliases so existing usages don't break. Install with `--overwrite`. |
| `@stellify/input` | `src/components/ui/input.tsx` | **Overwrite.** Same API + `aria-invalid` border. Install with `--overwrite`. |
| `@stellify/text-field` | label+input pairs in forms / `Fields/` | Optional labeled wrapper (error/helper/icons) for inputs outside FormModal. |
| `@stellify/data-table-pagination` | `src/components/DataGrid/DataGridPagination.tsx` | Presentational; Spanish labels are now props (English defaults). |
| `@stellify/data-table-toolbar` | `src/components/DataGrid/DataGridFilters.tsx` | Search + filters toggle; filter widgets stay app-side. |
| `@stellify/data-table-mobile` | `src/components/DataGrid/MobileList.tsx` + `MobileListItem.tsx` | Card-per-row view, decoupled from `useDataGrid`. |

## Other consuming apps

These had **no overlapping components** (verified in recon), so adoption is
greenfield: install `stellify-base` + whatever you need.

| App | First step | Then |
|---|---|---|
| `recetia-landing` | Already has shadcn + Tailwind v4 → add the registry to `components.json`, wire `@theme inline` (see README). | `add @stellify/stellify-base`, then components. |
| `recetia/recetia-studio` | `shadcn init` (Tailwind v4, no shadcn yet). | Add registry → `stellify-base` → components. |
| `ebrebook/frontend` | `shadcn init` (Tailwind v3, currently hex tokens). `stellify-base` replaces them with oklch. | Add registry → `stellify-base` → components. |
| `recetia/recetia-app` | **N/A** — React Native/Expo, not supported. | — |
| `assistant`, `deltransform` | **N/A** — not Tailwind/shadcn web apps. | — |

## Left out on purpose (decisions to make per call site)

- **`DataTable`** ships without data fetching, pagination state, debounced
  search or column filters — that logic was app-specific (`useDataGrid` +
  `StellifyitFilters`). Keep your hook; the registry component is the view layer.
- **`PageHeader`** carries no auth / theme / locale logic from `AdminHeader`.
- **`week-grid`** carries no drag-to-reschedule, time-axis gutter, or category
  config from the full planner.
- **Kanban** components were requested but **don't exist** in any repo, so none
  were created.
