import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import {
  getWeekDates,
  isToday,
  weekdayLabels,
} from "@/lib/week-dates"

export interface DayColumnProps<E> {
  /** ISO date this column represents. */
  date: string
  /** Events for this day (already filtered by the parent). */
  events: E[]
  /** Whether this column is today (drives highlight). */
  today?: boolean
  /** Renders a single event block. */
  renderEvent: (event: E) => ReactNode
  /** Called when the empty area of the column is clicked. */
  onClickEmpty?: (date: string) => void
  /** Header label; when omitted the header row is skipped. */
  label?: ReactNode
  className?: string
}

/**
 * A single day column for the WeekGrid. Presentational: it lays out the
 * provided event nodes and surfaces click intents, but owns no scheduling
 * logic (no drag math, no time snapping — that stays in the consumer).
 */
export function DayColumn<E>({
  date,
  events,
  today = false,
  renderEvent,
  onClickEmpty,
  label,
  className,
}: DayColumnProps<E>) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col border-l border-border first:border-l-0",
        today && "bg-accent/30",
        className
      )}
    >
      {label !== undefined && (
        <div
          className={cn(
            "border-b border-border px-2 py-1.5 text-center text-xs font-medium",
            today ? "text-primary" : "text-muted-foreground"
          )}
        >
          {label}
        </div>
      )}
      <div
        className="flex flex-1 flex-col gap-1 p-1.5"
        onClick={onClickEmpty ? () => onClickEmpty(date) : undefined}
      >
        {events.map((event, i) => (
          <div key={i} onClick={(e) => e.stopPropagation()}>
            {renderEvent(event)}
          </div>
        ))}
      </div>
    </div>
  )
}

export interface WeekGridProps<E> {
  /** Any ISO date within the week to display. */
  date: string
  /** All events, grouped by ISO date. */
  eventsByDate: Record<string, E[]>
  /** Renders a single event block. */
  renderEvent: (event: E) => ReactNode
  /** Called when an empty day cell is clicked. */
  onClickEmpty?: (date: string) => void
  /** Locale for the weekday header labels. */
  locale?: string
  /** Hide the weekday header row. */
  hideHeader?: boolean
  className?: string
}

/**
 * A 7-day (Mon..Sun) week grid built from `eventsByDate`.
 *
 * Generalized from the StellifyIT planner: the time-axis gutter, drag-to-
 * reschedule and category styling are intentionally left out so this works for
 * any weekly layout (meal planner, schedule, habits). Bring your own event
 * renderer; bring your own week navigation.
 */
export default function WeekGrid<E>({
  date,
  eventsByDate,
  renderEvent,
  onClickEmpty,
  locale,
  hideHeader = false,
  className,
}: WeekGridProps<E>) {
  const days = getWeekDates(date)
  const labels = weekdayLabels(locale)

  return (
    <div
      className={cn(
        "grid grid-cols-7 overflow-hidden rounded-lg border border-border",
        className
      )}
    >
      {days.map((day, index) => (
        <DayColumn
          key={day}
          date={day}
          events={eventsByDate[day] ?? []}
          today={isToday(day)}
          renderEvent={renderEvent}
          onClickEmpty={onClickEmpty}
          label={
            hideHeader ? undefined : (
              <span>
                {labels[index]}{" "}
                <span className="text-muted-foreground">
                  {Number(day.slice(8, 10))}
                </span>
              </span>
            )
          }
        />
      ))}
    </div>
  )
}

export { WeekGrid }
