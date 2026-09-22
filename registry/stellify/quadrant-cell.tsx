import type { LucideIcon } from "lucide-react"
import { Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface QuadrantCellProps {
  icon: LucideIcon
  /** Uppercase grey code line, e.g. "C3 · Búsqueda activa · Tiempo". */
  code: string
  title: string
  description: string
  /** The user's recommended path: primary border + badge. */
  active?: boolean
  activeLabel?: string
  className?: string
}

/** One cell of the 2×2 acquisition grid. */
function QuadrantCell({
  icon: Icon,
  code,
  title,
  description,
  active = false,
  activeLabel = "Tu vía",
  className,
}: QuadrantCellProps) {
  return (
    <div
      data-slot="quadrant-cell"
      data-active={active}
      aria-current={active ? "true" : undefined}
      className={cn(
        "relative flex flex-col gap-2 rounded-xl border border-transparent p-5 transition-colors hover:border-border",
        active && "border-primary/60 hover:border-primary/60",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <Icon className="size-5 text-primary" aria-hidden />
        {active && (
          <Badge size="xs" uppercase>
            <Sparkles aria-hidden />
            {activeLabel}
          </Badge>
        )}
      </div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{code}</p>
      <p className="text-lg font-bold leading-tight text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export { QuadrantCell }
