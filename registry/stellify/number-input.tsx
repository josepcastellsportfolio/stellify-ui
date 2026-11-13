"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface NumberInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type" | "min" | "max" | "step"> {
  value: number | null
  onChange: (value: number | null) => void
  label?: string
  min?: number
  max?: number
  step?: number
  /** Stepper button names. Defaults: "Aumentar", "Disminuir". */
  labels?: Partial<NumberInputLabels>
}

export interface NumberInputLabels {
  increment: string
  decrement: string
}

const DEFAULT_LABELS: NumberInputLabels = { increment: "Aumentar", decrement: "Disminuir" }

const clamp = (n: number, min?: number, max?: number) =>
  Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, n))

/** Numeric input with a vertical ± stepper on the right. Controlled; empty = null. */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      label,
      min,
      max,
      step = 1,
      labels,
      id,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const l = { ...DEFAULT_LABELS, ...labels }
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const bump = (delta: number) => onChange(clamp((value ?? min ?? 0) + delta, min, max))
    const atMax = value !== null && max !== undefined && value >= max
    const atMin = value !== null && min !== undefined && value <= min
    const stepperButton =
      "flex h-1/2 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-surface-3 hover:text-foreground disabled:opacity-40 [&_svg]:size-3.5"

    return (
      <div data-slot="number-input" className="space-y-1.5">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="number"
            inputMode="numeric"
            value={value ?? ""}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(e) => {
              const raw = e.target.value
              onChange(raw === "" ? null : clamp(Number(raw), min, max))
            }}
            className={cn(
              "flex h-9 w-full rounded-md bg-field border-b border-field-edge px-3 py-1.5 pr-9 text-base text-foreground tabular-nums transition-colors duration-(--duration-fast) hover:bg-field-hover aria-[invalid=true]:bg-danger-subtle [appearance:textfield] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              className
            )}
            {...props}
          />
          <div className="absolute inset-y-1 right-1 flex flex-col">
            <button
              type="button"
              tabIndex={-1}
              aria-label={l.increment}
              disabled={disabled || atMax}
              onClick={() => bump(step)}
              className={stepperButton}
            >
              <ChevronUp />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label={l.decrement}
              disabled={disabled || atMin}
              onClick={() => bump(-step)}
              className={stepperButton}
            >
              <ChevronDown />
            </button>
          </div>
        </div>
      </div>
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }
