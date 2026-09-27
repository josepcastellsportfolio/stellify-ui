import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

/** Small neutral tag (e.g. a detected signal). Read-only; not a filter or a button. */
function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="chip"
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Chip }
