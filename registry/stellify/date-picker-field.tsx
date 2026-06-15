import { useState } from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export interface DatePickerFieldProps {
  /** ISO date string (YYYY-MM-DD), or "" when empty. Controlled. */
  value: string
  onChange: (next: string) => void
  /** Shown when no date is selected. */
  placeholder?: string
  /** BCP 47 locale for the displayed label. Defaults to runtime locale. */
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

/**
 * Date field: a button showing the formatted date that opens a calendar
 * popover. Emits ISO `YYYY-MM-DD` strings. Presentational, locale via prop.
 */
export default function DatePickerField({
  value,
  onChange,
  placeholder,
  locale,
  disabled,
  className,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(`${value}T00:00:00`) : undefined
  const label = selected
    ? selected.toLocaleDateString(locale, {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
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
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(next) => {
            if (next) {
              onChange(toISODate(next))
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePickerField }
