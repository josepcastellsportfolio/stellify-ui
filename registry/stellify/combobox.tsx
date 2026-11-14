"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Check, ChevronDown, Plus, X } from "lucide-react"

import { Chip } from "@/components/ui/chip"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface ComboboxOption {
  value: string
  /** Text shown, filtered and highlighted. */
  label: string
  /** Second line, muted. Not filtered. */
  description?: string
  disabled?: boolean
  /** Options sharing a group are listed together under a small heading, in order of first appearance. */
  group?: string
}

export interface ComboboxLabels {
  /** Shown when nothing matches. */
  empty: string
  /** The row that creates a new option from the query. */
  create: (query: string) => string
  /** Name of the clear button (single mode). */
  clear: string
  /** Prefixes the name of a chip's remove button (multiple mode): "Quitar Lleida". */
  remove: string
  /** Name of the chevron button that opens and closes the list. */
  toggle: string
}

const DEFAULT_LABELS: ComboboxLabels = {
  empty: "Sin resultados",
  create: (query) => `Crear «${query}»`,
  clear: "Borrar selección",
  remove: "Quitar",
  toggle: "Mostrar opciones",
}

interface ComboboxBaseProps {
  options: readonly ComboboxOption[]
  /** Return true to keep an option for `query` (already trimmed, never empty). Default: accent- and case-insensitive substring of the label. */
  filter?: (option: ComboboxOption, query: string) => boolean
  /** Offers a "Crear «query»" row when the query matches no label exactly. Receives the trimmed query. */
  onCreate?: (query: string) => void
  placeholder?: string
  disabled?: boolean
  /** Class for the field box. */
  className?: string
  /** Copy. Spanish defaults. */
  labels?: Partial<ComboboxLabels>
  /** Input id. `Field` sets it. */
  id?: string
  /** Marks the input `aria-required` (`Field` sets it). */
  required?: boolean
  "aria-invalid"?: boolean | "true" | "false"
  "aria-describedby"?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false
  value: string | null
  onValueChange: (value: string | null) => void
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true
  values: readonly string[]
  onValuesChange: (values: string[]) => void
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

const CREATE_KEY = "\u0000create"
/** Sentinel for "the first enabled row", resolved against the rows of the current render. */
const FIRST_KEY = "\u0000first"

type Row =
  | { kind: "option"; key: string; option: ComboboxOption }
  | { kind: "create"; key: typeof CREATE_KEY; query: string }

const DIACRITICS = /\p{Diacritic}/gu

/** Folds case and accents ("Camión" -> "camion") and keeps, per folded char, the index of its source char. */
function fold(text: string): { folded: string; source: number[] } {
  let folded = ""
  const source: number[] = []
  for (let i = 0; i < text.length; i++) {
    const f = text[i].normalize("NFD").replace(DIACRITICS, "").toLowerCase()
    for (let j = 0; j < f.length; j++) source.push(i)
    folded += f
  }
  return { folded, source }
}

const foldText = (text: string) => fold(text).folded

/** Postel: tolerant of case, accents and stray whitespace. */
export function defaultComboboxFilter(option: ComboboxOption, query: string): boolean {
  return foldText(option.label).includes(foldText(query.trim()))
}

/** Splits `label` around the first accent-insensitive match of `query`. */
function highlight(label: string, query: string): React.ReactNode {
  const q = foldText(query.trim())
  if (!q) return label
  const { folded, source } = fold(label)
  const at = folded.indexOf(q)
  if (at < 0) return label
  const start = source[at]
  const end = source[at + q.length - 1] + 1
  return (
    <>
      {label.slice(0, start)}
      <span data-slot="combobox-match" className="font-semibold text-foreground">
        {label.slice(start, end)}
      </span>
      {label.slice(end)}
    </>
  )
}

/**
 * A text input that filters a list of options: search a long list, pick one
 * or several, or create a missing one. WAI-ARIA combobox with a listbox popup;
 * focus never leaves the input, the active option is `aria-activedescendant`.
 *
 * Keyboard: typing filters and opens. ArrowDown/ArrowUp move (wrapping,
 * skipping disabled) and open the list; Home/End jump to the ends; Enter
 * selects; Tab closes without selecting. Escape closes; a second Escape clears
 * the text (and, in single mode, the selection). In multiple mode Backspace on
 * an empty input removes the last chip.
 *
 * Works as the control of `Field`, which hands it `id`, `aria-invalid` and
 * `aria-describedby`.
 *
 * ```tsx
 * <Field label="Provincia">
 *   <Combobox options={provincias} value={v} onValueChange={setV} />
 * </Field>
 * ```
 */
function Combobox(props: ComboboxProps) {
  const {
    options,
    filter = defaultComboboxFilter,
    onCreate,
    placeholder,
    disabled = false,
    className,
    labels,
    id: idProp,
    required,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
  } = props
  const l = { ...DEFAULT_LABELS, ...labels }

  const generatedId = React.useId()
  const inputId = idProp ?? `${generatedId}-input`
  const listboxId = `${generatedId}-listbox`
  const optionId = (index: number) => `${generatedId}-option-${index}`

  const fieldRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listboxRef = React.useRef<HTMLDivElement>(null)

  const [open, setOpen] = React.useState(false)
  // In single mode the input shows the selected label until the user types.
  const [dirty, setDirty] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeKey, setActiveKey] = React.useState<string | null>(null)

