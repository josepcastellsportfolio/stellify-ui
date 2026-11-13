import { SegmentedControl } from "@/components/ui/segmented-control"

export type TimeRange = "7d" | "30d" | "90d" | "all"

export const TIME_RANGES: TimeRange[] = ["7d", "30d", "90d", "all"]

const DEFAULT_LABELS: Record<TimeRange, string> = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  all: "Todo",
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
  /** Option labels. Defaults: "7d", "30d", "90d", "Todo". `group` names the control for screen readers (default "Periodo"). */
  labels?: Partial<Record<TimeRange | "group", string>>
  size?: "sm" | "md"
  className?: string
}

/**
 * Time-range picker (7d / 30d / 90d / Todo) built on `segmented-control`, so
 * the indicator slides and can be interrupted. Pass `labels` to localize.
 * Drop it into a chart card's header.
 */
export function TimeRangeSelector({
  value,
  onChange,
  ranges = TIME_RANGES,
  labels,
  size = "sm",
  className,
}: TimeRangeSelectorProps) {
  return (
    <SegmentedControl
      aria-label={labels?.group ?? "Periodo"}
      size={size}
      value={value}
      onValueChange={onChange}
      options={ranges.map((r) => ({ value: r, label: labels?.[r] ?? DEFAULT_LABELS[r] }))}
      className={className}
    />
  )
}

export default TimeRangeSelector
