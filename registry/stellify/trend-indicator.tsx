import * as React from "react"
import { cva } from "class-variance-authority"
import { ArrowDown, ArrowRight, ArrowUp, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type TrendDirection = "up" | "down" | "flat"
export type TrendTone = "success" | "danger" | "neutral"

const trendIndicatorVariants = cva(
  "inline-flex items-center gap-1 text-sm font-medium tabular-nums [&>svg]:size-3.5 [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        success: "text-success",
        danger: "text-destructive",
        neutral: "text-muted-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

const ICONS: Record<TrendDirection, LucideIcon> = {
  up: ArrowUp,
  down: ArrowDown,
  flat: ArrowRight,
}

/**
 * Direction of a numeric change: above `flatThreshold` is up, below its
 * negative is down, anything in between (inclusive) is flat.
 */
export function trendDirection(change: number, flatThreshold = 0): TrendDirection {
  if (change > flatThreshold) return "up"
  if (change < -flatThreshold) return "down"
  return "flat"
}

/** Semantic tone of a direction: up is good unless `inverted` (e.g. costs). */
export function trendTone(direction: TrendDirection, inverted = false): TrendTone {
  if (direction === "flat") return "neutral"
  return (direction === "up") !== inverted ? "success" : "danger"
}

export interface TrendIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Explicit direction. When omitted it is derived from `change`. */
  direction?: TrendDirection
  /** Numeric change used to derive the direction (any unit: 0.12 or 12). */
  change?: number
  /** `|change| <= flatThreshold` counts as flat. Defaults to 0. */
  flatThreshold?: number
  /** Visible, already formatted text, e.g. "+12 %". Optional (icon only). */
  value?: string
  /**
   * Text read by screen readers instead of the icon + value,
   * e.g. "Tendencia: sube 12 %". Required: the arrow alone says nothing.
   */
  label: string
  /** Swap the tones: down is good and up is bad (costs, churn…). */
  inverted?: boolean
  /** Force a tone, overriding the one derived from the direction. */
  tone?: TrendTone
}

/**
 * Up / down / flat arrow with a formatted change and a semantic tone
 * (up = success, down = danger, flat = neutral; invertible). All copy comes
 * in via props, so it stays i18n-agnostic; `label` is what assistive tech
 * reads, while the arrow and the visible value are hidden from it.
 */
function TrendIndicator({
  direction,
  change,
  flatThreshold = 0,
  value,
  label,
  inverted = false,
  tone,
  className,
  ...props
}: TrendIndicatorProps) {
  const dir = direction ?? (change === undefined ? "flat" : trendDirection(change, flatThreshold))
  const resolvedTone = tone ?? trendTone(dir, inverted)
  const Icon = ICONS[dir]

  return (
    <span
      data-slot="trend-indicator"
      data-direction={dir}
      data-tone={resolvedTone}
      className={cn(trendIndicatorVariants({ tone: resolvedTone }), className)}
      {...props}
    >
      <Icon aria-hidden />
      {value && <span aria-hidden>{value}</span>}
      <span className="sr-only">{label}</span>
    </span>
  )
}

export default TrendIndicator
export { TrendIndicator, trendIndicatorVariants }
