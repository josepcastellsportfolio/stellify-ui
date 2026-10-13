"use client"

import * as React from "react"

import { TextField, type TextFieldProps } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

/** Internal sentinel for "no filter"; Radix Select cannot use "" as a value. */
const ALL = "__all__"

export interface FilterBarProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /** Accessible name of the filter form (e.g. "Filtros"). */
  label: string
  /** Clears every filter. The button is hidden when omitted. */
  onClear?: () => void
  /** Text of the clear button (e.g. "Limpiar"). */
  clearLabel?: string
  /** Disable the clear button, typically when no filter is active. */
  clearDisabled?: boolean
  /** Filter fields: `FilterSelect`, `FilterText` or any other control. */
  children: React.ReactNode
}

/**
 * Sticky filter form: one column per field on wide screens plus a trailing
 * clear button. Submitting does nothing (filters apply as they change), so
 * pressing Enter in the text field never reloads the page. All copy comes in
 * via props.
 */
function FilterBar({
  label,
  onClear,
  clearLabel,
  clearDisabled = false,
  className,
  style,
  children,
  ...props
}: FilterBarProps) {
  const fields = React.Children.toArray(children).length
  return (
    <form
      data-slot="filter-bar"
      aria-label={label}
      onSubmit={(e) => e.preventDefault()}
      style={{ "--filter-bar-fields": fields, ...style } as React.CSSProperties}
      className={cn(
        "z-20 grid gap-4 rounded-lg border bg-background p-4 shadow-xs sm:grid-cols-2 md:sticky md:top-0 lg:grid-cols-[repeat(var(--filter-bar-fields),minmax(0,1fr))_auto] lg:items-end",
        className
      )}
      {...props}
    >
      {children}
      {onClear && (
        <Button
          type="button"
          variant="base"
          data-slot="filter-bar-clear"
          disabled={clearDisabled}
          onClick={onClear}
        >
          {clearLabel}
        </Button>
      )}
    </form>
  )
}

export interface FilterOption {
  value: string
  label: string
}

export interface FilterSelectProps {
  /** Visible label, also the trigger's accessible name. */
  label: string
  /** Current value; `""` means "all" (no filter). */
  value: string
  options: FilterOption[]
  /** Called with the picked value, or `""` when the "all" option is picked. */
  onValueChange: (value: string) => void
  /** Text of the leading "no filter" option (e.g. "Todos"). */
  allLabel: string
  /** Override the generated id. */
  id?: string
  className?: string
}

/** Labelled select whose first option clears the filter. */
function FilterSelect({
  label,
  value,
  options,
  onValueChange,
  allLabel,
  id,
  className,
}: FilterSelectProps) {
  const generatedId = React.useId()
  const selectId = id ?? generatedId
  return (
    <div data-slot="filter-select" className={cn("space-y-1.5", className)}>
      <Label htmlFor={selectId}>{label}</Label>
      <Select
        value={value || ALL}
        onValueChange={(v) => onValueChange(v === ALL ? "" : v)}
      >
        <SelectTrigger id={selectId} aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export interface FilterTextProps
  extends Omit<TextFieldProps, "value" | "defaultValue" | "onChange"> {
  /** Committed value (e.g. the one in the URL). */
  value: string
  /** Called with the typed text once typing pauses for `debounceMs`. */
  onValueChange: (value: string) => void
  /** Pause before committing, in ms. Defaults to 0 (commit on every key). */
  debounceMs?: number
}

/**
 * Search box for a filter bar. Keeps its own text while typing and commits it
 * after `debounceMs`; an external change of `value` (e.g. "clear") resets it.
 */
function FilterText({
  value,
  onValueChange,
  debounceMs = 0,
  type = "search",
  ...props
}: FilterTextProps) {
  const [text, setText] = React.useState(value)
  const onValueChangeRef = React.useRef(onValueChange)
  // Last value this field committed: echoes of it must not reset the text
  // typed meanwhile; any other change of `value` (e.g. "clear") must.
  const committed = React.useRef(value)

  React.useEffect(() => {
    onValueChangeRef.current = onValueChange
  })

  const commit = React.useCallback((next: string) => {
    committed.current = next
    onValueChangeRef.current(next)
  }, [])

  React.useEffect(() => {
    if (value === committed.current) return
    committed.current = value
    setText(value)
  }, [value])

  React.useEffect(() => {
    if (debounceMs <= 0 || text === committed.current) return
    const timer = setTimeout(() => commit(text), debounceMs)
    return () => clearTimeout(timer)
  }, [text, debounceMs, commit])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    if (debounceMs <= 0) commit(e.target.value)
  }

  return (
    <TextField
      data-slot="filter-text"
      type={type}
      value={text}
      onChange={onChange}
      {...props}
    />
  )
}

export default FilterBar
export { FilterBar, FilterSelect, FilterText }
