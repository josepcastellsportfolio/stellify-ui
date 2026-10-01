import * as React from "react"
import { Bell } from "lucide-react"

import { cn } from "@/lib/utils"

export interface NotificationBellProps {
  /** Unread notifications: badge hidden at 0, "9+" from 10. */
  count: number
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Panel content: usually a list of NotificationItem. */
  children: React.ReactNode
  title?: string
  /** Header actions, e.g. "Marcar todas como leídas". */
  actions?: React.ReactNode
  /** Panel footer, e.g. "Ver todas". */
  footer?: React.ReactNode
  label?: string
  className?: string
}

export function badgeText(count: number): string | null {
  if (count <= 0) return null
  return count >= 10 ? "9+" : String(count)
}

/**
 * Bell button with an unread badge and a dropdown panel. Controlled: the caller closes it after
 * navigating. Escape and a click outside close it too.
 */
function NotificationBell({
  count,
  open,
  onOpenChange,
  children,
  title = "Notificaciones",
  actions,
  footer,
  label = "Notificaciones",
  className,
}: NotificationBellProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const panelId = React.useId()
  const badge = badgeText(count)

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false)
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [open, onOpenChange])

  return (
    <div ref={ref} data-slot="notification-bell" className={cn("relative", className)}>
      <button
        type="button"
        aria-label={badge ? `${label} (${count} sin leer)` : label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
        className="relative inline-flex size-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="size-5" aria-hidden />
        {badge && (
          <span
            data-testid="notification-badge"
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white"
          >
            {badge}
          </span>
        )}
      </button>
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={title}
          className="absolute right-0 z-50 mt-2 flex max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            <span className="text-sm font-semibold">{title}</span>
            {actions}
          </div>
          <div className="flex-1 overflow-y-auto p-1">{children}</div>
          {footer && <div className="border-t px-3 py-2">{footer}</div>}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
export { NotificationBell }
