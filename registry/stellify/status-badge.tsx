import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      status: {
        success:
          "border-transparent bg-success/15 text-success dark:bg-success/20",
        warning:
          "border-transparent bg-warning/15 text-warning dark:bg-warning/20",
        danger:
          "border-transparent bg-destructive/15 text-destructive dark:bg-destructive/20",
        info: "border-transparent bg-info/15 text-info dark:bg-info/20",
        neutral:
          "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** Show a small leading dot in the current text color. */
  withDot?: boolean
}

/**
 * Badge with semantic status colors backed by the StellifyIT tokens
 * (success / warning / danger / info / neutral). The label is the children,
 * so it stays i18n-agnostic.
 *
 * Note: relies on the `success`, `warning` and `info` tokens shipped by
 * `stellify-base` (in addition to the standard shadcn `destructive`/`muted`).
 */
function StatusBadge({
  className,
  status,
  withDot = false,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {withDot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      )}
      {children}
    </span>
  )
}

export default StatusBadge
export { StatusBadge, statusBadgeVariants }
