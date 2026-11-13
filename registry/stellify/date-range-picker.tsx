import { useEffect, useId, useState } from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TimePicker } from "@/components/time-picker"
import { cn } from "@/lib/utils"

export interface DateRangeValue {
  /**
   * Start bound: `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` when time is included.
   * Empty string when unset.
   */
  from: string
  /** End bound, same format as `from`. */
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
  /** Default state of the time switch when the popover opens. Defaults to false. */
  defaultIncludeTime?: boolean
  /** Hide the date/time switch entirely (force date-only). Defaults to false. */
  hideTimeToggle?: boolean
  /** Use 24-hour time inputs. Defaults to false (12h + AM/PM). */
  use24Hour?: boolean
  /** Interface copy. Spanish defaults; presets have their own labels. */
  labels?: Partial<DateRangePickerLabels>
}

export interface DateRangePickerLabels {
  apply: string
  cancel: string
  includeTime: string
  startTime: string
  endTime: string
}

const DEFAULT_LABELS: DateRangePickerLabels = {
  apply: "Aplicar",
  cancel: "Cancelar",
  includeTime: "Incluir hora",
  startTime: "Hora de inicio",
  endTime: "Hora de fin",
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function fromISO(s: string): Date | undefined {
  if (!s) return undefined
  const datePart = s.slice(0, 10)
  return new Date(`${datePart}T00:00:00`)
}

/** Extract "HH:mm" from an ISO string, or "00:00" if absent. */
function timeOf(s: string): string {
  const match = /T(\d{2}:\d{2})/.exec(s)
  return match ? match[1] : "00:00"
}

/** Whether either bound carries a time component. */
function hasTime(v: DateRangeValue): boolean {
  return v.from.includes("T") || v.to.includes("T")
}

function shift(today: Date, days: number): Date {
  const d = new Date(today)
  d.setDate(d.getDate() - days)
  return d
}

/** Default presets, in Spanish. Pass your own `presets` to localize. */
export const DEFAULT_RANGE_PRESETS: DateRangePreset[] = [
  { label: "Hoy", getRange: (t) => ({ from: toISODate(t), to: toISODate(t) }) },
  { label: "Últimos 7 días", getRange: (t) => ({ from: toISODate(shift(t, 6)), to: toISODate(t) }) },
  { label: "Últimos 30 días", getRange: (t) => ({ from: toISODate(shift(t, 29)), to: toISODate(t) }) },
  { label: "Últimos 90 días", getRange: (t) => ({ from: toISODate(shift(t, 89)), to: toISODate(t) }) },
  {
    label: "Este mes",
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
  defaultIncludeTime = false,
  hideTimeToggle = false,
  use24Hour = false,
  labels,
}: DateRangePickerProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const timeId = useId()
  const [open, setOpen] = useState(false)
  // Draft state — edits stay local until the user clicks Apply.
  const [draft, setDraft] = useState<DateRange | undefined>(undefined)
  const [withTime, setWithTime] = useState(defaultIncludeTime)
  const [startTime, setStartTime] = useState("00:00")
  const [endTime, setEndTime] = useState("00:00")

  const toRange = (v: DateRangeValue): DateRange | undefined =>
    v.from ? { from: fromISO(v.from), to: fromISO(v.to) } : undefined

  // Reset the draft (range + time fields + toggle) when the popover opens.
  useEffect(() => {
    if (!open) return
    setDraft(toRange(value))
    setWithTime(hasTime(value) || defaultIncludeTime)
    setStartTime(value.from ? timeOf(value.from) : "00:00")
    setEndTime(value.to ? timeOf(value.to) : "00:00")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const fmt = (s: string) => {
    const d = fromISO(s)
    if (!d) return ""
    const datePart = d.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    return s.includes("T") ? `${datePart} ${timeOf(s)}` : datePart
  }

  const label =
    value.from && value.to
      ? `${fmt(value.from)} – ${fmt(value.to)}`
      : value.from
        ? fmt(value.from)
        : (placeholder ?? "")

  const apply = () => {
    const fromDate = draft?.from ? toISODate(draft.from) : ""
    const toDate = draft?.to ? toISODate(draft.to) : ""
    onChange({
      from: fromDate && withTime ? `${fromDate}T${startTime}` : fromDate,
      to: toDate && withTime ? `${toDate}T${endTime}` : toDate,
    })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          className={cn(
            "w-full justify-start bg-field font-normal hover:bg-field-hover",
            !value.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden rounded-lg p-0"
        align="start"
        sideOffset={6}
      >
        {/* Header: time toggle */}
        {!hideTimeToggle && (
          <div className="flex items-center justify-end gap-2 border-b border-border px-3 py-2">
            <Label htmlFor={timeId} className="text-xs text-muted-foreground">
              {l.includeTime}
            </Label>
            <Switch
              id={timeId}
              checked={withTime}
              onCheckedChange={setWithTime}
            />
          </div>
        )}

        <div className="flex">
          {presets.length > 0 && (
            <div className="flex flex-col gap-1 border-r border-border p-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="base"
                  size="sm"
                  className="justify-start font-normal"
                  onClick={() => setDraft(toRange(preset.getRange(new Date())))}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
          {/* Two compact months side by side. The popover stays open; the user
              picks start then end (two clicks), then confirms with Apply. */}
          <Calendar
            mode="range"
            numberOfMonths={numberOfMonths}
            selected={draft}
            defaultMonth={draft?.from}
            onSelect={setDraft}
            className="[--cell-size:2rem]"
            classNames={{ months: "relative flex flex-row gap-4" }}
            autoFocus
          />
        </div>

        {/* Time fields — unlocked by the header switch */}
        {withTime && (
          <div className="flex flex-wrap items-end gap-4 border-t border-border px-3 py-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{l.startTime}</Label>
              <TimePicker value={startTime} onChange={setStartTime} use24Hour={use24Hour} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{l.endTime}</Label>
              <TimePicker value={endTime} onChange={setEndTime} use24Hour={use24Hour} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border p-3">
          <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
            {l.cancel}
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={apply}>
            {l.apply}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker }
