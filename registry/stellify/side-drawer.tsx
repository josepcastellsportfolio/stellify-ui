"use client"

import { useRef, type ReactNode } from "react"

import { useFocusTrap } from "@/hooks/use-focus-trap"
import { cn } from "@/lib/utils"

export interface SideDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Accessible name of the drawer ("Conversaciones"). */
  label: string
  /** Edge it slides from. Default "left". */
  side?: "left" | "right"
  children: ReactNode
  className?: string
}

/**
 * Modal panel from a screen edge for small screens (a sidebar's mobile form).
 * Traps focus while open, closes on Escape or a tap on the backdrop, locks
 * page scroll, respects the safe areas, and returns focus to whatever opened
 * it.
 */
export function SideDrawer({ open, onOpenChange, label, side = "left", children, className }: SideDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, {
    active: open,
    onEscape: () => onOpenChange(false),
    lockScroll: true,
    restoreFocus: true,
  })
  if (!open) return null
  return (
    <div data-slot="side-drawer" className="fixed inset-0 z-50">
      <div
        aria-hidden
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-foreground/40 animate-in fade-in-0"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          "absolute inset-y-0 flex w-[min(20rem,88vw)] flex-col overflow-y-auto overscroll-contain bg-sidebar text-sidebar-foreground shadow-(--shadow-overlay) animate-in duration-(--duration-base)",
          side === "left" ? "left-0 slide-in-from-left" : "right-0 slide-in-from-right",
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
