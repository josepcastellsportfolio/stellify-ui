import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Brand mark at the top. */
  logo?: React.ReactNode
  footer?: React.ReactNode
}

/** Vertical app navigation. Name it with `aria-label`. */
function Sidebar({ logo, footer, children, className, ...props }: SidebarProps) {
  return (
    <nav
      data-slot="sidebar"
      className={cn("flex h-full flex-col gap-6 px-4 py-6", className)}
      {...props}
    >
      {logo && <div className="px-2">{logo}</div>}
      <div className="flex flex-1 flex-col gap-6">{children}</div>
      {footer}
    </nav>
  )
}

export interface SidebarGroupProps {
  label: React.ReactNode
  children: React.ReactNode
  className?: string
}

function SidebarGroup({ label, children, className }: SidebarGroupProps) {
  const labelId = React.useId()
  return (
    <div data-slot="sidebar-group" className={cn("space-y-1", className)}>
      <SidebarGroupLabel id={labelId}>{label}</SidebarGroupLabel>
      <ul aria-labelledby={labelId} className="space-y-0.5">
        {React.Children.map(children, (child) => (child ? <li>{child}</li> : null))}
      </ul>
    </div>
  )
}

function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="sidebar-group-label"
      className={cn("px-2 pb-1 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

export interface SidebarItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon: LucideIcon
  active?: boolean
  /** Right-hand slot: a "TU VÍA" badge, a job spinner… */
  trailing?: React.ReactNode
  /** Render the child element (e.g. a router `<Link>`) instead of an `<a>`. */
  asChild?: boolean
}

const SidebarItem = React.forwardRef<HTMLAnchorElement, SidebarItemProps>(
  ({ icon: Icon, active = false, trailing, asChild = false, className, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"
    return (
      <Comp
        ref={ref}
        data-slot="sidebar-item"
        data-active={active}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 whitespace-nowrap rounded-md px-2 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground",
          active && "bg-primary/5 font-semibold text-primary hover:bg-primary/10 hover:text-primary",
          className
        )}
        {...props}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <Slottable>{children}</Slottable>
        {trailing && <span className="ml-auto flex shrink-0 items-center">{trailing}</span>}
      </Comp>
    )
  }
)
SidebarItem.displayName = "SidebarItem"

export { Sidebar, SidebarGroup, SidebarGroupLabel, SidebarItem }
