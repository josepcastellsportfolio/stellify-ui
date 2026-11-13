"use client"

/*
 * Model picker: a search box, a rail of model groups with a Favorites tab, and
 * rows that say where each model runs and whether it can be used now.
 *
 * The interaction model (rail + search, ←/→ between them, favorites tab,
 * jump shortcuts, unavailable providers listed with their reason) follows
 * T3 Code's ProviderModelPicker (https://github.com/pingdotgg/t3code, MIT,
 * Copyright (c) 2026 T3 Tools Inc.). No code was copied: this is written on
 * the stellify-ui primitives (popover, dialog).
 */

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  Check,
  ChevronDown,
  Eye,
  Hourglass,
  Lock,
  PowerOff,
  Search,
  Star,
  TriangleAlert,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react"

import { DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// --- Types -------------------------------------------------------------------

export type ModelGroupState = "ok" | "off" | "busy" | "limited"

export interface ModelGroup {
  id: string
  /** Where the models run ("API", "Servidor local"…). */
  label: string
  /** Icon component for the rail (`icon={Cloud}`). Without one, the rail shows the label's first letters. */
  icon?: React.ComponentType<{ className?: string }>
  /** Live status of the whole group. `off` and `limited` usually come with unavailable models. */
  status?: { state: ModelGroupState; reason?: string }
}

export interface ModelOption {
  key: string
  label: string
  /** `ModelGroup.id` it belongs to. */
  group: string
  /** Searched, not shown. */
  description?: string
  /** Runs on the user's own hardware: nothing leaves their network. Shown as a lock and a word. */
  private?: boolean
  /** False: listed, not selectable, with `reason`. */
  available: boolean
  /** Why it is unavailable ("El servidor está apagado"). */
  reason?: string
  /** Short tags shown as badges ("voz", "nuevo"). */
  badges?: string[]
  /** Context window in tokens. */
  context?: number
  vision?: boolean
  tools?: boolean
  /** Measured generation speed. Only a number is shown: null/undefined hides it (no made-up default). */
  speedTps?: number | null
}

export interface ModelPickerLabels {
  /** The setting's name: hidden prefix of the trigger, title of the mobile sheet. */
  setting: string
  /** Placeholder and name of the search box. */
  search: string
  /** Name of the rail. */
  groups: string
  favorites: string
  /** Heading of the list while searching. */
  results: string
  /** No model matches the search, or the group is empty. */
  empty: string
  /** The Favorites tab is empty. */
  noFavorites: string
  /** Fallback reason for an unavailable model. */
  unavailable: string
  private: string
  vision: string
  tools: string
  /** Visible context size, e.g. 16384 → "16k ctx". */
  context: (tokens: number) => string
  /** Visible speed, e.g. 42 → "42 t/s". */
  speed: (tokensPerSecond: number) => string
  /** Group status words, shown in the rail's name and the notice. */
  status: Record<Exclude<ModelGroupState, "ok">, string>
  /** Name of the favorite toggle (its pressed state says whether it is on). */
  favorite: (model: string) => string
  /** Visible hint of the jump shortcut (n = 1…9). */
  jump: (n: number) => string
  /** Announced after choosing a model. */
  selected: (model: string) => string
  /** Close button of the mobile sheet. */
  close: string
}

const compact = (tokens: number) =>
  tokens >= 1_000_000
    ? `${Math.round(tokens / 100_000) / 10}M`
    : tokens >= 1000
      ? `${Math.round(tokens / 1024)}k`
      : String(tokens)

const DEFAULT_LABELS: ModelPickerLabels = {
  setting: "Modelo",
  search: "Buscar modelos",
  groups: "Grupos de modelos",
  favorites: "Favoritos",
  results: "Resultados",
  empty: "Ningún modelo coincide.",
  noFavorites: "Marca un modelo con la estrella para tenerlo aquí.",
  unavailable: "No disponible",
  private: "privado",
  vision: "Entiende imágenes",
  tools: "Usa herramientas",
  context: (tokens) => `${compact(tokens)} ctx`,
  speed: (tps) => `${Math.round(tps)} t/s`,
  status: { off: "Apagado", busy: "Ocupado", limited: "Limitado" },
  favorite: (model) => `Favorito: ${model}`,
  jump: (n) => `Alt ${n}`,
  selected: (model) => `Modelo elegido: ${model}`,
  close: "Cerrar",
}

export interface ModelPickerProps {
  groups: ModelGroup[]
  models: ModelOption[]
  value: string
  onValueChange: (key: string) => void
  /** Keys of the favorite models, in the order the Favorites tab lists them. */
  favorites: string[]
  onToggleFavorite: (key: string) => void
  /** Defaults in Spanish; pass the rest per product. */
  labels?: Partial<Omit<ModelPickerLabels, "status">> & { status?: Partial<ModelPickerLabels["status"]> }
  /**
   * `auto` (default): popover with a fine pointer on a wide screen, bottom
   * sheet on touch or narrow screens. Force one with `popover` or `sheet`.
   */
  presentation?: "auto" | "popover" | "sheet"
  /** Popover alignment against the trigger. Default "start". */
  align?: "start" | "center" | "end"
  disabled?: boolean
  className?: string
}

// --- Search ------------------------------------------------------------------

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

/** 3 = prefix, 2 = start of a word, 1 = anywhere, 0 = no match. */
function matchScore(text: string, term: string): number {
  const t = normalize(text)
  let i = t.indexOf(term)
  let best = 0
  while (i !== -1) {
    if (i === 0) return 3
    if (!/[\p{L}\p{N}]/u.test(t[i - 1])) best = 2
    else best = Math.max(best, 1)
    i = t.indexOf(term, i + 1)
  }
  return best
}

/**
 * Models matching every word of `query`, best first: a hit in the model's
 * name beats a hit in its group, badges or description, and within a field a
 * prefix beats a word start beats a substring. Ties keep the input order.
 */
export function rankModels(models: ModelOption[], query: string, groups: ModelGroup[] = []): ModelOption[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return models
  const groupLabel = new Map(groups.map((g) => [g.id, g.label]))
  const scored: { model: ModelOption; score: number; index: number }[] = []
  models.forEach((model, index) => {
    const others = [groupLabel.get(model.group) ?? "", model.key, model.description ?? "", ...(model.badges ?? [])]
    let score = 0
    for (const term of terms) {
      const s = Math.max(matchScore(model.label, term) * 3, ...others.map((o) => matchScore(o, term)))
      if (s === 0) return
      score += s
    }
    scored.push({ model, score, index })
  })
  return scored.sort((a, b) => b.score - a.score || a.index - b.index).map((s) => s.model)
}

// --- Small pieces --------------------------------------------------------------

const COMPACT_QUERY = "(pointer: coarse), (max-width: 639px)"

function subscribeCompact(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {}
  const mq = window.matchMedia(COMPACT_QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

/** Touch or narrow screen. False on the server: the sheet only exists once opened, so markup never differs. */
function useCompact(): boolean {
  return React.useSyncExternalStore(
    subscribeCompact,
    () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(COMPACT_QUERY).matches,
    () => false
  )
}

const STATUS_ICON: Record<Exclude<ModelGroupState, "ok">, LucideIcon> = {
  off: PowerOff,
  busy: Hourglass,
  limited: TriangleAlert,
}

const STATUS_TONE: Record<Exclude<ModelGroupState, "ok">, string> = {
  off: "text-muted-foreground",
  busy: "text-warning",
  limited: "text-warning",
}

function statusOf(group: ModelGroup | undefined): Exclude<ModelGroupState, "ok"> | null {
  const state = group?.status?.state
  return state && state !== "ok" ? state : null
}

function GroupGlyph({ group, className }: { group: ModelGroup; className?: string }) {
  if (group.icon) {
    const Icon = group.icon
    return <Icon className={cn("size-5", className)} aria-hidden />
  }
  return (
    <span aria-hidden className={cn("text-xs font-semibold uppercase", className)}>
      {group.label.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2)}
    </span>
  )
}

// --- Panel (shared by the popover and the sheet) -------------------------------

type Tab = "favorites" | (string & {})

interface PanelProps {
  groups: ModelGroup[]
  models: ModelOption[]
  value: string
  favorites: string[]
  onToggleFavorite: (key: string) => void
  onSelect: (model: ModelOption) => void
  labels: ModelPickerLabels
  /** Search box on a desktop; the chosen row on touch (no keyboard popping up). */
  initialFocus: "search" | "selected"
  compact: boolean
}

function ModelPickerPanel({
  groups,
  models,
  value,
  favorites,
  onToggleFavorite,
  onSelect,
  labels,
  initialFocus,
  compact,
}: PanelProps) {
  const ids = React.useId()
  const listId = `${ids}-list`
  const headingId = `${ids}-heading`
  const searchRef = React.useRef<HTMLInputElement>(null)
  const railRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)

  const current = models.find((m) => m.key === value)
  const [tab, setTab] = React.useState<Tab>(() => current?.group ?? groups[0]?.id ?? "favorites")
  const [query, setQuery] = React.useState("")
  const [activeRow, setActiveRow] = React.useState<string | null>(null)

  const groupById = React.useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups])
  const favoriteSet = React.useMemo(() => new Set(favorites), [favorites])
  const searching = query.trim().length > 0

  const visible = React.useMemo(() => {
    if (searching) return rankModels(models, query, groups)
    if (tab === "favorites") {
      const byKey = new Map(models.map((m) => [m.key, m]))
      return favorites.map((k) => byKey.get(k)).filter((m): m is ModelOption => !!m)
    }
    return models.filter((m) => m.group === tab)
  }, [searching, models, query, groups, tab, favorites])

  // Alt+1…9 jump to the first nine models you can actually pick in this view.
  const jumpKeys = React.useMemo(() => visible.filter((m) => m.available).slice(0, 9).map((m) => m.key), [visible])
  const showGroup = searching || tab === "favorites"
  const selectedGroup = !searching && tab !== "favorites" ? groupById.get(tab) : undefined
  const notice = statusOf(selectedGroup)

  const rowButtons = () => Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("[data-model-row]") ?? [])
  const focusRow = (key: string | undefined) => {
    if (!key) return
    rowButtons().find((b) => b.dataset.key === key)?.focus()
  }
  const focusRailTab = () =>
    (railRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]') ??
      railRef.current?.querySelector<HTMLButtonElement>("button"))?.focus()

  // Initial focus once the panel is mounted (each open mounts it afresh).
  React.useEffect(() => {
    if (initialFocus === "search") searchRef.current?.focus()
    else (rowButtons().find((b) => b.dataset.key === value) ?? rowButtons()[0] ?? searchRef.current)?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tabs: Tab[] = ["favorites", ...groups.map((g) => g.id)]
  const selectTab = (next: Tab) => {
    setTab(next)
    setQuery("")
  }

  const onRailKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.indexOf(tab)
    let next: Tab | undefined
    if (event.key === "ArrowDown") next = tabs[(i + 1) % tabs.length]
    else if (event.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length]
    else if (event.key === "Home") next = tabs[0]
    else if (event.key === "End") next = tabs[tabs.length - 1]
    else if (event.key === "ArrowRight") {
      event.preventDefault()
      searchRef.current?.focus()
      return
    }
    if (next === undefined) return
    event.preventDefault()
    selectTab(next)
    Array.from(railRef.current?.querySelectorAll<HTMLButtonElement>("[data-tab]") ?? [])
      .find((b) => b.dataset.tab === next)
      ?.focus()
  }

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    const box = event.currentTarget
    if (event.key === "ArrowLeft" && box.selectionStart === 0 && box.selectionEnd === 0) {
      event.preventDefault()
      focusRailTab()
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      focusRow(visible.some((m) => m.key === value) ? value : visible[0]?.key)
    } else if (event.key === "Enter" && searching) {
      event.preventDefault()
      const first = visible.find((m) => m.available)
      if (first) onSelect(first)
    }
  }

  const onRowKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rows = rowButtons()
    const go = (i: number) => rows[Math.max(0, Math.min(rows.length - 1, i))]?.focus()
    if (event.key === "ArrowDown") go(index + 1)
    else if (event.key === "ArrowUp") {
      if (index === 0) searchRef.current?.focus()
      else go(index - 1)
    } else if (event.key === "Home") go(0)
    else if (event.key === "End") go(rows.length - 1)
    else if (event.key === "ArrowRight") {
      event.currentTarget.parentElement?.querySelector<HTMLButtonElement>("[data-favorite]")?.focus()
    } else return
    event.preventDefault()
  }

  const onStarKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rows = rowButtons()
    if (event.key === "ArrowLeft") rows[index]?.focus()
    else if (event.key === "ArrowDown") rows[Math.min(rows.length - 1, index + 1)]?.focus()
    else if (event.key === "ArrowUp") rows[Math.max(0, index - 1)]?.focus()
    else return
    event.preventDefault()
  }

  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // `code`, not `key`: Option+digit types a symbol on macOS.
    const digit = /^Digit([1-9])$/.exec(event.code)
    if (!event.altKey || event.ctrlKey || event.metaKey || !digit) return
    const key = jumpKeys[Number(digit[1]) - 1]
    const model = key ? visible.find((m) => m.key === key) : undefined
    if (!model) return
    event.preventDefault()
    onSelect(model)
  }

  const tabStop = activeRow && visible.some((m) => m.key === activeRow) ? activeRow : visible.some((m) => m.key === value) ? value : visible[0]?.key
  const heading = searching ? labels.results : tab === "favorites" ? labels.favorites : (selectedGroup?.label ?? "")
  const railButton =
    "relative flex aspect-square w-full items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-surface-3 hover:text-foreground aria-pressed:bg-surface-3 aria-pressed:text-foreground aria-pressed:before:absolute aria-pressed:before:inset-y-2 aria-pressed:before:-left-1 aria-pressed:before:w-0.5 aria-pressed:before:rounded-full aria-pressed:before:bg-brand"

  return (
    <div
      data-slot="model-picker-panel"
      onKeyDown={onPanelKeyDown}
      className={cn(
        "flex overflow-hidden",
        // Room for a few rows so switching tabs does not jump; grows up to a cap, then the list scrolls.
        compact ? "min-h-72 max-h-[min(32rem,75dvh)]" : "min-h-60 max-h-[min(24rem,70dvh)]"
      )}
    >
      {/* Rail: Favorites, then one tab per group. Arrows move and select; → goes to the search box. */}
      <div
        ref={railRef}
        role="toolbar"
        aria-orientation="vertical"
        aria-label={labels.groups}
        data-searching={searching || undefined}
        onKeyDown={onRailKeyDown}
        className="flex w-14 shrink-0 flex-col gap-1 overflow-y-auto overscroll-contain bg-surface-2 p-1.5 data-searching:opacity-70"
      >
        <button
          type="button"
          data-tab="favorites"
          aria-pressed={tab === "favorites"}
          tabIndex={tab === "favorites" ? 0 : -1}
          onClick={() => selectTab("favorites")}
          aria-label={labels.favorites}
          title={labels.favorites}
          className={railButton}
        >
          <Star className="size-5" aria-hidden />
        </button>
        <span aria-hidden className="mx-1.5 my-0.5 border-b" />
        {groups.map((group) => {
          const state = statusOf(group)
          const StatusIcon = state ? STATUS_ICON[state] : null
          const name = state
            ? `${group.label}: ${labels.status[state]}${group.status?.reason ? `. ${group.status.reason}` : ""}`
            : group.label
          return (
            <button
              key={group.id}
              type="button"
              data-tab={group.id}
              data-state={state ?? "ok"}
              aria-pressed={tab === group.id}
              tabIndex={tab === group.id ? 0 : -1}
              onClick={() => selectTab(group.id)}
              aria-label={name}
              title={name}
              className={railButton}
            >
              <GroupGlyph group={group} />
              {StatusIcon ? (
                // Shape, not only color: power-off, hourglass, warning triangle.
                <span
                  aria-hidden
                  className={cn("absolute bottom-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-popover", STATUS_TONE[state!])}
                >
                  <StatusIcon className="size-3" />
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b px-3 focus-within:shadow-[inset_0_-2px_0_var(--focus)]">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder={labels.search}
            aria-label={labels.search}
            aria-controls={listId}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            className="h-11 min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
          <p id={headingId} className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">
            {heading}
          </p>

          {notice && selectedGroup ? (
            <ModelGroupNotice state={notice} reason={selectedGroup.status?.reason} labels={labels} />
          ) : null}

          {visible.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {tab === "favorites" && !searching ? labels.noFavorites : labels.empty}
            </p>
          ) : (
            <ul ref={listRef} id={listId} aria-labelledby={headingId} className="flex flex-col gap-0.5">
              {visible.map((model, index) => {
                const group = groupById.get(model.group)
                const jump = jumpKeys.indexOf(model.key) + 1
                const isFavorite = favoriteSet.has(model.key)
                const selected = model.key === value
                const groupState = statusOf(group)
                const GroupStatusIcon = groupState && model.available ? STATUS_ICON[groupState] : null
                return (
                  <li key={model.key} data-model={model.key} className="group/row relative flex items-center rounded-md">
                    <button
                      type="button"
                      data-model-row
                      data-key={model.key}
                      aria-current={selected ? "true" : undefined}
                      aria-disabled={!model.available || undefined}
                      aria-keyshortcuts={jump ? `Alt+${jump}` : undefined}
                      tabIndex={model.key === tabStop ? 0 : -1}
                      onFocus={() => setActiveRow(model.key)}
                      onClick={() => model.available && onSelect(model)}
                      onKeyDown={(e) => onRowKeyDown(e, index)}
                      className={cn(
                        "flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-(--duration-fast)",
                        model.available ? "hover:bg-surface-3" : "cursor-not-allowed"
                      )}
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span
                            translate="no"
                            className={cn(
                              "truncate text-sm",
                              selected ? "font-semibold text-foreground" : "font-medium",
                              model.available ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {model.label}
                          </span>
                          {selected ? <Check className="size-3.5 shrink-0 text-foreground" aria-hidden /> : null}
                        </span>
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          {showGroup && group ? <span>{group.label}</span> : null}
                          {model.private ? (
                            <span className="inline-flex items-center gap-1 font-medium text-foreground">
                              <Lock className="size-3" aria-hidden />
                              {labels.private}
                            </span>
                          ) : null}
                          {model.badges?.map((badge) => (
                            <span key={badge} className="rounded-sm bg-surface-3 px-1 leading-4 text-foreground">
                              {badge}
                            </span>
                          ))}
                          {typeof model.context === "number" ? (
                            <span className="font-mono tabular-nums">{labels.context(model.context)}</span>
                          ) : null}
                          {model.vision ? (
                            <span className="inline-flex items-center" title={labels.vision}>
                              <Eye className="size-3.5" aria-hidden />
                              <span className="sr-only">{labels.vision}</span>
                            </span>
                          ) : null}
                          {model.tools ? (
                            <span className="inline-flex items-center" title={labels.tools}>
                              <Wrench className="size-3.5" aria-hidden />
                              <span className="sr-only">{labels.tools}</span>
                            </span>
                          ) : null}
                          {typeof model.speedTps === "number" && Number.isFinite(model.speedTps) ? (
                            <span data-slot="model-speed" className="font-mono tabular-nums">
                              {labels.speed(model.speedTps)}
                            </span>
                          ) : null}
                          {GroupStatusIcon && groupState ? (
                            <span className={cn("inline-flex items-center gap-1", STATUS_TONE[groupState])}>
                              <GroupStatusIcon className="size-3" aria-hidden />
                              {labels.status[groupState]}
                            </span>
                          ) : null}
                          {!model.available ? (
                            <span className="inline-flex items-center gap-1 font-medium text-foreground">
                              <PowerOff className="size-3" aria-hidden />
                              {model.reason ?? labels.unavailable}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      {jump ? (
                        <kbd
                          aria-hidden
                          className="shrink-0 rounded-sm bg-surface-3 px-1.5 font-mono text-[11px] leading-5 text-muted-foreground [@media(pointer:coarse)]:hidden"
                        >
                          {labels.jump(jump)}
                        </kbd>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      data-favorite
                      aria-pressed={isFavorite}
                      aria-label={labels.favorite(model.label)}
                      title={labels.favorite(model.label)}
                      tabIndex={-1}
                      onClick={() => onToggleFavorite(model.key)}
                      onKeyDown={(e) => onStarKeyDown(e, index)}
                      className={cn(
                        "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-[opacity,color] duration-(--duration-fast) hover:bg-surface-3 hover:text-foreground focus-visible:opacity-100 group-hover/row:opacity-100 group-focus-within/row:opacity-100 [@media(pointer:coarse)]:size-11 [@media(pointer:coarse)]:opacity-100",
                        // In Favorites every row is starred: the star waits for hover or focus there too.
                        isFavorite && tab !== "favorites" ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <Star className={cn("size-4", isFavorite && "fill-current text-warning")} aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

/** A group's live status in words: shape + text, tinted only as a third cue. */
export function ModelGroupNotice({
  state,
  reason,
  labels,
}: {
  state: Exclude<ModelGroupState, "ok">
  reason?: string
  labels: Pick<ModelPickerLabels, "status">
}) {
  const Icon = STATUS_ICON[state]
  return (
    <p
      data-slot="model-group-notice"
      data-state={state}
      className={cn(
        "mx-1 mb-1.5 flex items-start gap-2 rounded-md px-2 py-1.5 text-xs text-foreground",
        state === "off" ? "bg-surface-3" : "bg-warning-subtle"
      )}
    >
      <Icon className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>
        <span className="font-semibold">{labels.status[state]}</span>
        {reason ? `. ${reason}` : null}
      </span>
    </p>
  )
}

// --- Picker ------------------------------------------------------------------

/**
 * Model picker for a chat composer or header. The trigger names the setting
 * (hidden prefix) and the current model, with a lock for private models and
 * a power-off mark when the current one is unavailable.
 *
 * Opens a popover on a desktop and a bottom sheet on touch or narrow screens.
 * Inside: a search box (ranked: prefix, then word start, then substring), a
 * rail of groups with a Favorites tab (↑/↓ move, → to search, ← back from an
 * empty caret), rows with what each model can do and whether it can be used
 * now, Alt+1…9 to jump, and a star per row. Unavailable models stay listed
 * with their reason and cannot be chosen. The choice is announced politely.
 */
export function ModelPicker({
  groups,
  models,
  value,
  onValueChange,
  favorites,
  onToggleFavorite,
  labels: labelsProp,
  presentation = "auto",
  align = "start",
  disabled,
  className,
}: ModelPickerProps) {
  const labels: ModelPickerLabels = {
    ...DEFAULT_LABELS,
    ...labelsProp,
    status: { ...DEFAULT_LABELS.status, ...labelsProp?.status },
  }
  const [open, setOpen] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState("")
  const compactScreen = useCompact()
  const sheet = presentation === "sheet" || (presentation === "auto" && compactScreen)

  const current = models.find((m) => m.key === value)

  const select = (model: ModelOption) => {
    if (!model.available) return
    onValueChange(model.key)
    setAnnouncement(labels.selected(model.label))
    setOpen(false)
  }

  const trigger = (
    <button
      type="button"
      data-slot="model-picker-trigger"
      disabled={disabled}
      className={cn(
        "inline-flex h-9 max-w-full items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-foreground transition-colors duration-(--duration-fast) hover:bg-surface-3 disabled:pointer-events-none disabled:opacity-50 aria-expanded:bg-surface-3 [@media(pointer:coarse)]:min-h-11",
        className
      )}
    >
      {/* The name is the visible text with the setting before it (WCAG 2.5.3). */}
      <span className="sr-only">{labels.setting}: </span>
      <span translate="no" className="truncate">
        {current?.label ?? value}
      </span>
      {current?.private ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Lock className="size-3" aria-hidden />
          {labels.private}
        </span>
      ) : null}
      {current && !current.available ? (
        <>
          <PowerOff className="size-4 shrink-0 text-danger" aria-hidden />
          <span className="sr-only">, {current.reason ?? labels.unavailable}</span>
        </>
      ) : null}
      <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  )

  const panel = (
    <ModelPickerPanel
      groups={groups}
      models={models}
      value={value}
      favorites={favorites}
      onToggleFavorite={onToggleFavorite}
      onSelect={select}
      labels={labels}
      initialFocus={sheet ? "selected" : "search"}
      compact={sheet}
    />
  )

  return (
    <>
      {sheet ? (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
              data-slot="model-picker-sheet"
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col overflow-hidden rounded-t-lg bg-popover pb-[env(safe-area-inset-bottom)] text-popover-foreground shadow-(--shadow-overlay) duration-(--duration-base) data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom"
            >
              <div className="flex items-center justify-between border-b pl-4 pr-1">
                <DialogPrimitive.Title className="text-base font-semibold">{labels.setting}</DialogPrimitive.Title>
                <DialogPrimitive.Close className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-3 hover:text-foreground">
                  <X className="size-4" aria-hidden />
                  <span className="sr-only">{labels.close}</span>
                </DialogPrimitive.Close>
              </div>
              {panel}
            </DialogPrimitive.Content>
          </DialogPortal>
        </DialogPrimitive.Root>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            data-slot="model-picker-popover"
            aria-label={labels.setting}
            align={align}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="w-[min(28rem,calc(100vw-1rem))] overflow-hidden p-0"
          >
            {panel}
          </PopoverContent>
        </Popover>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  )
}
