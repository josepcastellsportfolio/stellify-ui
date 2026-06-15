import type { FC, KeyboardEvent } from "react"
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

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

export interface MetricCardDelta {
  /** Display string for the change, e.g. "+12%" or "-3.4 kg". */
  value: string
  /** Whether the delta is a positive change (drives the arrow + default color). */
  positive?: boolean
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
  onClick,
  className,
}) => {
  const interactive = Boolean(onClick)

  // `positive` describes the raw direction; `good` decides the color, so that
  // `invertDelta` can flip the meaning for metrics where up is bad.
  const positive = delta?.positive ?? false
  const good = invertDelta ? !positive : positive

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
        "flex h-full flex-col gap-3 rounded-lg border border-border/60 bg-card p-5 text-card-foreground shadow-sm transition-all",
        interactive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:ring-1 hover:ring-primary/20",
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-md p-2",
              ACCENT_ICON_CLASS[accent]
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>

      {delta && (
        <div
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            good
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          )}
        >
          {positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {delta.value}
        </div>
      )}
    </div>
  )
}

export default MetricCard
export { MetricCard }
