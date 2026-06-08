import { forwardRef, useId } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface MoneyInputProps {
  /** Current amount, or null/undefined when empty. Controlled. */
  value: number | null | undefined
  /** Called with the parsed number, or null when the field is cleared. */
  onChange: (value: number | null) => void
  /** Currency symbol/code adornment, e.g. "€", "$", "EUR". Defaults to "€". */
  symbol?: string
  /** Position of the adornment. Defaults to "leading". */
  symbolPosition?: "leading" | "trailing"
  /** Step for the number input. Defaults to 0.01. */
  step?: number
  /** Minimum value. */
  min?: number
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  "aria-label"?: string
}

/**
 * Numeric input for monetary amounts with a currency adornment.
 *
 * Controlled component: holds no internal value, emits `number | null`.
 * Display formatting (thousands separators, etc.) is intentionally left to a
 * read-only `CurrencyDisplay` — editing a grouped string is hostile, so the
 * raw number input stays plain while focused.
 */
const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      value,
      onChange,
      symbol = "€",
      symbolPosition = "leading",
      step = 0.01,
      min,
      placeholder,
      disabled,
      id,
      name,
      className,
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const reactId = useId()
    const inputId = id ?? reactId
    const leading = symbolPosition === "leading"

    const adornment = (
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 flex items-center text-sm text-muted-foreground",
          leading ? "left-3" : "right-3"
        )}
      >
        {symbol}
      </span>
    )

    return (
      <div className={cn("relative", className)}>
        {adornment}
        <Input
          ref={ref}
          id={inputId}
          name={name}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={cn(leading ? "pl-8" : "pr-8")}
          value={value ?? ""}
          onChange={(event) => {
            const raw = event.target.value
            onChange(raw === "" ? null : Number(raw))
          }}
        />
      </div>
    )
  }
)
MoneyInput.displayName = "MoneyInput"

export default MoneyInput
export { MoneyInput }
