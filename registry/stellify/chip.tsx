import type { HTMLAttributes } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ChipLabels {
  remove: string
}

const DEFAULT_LABELS: ChipLabels = { remove: "Quitar" }

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Shows a small remove button (e.g. an editable list of topics). Read-only when omitted. */
  onRemove?: () => void
  /** Copy. `remove` prefixes the remove button's name: "Quitar <text>". */
  labels?: Partial<ChipLabels>
}

/** A user-held value (a topic, a filter), pill-shaped and optionally removable. For labels and states use `badge`. */
function Chip({ className, children, onRemove, labels, ...props }: ChipProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  return (
    <span
      data-slot="chip"
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-foreground",
        className
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${l.remove} ${typeof children === "string" ? children : ""}`.trim()}
          className="-mr-1.5 rounded-full p-0.5 text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-surface-3 hover:text-foreground"
        >
          <X className="size-3" aria-hidden />
        </button>
      )}
    </span>
  )
}

export { Chip }
