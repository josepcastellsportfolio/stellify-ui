import * as React from "react"
import { AlertTriangle, Info, OctagonAlert } from "lucide-react"

import { cn } from "@/lib/utils"

export type NotificationSeverity = "info" | "aviso" | "critica"

const SEVERITY = {
  info: { icon: Info, className: "text-info", label: "Información" },
  aviso: { icon: AlertTriangle, className: "text-warning", label: "Aviso" },
  critica: { icon: OctagonAlert, className: "text-destructive", label: "Crítica" },
} as const

export interface NotificationItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  severity: NotificationSeverity
  title: React.ReactNode
  body?: React.ReactNode
  /** Already formatted, e.g. "hace 5 min". */
  time: React.ReactNode
  unread?: boolean
  unreadLabel?: string
}

/** One notification row: severity icon, title, optional body, relative time and unread dot. */
function NotificationItem({
  severity,
  title,
  body,
  time,
  unread = false,
  unreadLabel = "No leída",
  className,
  ...props
}: NotificationItemProps) {
  const { icon: Icon, className: tone, label } = SEVERITY[severity]
  return (
    <button
      type="button"
      data-slot="notification-item"
      data-unread={unread || undefined}
      className={cn(
        "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        unread && "bg-primary/5",
        className
      )}
      {...props}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", tone)} aria-label={label} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("text-sm", unread ? "font-semibold" : "font-medium")}>{title}</span>
        {body && <span className="line-clamp-2 text-xs text-muted-foreground">{body}</span>}
        <span className="text-xs text-muted-foreground">{time}</span>
      </span>
      {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label={unreadLabel} role="img" />}
    </button>
  )
}

export default NotificationItem
export { NotificationItem }
