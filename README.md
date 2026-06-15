# @stellify — shared component registry

A [shadcn registry](https://ui.shadcn.com/docs/registry) of reusable React +
Tailwind components, served from GitHub. Components are **copied** into each app
on install (the shadcn model): editable, no version coupling, updates are
pull-based (re-run `shadcn add`).

> Not an npm package. There is no `@stellify` to `npm install`. You consume it
> through the shadcn CLI, which fetches JSON from this repo's raw GitHub URLs.

## Storybook (component showcase)

Browse every component in isolation — variants, light/dark, controls — in
Storybook:

- **Online:** https://josepcastellsportfolio.github.io/stellify-ui/ (deployed
  from `main` via GitHub Actions).
- **Local:**
  ```bash
  npm install
  npm run storybook      # dev server on :6006
  npm run build-storybook  # static build → storybook-static/
  ```

Storybook renders the **published registry sources** directly. The shadcn
primitives (`card`, `select`, `table`, …) plus `cn` live in
`.storybook/shadcn/` — a "consumer" tree that mimics an app after `shadcn init`,
so the stories prove the components work exactly as installed. It does not touch
the registry; `shadcn build` is unaffected.

## What's in here

| Item | Type | Summary |
|---|---|---|
| `stellify-base` | style | The design system: emerald/teal/slate tokens (light + dark, oklch), Inter font, radius. **Install first.** |
| `button` | ui | **Overwrites `ui/button`.** Hierarchy `primary`/`secondary`/`base` (+ `destructive`/`success`/`warning`/`info`/`link`, plus `default`/`outline`/`ghost` back-compat aliases), `loading` spinner, and a CRUD `mode` (`create`/`edit`/`finish`) → semantic color + icon. |
| `input` | ui | **Overwrites `ui/input`.** Standard shadcn input + invalid state (`aria-invalid` → destructive border). API-compatible. |
| `text-field` | component | Labeled input with error/helper text + leading/trailing icons (wraps `input`). |
| `metric-card` | component | KPI card (label, value, unit, delta, accent icon, `invertDelta`). |
| `chart-card` | component | Card shell for charts: loading / empty / error states + header actions. |
| `currency-display` | component | Number → localized currency via `Intl.NumberFormat`. |
| `money-input` | component | Controlled numeric input with a currency adornment. |
| `progress-ring` | component | SVG circular progress, themed via tokens. |
| `page-header` | component | Title + description + actions (presentational only). |
| `section-card` | component | Titled card panel shell. |
| `empty-state` | ui | Icon + title + description + action placeholder. |
| `status-badge` | component | Badge with semantic status colors. |
| `confirm-dialog` | component | Confirmation dialog over AlertDialog. |
| `data-table` | component | Controlled, presentational paginated table (sort, skeleton, empty; `toolbar`/`footer` slots). |
| `data-table-pagination` | component | Pagination footer (page-size + prev/next) for `data-table`. |
| `data-table-toolbar` | component | Search box + filters toggle for `data-table`'s toolbar slot. |
| `data-table-mobile` | component | Card-per-row mobile view reusing `data-table` columns. |
| `use-currency-format` | hook | Memoized currency formatter. |
| `use-persisted-state` | hook | `useState` synced to localStorage (SSR-safe). |
| `week-dates` | lib | Date helpers for weekly grids (no date library). |
| `week-grid` | component | 7-day week grid + day columns (generalized planner). |
| `carousel` | component | Generic card carousel: autoplay, hover-pause, drag/swipe, responsive slides-per-view, arrows + dots. Pass `items` + `renderItem`. |
| `form-modal` | component | Reusable CRUD form modal (react-hook-form + zod): text/number/date/select/color/switch fields, two-column layout, create/update handlers. Copy via props; `onNotify` for toasts. |
| `date-picker-field` | component | Button + calendar popover; emits ISO `YYYY-MM-DD`. Locale via prop. |
| `month-year-picker` | component | Native month input (`YYYY-MM`) wrapper, controlled via month/year. |
| `loading-spinner` | component | Centered spinner; `fullScreen` for route-level loading. |
| `category-tag` | component | Colored badge resolving Parent / Child category hierarchy. |
| `logo` | component | StellifyIT wordmark (SVG, `currentColor`). |

