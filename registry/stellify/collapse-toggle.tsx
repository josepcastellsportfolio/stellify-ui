import { ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CollapseToggleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  openLabel?: string
  closedLabel?: string
  /** id of the region this button shows/hides. */
  controls?: string
  className?: string
}

/** Text button that collapses/expands a region ("^ Contraer la lista"). */
function CollapseToggle({
  open,
  onOpenChange,
  openLabel = "Contraer",
  closedLabel = "Mostrar",
  controls,
  className,
}: CollapseToggleProps) {
  const Icon = open ? ChevronUp : ChevronDown
  return (
    <button
      type="button"
      data-slot="collapse-toggle"
      aria-expanded={open}
      aria-controls={controls}
      onClick={() => onOpenChange(!open)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-1 text-sm text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className
      )}
    >
      <Icon className="size-4" aria-hidden />
      {open ? openLabel : closedLabel}
    </button>
  )
}

export { CollapseToggle }
