import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Check } from "lucide-react"

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
}

/** Selectable block: title + description; selected = primary border + check. */
const ChoiceCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  ChoiceCardProps
>(({ className, title, description, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    data-slot="choice-card"
    className={cn(
      "group flex w-full items-start justify-between gap-4 rounded-lg bg-surface-2 px-4 py-3 text-left transition-colors duration-(--duration-fast)",
      "hover:bg-surface-3",
      "data-[state=checked]:bg-brand-subtle",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <span className="space-y-0.5">
      <span className="block text-sm font-medium text-foreground">{title}</span>
      {description && <span className="block text-sm text-muted-foreground">{description}</span>}
    </span>
    <RadioGroupPrimitive.Indicator data-slot="choice-card-check" className="mt-0.5 text-primary">
      <Check className="size-4" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
))
ChoiceCard.displayName = "ChoiceCard"

export { ChoiceCard, ChoiceCardGroup }
