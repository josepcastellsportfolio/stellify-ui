"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { useSlidingIndicator } from "@/components/ui/segmented-control"
import { cn } from "@/lib/utils"

type TabsVariant = "default" | "plain"
const VariantContext = React.createContext<TabsVariant>("default")

const Tabs = TabsPrimitive.Root

/**
 * `default`: the segmented look (tonal track, ink indicator that slides and can
 * be interrupted mid-move). `plain`: text tabs with a sliding underline, for
 * page-level navigation. Both keep Radix tab semantics and keyboard.
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: TabsVariant
  }
>(({ className, variant = "default", children, ...props }, forwardedRef) => {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement)
  const indicator = useSlidingIndicator(ref, '[data-state="active"]', [variant])
  const plain = variant === "plain"

  return (
    <VariantContext.Provider value={variant}>
      <TabsPrimitive.List
        ref={ref}
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(
          "relative isolate inline-flex items-center text-muted-foreground",
          plain ? "gap-4" : "h-9 rounded-full bg-surface-2 p-[3px]",
          className
        )}
        {...props}
      >
        <span
          aria-hidden
          data-slot="tabs-indicator"
          className={cn(
            "absolute left-0 -z-10 transition-[transform,width,opacity] duration-(--duration-base) ease-(--ease-out)",
            plain ? "bottom-0 h-0.5 rounded-full bg-foreground" : "inset-y-[3px] rounded-full bg-foreground"
          )}
          style={indicator}
        />
        {children}
      </TabsPrimitive.List>
    </VariantContext.Provider>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(VariantContext)
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      data-variant={variant}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors duration-(--duration-base) hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
        variant === "plain"
          ? "px-0.5 pb-1.5 data-[state=active]:text-foreground"
          : "h-full rounded-full px-3.5 data-[state=active]:text-background data-[state=active]:hover:text-background",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} data-slot="tabs-content" className={cn("mt-3", className)} {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
