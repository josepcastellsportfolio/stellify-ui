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

/**
 * Postel's law: accept what people type, not only what `Number()` reads.
 * "1.234,5", "1,234.5", "1 234,5", "12,5 €", "−3" and "+4" all parse; with a
 * single separator, a comma is the decimal mark ("12,5" = 12.5), and a dot is
 * too unless it repeats ("1.234.567"). Returns null when nothing numeric is left.
 */
export function parseNumber(text: string): number | null {
  let t = text.replace(/[\s\u00a0\u202f€$£%]/g, "").replace(/\u2212/g, "-")
  if (t === "" || t === "-" || t === "+") return null
  const lastComma = t.lastIndexOf(",")
  const lastDot = t.lastIndexOf(".")
  if (lastComma !== -1 && lastDot !== -1) {
    // Both present: the later one is the decimal mark, the other groups thousands.
    const dec = lastComma > lastDot ? "," : "."
    const group = dec === "," ? "." : ","
    t = t.split(group).join("").replace(dec, ".")
  } else if (lastComma !== -1) {
    t = (t.match(/,/g)?.length ?? 0) > 1 ? t.split(",").join("") : t.replace(",", ".")
  } else if ((t.match(/\./g)?.length ?? 0) > 1) {
    t = t.split(".").join("")
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t)) return null
  return Number(t)
}

/**
 * Numeric input with a vertical ± stepper on the right. Controlled; empty = null.
 *
 * A text field with `role="spinbutton"`, so it accepts liberal input (see
 * `parseNumber`): a value the field can read is reported while typing, the
 * range is enforced on blur (typing "1" on the way to "15" with `min={10}`
 * is not snapped to 10 under your fingers). Arrow keys step, like a native
 * number input.
 */
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
      onBlur,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const l = { ...DEFAULT_LABELS, ...labels }
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    // What the person is typing; null when not editing (then the value is shown).
    const [draft, setDraft] = React.useState<string | null>(null)
    const bump = (delta: number) => {
      setDraft(null)
      onChange(clamp((value ?? min ?? 0) + delta, min, max))
    }
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
            type="text"
            role="spinbutton"
            inputMode="decimal"
            autoComplete="off"
            aria-valuenow={value ?? undefined}
            aria-valuemin={min}
            aria-valuemax={max}
            value={draft ?? (value === null ? "" : String(value))}
            disabled={disabled}
            onChange={(e) => {
              const raw = e.target.value
              setDraft(raw)
              if (raw.trim() === "") return onChange(null)
              const n = parseNumber(raw)
              if (n !== null) onChange(n)
            }}
            onBlur={(e) => {
              if (draft !== null) {
                const n = parseNumber(draft)
                onChange(n === null ? (draft.trim() === "" ? null : value) : clamp(n, min, max))
                setDraft(null)
              }
              onBlur?.(e)
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault()
                bump(e.key === "ArrowUp" ? step : -step)
              }
              onKeyDown?.(e)
            }}
            className={cn(
              "flex h-9 w-full rounded-md bg-field border-b border-field-edge px-3 py-1.5 pr-9 text-base text-foreground tabular-nums transition-colors duration-(--duration-fast) hover:bg-field-hover aria-[invalid=true]:bg-danger-subtle disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
