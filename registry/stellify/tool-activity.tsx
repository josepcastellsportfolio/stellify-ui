import { CircleCheck, CircleX, LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ToolActivityItem {
  id: string
  /** Already-localized line that also states the status ("Consultando el repositorio…", "Repositorio consultado"). */
  label: string
  status: "running" | "done" | "failed"
  /** Shown when the line is expanded (the query sent, the note written…). */
  detail?: string | null
  /** Already-formatted duration ("2,4 s"). */
  duration?: string | null
}

export interface ToolActivityProps {
  items: ToolActivityItem[]
  /** Accessible name of the list ("Herramientas usadas"). */
  label: string
  className?: string
}

const ICON = { running: LoaderCircle, done: CircleCheck, failed: CircleX } as const

/**
 * Compact lines for the tools a turn used. A line with a detail is a native
 * `<details>` disclosure, so it is keyboard- and screen-reader-operable for
 * free. Status is carried by the text and the icon's shape (spinner, check,
 * cross), never by color alone.
 */
export function ToolActivity({ items, label, className }: ToolActivityProps) {
  if (items.length === 0) return null
  return (
    <ul data-slot="tool-activity" aria-label={label} className={cn("flex w-full flex-col gap-1", className)}>
      {items.map((item) => {
        const Icon = ICON[item.status]
        const line = (
          <>
            <Icon
              aria-hidden
              className={cn(
                "size-4 shrink-0",
                item.status === "running" && "motion-safe:animate-spin",
                item.status === "done" && "text-success",
                item.status === "failed" && "text-danger"
              )}
            />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.duration ? <span className="shrink-0 font-mono text-xs tabular-nums">{item.duration}</span> : null}
          </>
        )
        return (
          <li key={item.id} className="text-sm text-muted-foreground">
            {item.detail ? (
              <details className="group rounded-md">
                <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-md px-1 hover:text-foreground [&::-webkit-details-marker]:hidden">
                  {line}
                  <span
                    aria-hidden
                    className="shrink-0 transition-transform duration-(--duration-fast) group-open:rotate-90"
                  >
                    ›
                  </span>
                </summary>
                <p className="ml-6 mt-1 whitespace-pre-wrap border-l border-field-edge pl-3 text-foreground">{item.detail}</p>
              </details>
            ) : (
              <div className="flex min-h-9 items-center gap-2 px-1">{line}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
