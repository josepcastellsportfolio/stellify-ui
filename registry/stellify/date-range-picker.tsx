import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export interface DateRangeValue {
  /** ISO date (YYYY-MM-DD) or "". */
  from: string
  /** ISO date (YYYY-MM-DD) or "". */
  to: string
}

export interface DateRangePreset {
  label: string
  /** Returns the [from, to] ISO range when clicked. */
  getRange: (today: Date) => DateRangeValue
}

export interface DateRangePickerProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  /** Months shown side by side. Defaults to 2. */
  numberOfMonths?: number
  /** Quick-pick presets shown on the left. Pass [] to hide. */
  presets?: DateRangePreset[]
  placeholder?: string
  locale?: string
  disabled?: boolean
  className?: string
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function fromISO(s: string): Date | undefined {
  return s ? new Date(`${s}T00:00:00`) : undefined
}

function shift(today: Date, days: number): Date {
  const d = new Date(today)
  d.setDate(d.getDate() - days)
  return d
}

/** English-default presets. Pass your own `presets` to localize. */
export const DEFAULT_RANGE_PRESETS: DateRangePreset[] = [
  { label: "Today", getRange: (t) => ({ from: toISODate(t), to: toISODate(t) }) },
  { label: "Last 7 days", getRange: (t) => ({ from: toISODate(shift(t, 6)), to: toISODate(t) }) },
  { label: "Last 30 days", getRange: (t) => ({ from: toISODate(shift(t, 29)), to: toISODate(t) }) },
  { label: "Last 90 days", getRange: (t) => ({ from: toISODate(shift(t, 89)), to: toISODate(t) }) },
  {
    label: "This month",
    getRange: (t) => ({
      from: toISODate(new Date(t.getFullYear(), t.getMonth(), 1)),
      to: toISODate(t),
    }),
  },
]

/**
 * Date range picker: a button showing the selected range that opens a popover
 * with quick presets + a multi-month range calendar. Emits ISO `{ from, to }`.
 */
export default function DateRangePicker({
  value,
  onChange,
  numberOfMonths = 2,
  presets = DEFAULT_RANGE_PRESETS,
  placeholder,
  locale,
  disabled,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const selected: DateRange | undefined = value.from
    ? { from: fromISO(value.from), to: fromISO(value.to) }
    : undefined

  const fmt = (s: string) =>
    fromISO(s)?.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) ?? ""

  const label =
    value.from && value.to
      ? `${fmt(value.from)} – ${fmt(value.to)}`
      : value.from
        ? fmt(value.from)
        : (placeholder ?? "")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          className={cn(
            "w-full justify-start font-normal",
            !value.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-auto overflow-hidden rounded-lg p-0 shadow-lg"
        align="start"
        sideOffset={6}
      >
        {presets.length > 0 && (
          <div className="flex flex-col gap-1 border-r border-border/60 p-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="base"
                size="sm"
                className="justify-start font-normal"
                onClick={() => {
                  onChange(preset.getRange(new Date()))
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}
        <Calendar
          mode="range"
          numberOfMonths={numberOfMonths}
          selected={selected}
          defaultMonth={selected?.from}
          onSelect={(range) => {
            onChange({
              from: range?.from ? toISODate(range.from) : "",
              to: range?.to ? toISODate(range.to) : "",
            })
            if (range?.from && range?.to) setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker }
