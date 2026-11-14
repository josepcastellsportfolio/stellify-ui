import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CollapseToggleLabels {
  /** Shown while the region is open. */
  open: string
  /** Shown while the region is closed. */
  closed: string
}

const DEFAULT_LABELS: CollapseToggleLabels = { open: "Contraer", closed: "Mostrar" }

export interface CollapseToggleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Defaults: "Contraer" / "Mostrar". */
  labels?: Partial<CollapseToggleLabels>
  /** id of the region this button shows/hides. */
  controls?: string
  className?: string
}

/** Text button that collapses/expands a region ("^ Contraer la lista"). The chevron turns; clicking again mid-turn reverses it. */
function CollapseToggle({ open, onOpenChange, labels, controls, className }: CollapseToggleProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  return (
    <button
      type="button"
      data-slot="collapse-toggle"
      aria-expanded={open}
      aria-controls={controls}
      onClick={() => onOpenChange(!open)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-1 text-sm text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground",
        className
      )}
    >
      <ChevronDown
        className={cn("size-4 transition-transform duration-(--duration-base) ease-(--ease-spring)", open && "rotate-180")}
        aria-hidden
      />
      {open ? l.open : l.closed}
    </button>
  )
}

export { CollapseToggle }
