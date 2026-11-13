# Migration guide

## Chat items, model picker and accessibility fixes (2026-11-13)

**New** (status `experimental`, category `blocks/chat`, installed under `components/chat/`): `model-picker`,
`chat-composer`, `message-bubble`, `markdown-message`, `message-actions`, `tool-activity`, `turn-status`,
`conversation-list`, `side-drawer`, `mic-button`, `keyboard-shortcuts-dialog`, `pairing-qr`, and the hook
`use-smooth-text`. They come from voice-bridge's `web/src/components/chat/`; differences from those copies:

| Item | voice-bridge copy | Registry |
|---|---|---|
| `chat-composer` | `voiceControl` slot, bordered frame | `controls` slot (model picker, mic), tonal frame (`surface-2`, `brand-subtle` when `tone="private"`); built on `textarea` + `button` |
| `keyboard-shortcuts-dialog` | `title`, `orLabel`, `closeLabel` props, `LabeledDialogContent` | `labels={{ title, or, close }}`; the registry `dialog` now has a translatable, larger close button |
| `segmented-control` | own native-radio copy | not added: the registry one gains `accessibleLabel` per option and `size="lg"` (44px) |
| `model-picker` | dropdown menu with `private`/`available` | new item (search, groups rail, favorites, status, speed, Alt+1…9, sheet on touch) |
| all | required `labels` | `labels` optional, Spanish defaults; `message-bubble`/`conversation-list` take `headingLevel` |

**Tokens.** New `--field-edge` (light `oklch(0.6 0.015 265)`, dark `oklch(0.55 0.015 265)`), ≥ 3:1 against every
surface (WCAG 1.4.11). `--input` now points at it, so upstream shadcn components that draw `border-input` get a
visible boundary. `--border` stays the faint hairline: it is only for dividers, which 1.4.11 does not cover.

**Visible changes**

- `input`, `textarea`, `select`, `number-input`, the date-picker triggers and the calendar's month/year selects keep
  their fill and gain a 1px `field-edge` underline (filled, still not outlined).
- `switch`: the unchecked track is `field-edge` (was `foreground/25`, 1.7:1).
- `button`: `default`, `lg` and `icon` get `min-h-11` (and `min-w-11` for `icon`) on coarse pointers. Desktop sizes
  are unchanged; `sm` stays compact everywhere.
- `dialog`: the close button is a 32px target (44px on touch), was ~28px.

**API**

- `textarea`: `autoResize` now measures on every value change (a controlled box cleared after sending shrinks back)
  and takes `maxHeight` (px), past which it scrolls. `field-sizing-content` is gone.
- `confirm-dialog`: `returnFocusRef` for dialogs opened from a menu item.
- `empty-state`, `loading-state`: `headingLevel` (2–6, default 3).
- `segmented-control`: `accessibleLabel` per option, `size="lg"`.
- `use-persisted-state` and `use-prefers-reduced-motion` use `useSyncExternalStore` (no setState in an effect; they
  passed React's `react-hooks/set-state-in-effect` lint only after this). `use-persisted-state` now also syncs hooks on
  the same key and other tabs.
- `"use client"` added to every item that calls hooks or builds event handlers and lacked it (31 files). Items that only forward event props
  (`chip`, `site-footer`, `inline-cta`…) were left alone so they keep working in Server Components.

Already fixed on `main` by the v2 tokens and not touched here: `--muted-foreground` (6.5:1 light), `--destructive`
as text (7.8:1 dark), `--warning` as text (5.5:1 light), `status-badge` neutral/danger, the focus ring on
`input`/`textarea` (the global 2px solid outline), `dialog`'s close label, `confirm-dialog`'s label props and
`loading-state`'s "n de N".

## v2, phase 3: charts, blocks and motion (2026-11-13)

The v2 rules now cover every item, and `tests/registry.test.ts` checks all of them: no focus halos, no
non-overlay shadows, no blur or gradients, no outlined fields, no raw palette colors (`bg-emerald-200`…) and no
utilities from the removed v1 tokens.

- **Removed-token utilities.** Blocks used `rounded-card`, `rounded-icon`, `rounded-pill`, `leading-body`,
  `shadow-card`, `tracking-display`, `duration-base` and `ease-out-soft`, which only worked if your Tailwind config
  defined them. They now use `rounded-lg`, `rounded-full`, `leading-relaxed`, `tracking-(--tracking-display)` and
  the motion tokens.
- **Charts.** Bars have 4px rounded tops on the baseline; area and radar fills are light (12–15%) with a 2px line;
  pie slices are separated by a 2px surface ring; the tooltip is an overlay. Axis ticks use Geist Mono and now
  actually take the muted color (recharts 3 moved the tick class, so the shadcn selector never matched).
  `chart-card`: `retryLabel` → `labels.retry` ("Reintentar").
- **`metric-card`.** `accent` takes `neutral | brand | success | warning | danger | info` (default `neutral`); the
  v1 hues (`emerald`, `rose`…) still work and map onto them. Value and delta use tabular mono; status colors come
  from the tokens, so they follow dark mode and rebranding.
- **App blocks.** `app-shell`'s sidebar is a tonal column (`bg-sidebar`), not a bordered one; `sidebar` marks the
  active item with `sidebar-accent` and a brand edge.
- **Site blocks.** `cookie-consent` floats as an overlay on desktop; `acceptLabel`, `rejectLabel`, `policyLabel` →
  `labels`. `site-chat` copy moves to `labels`. `mega-menu-panel` uses the overlay surface and shadow.
- **Motion.** Every GSAP tween and timeline sets `overwrite: "auto"`, so a new animation on the same element
  replaces the running one instead of fighting it.

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
- `stellify-base` now sets the hairline as the default border color (Tailwind 4 defaulted to the text color, so
  every `border-b` was a dark line). Re-add `stellify-base` to pick it up.
- **Data table family** (breaking copy props, Spanish defaults):
  - `data-table`: new `filter` on columns plus `filters` / `onFilterChange` (header filter buttons), `selectedKeys` /
    `onSelectedKeysChange` (checkbox column, select-all) and `bulkActions` (bar above the rows), `labels`.
  - `data-table-toolbar`: `searchPlaceholder`, `resetLabel`, `clearSearchLabel` → `labels`; `showFilterToggle`,
    `filtersOpen`, `onToggleFilters` are gone (put `DataTableAdvancedFilters` in the new `filters` slot);
    `children` renders under the row (for `DataTableActiveFilters`).
  - `data-table-pagination`: `rowsPerPageLabel`, `ofLabel`, `previousLabel`, `nextLabel` → `labels`; shows the range
    ("1–10 de 42") and numbered pages.
  - New `data-table-advanced-filters` ("Filtros" button + panel with every filterable column).
  - `data-table-active-filters`: optional `onClearAll` ("Limpiar filtros"), `labels`.
  - `data-table-filters`: `applyFilters`, `matchesFilter`, `countActiveFilters` for in-memory rows.
  - `data-table-mobile`: `layout="grid"` for a cards view, `rowClassName`.
  - Fixed: components imported `./data-table-filters`, which broke once installed (the lib lands in `lib/`); and date
    presets ("Este mes"…) used UTC, so east of UTC they started a day early.
- `table`: header row on `surface-2` with mono caps labels, hairline row separators, hover `surface-2`, selected row
  `brand-subtle` with a brand edge. `data-table`: rounded hairline frame; the `footer` (e.g. pagination) now renders
  inside the frame on `surface-2`; right-aligned columns use Geist Mono tabular figures.

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
