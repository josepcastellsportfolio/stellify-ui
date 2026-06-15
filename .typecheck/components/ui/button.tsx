import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Loader2, Pencil, Plus, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-[color,background-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // StellifyIT hierarchy: primary (main) / secondary (soft) / base (neutral).
        primary:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-sm",
        secondary:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        base: "hover:bg-accent hover:text-accent-foreground",
        // Semantic actions:
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 hover:shadow-sm",
        success:
          "bg-success text-success-foreground shadow-xs hover:bg-success/90 hover:shadow-sm",
        warning:
          "bg-warning text-warning-foreground shadow-xs hover:bg-warning/90 hover:shadow-sm",
        info: "bg-info text-info-foreground shadow-xs hover:bg-info/90 hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
        // Back-compat aliases with the standard shadcn names so overwriting
        // ui/button never breaks existing usages (outline === secondary,
        // ghost === base, default === primary).
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-sm",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
          <Loader2 className="animate-spin" aria-hidden />
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
