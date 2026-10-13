import type { HTMLAttributes } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Shows a small remove button (e.g. an editable list of topics). Read-only when omitted. */
  onRemove?: () => void
  /** Accessible name prefix for the remove button: "Quitar <text>". */
  removeLabel?: string
}

/** Small neutral tag (e.g. a detected signal), optionally removable. */
function Chip({ className, children, onRemove, removeLabel = "Quitar", ...props }: ChipProps) {
  return (
    <span
      data-slot="chip"
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${removeLabel} ${typeof children === "string" ? children : ""}`.trim()}
          className="-mr-1 rounded p-0.5 hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <X className="size-3" aria-hidden />
        </button>
      )}
    </span>
  )
}

export { Chip }
