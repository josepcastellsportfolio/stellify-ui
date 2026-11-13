"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/** What `Field` hands to its control so label, help and error are wired up. */
export interface FieldControlProps {
  id: string
  required?: boolean
  "aria-invalid"?: true
  "aria-describedby"?: string
}

export interface FieldProps {
  /** Label above the control. */
  label?: React.ReactNode
  /** Help under the control; hidden while there is an error. */
  description?: React.ReactNode
  /** Error message: marks the control invalid and is announced. */
  error?: React.ReactNode
  /** Adds the required mark to the label and `required` to the control. */
  required?: boolean
  /** Control id. Generated when omitted. */
  id?: string
  className?: string
  /**
   * The control. A single element gets `id`, `required`, `aria-invalid` and
   * `aria-describedby` merged in; a function receives them to place by hand.
   */
  children: React.ReactElement<FieldControlProps> | ((control: FieldControlProps) => React.ReactNode)
}

/**
 * The wrapper every form control sits in: label, control, then help or error.
 * Owns the accessibility wiring so each control doesn't. Works with `input`,
 * `textarea`, `select`, `number-input`, the date pickers, or any custom control.
 *
 * ```tsx
 * <Field label="Email" error={errors.email} required>
 *   <Input type="email" />
 * </Field>
 * ```
 */
function Field({ label, description, error, required, id, className, children }: FieldProps) {
  const generatedId = React.useId()
  const childId = typeof children === "function" ? undefined : children.props.id
  const controlId = id ?? childId ?? generatedId
  const messageId = error ? `${controlId}-error` : description ? `${controlId}-description` : undefined

  const control: FieldControlProps = {
    id: controlId,
    required: required || undefined,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": messageId,
  }

  return (
    <div data-slot="field" data-invalid={error ? "" : undefined} className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={controlId}>
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden>
              *
            </span>
          )}
        </Label>
      )}
      {typeof children === "function"
        ? children(control)
        : React.cloneElement(children, { ...control, ...stripUndefined(children.props) })}
      {error ? (
        <p id={messageId} data-slot="field-error" className="text-xs text-danger">
          {error}
        </p>
      ) : description ? (
        <p id={messageId} data-slot="field-description" className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}

/** Props the child set explicitly win over Field's, but `undefined` never erases them. */
function stripUndefined<T extends object>(props: T): Partial<T> {
  return Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) as Partial<T>
}

export { Field }
