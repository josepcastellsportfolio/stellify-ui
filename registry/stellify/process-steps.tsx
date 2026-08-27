import type { FC } from "react"

import { cn } from "@/lib/utils"

export interface ProcessStep {
  title: string
  description: string
}

export interface ProcessStepsProps {
  steps: ProcessStep[]
  className?: string
}

/**
 * Numbered "how this works" steps.
 *
 * Ordered list on purpose: the sequence is the meaning, and a screen reader
 * should announce it as one.
 */
export const ProcessSteps: FC<ProcessStepsProps> = ({ steps, className }) => (
  <ol className={cn("grid gap-8 sm:grid-cols-2 lg:grid-cols-4", className)}>
    {steps.map((step, index) => (
      <li key={step.title} className="flex flex-col gap-3">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-pill bg-primary text-sm font-semibold text-primary-foreground"
          aria-hidden="true"
        >
          {index + 1}
        </span>
        <h3 className="text-lg font-semibold tracking-display">
          {step.title}
        </h3>
        <p className="text-sm leading-body text-muted-foreground">
          {step.description}
        </p>
      </li>
    ))}
  </ol>
)
