# Migration guide

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
