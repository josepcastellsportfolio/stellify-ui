import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** Lower-bound operators (greater-than family). */
export type LowerOperator = "gt" | "gte"
/** Upper-bound operators (less-than family). */
export type UpperOperator = "lt" | "lte"

export const OPERATOR_SYMBOL: Record<
  LowerOperator | UpperOperator,
  string
> = {
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
}

export interface NumberBound<Op extends string> {
  operator: Op
  /** Bound value, or null when that side is unconstrained. */
  value: number | null
}

export interface NumberCompareValue {
  /** Lower bound, e.g. { operator: "gt", value: 2 } → "> 2". */
  lower: NumberBound<LowerOperator>
  /** Upper bound, e.g. { operator: "lt", value: 10 } → "< 10". */
  upper: NumberBound<UpperOperator>
}

export interface NumberCompareProps {
  value: NumberCompareValue
  onChange: (value: NumberCompareValue) => void
  /** Label between the two bounds. Defaults to "and". */
  conjunction?: string
  /** Stack the two bounds vertically instead of inline. Defaults to false. */
  vertical?: boolean
  placeholder?: string
  step?: number
  disabled?: boolean
  className?: string
}

const LOWER_OPS: LowerOperator[] = ["gt", "gte"]
const UPPER_OPS: UpperOperator[] = ["lt", "lte"]

/** A sensible empty value: ">" lower, "<" upper, both blank. */
export const EMPTY_NUMBER_COMPARE: NumberCompareValue = {
  lower: { operator: "gt", value: null },
  upper: { operator: "lt", value: null },
}

/**
 * Two-sided numeric comparison: a lower bound (>, ≥) AND an upper bound (<, ≤),
 * e.g. "> 2 and < 10". Either side can be left blank for an open range.
 * Controlled; emits `{ lower, upper }`. Useful for range filters.
 */
export default function NumberCompare({
  value,
  onChange,
  conjunction = "and",
  vertical = false,
  placeholder,
  step,
  disabled,
  className,
}: NumberCompareProps) {
  const bound = <Op extends LowerOperator | UpperOperator>(
    side: "lower" | "upper",
    ops: Op[]
  ) => {
    const current = value[side] as NumberBound<Op>
    return (
      <div className="flex items-center gap-2">
        <Select
          value={current.operator}
          onValueChange={(op) =>
            onChange({ ...value, [side]: { ...current, operator: op } })
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-[4.25rem]" aria-label={`${side} operator`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ops.map((op) => (
              <SelectItem key={op} value={op}>
                <span className="font-mono">{OPERATOR_SYMBOL[op]}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          inputMode="decimal"
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={`${side} value`}
          value={current.value ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              [side]: {
                ...current,
                value: e.target.value === "" ? null : Number(e.target.value),
              },
            })
          }
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex gap-2",
        vertical ? "flex-col items-stretch" : "flex-row items-center",
        className
      )}
    >
      {bound("lower", LOWER_OPS)}
      <span className="shrink-0 text-sm text-muted-foreground">{conjunction}</span>
      {bound("upper", UPPER_OPS)}
    </div>
  )
}

export { NumberCompare }
