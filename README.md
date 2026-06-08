# @stellify — shared component registry

A [shadcn registry](https://ui.shadcn.com/docs/registry) of reusable React +
Tailwind components, served from GitHub. Components are **copied** into each app
on install (the shadcn model): editable, no version coupling, updates are
pull-based (re-run `shadcn add`).

> Not an npm package. There is no `@stellify` to `npm install`. You consume it
> through the shadcn CLI, which fetches JSON from this repo's raw GitHub URLs.

## What's in here

| Item | Type | Summary |
|---|---|---|
| `stellify-base` | style | The design system: emerald/teal/slate tokens (light + dark, oklch), Inter font, radius. **Install first.** |
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
| `data-table` | component | Controlled, presentational paginated table. |
| `use-currency-format` | hook | Memoized currency formatter. |
| `use-persisted-state` | hook | `useState` synced to localStorage (SSR-safe). |
| `week-dates` | lib | Date helpers for weekly grids (no date library). |
| `week-grid` | component | 7-day week grid + day columns (generalized planner). |

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