  const selected: readonly string[] = props.multiple ? props.values : props.value == null ? [] : [props.value]
  const selectedSet = new Set(selected)
  const singleLabel = props.multiple ? "" : (options.find((o) => o.value === props.value)?.label ?? "")
  const inputValue = props.multiple || dirty ? query : singleLabel
  const trimmed = dirty || props.multiple ? query.trim() : ""
  const isInvalid = ariaInvalid === true || ariaInvalid === "true"

  // Rows in display order: grouped options keep their group together.
  const rows = React.useMemo<Row[]>(() => {
    const kept = trimmed ? options.filter((o) => filter(o, trimmed)) : options.slice()
    const order: string[] = []
    const byGroup = new Map<string, ComboboxOption[]>()
    for (const o of kept) {
      const g = o.group ?? ""
      if (!byGroup.has(g)) {
        byGroup.set(g, [])
        order.push(g)
      }
      byGroup.get(g)!.push(o)
    }
    const out: Row[] = order.flatMap((g) => byGroup.get(g)!.map((option) => ({ kind: "option" as const, key: option.value, option })))
    if (onCreate && trimmed) {
      const q = foldText(trimmed)
      if (!options.some((o) => foldText(o.label.trim()) === q)) out.push({ kind: "create", key: CREATE_KEY, query: trimmed })
    }
    return out
  }, [options, filter, trimmed, onCreate])

  const enabledKeys = React.useMemo(
    () => rows.filter((r) => r.kind === "create" || !r.option.disabled).map((r) => r.key),
    [rows]
  )
  const active =
    activeKey === FIRST_KEY
      ? (enabledKeys[0] ?? null)
      : activeKey !== null && enabledKeys.includes(activeKey)
        ? activeKey
        : null
  const activeIndex = active === null ? -1 : rows.findIndex((r) => r.key === active)
  const isOpen = open && !disabled

