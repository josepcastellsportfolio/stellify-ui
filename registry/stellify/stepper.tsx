import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/** Where a step stands. Shared with `progress-checklist`. */
export type StepStatus = "complete" | "current" | "upcoming"

export interface StepperStep {
  id: string
  label: React.ReactNode
  /** Second line, muted ("Llega el jueves"). */
  description?: React.ReactNode
}

export interface StepperLabels {
  /** Read after a step's label by screen readers, so status never rests on color alone. */
  status: Record<StepStatus, string>
}

const DEFAULT_LABELS: StepperLabels = {
  status: { complete: "completado", current: "paso actual", upcoming: "pendiente" },
}

/** Status of step `index` when `current` is the index of the step in progress. */
export function stepStatus(index: number, current: number): StepStatus {
  return index < current ? "complete" : index === current ? "current" : "upcoming"
}

export interface StepMarkerProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StepStatus
  /** Shown while not complete: the step number, usually. */
  children?: React.ReactNode
}

/**
 * The round marker of a step: a check when complete, a brand-tinted number
 * when current, a muted number when upcoming. Decorative: the status is
 * announced by the text next to it.
 */
function StepMarker({ status, children, className, ...props }: StepMarkerProps) {
  return (
    <span
      data-slot="step-marker"
      data-status={status}
      aria-hidden
      className={cn(
        "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold tabular-nums transition-colors duration-(--duration-base) ease-(--ease-out)",
        status === "complete" && "bg-primary text-primary-foreground",
        status === "current" && "bg-brand-subtle text-brand",
        status === "upcoming" && "bg-surface-3 text-muted-foreground",
        className
      )}
      {...props}
    >
      {status === "complete" ? (
        <Check className="size-3.5 animate-in zoom-in-50 duration-(--duration-base) ease-(--ease-spring)" strokeWidth={3} />
      ) : (
        children
      )}
    </span>
  )
}

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "children"> {
  steps: readonly StepperStep[]
  /** Index of the step in progress. `steps.length` marks every step complete. */
  current: number
  /**
   * `responsive` stacks the steps on phones and lays them out in a row from
   * `sm` up: a row of four or more labels doesn't fit 360px. Default.
   */
  orientation?: "horizontal" | "vertical" | "responsive"
  labels?: Partial<StepperLabels>
}

/**
 * Steps joined by a line (uniform connectedness: what is connected reads as
 * one sequence). For a process the person watches or walks through: order
 * tracking, a multi-page form, a deploy. Name it with `aria-label`. Stacked
 * on phones and in a row from `sm` up unless `orientation` says otherwise.
 *
 * An ordered list; the current step carries `aria-current="step"` and every
 * step reads its status after its label. The line up to the current step is
 * filled with the brand.
 *
 * ```tsx
 * <Stepper aria-label="Estado del pedido" current={2} steps={[
 *   { id: "o", label: "Pedido" }, { id: "p", label: "Preparado" },
 *   { id: "s", label: "Enviado" }, { id: "d", label: "Entregado" },
 * ]} />
 * ```
 */
const LAYOUT = {
  vertical: {
    list: "flex flex-col",
    step: "flex gap-3 pb-6 last:pb-0",
    grow: "",
    connector: "bottom-1 left-3 top-7 w-0.5 -translate-x-1/2",
    text: "",
  },
  horizontal: {
    list: "flex w-full items-start",
    step: "flex min-w-0 flex-col gap-2",
    grow: "flex-1",
    connector: "left-7 right-1 top-3 h-0.5 -translate-y-1/2",
    text: "pr-3",
  },
  responsive: {
    list: "flex flex-col sm:w-full sm:flex-row sm:items-start",
    step: "flex gap-3 pb-6 last:pb-0 sm:min-w-0 sm:flex-col sm:gap-2 sm:pb-0",
    grow: "sm:flex-1",
    connector:
      "bottom-1 left-3 top-7 w-0.5 -translate-x-1/2 sm:bottom-auto sm:left-7 sm:right-1 sm:top-3 sm:h-0.5 sm:w-auto sm:translate-x-0 sm:-translate-y-1/2",
    text: "sm:pr-3",
  },
}

function Stepper({ steps, current, orientation = "responsive", labels, className, ...props }: StepperProps) {
  const l = { status: { ...DEFAULT_LABELS.status, ...labels?.status } }
  const layout = LAYOUT[orientation]
  return (
    <ol
      data-slot="stepper"
      data-orientation={orientation}
      className={cn(layout.list, className)}
      {...props}
    >
      {steps.map((step, i) => {
        const status = stepStatus(i, current)
        const last = i === steps.length - 1
        // The segment after a step is filled once the next step has been reached.
        const filled = i < current
        return (
          <li
            key={step.id}
            data-slot="stepper-step"
            data-status={status}
            aria-current={status === "current" ? "step" : undefined}
            className={cn("relative", layout.step, !last && layout.grow)}
          >
            {!last && (
              <span
                data-slot="stepper-connector"
                data-filled={filled || undefined}
                aria-hidden
                className={cn(
                  "absolute rounded-full bg-surface-3 transition-colors duration-(--duration-base) ease-(--ease-out) data-[filled]:bg-primary",
                  layout.connector
                )}
              />
            )}
            <StepMarker status={status}>{i + 1}</StepMarker>
            <span className={cn("flex min-w-0 flex-col", layout.text)}>
              <span
                className={cn(
                  "text-sm",
                  status === "upcoming" ? "text-muted-foreground" : "font-medium text-foreground"
                )}
              >
                {step.label}
                <span className="sr-only">, {l.status[status]}</span>
              </span>
              {step.description && <span className="text-xs text-muted-foreground">{step.description}</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export { Stepper, StepMarker }