### Charts

Vendored from shadcn/ui and re-themed with the stellify-base `--chart-*` tokens
(so they match the StellifyIT palette in light/dark). Each chart ships demo data
inside its file — copy it in and edit freely.

| Item | Type | Summary |
|---|---|---|
| `chart` | ui | The chart primitive: `ChartContainer` / `ChartTooltip` / `ChartLegend` over Recharts. **Required by the charts below.** Overwrites `ui/chart`. |
| `chart-area` | component | Area chart. |
| `chart-bar` | component | Bar chart. |
| `chart-line` | component | Line chart. |
| `chart-pie` | component | Pie / donut chart. |
| `chart-radar` | component | Radar chart. |
| `chart-radial` | component | Radial chart. |

```bash
npx shadcn@latest add @stellify/chart @stellify/chart-area
```

The `chart-area` / `chart-bar` / `chart-line` blocks are **data-driven** (pass
`data` + `config`, or render with no props for the demo).

#### PowerChart — dashboard-grade chart

`@stellify/power-chart` is a single configurable component (Grafana-ish) over the
chart primitive. One `type` prop (`area|bar|line|pie|radar|radial`) + options:

- **Reference lines / thresholds** with semantic colors (`success|warning|info|destructive`).
- **Interactive legend** — click a series to show/hide (`legend.interactive`).
- **Intl tooltips + axes** via `formatters` (`currency|number|date`).
- **Brush + time-range selector** (7d/30d/90d/All) for time series.
- **Loading / empty / error** states (reuses `chart-card`).

```tsx
<PowerChart
  type="bar" title="Spend vs budget" data={rows} xKey="month"
  series={[{ key: "spend", color: "var(--chart-3)" }]}
  referenceLines={[{ value: 250, label: "Budget", color: "warning" }]}
  legend={{ interactive: true }}
  formatters={{ value: { kind: "currency", currency: "EUR", locale: "es-ES" } }}
/>
```

Supporting items pulled in automatically: `chart-formatters` (lib),
`use-series-toggle` (hook), `time-range-selector` (ui). Brush/reference lines
apply to cartesian charts only. Install:

```bash
npx shadcn@latest add @stellify/power-chart
```

### shadcn primitives

The registry also ships the standard shadcn primitives under `@stellify`, so an
app **without** shadcn can install everything from one place (they overwrite
`ui/<name>` and are identical to upstream):

`badge`, `card`, `dialog`, `select`, `tabs`, `checkbox`, `switch`, `tooltip`,
`dropdown-menu`, `popover`, `calendar`, `textarea`, `separator`, `label`,
`progress`, `form` (plus the customized `button` / `input` above).

```bash
npx shadcn@latest add @stellify/card @stellify/dialog @stellify/select --overwrite
```

Source lives in [`registry/stellify/`](registry/stellify/). Built JSON (what the
CLI fetches) lives in [`public/r/`](public/r/).

---

## Publishing / updating the registry

1. Edit or add a source file in `registry/stellify/`.
2. Register it in [`registry.json`](registry.json) (`name`, `type`,
   `dependencies`, `registryDependencies`, `files`).
3. Rebuild the JSON:
   ```bash
   npm install        # first time only, installs the shadcn CLI
   npm run registry:build   # = shadcn build  → writes public/r/*.json
   ```
4. Commit **both** the source and the regenerated `public/r/*.json`, then push.
   Consumers pull the change by re-running `shadcn add @stellify/<item>`.

> `homepage` in `registry.json` points at
> `https://github.com/josepcastellsportfolio/stellify-ui`.

---

## Consuming it in an app

### 1. Point the app at the registry

Add the namespace to the app's `components.json` (create it with `shadcn init`
if it doesn't exist):

```json
{
  "registries": {
    "@stellify": "https://raw.githubusercontent.com/josepcastellsportfolio/stellify-ui/main/public/r/{name}.json"
  }
}
```

### 2. Install the base, then components

```bash
npx shadcn@latest add @stellify/stellify-base
npx shadcn@latest add @stellify/metric-card
```

`stellify-base` writes the StellifyIT tokens into your CSS. Components land in
`@/components/...` and import `@/lib/utils` (`cn`) and `@/components/ui/*` exactly
like any other shadcn component — re-using the ones you already have.

