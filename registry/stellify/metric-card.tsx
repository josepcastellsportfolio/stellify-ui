import type { FC, KeyboardEvent, ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

export type MetricCardAccent =
  | "amber"
  | "sky"
  | "rose"
  | "emerald"
  | "violet"
  | "orange"
  | "teal"
  | "pink"
  | "slate"

const ACCENT_ICON_CLASS: Record<MetricCardAccent, string> = {
  amber: "bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  sky: "bg-sky-200 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
  rose: "bg-rose-200 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200",
  emerald:
    "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  violet:
    "bg-violet-200 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200",
  orange:
    "bg-orange-200 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200",
  teal: "bg-teal-200 text-teal-900 dark:bg-teal-900/40 dark:text-teal-200",
  pink: "bg-pink-200 text-pink-900 dark:bg-pink-900/40 dark:text-pink-200",
  slate:
    "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100",
}

export type MetricCardTone = "default" | "positive" | "negative"

export interface MetricCardDelta {
  /** Display string for the change, e.g. "+12%" or "-3.4 kg". */
  value: string
  /**
   * Direction of the change: true → up arrow, false → down arrow (colored
   * good/bad, see `invertDelta`). Left undefined, the delta is neutral.
   */
  positive?: boolean
  /**
   * "neutral" renders the delta without an arrow, in muted text (e.g. "sin
   * cambios", "= mes anterior"), even if `positive` is set.
   */
  tone?: "neutral"
}

export interface MetricCardProps {
  /** Caption above the value, e.g. "Total balance". */
  label: string
  /** Main, already-formatted value, e.g. "1.234,50". */
  value: string
  /** Optional unit shown next to the value, e.g. "EUR". */
  unit?: string
  /** Optional change indicator. */
  delta?: MetricCardDelta
  /** Accent color for the icon chip. Defaults to "emerald". */
  accent?: MetricCardAccent
  /** Optional leading icon (lucide). */
  icon?: LucideIcon
  /**
   * Invert the delta color semantics. By default a positive delta is green.
   * For metrics where "up is bad" (e.g. expenses), set this to color a
   * positive delta red and a negative one green.
   */
  invertDelta?: boolean
  /** Secondary line under the value (context such as a date or a target). */
  hint?: ReactNode
  /**
   * Meaning of the value itself: "negative" paints it in the destructive
   * color (e.g. a negative balance). Defaults to "default".
   */
  tone?: MetricCardTone
  /** "compact" packs many cards in a row (smaller padding and type; the hint truncates to one line). */
  size?: "default" | "compact"
  /**
   * Optional progress towards a target, 0–100 (clamped). Renders a thin bar
   * exposed as a progressbar labelled by `label`. Non-finite values are ignored.
   */
  progress?: number
  /** Makes the card interactive. */
  onClick?: () => void
  className?: string
}

/**
 * KPI card used across StellifyIT dashboards.
 *
 * Pure presentational: pass in already-formatted `value`/`delta` strings and,
 * if needed, an onClick handler. No business logic, no i18n, no data fetching.
 */
const MetricCard: FC<MetricCardProps> = ({
  label,
  value,
  unit,
  delta,
  accent = "emerald",
  icon: Icon,
  invertDelta = false,
  hint,
  tone = "default",
  size = "default",
  progress,
  onClick,
  className,
}) => {
  const interactive = Boolean(onClick)
  const compact = size === "compact"

  // `positive` describes the raw direction; `good` decides the color, so that
  // `invertDelta` can flip the meaning for metrics where up is bad. A delta
  // with no direction (or tone "neutral") gets no arrow and no good/bad color.
  const neutral = delta?.tone === "neutral" || delta?.positive === undefined
  const positive = delta?.positive ?? false
  const good = invertDelta ? !positive : positive
  const progressValue =
    typeof progress === "number" && Number.isFinite(progress)
      ? Math.min(100, Math.max(0, progress))
      : undefined

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col rounded-lg border border-border/60 bg-card text-card-foreground shadow-sm transition-all",
        compact ? "gap-1 p-3" : "gap-3 p-5",
        interactive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:ring-1 hover:ring-primary/20",
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-muted-foreground",
            compact
              ? "text-[11px] uppercase leading-tight tracking-wide"
              : "text-sm"
          )}
        >
          {label}
        </span>
        {Icon && (
          <span
            className={cn(
              "items-center justify-center rounded-md",
              compact ? "hidden p-1.5 sm:inline-flex" : "inline-flex p-2",
              ACCENT_ICON_CLASS[accent]
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 items-baseline gap-2">
        <span
          className={cn(
            "break-words tabular-nums",
            compact
              ? "text-base font-semibold leading-tight sm:text-lg"
              : "text-3xl font-bold",
            tone === "negative"
              ? "text-destructive"
              : tone === "positive"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-foreground"
          )}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>

      {hint && (
        <div
          data-slot="metric-card-hint"
          title={compact && typeof hint === "string" ? hint : undefined}
          className={cn(
            "min-w-0 text-muted-foreground",
            compact ? "truncate text-[11px]" : "text-xs"
          )}
        >
          {hint}
        </div>
      )}

      {progressValue !== undefined && (
        <Progress
          data-slot="metric-card-progress"
          size="sm"
          value={progressValue}
          aria-label={label}
        />
      )}

      {delta && (
        <div
          data-slot="metric-card-delta"
          data-tone={neutral ? "neutral" : good ? "good" : "bad"}
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            neutral
              ? "text-muted-foreground"
              : good
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
          )}
        >
          {!neutral &&
            (positive ? (
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            ) : (
              <ArrowDownRight className="h-3 w-3" aria-hidden />
            ))}
          {delta.value}
        </div>
      )}
    </div>
  )
}

export default MetricCard
export { MetricCard }
