import type { ReactNode } from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ReasonListProps {
  reasons: ReactNode[]
  className?: string
}

/** Short justifications, each with a primary check. */
function ReasonList({ reasons, className }: ReasonListProps) {
  if (reasons.length === 0) return null
  return (
    <ul data-slot="reason-list" className={cn("space-y-3", className)}>
      {reasons.map((reason, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  )
}

export { ReasonList }