  React.useEffect(() => {
    if (!isOpen || activeIndex < 0) return
    listboxRef.current
      ?.querySelector<HTMLElement>(`[id="${optionId(activeIndex)}"]`)
      ?.scrollIntoView({ block: "nearest" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeIndex])

  const openList = (to: "selected" | "first" | "last" = "selected") => {
    setOpen(true)
    if (!enabledKeys.length) return setActiveKey(null)
    const firstSelected = enabledKeys.find((k) => selectedSet.has(k))
    setActiveKey(
      to === "last"
        ? enabledKeys[enabledKeys.length - 1]
        : to === "selected" && firstSelected !== undefined
          ? firstSelected
          : enabledKeys[0]
    )
  }

  const close = () => {
    setOpen(false)
    setActiveKey(null)
  }

  const move = (step: 1 | -1 | "first" | "last") => {
    if (!enabledKeys.length) return
    const i = active === null ? -1 : enabledKeys.indexOf(active)
    const n = enabledKeys.length
    const next =
      step === "first"
        ? 0
        : step === "last"
          ? n - 1
          : i < 0
            ? step === 1
              ? 0
              : n - 1
            : (i + step + n) % n
    setActiveKey(enabledKeys[next])
  }

  const commit = (row: Row) => {
    if (row.kind === "create") {
      onCreate?.(row.query)
      setQuery("")
      setDirty(false)
      if (!props.multiple) close()
      return
    }
    if (row.option.disabled) return
    const v = row.option.value
    if (props.multiple) {
      props.onValuesChange(selectedSet.has(v) ? props.values.filter((x) => x !== v) : [...props.values, v])
      setQuery("")
      setActiveKey(v)
    } else {
      props.onValueChange(v)
      setDirty(false)
      setQuery("")
      close()
    }
  }

  const clearSelection = () => {
    if (props.multiple) props.onValuesChange([])
    else props.onValueChange(null)
    setQuery("")
    setDirty(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault()
        const down = e.key === "ArrowDown"
        if (!isOpen) openList(e.altKey || down ? "selected" : "last")
        else move(down ? 1 : -1)
        return
      }
      case "Home":
      case "End":
        if (!isOpen) return // let the caret move in the text
        e.preventDefault()
        move(e.key === "Home" ? "first" : "last")
        return
      case "Enter":
        if (!isOpen || activeIndex < 0) return
        e.preventDefault()
        commit(rows[activeIndex])
        return
      case "Escape":
        if (isOpen) {
          e.preventDefault()
          close()
        } else if (inputValue !== "") {
          e.preventDefault()
          setQuery("")
          if (props.multiple) return
          // Typed text is cleared; the selected label showing is the selection, so it goes too.
          if (!dirty && props.value != null) props.onValueChange(null)
          setDirty(true)
        }
        return
      case "Tab":
        close()
        return
      case "Backspace":
        if (props.multiple && query === "" && props.values.length) {
          e.preventDefault()
          props.onValuesChange(props.values.slice(0, -1))
        }
        return
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setQuery(next)
    setDirty(true)
    setOpen(true)
    // Point at the first enabled match of the new text.
    setActiveKey(FIRST_KEY)
  }

  const onBlur = () => {
    close()
    // Single mode falls back to the selected label; multiple keeps what was typed.
    if (!props.multiple) {
      setDirty(false)
      setQuery("")
    }
  }

  // Clicks on the box (padding, between chips) focus the input instead of stealing focus.
  const onFieldMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || e.target === inputRef.current) return
    if ((e.target as HTMLElement).closest("button")) return
    e.preventDefault()
    inputRef.current?.focus()
  }

  // Keep the order stable: groups appear once, in the order of their first option.
  let lastGroup: string | undefined
  const groupHeadingId = (g: string) => `${generatedId}-group-${encodeURIComponent(g)}`
  const groups: { name: string; rows: { row: Row; index: number }[] }[] = []
  rows.forEach((row, index) => {
    const g = row.kind === "option" ? (row.option.group ?? "") : ""
    if (row.kind === "create" || groups.length === 0 || g !== lastGroup) {
      groups.push({ name: row.kind === "create" ? "" : g, rows: [] })
      lastGroup = g
    }
    groups[groups.length - 1].rows.push({ row, index })
  })

  const hasValue = selected.length > 0

