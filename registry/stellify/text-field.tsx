import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface TextFieldProps
  extends Omit<React.ComponentProps<"input">, "id"> {
  /** Field label rendered above the input. */
  label?: string
  /** Error message; sets the invalid state and is announced to a11y tools. */
  error?: string
  /** Helper text shown below the input when there's no error. */
  helperText?: string
  /** Icon rendered inside the input, on the left. */
  leadingIcon?: LucideIcon
  /** Icon rendered inside the input, on the right. */
  trailingIcon?: LucideIcon
  /** Marks the field required (adds an asterisk to the label). */
  required?: boolean
  /** Override the generated id. */
  id?: string
  /** Class for the outer wrapper (the input keeps `className`). */
  wrapperClassName?: string
}

/**
 * Labeled input with error / helper text and optional leading/trailing icons.
 *
 * Wraps the StellifyIT `Input`. Wiring (`htmlFor`, `aria-invalid`,
 * `aria-describedby`) is handled so screen readers announce the label and the
 * error/helper. All copy is passed via props — no hardcoded language.
 */
const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      leadingIcon: LeadingIcon,
      trailingIcon: TrailingIcon,
      required,
      id,
      className,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const describedById = error
      ? `${inputId}-error`
      : helperText
        ? `${inputId}-helper`
        : undefined

    return (
      <div className={cn("space-y-1.5", wrapperClassName)}>
        {label && (
          <Label htmlFor={inputId}>
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </Label>
        )}

        <div className="relative">
          {LeadingIcon && (
            <LeadingIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          )}
          <Input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedById}
            className={cn(
              LeadingIcon && "pl-9",
              TrailingIcon && "pr-9",
              className
            )}
            {...props}
          />
          {TrailingIcon && (
            <TrailingIcon
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-destructive">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)
TextField.displayName = "TextField"

export default TextField
export { TextField }
