import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { useCurrencyFormat } from "@stellify/use-currency-format"
import { usePersistedState } from "@stellify/use-persisted-state"
import {
  getWeekDates,
  weekdayLabels,
  startOfWeek,
  todayISO,
} from "@stellify/week-dates"
import { Button } from "@stellify/button"

/**
 * Demos for the non-visual registry items (hooks + lib). They run the real
 * code and render the output so the showcase covers all 22 items.
 */
const meta = {
  title: "Hooks & Utils/Overview",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

function CurrencyFormatDemo() {
  const { format } = useCurrencyFormat({ locale: "es-ES", currency: "EUR" })
  const values = [0, 9.5, 1234.5, -42, 1000000]
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">useCurrencyFormat</h3>
      <pre className="rounded bg-muted p-2 text-xs">
{`const { format } = useCurrencyFormat({ locale: "es-ES", currency: "EUR" })`}
      </pre>
      <ul className="space-y-1 text-sm">
        {values.map((v) => (
          <li key={v}>
            <code className="text-muted-foreground">format({v})</code> → {format(v)}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PersistedStateDemo() {
  const [count, setCount] = usePersistedState("sb-demo-count", 0)
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">usePersistedState</h3>
      <pre className="rounded bg-muted p-2 text-xs">
{`const [count, setCount] = usePersistedState("sb-demo-count", 0)`}
      </pre>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={() => setCount((c) => c + 1)}>
          Increment
        </Button>
        <span className="text-sm">
          count = <strong>{count}</strong> (survives reload via localStorage)
        </span>
      </div>
    </div>
  )
}

function WeekDatesDemo() {
  const anchor = "2026-06-10"
  const [iso] = useState(anchor)
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">week-dates</h3>
      <pre className="rounded bg-muted p-2 text-xs">
{`getWeekDates("${iso}")  // Mon..Sun ISO dates`}
      </pre>
      <p className="text-sm">today: <code>{todayISO()}</code></p>
      <p className="text-sm">startOfWeek: <code>{startOfWeek(iso)}</code></p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {weekdayLabels("en-US").map((l) => (
          <div key={l} className="font-medium text-muted-foreground">{l}</div>
        ))}
        {getWeekDates(iso).map((d) => (
          <div key={d} className="rounded border border-border py-1">
            {Number(d.slice(8, 10))}
          </div>
        ))}
      </div>
    </div>
  )
}

export const CurrencyFormat: Story = { render: () => <CurrencyFormatDemo /> }
export const PersistedState: Story = { render: () => <PersistedStateDemo /> }
export const WeekDates: Story = { render: () => <WeekDatesDemo /> }
