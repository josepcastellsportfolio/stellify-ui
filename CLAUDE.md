# stellify-ui — CLAUDE.md

Shared component library for the StellifyIT products, published as a **shadcn registry**
(`@stellify`, 111 items in `registry.json`). Not an npm package: apps pull components with
`npx shadcn@latest add @stellify/<item>`, which copies the source into the app. Every change
here reaches an app only when that app re-runs `shadcn add`.

Apps with `@stellify` in their `components.json` (2026-10-16): `stellifyit-global/apps/web-app`
(origin of most items) and `captationcenter` (`apps/web`, `packages/ui`). Documented targets not
wired yet: `recetia-landing`, `recetia/recetia-studio`, `ebrebook/frontend`. Not supported: `recetia/recetia-app` (React Native/Expo), `assistant`, `deltransform`.

State, backlog and product decisions live in the vault, not here:
`/home/jcastells/vault/proyectos/stellify-ui/` (from this repo, `../../vault/proyectos/stellify-ui/`).

## Where things are

| Path | What |
|---|---|
| `registry/stellify/` | Published sources (`.tsx`, `.ts`, `stellify-base.css`). What consumers get. |
| `registry.json` | Item manifest: `name`, `type`, `dependencies`, `registryDependencies`, `files`, `target`. |
| `public/r/*.json` | Built registry (what the CLI fetches). Generated, but **committed**. |
| `stories/` | Storybook stories, one per component family. |
| `.storybook/shadcn/` | Fake consumer tree (shadcn primitives + `cn`) so stories run components as installed. |
| `tests/` | vitest + Testing Library. `registry.test.ts` checks manifest integrity. |
| `registry-resolver.ts` | Vite plugin: `@/…` imports resolve to `registry/stellify/` first, then `.storybook/shadcn/`. |
| `.typecheck/` | `tsc` harness with shims; not published. |
| `README.md` | Item catalogue and consumer instructions. `MIGRATION.md`: replacing app code with registry items. |

## Commands

```bash
npm install
npm test                  # vitest run (25 files, 319 tests on 2026-10-16)
npm run registry:build    # shadcn build → public/r/*.json
npm run storybook         # dev server on :6006
npm run build-storybook   # static build → storybook-static/ (gitignored)
npm run typecheck         # tsc --noEmit
```

## Adding or changing an item

1. Edit or add the source in `registry/stellify/`.
2. Register it in `registry.json`.
3. `npm run registry:build` and commit **both** the source and `public/r/*.json`.
   CI (`.github/workflows/tests.yml`) rebuilds and fails on `git diff --exit-code -- public/r`.
4. Add or update a test in `tests/` (imports via `@stellify/<file>`) and a story in `stories/`.
5. Add the item to the catalogue in `README.md`.

Pushing to `main` deploys Storybook to GitHub Pages (`.github/workflows/storybook.yml`).

## Rules

- **`registryDependencies` are always namespaced: `@stellify/button`, never `button`.** A bare
  name resolves against shadcn's upstream registry and silently installs a different
  component (and upstream `utils`). `tests/registry.test.ts` enforces it.
- If an item needs a primitive the registry does not ship, vendor it here first.
- **Components are presentational.** No data fetching, no app context, no i18n library:
  copy comes in through props (Spanish defaults are fine). App logic (`useDataGrid`, auth
  menus, assistant engines) stays in the app.
- Only shadcn utility classes and `stellify-base` tokens (`bg-card`, `text-muted-foreground`,
  `--chart-*`…), never raw colors: the same source must work on Tailwind v3 and v4 apps.
- Every part emits `data-slot`, like current shadcn primitives.
- Public-page items must be prerender-safe: nothing reads `window`/`navigator`/`document`
  during render. Links go through an optional `renderLink`.
- Animations use `tw-animate-css` (Tailwind 4), imported by `stellify-base`; never
  `tailwindcss-animate`.
- Extending an existing item must stay backwards compatible (superset API). `button` and
  `input` overwrite `ui/button` / `ui/input` in apps, so their API can only grow.
- React 19, TypeScript strict, Radix primitives, `lucide-react` icons, Recharts 3 for charts.
  New dependencies need a reason: they are installed in every consuming app.

## Assistant (intelUI) pieces

`intelui-*`, `actionable`, `intelui-highlight.css` and `site-chat` are the chat-assistant UI.
They are **engine-agnostic**: the host app owns the assistant engine, actions and selection,
and feeds plain shapes (`intelui-types.ts`) and labels as props. `actionable` only paints the
`data-intelui-*` markers that the highlight layer styles.

**Planned, not implemented:** a two-way contract between screens and the products' chat
agents — the agent adjusts the filters of the screen the user is on, and the user adds
on-screen elements to the chat with a click. It needs components that expose their
filterable state and an "add to chat" action. Tracked in the vault backlog
(`proyectos/stellify-ui/backlog.md`); do not build it without an approved plan in `00-inbox/`.

## Git

- Default branch `main`; feature branches merge through PRs.
- Commits in English, conventional commits scoped by area: `feat(registry): …`, `feat(charts): …`.
