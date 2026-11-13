import * as React from "react"

import { Field } from "@/components/ui/field"
import { Textarea, type TextareaProps } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface TextareaFieldProps extends Omit<TextareaProps, "id"> {
  label?: string
  error?: string
  helperText?: string
  id?: string
  wrapperClassName?: string
}

/** `Field` + `Textarea`: the multi-line sibling of `TextField`. */
const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, helperText, required, id, wrapperClassName, ...props }, ref) => {
    return (
      <Field
        label={label}
        error={error}
        description={helperText}
        required={required}
        id={id}
        className={cn(wrapperClassName)}
      >
        <Textarea ref={ref} data-slot="textarea-field" {...props} />
      </Field>
    )
  }
)
TextareaField.displayName = "TextareaField"

export { TextareaField }
