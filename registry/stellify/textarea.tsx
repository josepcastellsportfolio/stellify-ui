"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  /** Grow with the content instead of scrolling (and shrink back when it is cleared). */
  autoResize?: boolean
  /** With `autoResize`: the tallest it grows, in px, before it scrolls. */
  maxHeight?: number
}

/**
 * StellifyIT textarea: a filled field with a 3:1 underline (`field-edge`).
 * `aria-invalid` turns the fill `danger-subtle`; focus is the global outline.
 *
 * `autoResize` measures on every value change, typed or programmatic, so a
 * box cleared after sending shrinks back; past `maxHeight` it scrolls.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, maxHeight, onInput, value, style, ...props }, ref) => {
    const inner = React.useRef<HTMLTextAreaElement | null>(null)
    React.useImperativeHandle(ref, () => inner.current as HTMLTextAreaElement, [])

    const fit = React.useCallback(() => {
      const box = inner.current
      if (!box || !autoResize) return
      box.style.height = "auto"
      const full = box.scrollHeight
      const capped = maxHeight ? Math.min(full, maxHeight) : full
      box.style.height = `${capped}px`
      box.style.overflowY = maxHeight && full > maxHeight ? "auto" : "hidden"
    }, [autoResize, maxHeight])

    // Controlled values change without an input event (cleared after send).
    React.useLayoutEffect(fit, [fit, value])

    return (
      <textarea
        data-slot="textarea"
        className={cn(
          "flex min-h-[80px] w-full rounded-md bg-field border-b border-field-edge px-3 py-2 text-base text-foreground transition-colors duration-(--duration-fast) hover:bg-field-hover placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:bg-danger-subtle md:text-sm",
          autoResize && "resize-none overflow-hidden",
          className
        )}
        ref={inner}
        value={value}
        style={style}
        onInput={(event) => {
          fit()
          onInput?.(event)
        }}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
