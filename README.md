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

Every item in `registry.json` carries a `categories` entry (the group below) and a `meta.status`:
`ready`, `experimental` or `deprecated`. Storybook follows the same order. What belongs in the core:
generic (no domain vocabulary) and used by 2+ products, or a base piece of the system.
Domain components live in their product (see [MIGRATION.md](MIGRATION.md)).

### Foundations

Install `stellify-base` once per app, before anything else. It writes the tokens (`:root` and `.dark`), the
Tailwind 4 `@theme inline` wiring (so `bg-surface-2`, `text-danger`, `bg-field`… exist), the focus outline and the
reduced-motion rule. Every value, with what it is for and the contrast checks behind it, is in
[docs/tokens.md](docs/tokens.md); Storybook shows them under **Foundations**.

It names the fonts but does not load them. Self-host both:
`npm i @fontsource-variable/inter @fontsource-variable/geist-mono`, then import them once in your entry file.

To rebrand, override `--brand`, `--brand-foreground` and `--brand-subtle` in both `:root` and `.dark`.

| Item | Type | Summary |
|---|---|---|
| `stellify-base` | style | StellifyIT design tokens v2: tonal surfaces, status and chart palettes, 4/8px radii, solid focus outline, one overlay shadow, motion, Inter + Geist Mono (light + dark, oklch). Install first. |

### UI (core)

Generic building blocks. The standard shadcn primitives ship here too, so an app **without** shadcn installs everything from one place (they overwrite `ui/<name>`; use `--overwrite`).

