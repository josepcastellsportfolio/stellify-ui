import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TimeRange = "7d" | "30d" | "90d" | "all"

export const TIME_RANGES: TimeRange[] = ["7d", "30d", "90d", "all"]

const DEFAULT_LABELS: Record<TimeRange, string> = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  all: "All",
}

const RANGE_DAYS: Record<TimeRange, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: null,
}

/**
 * Lower/upper bounds for a range, relative to `now`. `all` returns no bounds.
 * Use to filter time-series data by the selected range.
 */
export function getRangeBounds(
  range: TimeRange,
  now: Date = new Date()
): { from?: Date; to?: Date } {
  const days = RANGE_DAYS[range]
  if (days === null) return {}
  const from = new Date(now)
  from.setDate(from.getDate() - days)
  return { from, to: now }
}

export interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  /** Which ranges to show. Defaults to all four. */
  ranges?: TimeRange[]
  /** Override labels (consumer owns copy/i18n). */
  labels?: Partial<Record<TimeRange, string>>
  className?: string
}

/**
 * Segmented time-range control (7d / 30d / 90d / All). Presentational and
 * i18n-agnostic — pass `labels` to localize. Generalized from StellifyIT's
 * StatsRangeSelector; drop it into a chart card's header.
 */
export function TimeRangeSelector({
  value,
  onChange,
  ranges = TIME_RANGES,
  labels,
  className,
}: TimeRangeSelectorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5",
        className
      )}
      role="group"
    >
      {ranges.map((r) => (
        <Button
          key={r}
          type="button"
          size="sm"
          variant={value === r ? "primary" : "base"}
          className="h-7 px-2.5 text-xs"
          aria-pressed={value === r}
          onClick={() => onChange(r)}
        >
          {labels?.[r] ?? DEFAULT_LABELS[r]}
        </Button>
      ))}
    </div>
  )
}

export default TimeRangeSelector
