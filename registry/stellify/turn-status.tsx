import { CircleSlash, LoaderCircle, PenLine, TriangleAlert, Wrench } from "lucide-react"

import { cn } from "@/lib/utils"

export type TurnStatusKind = "thinking" | "responding" | "tool" | "cancelled" | "error"

export interface TurnStatusProps {
  status: TurnStatusKind
  /** Already-localized text ("Pensando…", "Cancelado", the error message). */
  label: string
  className?: string
}

const ICON = {
  thinking: LoaderCircle,
  responding: PenLine,
  tool: Wrench,
  cancelled: CircleSlash,
  error: TriangleAlert,
} as const

/**
 * Where a turn stands, as text plus an icon whose shape changes with the
 * state. Purely visual: announce changes through a live region of your own
 * (the caption often sits inside a region hidden while streaming).
 */
export function TurnStatus({ status, label, className }: TurnStatusProps) {
  const Icon = ICON[status]
  return (
    <p
      data-slot="turn-status"
      data-status={status}
      className={cn(
        "inline-flex items-center gap-2 text-sm",
        status === "error" ? "font-medium text-danger" : "text-muted-foreground",
        className
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "size-4 shrink-0",
          status === "thinking" && "motion-safe:animate-spin",
          status === "responding" && "motion-safe:animate-pulse"
        )}
      />
      <span>{label}</span>
    </p>
  )
}