| Item | Type | Summary |
|---|---|---|
| `trend-indicator` | component | Up/down/flat arrow with a formatted change and a semantic tone (up = success, down = danger; invertible for costs). Direction can be derived from a numeric change with a flat threshold. The required label is what screen readers read; copy via props. |
| `progress-ring` | component | SVG circular progress indicator. value/max/size/strokeWidth via props, themed with currentColor + muted track. |
| `section-card` | component | Card with a titled header, optional description, header actions slot and content area. Common panel shell. |
| `status-badge` | component | Badge whose tone is a status (success/warning/danger/info/neutral); `appearance="plain"` for icon + text. Thin wrapper over badge. |
| `confirm-dialog` | component | Controlled confirmation dialog over AlertDialog. All copy via props; destructive flag for dangerous actions. |
| `alert-dialog` | ui | Radix alert dialog (vendored from shadcn so `confirm-dialog` never resolves upstream). Emits data-slot. |
| `table` | ui | Table primitives (vendored from shadcn so `data-table` never resolves upstream). Emits data-slot. |
| `button` | ui | Shadcn-compatible button: primary (brand) / secondary (tonal) / base (no fill) + destructive/success/warning/info/link, no borders or shadows. `loading` shows the Spinner; CRUD `mode` (create/edit/finish) injects color and icon. Overwrites ui/button. |
| `input` | ui | Filled input (bg-field, no border); aria-invalid turns it danger-subtle. Focus is the global outline. API-compatible; overwrites ui/input. |
| `field` | ui | Form-control wrapper: label, control, then help or error. Owns htmlFor / aria-invalid / aria-describedby / required for any control (input, textarea, select, number-input, pickers). |
| `spinner` | ui | The one spinner: a ring in the current color, sizes sm/md/lg, `decorative` inside busy buttons. Used by button, loading-spinner and loading-state. |
| `segmented-control` | ui | Pick one of 2-5 options; the ink indicator slides and changes course mid-move when you click again (interruptible CSS transition). radiogroup, arrows/Home/End, roving tabindex. Exports useSlidingIndicator (used by tabs). |
| `text-field` | component | Field + Input in one: label, error/help and optional leading/trailing icons. Copy via props. |
| `badge` | ui | One badge for labels and states: `tone` (neutral/brand/success/warning/danger/info) x `appearance` (subtle/solid/plain), `icon`, `withDot`, `size` (default | xs), `uppercase` (mono caps). shadcn `variant` names still work. Emits data-slot. |
| `card` | ui | Raised area: surface-2, no border or shadow, 8px radius. Parts as named exports or Card.Header / Title / Description / Content / Footer. Fields inside switch to surface-3. Overwrites ui/card. |
| `dialog` | ui | Standard shadcn dialog primitive, shipped under @stellify for apps without shadcn. Overwrites ui/dialog. |
| `select` | ui | Standard shadcn select primitive, shipped under @stellify for apps without shadcn. Overwrites ui/select. |
| `tabs` | ui | Radix tabs. Default: segmented look with a sliding, interruptible ink indicator. `TabsList variant="plain"`: text tabs with a sliding underline. Overwrites ui/tabs. Emits data-slot. |
| `checkbox` | ui | Standard shadcn checkbox primitive, shipped under @stellify for apps without shadcn. Overwrites ui/checkbox. |
| `slider` | ui | Standard shadcn slider primitive (Radix), single or range thumbs, shipped under @stellify. Overwrites ui/slider. |
| `switch` | ui | Standard shadcn switch primitive, shipped under @stellify for apps without shadcn. Overwrites ui/switch. |
| `tooltip` | ui | Standard shadcn tooltip primitive, shipped under @stellify for apps without shadcn. Overwrites ui/tooltip. |
| `dropdown-menu` | ui | Standard shadcn dropdown-menu primitive, shipped under @stellify for apps without shadcn. Overwrites ui/dropdown-menu. |
| `popover` | ui | Standard shadcn popover primitive, shipped under @stellify for apps without shadcn. Overwrites ui/popover. |
| `calendar` | ui | Standard shadcn calendar primitive, shipped under @stellify for apps without shadcn. Overwrites ui/calendar. |
| `textarea` | ui | Filled textarea with `autoResize` (grows with content); aria-invalid turns it danger-subtle. Emits data-slot. |
| `separator` | ui | Standard shadcn separator primitive, shipped under @stellify for apps without shadcn. Overwrites ui/separator. |
| `label` | ui | Standard shadcn label primitive, shipped under @stellify for apps without shadcn. Overwrites ui/label. |
| `progress` | ui | Standard shadcn progress primitive, shipped under @stellify for apps without shadcn. Overwrites ui/progress. `size="sm"`: thin bar on a neutral track. |
| `form` | ui | Standard shadcn form primitive, shipped under @stellify for apps without shadcn. Overwrites ui/form. |
| `time-range-selector` | ui | Time-range picker (7d/30d/90d/Todo) on segmented-control + getRangeBounds() helper. labels prop. For chart headers. |
| `date-picker-field` | component | Button + calendar popover date field. Emits ISO YYYY-MM-DD. Locale via prop. |
| `loading-spinner` | component | Spinner centered in its container or the viewport (`fullScreen`). size sm/md/lg; label defaults to "Cargando". |
| `date-range-picker` | component | Range calendar popover with presets, Apply/Cancel, side-by-side months, and an optional date↔datetime switch that unlocks start/end time pickers (default 00:00). Emits ISO { from, to } (with THH:mm when time is on). |
| `time-picker` | component | Hour + minute selects (+ AM/PM unless use24Hour). Controlled, emits 24h 'HH:mm'. minuteStep configurable. |
| `overflow-marquee` | component | Truncates with an ellipsis at rest and, only when the text actually overflows, slides horizontally on hover/focus to reveal the full string, easing back on leave. Self-contained (measures its own overflow, pure CSS transform, no Tailwind config). Honors reduced motion; keeps a native title fallback. |
| `number-input` | component | Controlled numeric input (empty = null) with a vertical ± stepper, min/max clamping and translatable button labels. |
| `choice-card` | component | Single-choice block options (Radix radio group): title + description, selected = primary border + check. |
| `textarea-field` | component | Field + Textarea: the multi-line sibling of text-field. |
| `chip` | component | Small neutral tag (e.g. a detected signal); optional `onRemove` adds an accessible remove button. |
| `collapse-toggle` | component | Text button that collapses/expands a region (aria-expanded, aria-controls). |
| `loading-state` | component | Long-running work: title + text + spinner, optional "n de N" progress (role=status). |

### Charts

The `chart` primitive (`ChartContainer` / `ChartTooltip` / `ChartLegend` over Recharts) is required by every chart. Each chart ships demo data inside its file; `chart-area`, `chart-bar` and `chart-line` are data-driven (`data` + `config`).

| Item | Type | Summary |
|---|---|---|
| `chart-card` | component | Card shell for charts with loading skeleton, empty and error states, header actions slot. All copy passed via props. |
| `chart` | ui | shadcn chart primitive: ChartContainer/ChartTooltip/ChartLegend over Recharts, wired to stellify-base chart tokens. Overwrites ui/chart. |
| `chart-area` | component | Area chart built on the chart primitive + Recharts, using stellify-base chart-N tokens. Demo data inside — edit freely. |
| `chart-bar` | component | Bar chart built on the chart primitive + Recharts, using stellify-base chart-N tokens. Demo data inside — edit freely. |
| `chart-line` | component | Line chart built on the chart primitive + Recharts 3, using stellify-base chart-N tokens. Optional per-series dashes, linear curve, Y axis and X formatter. Demo data inside. |
| `chart-pie` | component | Pie / donut chart built on the chart primitive + Recharts, using stellify-base chart-N tokens. Demo data inside — edit freely. |
| `chart-radar` | component | Radar chart built on the chart primitive + Recharts, using stellify-base chart-N tokens. Demo data inside — edit freely. |
| `chart-radial` | component | Radial chart built on the chart primitive + Recharts, using stellify-base chart-N tokens. Demo data inside — edit freely. |
| `chart-formatters` | lib | Intl-based value/currency/date/number formatters for chart tooltips, legends and axis ticks. Pure, no React. |
| `use-series-toggle` | hook | Visibility state for an interactive chart legend (click series to show/hide). |

