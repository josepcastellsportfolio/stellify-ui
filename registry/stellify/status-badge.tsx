import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { Badge, type BadgeAppearance } from "@/components/ui/badge"

export type Status = "success" | "warning" | "danger" | "info" | "neutral"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: Status
  /** `badge` (tinted) or `plain` (icon + text, no background). */
  appearance?: "badge" | "plain"
  /** Small leading dot in the current text color. */
  withDot?: boolean
  /** Leading icon (e.g. a check in a plain status pill). */
  icon?: LucideIcon
}

/**
 * A `Badge` whose tone is a status. Kept as its own item for the name; new
 * code can use `<Badge tone="success">` directly. Status is never color
 * alone: pass a label as children, and an icon when it helps.
 */
function StatusBadge({ status = "neutral", appearance = "badge", ...props }: StatusBadgeProps) {
  const look: BadgeAppearance = appearance === "plain" ? "plain" : "subtle"
  return <Badge data-slot="status-badge" tone={status} appearance={look} {...props} />
}

export default StatusBadge
export { StatusBadge }
