import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * One badge for labels and states. `tone` picks the color, `appearance` how
 * loud it is: `subtle` (tinted, the default), `solid`, or `plain` (icon + text,
 * no background). 4px corners; the pill shape belongs to `chip`.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm font-medium transition-colors duration-(--duration-fast) [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "",
        brand: "",
        success: "",
        warning: "",
        danger: "",
        info: "",
      },
      appearance: {
        subtle: "",
        solid: "",
        /** No background: icon + text, e.g. "✓ 20 negocios encontrados." */
        plain: "gap-2 bg-transparent px-0 text-sm text-foreground [&>svg]:size-4",
      },
      size: {
        default: "px-2 py-0.5 text-xs [&>svg]:size-3.5",
        /** Compact tag, e.g. "TU VÍA" next to a card title or sidebar item. */
        xs: "gap-1 px-1.5 py-0 text-[10px] leading-4 [&>svg]:size-3",
      },
      uppercase: {
        true: "font-mono uppercase tracking-(--tracking-mono-caps)",
        false: "",
      },
    },
    compoundVariants: [
      { appearance: "subtle", tone: "neutral", className: "bg-surface-3 text-foreground" },
      { appearance: "subtle", tone: "brand", className: "bg-brand-subtle text-brand" },
      { appearance: "subtle", tone: "success", className: "bg-success-subtle text-success" },
      { appearance: "subtle", tone: "warning", className: "bg-warning-subtle text-warning" },
      { appearance: "subtle", tone: "danger", className: "bg-danger-subtle text-danger" },
      { appearance: "subtle", tone: "info", className: "bg-info-subtle text-info" },
      { appearance: "solid", tone: "neutral", className: "bg-foreground text-background" },
      { appearance: "solid", tone: "brand", className: "bg-brand text-brand-foreground" },
      { appearance: "solid", tone: "success", className: "bg-success text-success-foreground" },
      { appearance: "solid", tone: "warning", className: "bg-warning text-warning-foreground" },
      { appearance: "solid", tone: "danger", className: "bg-danger text-danger-foreground" },
      { appearance: "solid", tone: "info", className: "bg-info text-info-foreground" },
      { appearance: "plain", tone: "brand", className: "[&>svg]:text-brand" },
      { appearance: "plain", tone: "success", className: "[&>svg]:text-success" },
      { appearance: "plain", tone: "warning", className: "[&>svg]:text-warning" },
      { appearance: "plain", tone: "danger", className: "text-danger [&>svg]:text-danger" },
      { appearance: "plain", tone: "info", className: "[&>svg]:text-info" },
    ],
    defaultVariants: {
      tone: "neutral",
      appearance: "subtle",
      size: "default",
      uppercase: false,
    },
  }
)

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>
type BadgeAppearance = NonNullable<VariantProps<typeof badgeVariants>["appearance"]>

/** shadcn variant names, kept so overwriting ui/badge never breaks a call site. */
const LEGACY_VARIANT: Record<string, { tone: BadgeTone; appearance: BadgeAppearance }> = {
  default: { tone: "brand", appearance: "solid" },
  secondary: { tone: "neutral", appearance: "subtle" },
  destructive: { tone: "danger", appearance: "subtle" },
  outline: { tone: "neutral", appearance: "subtle" },
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** shadcn compatibility: `default | secondary | destructive | outline`. Prefer `tone` + `appearance`. */
  variant?: "default" | "secondary" | "destructive" | "outline"
  /** Leading icon. */
  icon?: LucideIcon
  /** Small leading dot in the current text color. */
  withDot?: boolean
}

function Badge({
  className,
  variant,
  tone,
  appearance,
  size,
  uppercase,
  icon: Icon,
  withDot = false,
  children,
  ...props
}: BadgeProps) {
  const legacy = variant ? LEGACY_VARIANT[variant] : undefined
  return (
    <span
      data-slot="badge"
      className={cn(
        badgeVariants({
          tone: tone ?? legacy?.tone,
          appearance: appearance ?? legacy?.appearance,
          size,
          uppercase,
        }),
        className
      )}
      {...props}
    >
      {Icon && <Icon aria-hidden />}
      {withDot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
export type { BadgeTone, BadgeAppearance }