### Data table

`data-table` is presentational: keep your own data hook and feed it `rows`/`sort`; search goes in `toolbar`, pagination in `footer`. See [Composing the data table](#composing-the-data-table).

| Item | Type | Summary |
|---|---|---|
| `data-table` | component | Presentational, controlled table in a rounded frame: tinted header, hairline rows, footer inside. Sort, per-column header filters (`filter` + `filters`/`onFilterChange`), row selection with select-all and a bulk-actions bar, row actions, loading skeleton, empty state. Right-aligned columns use tabular mono figures. Spanish `labels`. |
| `data-table-pagination` | component | Controlled pagination: rows per page, "1–10 de 42" range and numbered pages with gaps. Spanish `labels`. |
| `data-table-toolbar` | component | Search row for data-table with `filters` and `actions` slots and children for active-filter chips. Spanish `labels`. |
| `data-table-mobile` | component | Card-per-row mobile view reusing data-table's columns. Pair with data-table behind a breakpoint. Includes loading skeletons + empty slot. |
| `data-table-filters` | lib | Filter type system for DataTable: 10 filter kinds, operators, state shapes, type guards and factory helpers. No UI. Also `applyFilters` / `matchesFilter` / `countActiveFilters` for in-memory rows. |
| `data-table-filter-widget` | component | Renders the control for one filter definition — text, number, ranges, date, datetime, select, multiselect and async column values. |
| `data-table-column-filter` | component | Header filter button (tinted while active) opening the column's FilterWidget in a popover. |
| `data-table-active-filters` | component | Active-filter chips: column + value, click to edit, ✕ to clear, optional "Limpiar filtros". Spanish `labels`. |
| `data-table-advanced-filters` | component | "Filtros" button with an active-count badge opening a panel with every filterable column's widget; edits apply live, with per-field reset and "Limpiar todo". Spanish `labels`. |

### Blocks · app

App layout pieces: built from the core, opinionated layout.

| Item | Type | Summary |
|---|---|---|
| `metric-card` | component | KPI card: label, value, unit, delta with trend arrow, accent icon chip. invertDelta flips good/bad colors (for expenses); tone colors the value (negative = red); details adds label/value rows. |
| `page-header` | component | Page title + optional description + actions slot. Presentational only (no auth/theme/locale logic). Optional `eyebrow` line above the title. |
| `empty-state` | component | Centered empty/placeholder block: icon, title, description and optional action. |
| `app-shell` | component | App frame: fixed left sidebar (collapsible), optional top bar, scrollable main. |
| `sidebar` | component | Vertical app nav: Sidebar, SidebarGroup, SidebarGroupLabel, SidebarItem (icon, active = aria-current, trailing slot, asChild for router links). |

### Blocks · site

Public pages. Prerender-safe: nothing reads `window`/`navigator`/`document` during render. Links go through an optional `renderLink` so apps keep client-side routing; copy comes in through props (`labels`).

| Item | Type | Summary |
|---|---|---|
| `site-nav` | ui | Public site navigation with an accessible mobile menu (focus trap, Escape to close). Optional mega-menu: desktop triggers open MegaMenuPanels (hover, click, ArrowDown; Escape/outside/blur close), mobile becomes a full-screen drill-down sheet (portal, focus trap, scroll lock, inert off-screen pane, actions dock). Links are real anchors so they stay crawlable. |
| `use-mega-menu` | hook | Mega-menu open/close state: instant open, delayed close for diagonal mouse moves, and a closing state kept until the exit animation finishes. No animation library. Exports megaMenuPanelId. |
| `use-mega-menu-motion` | hook | GSAP motion for MegaMenuPanel: background grows down, content unclips, items stagger in; category switch re-staggers only; faster fold-up on close. Also a render-nothing MegaMenuMotion component for SiteNav's menuMotion prop. Honors reduced motion. |
| `nav-preview-card` | ui | Mega-menu preview card: photo with scrim or a dark panel with title, summary and an optional decoration (FacetGrid included). Out of the tab order and a11y tree; renderLink for client routers. |
| `mega-menu-panel` | ui | Full-width mega-menu panel: up to three labelled link columns, optional CTA, and preview cards that follow the hovered/focused link. Always in the DOM (hidden) so links prerender; data-nav-* hooks for useMegaMenuMotion or a CSS fade. |
| `site-chat` | component | Public chat panel, degraded-first: renders a FAQ block by default and gains a composer when a service is available. Never shows a raw error or an indefinite spinner. |
| `site-footer` | component | Site footer with grouped link columns and a legal line. Real anchors — it doubles as the crawlable link graph. |
| `long-form-article` | component | Long-form page body: intro, optional status badge and figures, h2 sections with pull-outs, stack chips and related links. Content is plain strings, never markup. |
| `key-takeaways` | component | "En resumen" callout: an aside labelled by its h2 with a list of self-contained takeaways. Fits between the h1 intro and the first h2. Renders nothing when empty. |
| `faq-list` | component | FAQ section built on native details/summary (zero JS, answers present in the HTML for crawlers) plus a faqPageJsonLd() helper for schema.org FAQPage. |
| `inline-cta` | component | Compact bordered card with one sentence and a primary button-styled link. Meant to sit after a page's first paragraph. |
| `sticky-cta` | component | Mobile-only fixed bottom CTA bar (z-40, safe-area aware) with an optional secondary action (e.g. tel:) and an in-flow spacer so it never covers the footer. |
| `share-button` | component | Share button: native share sheet when available (checked on click), otherwise a popover with copy-link and LinkedIn/WhatsApp/X/email intent links. No third-party scripts. |
| `cookie-consent` | component | Presentational, non-modal analytics-cookie banner (z-50). Accept and Reject have equal weight; no close button that implies consent. |

### Blocks · assistant (experimental)

The intelUI assistant pieces. Experimental: they may change without a migration note until a second product adopts them.

| Item | Type | Summary |
|---|---|---|
| `intelui-types` | file | Shared presentational types for the intelUI assistant pieces (messages, tabs, conversations, actions). Engine-agnostic. |
| `intelui-pill` | component | Bottom-of-sidebar assistant pill: nav-item styling, fading label, highlighted when intelUI is active. Opens the assistant dropdown. Props-only. |
| `intelui-conversation-list` | component | Selectable conversation history list with per-row delete cross (reveals on hover). Props-only, i18n-agnostic. |
| `intelui-tabs` | component | Horizontal scrollable tab strip for open conversations: per-tab close cross + a new-conversation button. Props-only. |
| `intelui-chat-panel` | component | Upward-expanding transcript panel: context header, tab strip, suggestion chips and message log. max-height transition. Props-only. |
| `intelui-floating-bar` | component | Floating assistant input bar: portaled, anchored to the sidebar edge via --intelui-sidebar-w, grows from the icon. Send/stop (spinner+cancel), focus suggestions, caret-up chat panel. Props-only. |
| `intelui-dropdown` | component | Assistant popover content in two groups: Actions (Sparkles/Zap) and Conversations (Clock, deletable history), plus the intelUI switch. Props-only. |
| `intelui-highlight` | style | Assistant-actionable highlight: --intelui-accent token + a soft persistent outline on [data-intelui-actionable], reinforced on hover/focus and when [data-selected]. Respects reduced motion. Pairs with the Actionable wrapper. |
| `actionable` | component | Domain-agnostic wrapper that marks an entity as assistant-actionable: paints data-intelui-actionable / data-intelui-type / data-selected for the intelui-highlight layer. asChild (Slot) merges markers onto the child without an extra node or competing handlers. Props-only. |
| `intelui-chip` | component | Removable selected-entity chip for the assistant input: label + trailing ✕, --intelui-accent border, data-intelui-type accent. Props-only. |

### Motion

GSAP items depend on `gsap` and `@gsap/react` (SplitText ships in `gsap` ≥ 3.13). All of them render their final state as markup and do nothing under reduced motion.

| Item | Type | Summary |
|---|---|---|
| `animated-text` | ui | Text that rises out of a mask line by line or word by word when it enters the viewport (GSAP SplitText + ScrollTrigger). Markup is the final text; no motion under reduced motion. |
| `clip-reveal` | ui | Panel that opens from a rounded inset clip-path to full size as it scrolls in, scrubbed (GSAP ScrollTrigger). Markup is the open state; reduced motion shows it whole. |
| `scroll-reveal` | ui | Section whose background widens from an inset rounded card to full width (top corners flattening) as it scrolls to the top. Only the background layer moves (GSAP ScrollTrigger). |
| `scrub-words` | ui | Large statement whose words light up one by one, scrubbed to the scroll (GSAP SplitText + ScrollTrigger). Markup is the lit text. |
| `marquee` | ui | Infinite horizontal marquee of short entries: rendered twice for a seamless loop, read once by screen readers, Web Animations API (no keyframes to install), pauses on hover, off under reduced motion. |

### Hooks

| Item | Type | Summary |
|---|---|---|
| `use-persisted-state` | hook | useState that persists to localStorage (JSON-serialized), SSR-safe. |
| `use-prefers-reduced-motion` | hook | Reactive prefers-reduced-motion flag. Prerender-safe (false on the server, re-evaluated on the client). |
| `use-focus-trap` | hook | Keeps focus inside an element while active: Tab/Shift+Tab wrap, escaped focus is pulled back, Escape callback, optional initial focus, body scroll lock and focus restore. Skips inert/hidden subtrees. Exports getFocusables. |

### Lib

| Item | Type | Summary |
|---|---|---|
| `utils` | lib | `cn()` = clsx + tailwind-merge. Owned by this registry so installs never pull shadcn's upstream `utils`. |

Source lives in [`registry/stellify/`](registry/stellify/). Built JSON (what the
CLI fetches) lives in [`public/r/`](public/r/).

---

## Publishing / updating the registry

1. Edit or add a source file in `registry/stellify/`. If you touch the tokens, edit
   `registry/stellify/stellify-base.css` only and run `npm run tokens`: it rewrites the
   `stellify-base` item in `registry.json` and Storybook's `@theme` block. `npm test`
   fails while they are out of step.
2. Register it in [`registry.json`](registry.json) (`name`, `type`,
   `dependencies`, `registryDependencies`, `files`).
3. Rebuild the JSON:
   ```bash
   npm install        # first time only, installs the shadcn CLI
   npm run registry:build   # = shadcn build  → writes public/r/*.json
   ```
4. Add a test in [`tests/`](tests/) and run `npm test` (vitest + Testing Library).
   Tests import the published sources via `@stellify/<file>`; the `@/…` imports
   inside them resolve to `registry/stellify/` first (see `vitest.config.ts`).
5. Commit **both** the source and the regenerated `public/r/*.json`, then push.
   CI (`.github/workflows/tests.yml`) fails if `public/r` is out of sync.
   Consumers pull the change by re-running `shadcn add @stellify/<item>`.

### Rules for `registryDependencies`

- **Always namespace internal dependencies: `@stellify/button`, never `button`.**
  A bare name resolves against shadcn's upstream registry, so `chart-card` used
  to install upstream's `button`/`card` and shadcn's current `utils` (which
  rewrites `lib/utils.ts` to `export { cn } from "cn"` and adds the `cn` npm
  package). `tests/registry.test.ts` enforces this.
- If an item needs a primitive the registry doesn't ship, vendor it here first.
- New items emit `data-slot` on every part (like current shadcn primitives).
- Animations use `tw-animate-css` (Tailwind 4), imported by `stellify-base`.

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

`stellify-base` writes the StellifyIT tokens and `@import "tw-animate-css"` into
your CSS. If the app already has a `lib/utils.ts`, shadcn asks before replacing
it with `@stellify/utils` (same `cn()`); pass `--overwrite` to accept. Components land in
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

**Tailwind v4** (e.g. `recetia-landing`, `recetia/recetia-studio`): nothing to do.
`shadcn add @stellify/stellify-base` writes the `@theme inline` block for you.

**Tailwind v3** (e.g. `stellifyit-global/apps/web-app`, `ebrebook/frontend`): map each
token in `tailwind.config.js`. The variables hold complete `oklch()` colors, so map them
whole (`var(--x)`), not as channels:

```js
// tailwind.config.js → theme.extend
colors: {
  "surface-1": "var(--surface-1)", "surface-2": "var(--surface-2)", "surface-3": "var(--surface-3)",
  field: { DEFAULT: "var(--field)", hover: "var(--field-hover)" },
  brand: { DEFAULT: "var(--brand)", foreground: "var(--brand-foreground)", subtle: "var(--brand-subtle)" },
  danger: { DEFAULT: "var(--danger)", foreground: "var(--danger-foreground)", subtle: "var(--danger-subtle)" },
  // …success / warning / info the same way, plus the shadcn names (primary, card, muted…)
},
borderRadius: { sm: "var(--radius-control)", md: "var(--radius-control)", lg: "var(--radius-container)", xl: "var(--radius-container)" },
```

The full list is the `cssVars.theme` block of `stellify-base` in `registry.json`.

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
