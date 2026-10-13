import * as React from "react"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export interface SliderFieldProps {
  label: string
  value: number
  onValueChange: (value: number) => void
  min: number
  max: number
  step: number
  /** Formats the visible value (and the screen-reader value text). */
  format?: (value: number) => string
  /** Small helper text under the slider, e.g. the range. */
  hint?: React.ReactNode
  disabled?: boolean
  className?: string
}

/**
 * Labelled single-thumb slider with its current value always visible.
 * Controlled: pass `value` and `onValueChange`. No i18n, no business logic.
 */
const SliderField = ({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  format = String,
  hint,
  disabled,
  className,
}: SliderFieldProps) => {
  const id = React.useId()
  const labelId = `${id}-label`
  const formatted = format(value)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label id={labelId} className="text-sm font-medium">
          {label}
        </Label>
        <output
          aria-hidden="true"
          className="text-sm font-semibold tabular-nums text-foreground"
        >
          {formatted}
        </output>
      </div>
      <Slider
        value={[value]}
        onValueChange={([next]) => onValueChange(next)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        thumbProps={{ "aria-labelledby": labelId, "aria-valuetext": formatted }}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default SliderField
export { SliderField }
