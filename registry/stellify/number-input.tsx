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
  incrementLabel?: string
  decrementLabel?: string
}

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
      incrementLabel = "Aumentar",
      decrementLabel = "Disminuir",
      id,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const bump = (delta: number) => onChange(clamp((value ?? min ?? 0) + delta, min, max))
    const atMax = value !== null && max !== undefined && value >= max
    const atMin = value !== null && min !== undefined && value <= min
    const stepperButton =
      "flex h-1/2 w-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 [&_svg]:size-3.5"

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
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-9 text-base [appearance:textfield] focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              className
            )}
            {...props}
          />
          <div className="absolute inset-y-1 right-1 flex flex-col">
            <button
              type="button"
              tabIndex={-1}
              aria-label={incrementLabel}
              disabled={disabled || atMax}
              onClick={() => bump(step)}
              className={stepperButton}
            >
              <ChevronUp />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label={decrementLabel}
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
