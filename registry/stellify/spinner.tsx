import { cn } from "@/lib/utils"

const SIZE = { sm: "size-4 border-2", md: "size-5 border-2", lg: "size-8 border-[3px]" } as const

export interface SpinnerProps {
  size?: keyof typeof SIZE
  /** Accessible name. Defaults to "Cargando". Ignored when `decorative`. */
  label?: string
  /** Hide it from assistive tech, e.g. inside a button that already says it is busy. */
  decorative?: boolean
  className?: string
  /**
   * Fade in only after a short wait: `true` uses `--delay-feedback` (150ms),
   * a number is milliseconds. A wait shorter than that shows nothing.
   */
  delay?: boolean | number
}

/**
 * The one spinner of the system: a ring in the current text color with a
 * quarter gap. Used by `button`, `loading-spinner` and `loading-state`.
 * Under reduced motion `stellify-base` stops the rotation and the ring reads
 * as a static loading mark.
 */
function Spinner({ size = "md", label = "Cargando", decorative = false, delay, className }: SpinnerProps) {
  return (
    <span
      data-slot="spinner"
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-current border-r-transparent [animation-duration:800ms]",
        SIZE[size],
        delay && "transition-opacity duration-(--duration-fast) starting:opacity-0",
        className
      )}
      style={delay ? { transitionDelay: delay === true ? "var(--delay-feedback)" : `${delay}ms` } : undefined}
    />
  )
}

export { Spinner }
