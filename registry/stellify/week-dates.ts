/**
 * Date helpers for weekly grids. No external date library — plain `Date` and
 * ISO `YYYY-MM-DD` strings, matching how the StellifyIT planner addresses days.
 */

/** Format a Date as a local `YYYY-MM-DD` string (no timezone shift). */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Parse a `YYYY-MM-DD` string into a local Date at midnight. */
export function fromISODate(iso: string): Date {
  return new Date(`${iso}T00:00:00`)
}

/** Today as a `YYYY-MM-DD` string. */
export function todayISO(): string {
  return toISODate(new Date())
}

/**
 * Monday-of-the-week for the given ISO date, as an ISO string.
 * Weeks start on Monday (ISO-8601), matching the planner.
 */
export function startOfWeek(iso: string): string {
  const date = fromISODate(iso)
  const day = date.getDay() // 0 = Sun
  const mondayOffset = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + mondayOffset)
  return toISODate(date)
}

/** The 7 ISO dates (Mon..Sun) of the week containing `iso`. */
export function getWeekDates(iso: string): string[] {
  const monday = fromISODate(startOfWeek(iso))
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    return toISODate(day)
  })
}

/** Localized weekday labels (Mon..Sun) for the given locale. */
export function weekdayLabels(
  locale?: string,
  weekday: "long" | "short" | "narrow" = "short"
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday })
  // 2024-01-01 is a Monday — a stable anchor for label generation.
  const monday = new Date(2024, 0, 1)
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    return formatter.format(day)
  })
}

/** True if the ISO date is today. */
export function isToday(iso: string): boolean {
  return iso === todayISO()
}
