import * as React from "react"

import { cn } from "@/lib/utils"

export interface OverflowMarqueeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** The (potentially long) text to display. */
  text: string
  /**
   * Pixels-per-second of the reveal slide. Higher = faster. The duration is
   * derived from the actual overflow distance so short and long texts feel
   * consistent. Defaults to 40.
   */
  speed?: number
  /**
   * Extra pixels revealed past the end, so the last glyph isn't flush against
   * the edge while hovering. Defaults to 8.
   */
  tailGap?: number
}

/**
 * OverflowMarquee — truncates with an ellipsis at rest and, only when the text
 * actually overflows its container, slides horizontally on hover/focus to
 * reveal the full string, then eases back when the pointer leaves.
 *
 * Presentational and self-contained: it measures its own overflow with a
 * ResizeObserver and animates with a pure CSS transform transition (no
 * @keyframes, so consumers need no Tailwind config changes). When the text
 * fits, it behaves exactly like `truncate`. Honors `prefers-reduced-motion`
 * (no slide; the native `title` still surfaces the full text on hover).
 *
 * Drop it in place of a truncated element — e.g. inside a task-title button:
 *   <OverflowMarquee text={todo.title} className="flex-1 text-left text-sm" />
 */
const OverflowMarquee = React.forwardRef<HTMLSpanElement, OverflowMarqueeProps>(
  ({ text, speed = 40, tailGap = 8, className, style, ...props }, ref) => {
    const viewportRef = React.useRef<HTMLSpanElement>(null)
    const contentRef = React.useRef<HTMLSpanElement>(null)
    const [shift, setShift] = React.useState(0)

    // Merge the forwarded ref with our internal viewport ref.
    React.useImperativeHandle(ref, () => viewportRef.current as HTMLSpanElement)

    const measure = React.useCallback(() => {
      const vp = viewportRef.current
      const content = contentRef.current
      if (!vp || !content) return
      const overflow = content.scrollWidth - vp.clientWidth
      setShift(overflow > 1 ? overflow + tailGap : 0)
    }, [tailGap])

    React.useEffect(() => {
      measure()
      const vp = viewportRef.current
      const content = contentRef.current
      if (!vp || !content || typeof ResizeObserver === "undefined") return
      const ro = new ResizeObserver(measure)
      ro.observe(vp)
      ro.observe(content)
      return () => ro.disconnect()
    }, [measure, text])

    // Duration scales with the distance so the reveal reads at a steady pace.
    const durationMs = shift > 0 ? Math.round((shift / speed) * 1000) : 0

    return (
      <span
        ref={viewportRef}
        title={text}
        data-slot="overflow-marquee"
        data-overflowing={shift > 0 ? "true" : undefined}
        className={cn(
          "group/marquee relative block overflow-hidden whitespace-nowrap",
          className
        )}
        style={style}
        {...props}
      >
        <span
          ref={contentRef}
          className={cn(
            "inline-block will-change-transform",
            // Slide on hover/focus of the viewport; ease back on leave.
            "translate-x-0 transition-transform ease-in-out",
            "group-hover/marquee:[transform:translateX(calc(var(--marquee-shift)*-1))]",
            "group-focus-visible/marquee:[transform:translateX(calc(var(--marquee-shift)*-1))]",
            "motion-reduce:!transform-none motion-reduce:transition-none"
          )}
          style={
            {
              "--marquee-shift": `${shift}px`,
              transitionDuration: `${durationMs}ms`,
            } as React.CSSProperties
          }
        >
          {text}
        </span>
      </span>
    )
  }
)

OverflowMarquee.displayName = "OverflowMarquee"

export default OverflowMarquee
export { OverflowMarquee }
