import * as React from "react"

import { Label } from "@/components/ui/label"
import { Textarea, type TextareaProps } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface TextareaFieldProps extends Omit<TextareaProps, "id"> {
  label?: string
  error?: string
  helperText?: string
  id?: string
  wrapperClassName?: string
}

/** Labeled textarea with error/helper text; the multi-line sibling of `TextField`. */
const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, helperText, required, id, wrapperClassName, ...props }, ref) => {
    const generatedId = React.useId()
    const fieldId = id ?? generatedId
    const describedById = error
      ? `${fieldId}-error`
      : helperText
        ? `${fieldId}-helper`
        : undefined
    return (
      <div data-slot="textarea-field" className={cn("space-y-1.5", wrapperClassName)}>
        {label && (
          <Label htmlFor={fieldId}>
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </Label>
        )}
        <Textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          {...props}
        />
        {error ? (
          <p id={`${fieldId}-error`} className="text-xs text-destructive">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${fieldId}-helper`} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)
TextareaField.displayName = "TextareaField"

export { TextareaField }
