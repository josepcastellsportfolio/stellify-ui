"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface OtpInputLabels {
  /** Name of box `index` (1-based) of `length`, for every box but the first (the first takes the field label). */
  digit: (index: number, length: number) => string
}

const DEFAULT_LABELS: OtpInputLabels = {
  digit: (index, length) => `Carácter ${index} de ${length}`,
}

export interface OtpInputProps {
  /** Number of boxes. Default 6. */
  length?: number
  value: string
  onValueChange: (value: string) => void
  /** Called once all boxes are filled, with the full code. */
  onComplete?: (value: string) => void
  /** `numeric` (default) keeps digits and opens the number pad; `alphanumeric` keeps letters too (uppercased). */
  mode?: "numeric" | "alphanumeric"
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  labels?: Partial<OtpInputLabels>
  /** Id of the first box. `Field` sets it, so its label focuses the first box. */
  id?: string
  required?: boolean
  "aria-invalid"?: boolean | "true" | "false"
  "aria-describedby"?: string
  /** Name of the group, when there is no `Field` label. */
  "aria-label"?: string
}

/**
 * One-time code input: one box per character that moves on by itself
 * (Parkinson's law: make the task faster than people expect).
 *
 * - One tab stop. Typing a character jumps to the next box; Backspace on an empty box goes
 *   back and clears it; arrows, Home and End move.
 * - Pasting or SMS autofill (`autocomplete="one-time-code"`, which iOS drops
 *   whole into the first box) spreads the code across the boxes from there.
 * - Boxes are 44px tall, so they're touch-sized on every screen.
 *
 * Works as the control of `Field`.
 */
function OtpInput({
  length = 6,
  value,
  onValueChange,
  onComplete,
  mode = "numeric",
  disabled = false,
  autoFocus,
  className,
  labels,
  id,
  required,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
}: OtpInputProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const generatedId = React.useId()
  const firstId = id ?? `${generatedId}-0`
  const refs = React.useRef<(HTMLInputElement | null)[]>([])
  const isInvalid = ariaInvalid === true || ariaInvalid === "true"
  // Filled length, updated on commit before the parent re-renders, so focus moves land where the new value ends.
  const filled = React.useRef(value.length)
  React.useLayoutEffect(() => {
    filled.current = value.length
  }, [value])

  const clean = (text: string) =>
    (mode === "numeric" ? text.replace(/\D/g, "") : text.replace(/[^0-9a-z]/gi, "").toUpperCase())
  const chars = Array.from({ length }, (_, i) => value[i] ?? "")

  const focusBox = (i: number) => {
    const box = refs.current[Math.max(0, Math.min(length - 1, i))]
    box?.focus()
    box?.select()
  }

  const commit = (next: string[]) => {
    // Keep the value contiguous: a gap would shift characters on the next edit.
    const joined = next.join("").slice(0, length)
    filled.current = joined.length
    onValueChange(joined)
    if (joined.length === length && joined !== value) onComplete?.(joined)
  }

  /** Writes `text` starting at box `from`, then focuses the box after the last one written. */
  const fill = (from: number, text: string) => {
    const incoming = clean(text)
    if (!incoming) return
    // A whole code (SMS autofill, a paste) replaces the value, whichever box it landed in.
    const start = incoming.length >= length ? 0 : Math.min(from, value.length)
    // Overwrites from `start`: typing on a filled box replaces its character.
    const next = chars.slice(0, value.length)
    const written = Math.min(incoming.length, length - start)
    for (let k = 0; k < written; k++) next[start + k] = incoming[k]
    commit(next)
    focusBox(start + written)
  }

  const onChange = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // The box held one char; whatever else arrived is the new input (typed over, pasted or autofilled).
    const typed = raw.length > 1 && raw.startsWith(chars[i]) ? raw.slice(chars[i].length) : raw
    if (raw === "") {
      // Emptied without a Backspace keydown (cut, select + delete, some mobile keyboards).
      commit(chars.filter((_, j) => j !== i))
      return
    }
    if (!clean(typed)) return
    fill(i, typed)
  }

  const onKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Backspace": {
        e.preventDefault()
        if (chars[i]) {
          commit(chars.filter((_, j) => j !== i))
          focusBox(Math.min(i, value.length - 1))
        } else if (i > 0) {
          commit(chars.filter((_, j) => j !== i - 1))
          focusBox(i - 1)
        }
        return
      }
      case "Delete":
        e.preventDefault()
        commit(chars.filter((_, j) => j !== i))
        return
      case "ArrowLeft":
        e.preventDefault()
        focusBox(i - 1)
        return
      case "ArrowRight":
        e.preventDefault()
        focusBox(Math.min(i + 1, filled.current))
        return
      case "Home":
        e.preventDefault()
        focusBox(0)
        return
      case "End":
        e.preventDefault()
        focusBox(Math.min(filled.current, length - 1))
        return
    }
  }

  const onPaste = (i: number) => (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    fill(i, e.clipboardData.getData("text"))
  }

  return (
    <div
      data-slot="otp-input"
      role="group"
      aria-label={ariaLabel}
      className={cn("flex items-center gap-2", className)}
    >
      {chars.map((char, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          id={i === 0 ? firstId : `${generatedId}-${i}`}
          data-slot="otp-input-box"
          // One tab stop: the first empty box (the last when full). Arrows move between boxes.
          tabIndex={i === Math.min(value.length, length - 1) ? 0 : -1}
          type="text"
          inputMode={mode === "numeric" ? "numeric" : "text"}
          pattern={mode === "numeric" ? "[0-9]*" : undefined}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoCapitalize={mode === "alphanumeric" ? "characters" : undefined}
          autoCorrect="off"
          spellCheck={false}
          // No maxLength: autofill and paste deliver the whole code to one box.
          value={char}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          required={required && i === 0}
          aria-required={required || undefined}
          aria-invalid={isInvalid || undefined}
          aria-describedby={ariaDescribedBy}
          aria-label={i === 0 ? (ariaLabel ? `${ariaLabel}, ${l.digit(1, length)}` : undefined) : l.digit(i + 1, length)}
          onChange={onChange(i)}
          onKeyDown={onKeyDown(i)}
          onPaste={onPaste(i)}
          onFocus={(e) => {
            // Never let a box ahead of the first empty one be filled: jump back to it.
            if (i > filled.current) focusBox(filled.current)
            else e.target.select()
          }}
          className={cn(
            "h-11 w-10 rounded-md border-b border-field-edge bg-field text-center font-mono text-lg tabular-nums text-foreground caret-primary transition-colors duration-(--duration-fast) hover:bg-field-hover",
            "disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:bg-danger-subtle"
          )}
        />
      ))}
    </div>
  )
}

export { OtpInput }
