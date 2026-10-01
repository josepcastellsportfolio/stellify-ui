import * as React from "react"
import { AlertTriangle, Play, Square } from "lucide-react"

import { cn } from "@/lib/utils"

export interface TimerOption {
  value: string
  label: string
}

export interface TimerControlProps {
  /** ISO start of the running timer; undefined = stopped. The clock ticks locally from it. */
  startedAt?: string
  type: string
  types: TimerOption[]
  onTypeChange: (type: string) => void
  onStart: () => void
  onStop: () => void
  /** What the time is booked to, e.g. a select of search / client. */
  target?: React.ReactNode
  /** Past the long-timer limit (4 h): shows a warning. */
  overLimit?: boolean
  pending?: boolean
  className?: string
}

export function formatElapsed(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

/** Compact time tracker for the sidebar: type, target, elapsed clock and start / stop. */
function TimerControl({
  startedAt,
  type,
  types,
  onTypeChange,
  onStart,
  onStop,
  target,
  overLimit = false,
  pending = false,
  className,
}: TimerControlProps) {
  const running = startedAt !== undefined
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    if (!running) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [running])
  const elapsed = running ? (now - new Date(startedAt).getTime()) / 1000 : 0

  return (
    <div data-slot="timer-control" className={cn("flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">Timer</span>
        <span
          role="timer"
          aria-label="Tiempo transcurrido"
          className={cn("font-mono tabular-nums", overLimit ? "text-warning" : running ? "text-primary" : "text-muted-foreground")}
        >
          {formatElapsed(elapsed)}
        </span>
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Tipo
        <select
          value={type}
          disabled={running || pending}
          onChange={(e) => onTypeChange(e.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-sm text-foreground disabled:opacity-60"
        >
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      {target}
      {overLimit && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-warning">
          <AlertTriangle className="size-3.5" aria-hidden />
          Lleva más de 4 h en marcha
        </p>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={running ? onStop : onStart}
        className={cn(
          "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          running ? "bg-destructive text-white hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {running ? <Square className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
        {running ? "Parar" : "Empezar"}
      </button>
    </div>
  )
}

export default TimerControl
export { TimerControl }
