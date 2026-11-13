import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * StellifyIT input: a filled field (no border). API-compatible with the
 * standard shadcn input (`React.ComponentProps<"input">`). Set `aria-invalid`
 * (`field` does it on error) and the fill turns `danger-subtle`. Focus is the
 * global outline from `stellify-base`. Safe to overwrite `@/components/ui/input`.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md bg-field px-3 py-1.5 text-base text-foreground transition-colors duration-(--duration-fast) hover:bg-field-hover file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:bg-danger-subtle md:text-sm",
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
