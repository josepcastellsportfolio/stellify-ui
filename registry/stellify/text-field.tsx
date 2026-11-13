import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
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
 * `Field` + `Input` in one component. `Field` does the wiring (`htmlFor`,
 * `aria-invalid`, `aria-describedby`). All copy comes in through props.
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
    return (
      <Field
        label={label}
        error={error}
        description={helperText}
        required={required}
        id={id}
        className={wrapperClassName}
      >
        {(control) => (
          <div className="relative">
            {LeadingIcon && (
              <LeadingIcon
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            )}
            <Input
              ref={ref}
              {...control}
              className={cn(LeadingIcon && "pl-9", TrailingIcon && "pr-9", className)}
              {...props}
            />
            {TrailingIcon && (
              <TrailingIcon
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            )}
          </div>
        )}
      </Field>
    )
  }
)
TextField.displayName = "TextField"

export default TextField
export { TextField }