  return (
    <Popover open={isOpen} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <PopoverPrimitive.Anchor asChild>
        <div
          ref={fieldRef}
          data-slot="combobox"
          data-disabled={disabled ? "" : undefined}
          onMouseDown={onFieldMouseDown}
          className={cn(
            "relative flex w-full cursor-text items-center gap-1 rounded-md bg-field pr-1 text-sm text-foreground transition-colors duration-(--duration-fast) hover:bg-field-hover",
            // The global outline belongs on the box, not on the bare input inside it.
            "has-[input:focus-visible]:[outline:var(--focus-width)_solid_var(--focus)] has-[input:focus-visible]:[outline-offset:var(--focus-offset)]",
            props.multiple ? "min-h-9 flex-wrap py-1 pl-1" : "h-9",
            isInvalid && "bg-danger-subtle hover:bg-danger-subtle",
            disabled && "cursor-not-allowed opacity-50 hover:bg-field",
            className
          )}
        >
          {props.multiple &&
            props.values.map((v) => {
              const label = options.find((o) => o.value === v)?.label ?? v
              return (
                <Chip
                  key={v}
                  className="bg-surface-3"
                  labels={{ remove: l.remove }}
                  onRemove={disabled ? undefined : () => props.onValuesChange(props.values.filter((x) => x !== v))}
                >
                  {label}
                </Chip>
              )
            })}
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
            aria-required={required || undefined}
            aria-invalid={isInvalid || undefined}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            disabled={disabled}
            placeholder={props.multiple && hasValue ? undefined : placeholder}
            value={inputValue}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            onClick={() => !isOpen && openList()}
            className={cn(
              "h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
              props.multiple ? "h-7 min-w-24 px-2" : "truncate pl-3"
            )}
          />
          {!props.multiple && hasValue && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={l.clear}
              onClick={() => {
                clearSelection()
                inputRef.current?.focus()
              }}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-surface-3 hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label={l.toggle}
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            onClick={() => {
              if (isOpen) close()
              else openList()
              inputRef.current?.focus()
            }}
            className={cn(
              "inline-flex size-7 shrink-0 items-center justify-center self-center rounded-sm text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground disabled:pointer-events-none",
              props.multiple && "ml-auto"
            )}
          >
            <ChevronDown
              className={cn(
                "size-4 opacity-50 transition-transform duration-(--duration-fast) ease-(--ease-out)",
                isOpen && "rotate-180"
              )}
              aria-hidden
            />
          </button>
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverContent
        role="presentation"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        // Escape is the input's: first closes, second clears.
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (fieldRef.current?.contains(e.target as Node)) e.preventDefault()
        }}
        // Keep focus (and the caret) in the input while clicking options.
        onMouseDown={(e) => e.preventDefault()}
        className="w-(--radix-popover-trigger-width) min-w-48 p-1"
      >
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? undefined : (ariaLabelledBy ?? undefined)}
          aria-multiselectable={props.multiple || undefined}
          className="max-h-[min(18rem,calc(var(--radix-popover-content-available-height)-0.5rem))] overflow-y-auto overscroll-contain"
        >
          {groups.map((group, gi) => {
            const items = group.rows.map(({ row, index }) => {
              const isActive = index === activeIndex
              if (row.kind === "create") {
                return (
                  <div
                    key={row.key}
                    id={optionId(index)}
                    role="option"
                    aria-selected={false}
                    data-active={isActive || undefined}
                    data-slot="combobox-create"
                    onMouseMove={() => active !== row.key && setActiveKey(row.key)}
                    onClick={() => commit(row)}
                    className={cn(ROW, "text-foreground")}
                  >
                    <Plus className="absolute left-2 size-4 text-muted-foreground" aria-hidden />
                    <span className="truncate">{l.create(row.query)}</span>
                  </div>
                )
              }
              const o = row.option
              const isSelected = selectedSet.has(o.value)
              return (
                <div
                  key={row.key}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={o.disabled || undefined}
                  data-active={isActive || undefined}
                  data-slot="combobox-option"
                  onMouseMove={() => !o.disabled && active !== row.key && setActiveKey(row.key)}
                  onClick={() => commit(row)}
                  className={ROW}
                >
                  {isSelected && <Check className="absolute left-2 top-1/2 size-4 -translate-y-1/2" aria-hidden />}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{highlight(o.label, trimmed)}</span>
                    {o.description && (
                      <span className="truncate text-xs text-muted-foreground">{o.description}</span>
                    )}
                  </span>
                </div>
              )
            })
            if (!group.name) return <React.Fragment key={`g${gi}`}>{items}</React.Fragment>
            const headingId = groupHeadingId(group.name)
            return (
              <div key={`g${gi}`} role="group" aria-labelledby={headingId}>
                <div
                  id={headingId}
                  role="presentation"
                  className="px-2 pb-1 pt-2 font-mono text-[11px] uppercase tracking-(--tracking-mono-caps) text-muted-foreground"
                >
                  {group.name}
                </div>
                {items}
              </div>
            )
          })}
        </div>
        {rows.length === 0 && (
          <p role="status" className="px-2 py-6 text-center text-sm text-muted-foreground">
            {l.empty}
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}

const ROW =
  "relative flex min-h-8 cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none pointer-coarse:min-h-11 data-[active]:bg-accent data-[active]:text-accent-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"

export { Combobox }
