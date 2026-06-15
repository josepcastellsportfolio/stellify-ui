import type { FC, ChangeEvent } from "react"

import { cn } from "@/lib/utils"

export interface MonthYearPickerProps {
  /** Month, 1-12. */
  month: number
  /** Full year, e.g. 2026. */
  year: number
  onChange: (month: number, year: number) => void
  className?: string
}

/**
 * Native `<input type="month">` wrapper, themed like the other inputs.
 * Controlled via `month` (1-12) + `year`.
 */
const MonthYearPicker: FC<MonthYearPickerProps> = ({
  month,
  year,
  onChange,
  className,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value // "YYYY-MM"
    if (value) {
      const [y, m] = value.split("-").map(Number)
      onChange(m, y)
    }
  }

  const inputValue = `${year}-${String(month).padStart(2, "0")}`

  return (
    <input
      type="month"
      value={inputValue}
      onChange={handleChange}
      className={cn(
        "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        className
      )}
    />
  )
}

export default MonthYearPicker
export { MonthYearPicker }
