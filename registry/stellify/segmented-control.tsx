import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Measures the active item inside `container` and returns the style for a
 * sliding indicator. Movement is a CSS transition on `transform` and `width`,
 * so it is interruptible by construction: when the target changes mid-flight
 * the browser retargets from wherever the indicator is, it never finishes the
 * old move first. Shared by `segmented-control` and the default `tabs`.
 *
 * `activeSelector` finds the active item; the hook re-measures when `deps`
 * change, when the active item's `data-state`/`aria-checked` flips, and when
 * the container resizes.
 */
export function useSlidingIndicator(
  container: React.RefObject<HTMLElement | null>,
  activeSelector: string,
  deps: React.DependencyList
): React.CSSProperties {
  const [box, setBox] = React.useState<{ x: number; w: number } | null>(null)

  React.useLayoutEffect(() => {
    const el = container.current
    if (!el) return
    const measure = () => {
      const active = el.querySelector<HTMLElement>(activeSelector)
      setBox(active ? { x: active.offsetLeft, w: active.offsetWidth } : null)
    }
    measure()
    // Re-measure when the active item changes without a re-render here
    // (uncontrolled Radix tabs) and when the container resizes.
    const mo = new MutationObserver(measure)
    mo.observe(el, { subtree: true, attributes: true, attributeFilter: ["data-state", "aria-checked"] })
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure)
    ro?.observe(el)
    return () => {
      mo.disconnect()
      ro?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  if (!box) return { opacity: 0 }
  return { width: box.w, transform: `translateX(${box.x}px)` }
}

export interface SegmentedOption<T extends string> {
  value: T
  label: React.ReactNode
  disabled?: boolean
}

export interface SegmentedControlProps<T extends string> {
  /** 2 to 5 options. More than that wants a select. */
  options: readonly SegmentedOption<T>[]
  value: T
  onValueChange: (value: T) => void
  /** Accessible name of the group (required: the options alone don't say what they choose). */
  "aria-label": string
  size?: "sm" | "md"
  /** Stretch to the container width, options sharing it equally. */
  fullWidth?: boolean
  disabled?: boolean
  className?: string
}

const SIZE = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-8 px-3.5 text-sm",
} as const

/**
 * Pick one of a few options, with an ink indicator that slides to the choice.
 * Click a new option while the indicator is still moving and it changes
 * course from where it is: the animation is never queued.
 *
 * Keyboard: it is a `radiogroup`. Tab enters on the selected option; arrows
 * move and select (wrapping), Home/End jump to the ends.
 */
function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  size = "md",
  fullWidth = false,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const ref = React.useRef<HTMLDivElement>(null)
  if (process.env.NODE_ENV !== "production" && options.length > 5) {
    // Hick's law: past five options the choice slows down; a select reads better.
    console.warn(`SegmentedControl "${ariaLabel}": ${options.length} options; use a select above 5.`)
  }
  const indicator = useSlidingIndicator(ref, '[aria-checked="true"]', [value, options.length, size])

  const enabled = options.filter((o) => !o.disabled && !disabled)
  // Roving tabindex: the selected option, or the first enabled one if none is.
  const tabStop = options.some((o) => o.value === value) ? value : enabled[0]?.value

  const move = (from: T, step: number | "first" | "last") => {
    if (!enabled.length) return
    const i = enabled.findIndex((o) => o.value === from)
    const next =
      step === "first"
        ? enabled[0]
        : step === "last"
          ? enabled[enabled.length - 1]
          : enabled[(i + step + enabled.length) % enabled.length]
    onValueChange(next.value)
    const radios = ref.current?.querySelectorAll<HTMLElement>('[role="radio"]') ?? []
    Array.from(radios).find((r) => r.dataset.value === next.value)?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent, current: T) => {
    const keys: Record<string, number | "first" | "last"> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
      Home: "first",
      End: "last",
    }
    const step = keys[e.key]
    if (step === undefined) return
    e.preventDefault()
    move(current, step)
  }

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-slot="segmented-control"
      className={cn(
        "relative isolate rounded-full bg-surface-2 p-[3px]",
        fullWidth ? "grid auto-cols-fr grid-flow-col" : "inline-flex",
        disabled && "opacity-50",
        className
      )}
    >
      <span
        aria-hidden
        data-slot="segmented-control-indicator"
        className="absolute inset-y-[3px] left-0 -z-10 rounded-full bg-foreground transition-[transform,width,opacity] duration-(--duration-base) [transition-timing-function:var(--ease-spring),var(--ease-out),var(--ease-out)]"
        style={indicator}
      />
      {options.map((o) => {
        const checked = o.value === value
        const off = disabled || o.disabled
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={checked}
            data-value={o.value}
            disabled={off}
            tabIndex={o.value === tabStop ? 0 : -1}
            onClick={() => onValueChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, o.value)}
            className={cn(
              "relative inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:inset-y-[min(0px,calc((100%-var(--touch-target))/2))] transition-colors duration-(--duration-base) disabled:pointer-events-none disabled:opacity-50",
              SIZE[size],
              checked ? "text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export { SegmentedControl }
