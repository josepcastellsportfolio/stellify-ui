import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Pencil, Plus, type LucideIcon } from "lucide-react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

// Tonal secondary: one step darker than surface-3 on hover, mixed toward ink.
const TONAL = "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary)_88%,var(--foreground))]"
const GHOST = "hover:bg-accent hover:text-accent-foreground"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,transform] duration-(--duration-fast) active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Hierarchy: primary (brand fill) / secondary (tonal) / base (no fill).
        // No borders, no shadows: weight comes from tone.
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: TONAL,
        base: GHOST,
        // Semantic actions:
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        info: "bg-info text-info-foreground hover:bg-info/90",
        link: "text-primary underline-offset-4 hover:underline",
        // shadcn names, so overwriting ui/button never breaks existing usages
        // (default === primary, outline === secondary, ghost === base).
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: TONAL,
        ghost: GHOST,
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

/**
 * CRUD action modes. Each maps to a semantic color (via `variant`) and a
 * leading icon. The label is always the consumer's `children` (no hardcoded
 * language).
 */
export type ButtonMode = "create" | "edit" | "finish"

const MODE_VARIANT: Record<ButtonMode, NonNullable<VariantProps<typeof buttonVariants>["variant"]>> =
  {
    create: "success",
    edit: "info",
    finish: "success",
  }

const MODE_ICON: Record<ButtonMode, LucideIcon> = {
  create: Plus,
  edit: Pencil,
  finish: Check,
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Show a spinner and disable the button while an action is in flight.
   * The label stays for layout but is visually hidden.
   */
  loading?: boolean
  /**
   * CRUD intent shortcut: sets a semantic color and a leading icon
   * (create → success/Plus, edit → info/Pencil, finish → success/Check).
   * An explicit `variant` overrides the mode's color; the label is `children`.
   */
  mode?: ButtonMode
}

/**
 * StellifyIT button.
 *
 * Hierarchy variants `primary` / `secondary` / `base` (+ `destructive`,
 * `success`, `warning`, `info`, `link`), a `loading` spinner state, and a
 * `mode` shortcut for CRUD actions (edit / create / finish) that injects a
 * semantic color and icon. `disabled` is the native button state.
 *
 * Safe to overwrite `@/components/ui/button`. Note: `mode` icons and `loading`
 * are ignored when `asChild` is set (a Slot renders a single arbitrary child).
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      mode,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const resolvedVariant = variant ?? (mode ? MODE_VARIANT[mode] : undefined)
    const ModeIcon = mode ? MODE_ICON[mode] : undefined

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant: resolvedVariant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant: resolvedVariant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <Spinner size="sm" decorative />
        ) : (
          ModeIcon && <ModeIcon aria-hidden />
        )}
        {loading ? <span className="sr-only">{children}</span> : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
