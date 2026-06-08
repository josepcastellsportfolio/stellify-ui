import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * StellifyIT input — API-compatible with the standard shadcn input
 * (`React.ComponentProps<"input">`), plus an invalid state: set
 * `aria-invalid` (the `text-field` wrapper does this on error) and the border
 * turns destructive. Safe to overwrite `@/components/ui/input`.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/40 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