### Overwriting `ui/button` and `ui/input`

`@stellify/button` and `@stellify/input` **replace** the standard shadcn files
at `@/components/ui/button.tsx` and `@/components/ui/input.tsx`. Their API is a
superset of the standard ones (same variants/sizes/props, plus extras), so the
overwrite is safe — existing usages keep working. Install with `--overwrite`:

```bash
npx shadcn@latest add @stellify/button @stellify/input --overwrite
```

The enhanced button adds the `primary`/`secondary`/`base` hierarchy, `loading`,
and a CRUD `mode`:

```tsx
<Button mode="create">New expense</Button>      {/* success color + Plus icon */}
<Button mode="edit" variant="secondary">Edit</Button>
<Button loading>Saving…</Button>
```

`@stellify/text-field` is a labeled wrapper around the input:

```tsx
<TextField label="Email" error={errors.email} leadingIcon={Mail} required />
```

### Composing the data table

`data-table` is the controlled view; compose it with the helpers via its slots,
and swap to the mobile view behind a breakpoint:

```tsx
<div className="hidden md:block">
  <DataTable
    columns={columns} rows={rows} getRowKey={(r) => r.id}
    sort={sort} onSortChange={onSortChange} loading={loading}
    toolbar={<DataTableToolbar search={q} onSearchChange={setQ} />}
    footer={<DataTablePagination total={total} page={page} pageSize={size}
              onPageChange={setPage} onPageSizeChange={setSize} />}
  />
</div>
<div className="md:hidden">
  <DataTableMobile columns={columns} rows={rows} getRowKey={(r) => r.id} loading={loading} />
</div>
```

Fetching, debouncing and filter state stay in your own hook (e.g. `useDataGrid`).

### Per-stack notes

The target projects are deliberately heterogeneous. The components only use
shadcn **utility classes** (`bg-card`, `text-muted-foreground`, `border`,
`rounded-lg`…), never raw colors, so they work on both Tailwind v3 and v4 as
long as the `stellify-base` variables are present.

**Tailwind v3** (e.g. `stellifyit-global/apps/web-app`, `ebrebook/frontend`) —
already-set-up shadcn projects map the variables in `tailwind.config.js`:

```js
// tailwind.config.js → theme.extend.colors
primary: "oklch(var(--primary) / <alpha-value>)",
// …success / warning / info too (status-badge needs them):
success: { DEFAULT: "oklch(var(--success) / <alpha-value>)", foreground: "oklch(var(--success-foreground) / <alpha-value>)" },
warning: { DEFAULT: "oklch(var(--warning) / <alpha-value>)", foreground: "oklch(var(--warning-foreground) / <alpha-value>)" },
info:    { DEFAULT: "oklch(var(--info) / <alpha-value>)",    foreground: "oklch(var(--info-foreground) / <alpha-value>)" },
```
(See `stellifyit-global/apps/web-app/tailwind.config.js` for the full, working
mapping — copy it.)

**Tailwind v4** (e.g. `recetia-landing`, `recetia/recetia-studio`) — there is no
config file; expose the variables through `@theme inline` in your global CSS:

```css
@import "tailwindcss";
/* stellify-base wrote :root / .dark variables above */
@theme inline {
  --color-primary: var(--primary);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-info: var(--info);
  /* …map the rest the same way */
}
```

**Projects without shadcn yet** (`recetia-studio`, `ebrebook/frontend`) — run
`npx shadcn@latest init` first (it creates `components.json`, `@/lib/utils`, and
the base UI primitives), then add the `@stellify` registry and install items.

### Not supported

- **`recetia/recetia-app`** is **React Native / Expo** (NativeWind). These are
  DOM components and do **not** run there.
- **`assistant`** (Python) and **`deltransform`** (Plone/Volto, no
  Tailwind/shadcn) are out of scope.

---

## Local development

`tsc --noEmit` over the registry sources (uses web-app's `node_modules` and
shims for the `@/` aliases):

```bash
cd .typecheck
node node_modules/typescript/bin/tsc -p tsconfig.json
```

The `.typecheck/` folder is a validation harness only — it is not part of the
published registry.
