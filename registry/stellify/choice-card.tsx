import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Single-choice group of block options (radiogroup semantics, arrow-key
 * navigation). Name it with `aria-label` or `aria-labelledby`.
 */
const ChoiceCardGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    data-slot="choice-card-group"
    className={cn("grid gap-3", className)}
    {...props}
  />
))
ChoiceCardGroup.displayName = "ChoiceCardGroup"

export interface ChoiceCardProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  /** Short tag next to the title ("Recomendado", "Más popular"). */
  badge?: React.ReactNode
  /**
   * Von Restorff: the one option meant to stand out among similar ones (the
   * recommended plan). A brand bar on its leading edge and a solid badge; it
   * does not look selected. One per group at most.
   */
  featured?: boolean
}

/** Selectable block: title + description; selected = brand tint + check. */
const ChoiceCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  ChoiceCardProps
>(({ className, title, description, badge, featured = false, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    data-slot="choice-card"
    data-featured={featured || undefined}
    className={cn(
      "group relative flex w-full items-start justify-between gap-4 rounded-lg bg-surface-2 px-4 py-3 text-left transition-colors duration-(--duration-fast)",
      "hover:bg-surface-3",
      "data-[state=checked]:bg-brand-subtle",
      // A fill, not a border: the leading bar marks the featured option in any state.
      "data-[featured]:before:absolute data-[featured]:before:inset-y-2 data-[featured]:before:left-0 data-[featured]:before:w-1 data-[featured]:before:rounded-r-sm data-[featured]:before:bg-brand",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <span className="space-y-0.5">
      <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
        {title}
        {badge && (
          <Badge data-slot="choice-card-badge" tone="brand" appearance={featured ? "solid" : "subtle"} size="xs">
            {badge}
          </Badge>
        )}
      </span>
      {description && <span className="block text-sm text-muted-foreground">{description}</span>}
    </span>
    <RadioGroupPrimitive.Indicator data-slot="choice-card-check" className="mt-0.5 text-primary">
      <Check className="size-4" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
))
ChoiceCard.displayName = "ChoiceCard"

export { ChoiceCard, ChoiceCardGroup }
