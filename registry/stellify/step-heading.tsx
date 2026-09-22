import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface StepHeadingProps {
  title: ReactNode
  description?: ReactNode
  className?: string
}

/** Title + grey subtitle at the top of an onboarding step. */
function StepHeading({ title, description, className }: StepHeadingProps) {
  return (
    <div data-slot="step-heading" className={cn("space-y-1.5", className)}>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

export { StepHeading }
