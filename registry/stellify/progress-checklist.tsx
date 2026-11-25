import * as React from "react"

import { StepMarker, type StepStatus } from "@/components/ui/stepper"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface ChecklistItem {
  id: string
  label: React.ReactNode
  description?: React.ReactNode
  done: boolean
  /** Shown only on the next pending item: the one thing to do now ("Empezar"). */
  action?: React.ReactNode
}

export interface ProgressChecklistLabels {
  /** "3 de 5". */
  count: (done: number, total: number) => string
  /** Goal gradient: how close the finish is. */
  remaining: (left: number) => string
  /** When every item is done. */
  complete: string
  status: Record<StepStatus, string>
}

const DEFAULT_LABELS: ProgressChecklistLabels = {
  count: (done, total) => `${done} de ${total}`,
  remaining: (left) => (left === 1 ? "Te falta 1 paso" : `Te faltan ${left} pasos`),
  complete: "Todo listo",
  status: { complete: "hecho", current: "siguiente", upcoming: "pendiente" },
}

export interface ProgressChecklistProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode
  items: readonly ChecklistItem[]
  labels?: Partial<ProgressChecklistLabels>
  /** Level of the title in the page outline. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

/**
 * Onboarding or setup list with its progress in view: "3 de 5", a bar, and
 * how many steps are left.
 *
 * - Zeigarnik: an unfinished list stays on the mind, so show it until it's done.
 * - Goal gradient: people speed up near the end, so say how close it is.
 * - Progressive disclosure: only the next pending item shows its action.
 *
 * Start with something already done (the account they just created): a list
 * that begins at 1 of 5 gets finished more than one at 0 of 4. Items can be
 * done in any order; the first pending one is the "next".
 */
function ProgressChecklist({
  title,
  items,
  labels,
  headingLevel = 3,
  className,
  ...props
}: ProgressChecklistProps) {
  const l = { ...DEFAULT_LABELS, ...labels, status: { ...DEFAULT_LABELS.status, ...labels?.status } }
  const titleId = React.useId()
  const Heading = `h${headingLevel}` as const
  const done = items.filter((i) => i.done).length
  const total = items.length
  const left = total - done
  const nextIndex = items.findIndex((i) => !i.done)
  const percent = total ? Math.round((done / total) * 100) : 0

  return (
    <section
      data-slot="progress-checklist"
      aria-labelledby={titleId}
      className={cn("rounded-lg bg-surface-2 p-4", className)}
      {...props}
    >
      <div className="flex items-baseline justify-between gap-4">
        <Heading id={titleId} className="text-sm font-semibold text-foreground">
          {title}
        </Heading>
        <span data-slot="progress-checklist-count" className="text-xs tabular-nums text-muted-foreground">
          {l.count(done, total)}
        </span>
      </div>
      <Progress
        size="sm"
        value={percent}
        className="mt-3"
        aria-labelledby={titleId}
        aria-valuetext={l.count(done, total)}
      />
      <p data-slot="progress-checklist-remaining" className="mt-2 text-xs text-muted-foreground" aria-live="polite">
        {left === 0 ? l.complete : l.remaining(left)}
      </p>
      <ol className="mt-3 space-y-1">
        {items.map((item, i) => {
          const status: StepStatus = item.done ? "complete" : i === nextIndex ? "current" : "upcoming"
          return (
            <li
              key={item.id}
              data-slot="progress-checklist-item"
              data-status={status}
              aria-current={status === "current" ? "step" : undefined}
              className={cn(
                "flex items-start gap-3 rounded-md px-2 py-2",
                status === "current" && "bg-surface-3"
              )}
            >
              <StepMarker status={status} className="mt-px">
                {i + 1}
              </StepMarker>
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className={cn(
                    "text-sm",
                    status === "current" ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                  <span className="sr-only">, {l.status[status]}</span>
                </span>
                {status === "current" && item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </span>
              {status === "current" && item.action && <span className="shrink-0">{item.action}</span>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export { ProgressChecklist }
