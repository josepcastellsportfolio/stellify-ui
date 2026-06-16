import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface TimePickerProps {
  /** 24h time string "HH:mm", or "" when empty. Controlled. */
  value: string
  onChange: (value: string) => void
  /** Use 24-hour selects (no AM/PM). Defaults to false (12h + AM/PM). */
  use24Hour?: boolean
  /** Minute step. Defaults to 5. */
  minuteStep?: number
  disabled?: boolean
  className?: string
}

function parse(value: string): { h: number; m: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h < 0 || h > 23 || m < 0 || m > 59) return null
  return { h, m }
}

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * Time picker built from selects: hour + minute (+ AM/PM unless `use24Hour`).
 * Controlled, always emits a 24-hour `"HH:mm"` string regardless of display
 * mode. No external dependencies.
 */
export default function TimePicker({
  value,
  onChange,
  use24Hour = false,
  minuteStep = 5,
  disabled,
  className,
}: TimePickerProps) {
  const parsed = parse(value)
  const h24 = parsed?.h ?? null
  const minute = parsed?.m ?? null

  const meridiem: "AM" | "PM" = h24 != null && h24 >= 12 ? "PM" : "AM"
  const hour12 = h24 != null ? h24 % 12 || 12 : null

  const minutes = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, i) => i * minuteStep
  )

  const emit = (next: { h?: number; m?: number; mer?: "AM" | "PM" }) => {
    if (use24Hour) {
      const h = next.h ?? h24 ?? 0
      const m = next.m ?? minute ?? 0
      onChange(`${pad(h)}:${pad(m)}`)
      return
    }
    const mer = next.mer ?? meridiem
    const baseH12 = next.h ?? hour12 ?? 12
    const m = next.m ?? minute ?? 0
    let h = baseH12 % 12
    if (mer === "PM") h += 12
    onChange(`${pad(h)}:${pad(m)}`)
  }

  const hours = use24Hour
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={use24Hour ? (h24 != null ? String(h24) : "") : (hour12 != null ? String(hour12) : "")}
        onValueChange={(v) => emit({ h: Number(v) })}
        disabled={disabled}
      >
        <SelectTrigger className="w-[4.5rem]">
          <SelectValue placeholder="--" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={String(h)}>
              {use24Hour ? pad(h) : h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground">:</span>

      <Select
        value={minute != null ? String(minute) : ""}
        onValueChange={(v) => emit({ m: Number(v) })}
        disabled={disabled}
      >
        <SelectTrigger className="w-[4.5rem]">
          <SelectValue placeholder="--" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {pad(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!use24Hour && (
        <Select
          value={meridiem}
          onValueChange={(v) => emit({ mer: v as "AM" | "PM" })}
          disabled={disabled}
        >
          <SelectTrigger className="w-[4.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

export { TimePicker }
