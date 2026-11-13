import type { FC, KeyboardEvent, ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** System accents for the icon chip. */
export type MetricCardAccent = "neutral" | "brand" | "success" | "warning" | "danger" | "info"

/** v1 hue names, still accepted and mapped onto the system accents. */
type LegacyAccent = "amber" | "sky" | "rose" | "emerald" | "violet" | "orange" | "teal" | "pink" | "slate"

const LEGACY_ACCENT: Record<LegacyAccent, MetricCardAccent> = {
  amber: "warning",
  orange: "warning",
  sky: "info",
  teal: "info",
  violet: "info",
  rose: "danger",
  pink: "danger",
  emerald: "success",
  slate: "neutral",
}

const ACCENT_ICON_CLASS: Record<MetricCardAccent, string> = {
  neutral: "bg-surface-3 text-foreground",
  brand: "bg-brand-subtle text-brand",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  info: "bg-info-subtle text-info",
}

export interface MetricCardDelta {
  /** Display string for the change, e.g. "+12%" or "-3.4 kg". */
  value: string
  /** Whether the delta is a positive change (drives the arrow + default color). */
  positive?: boolean
}

export type MetricCardTone = "default" | "positive" | "negative"

const TONE_VALUE_CLASS: Record<MetricCardTone, string> = {
  default: "text-foreground",
  positive: "text-success",
  negative: "text-danger",
}

export interface MetricCardDetail {
  label: string
  /** Already-formatted value. */
  value: string
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
  /** Accent of the icon chip. Defaults to "neutral". v1 hue names (emerald, rose…) still work. */
  accent?: MetricCardAccent | LegacyAccent
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
  /** Colors the main value, e.g. "negative" for a loss. Defaults to "default". */
  tone?: MetricCardTone
  /** "compact" packs many cards in a row (smaller padding and type). */
  size?: "default" | "compact"
  /** Secondary label/value rows under the main value. */
  details?: MetricCardDetail[]
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
  accent = "neutral",
  icon: Icon,
  invertDelta = false,
  hint,
  tone = "default",
  size = "default",
  details,
  onClick,
  className,
}) => {
  const interactive = Boolean(onClick)
  const compact = size === "compact"

  // `positive` describes the raw direction; `good` decides the color, so that
  // `invertDelta` can flip the meaning for metrics where up is bad.
  const positive = delta?.positive ?? false
  const good = invertDelta ? !positive : positive
  const resolvedAccent: MetricCardAccent = accent in LEGACY_ACCENT ? LEGACY_ACCENT[accent as LegacyAccent] : (accent as MetricCardAccent)

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
        "flex h-full min-w-0 flex-col rounded-lg bg-card text-card-foreground transition-colors duration-(--duration-fast)",
        compact ? "gap-1 p-3" : "gap-3 p-5",
        interactive &&
          "cursor-pointer hover:bg-surface-3",
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
              ACCENT_ICON_CLASS[resolvedAccent]
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 items-baseline gap-2">
        <span
          className={cn(
            "break-words font-mono tabular-nums tracking-tight",
            compact
              ? "text-base font-medium leading-tight sm:text-lg"
              : "text-[28px] font-medium leading-none",
            TONE_VALUE_CLASS[tone]
          )}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>

      {hint && (
        <div className={cn("text-muted-foreground", compact ? "text-[11px]" : "text-xs")}>
          {hint}
        </div>
      )}

      {delta && (
        <div
          className={cn(
            "inline-flex items-center gap-1 font-mono text-xs font-medium tabular-nums",
            good ? "text-success" : "text-danger"
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

      {details && details.length > 0 && (
        <dl className="mt-auto grid gap-1 border-t pt-3 text-sm">
          {details.map((detail) => (
            <div key={detail.label} className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{detail.label}</dt>
              <dd className="font-medium tabular-nums text-foreground">{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

export default MetricCard
export { MetricCard }
