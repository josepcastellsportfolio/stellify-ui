import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type NumberOperator = "eq" | "lt" | "lte" | "gt" | "gte"

export const NUMBER_OPERATOR_SYMBOL: Record<NumberOperator, string> = {
  eq: "=",
  lt: "<",
  lte: "≤",
  gt: ">",
  gte: "≥",
}

export interface NumberCompareValue {
  operator: NumberOperator
  /** The compared value, or null when empty. */
  value: number | null
}

export interface NumberCompareProps {
  value: NumberCompareValue
  onChange: (value: NumberCompareValue) => void
  /** Operators to offer. Defaults to all five. */
  operators?: NumberOperator[]
  placeholder?: string
  step?: number
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

const ALL: NumberOperator[] = ["eq", "lt", "lte", "gt", "gte"]

/**
 * Numeric comparison input: an operator select (=, <, ≤, >, ≥) + a number
 * field. Controlled; emits `{ operator, value }` (value is null when blank).
 * Useful for filters and query builders.
 */
export default function NumberCompare({
  value,
  onChange,
  operators = ALL,
  placeholder,
  step,
  min,
  max,
  disabled,
  className,
  "aria-label": ariaLabel,
}: NumberCompareProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={value.operator}
        onValueChange={(op) => onChange({ ...value, operator: op as NumberOperator })}
        disabled={disabled}
      >
        <SelectTrigger className="w-[4.25rem]" aria-label="Operator">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op} value={op}>
              <span className="font-mono">{NUMBER_OPERATOR_SYMBOL[op]}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={value.value ?? ""}
        onChange={(e) =>
          onChange({
            ...value,
            value: e.target.value === "" ? null : Number(e.target.value),
          })
        }
      />
    </div>
  )
}

export { NumberCompare }
