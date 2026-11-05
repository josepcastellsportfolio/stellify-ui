import { useEffect, useRef, type FC, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface MarqueeProps {
  /** Lead-in read before the list by screen readers, e.g. "Tecnologías". */
  label: string
  /** The entries. Screen readers get them once, as a sentence. */
  items: string[]
  /** Custom rendering of one entry in the moving track (visual only). */
  renderItem?: (item: string, index: number) => ReactNode
  /** Between entries. Defaults to a small `bg-primary` dot; `null` for none. */
  separator?: ReactNode
  /** Seconds for one full loop. Defaults to 38. */
  duration?: number
  /** Defaults to `"left"`. */
  direction?: "left" | "right"
  /** Pause while the pointer is over it. Defaults to true. */
  pauseOnHover?: boolean
  /** Fade the left and right edges. Defaults to true. */
  fadeEdges?: boolean
  className?: string
  /** Classes of each entry (gap, type). */
  itemClassName?: string
}

const DOT = <span className="size-1.5 shrink-0 rounded-full bg-primary" />

/**
 * Infinite horizontal marquee of short entries (logos, technologies, clients).
 *
 * The list is rendered twice so a -50% shift loops seamlessly; the moving
 * copy is `aria-hidden` and assistive tech reads the list once instead. The
 * loop runs on the Web Animations API (no CSS keyframes or Tailwind config to
 * install), pauses on hover and does not run under reduced motion.
 *
 * Not the same as `overflow-marquee`, which reveals one truncated string on
 * hover.
 */
export const Marquee: FC<MarqueeProps> = ({
  label,
  items,
  renderItem,
  separator = DOT,
  duration = 38,
  direction = "left",
  pauseOnHover = true,
  fadeEdges = true,
  className,
  itemClassName,
}) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const animation = useRef<Animation | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const track = trackRef.current
    if (!track || reducedMotion || typeof track.animate !== "function") return
    const frames =
      direction === "left"
        ? [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }]
        : [{ transform: "translateX(-50%)" }, { transform: "translateX(0)" }]
    const anim = track.animate(frames, { duration: duration * 1000, iterations: Infinity, easing: "linear" })
    animation.current = anim
    return () => {
      anim.cancel()
      animation.current = null
    }
  }, [direction, duration, reducedMotion, items.length])

  return (
    <div
      data-slot="marquee"
      className={cn(
        "overflow-hidden",
        fadeEdges && "[mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
      onMouseEnter={pauseOnHover ? () => animation.current?.pause() : undefined}
      onMouseLeave={pauseOnHover ? () => animation.current?.play() : undefined}
    >
      <p className="sr-only">
        {label}: {items.join(", ")}
      </p>
      <div ref={trackRef} data-slot="marquee-track" className="flex w-max gap-10 will-change-transform" aria-hidden="true">
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className={cn(
              "inline-flex items-center gap-10 whitespace-nowrap text-lg tracking-display text-muted-foreground",
              itemClassName,
            )}
          >
            {renderItem ? renderItem(item, index % items.length) : item}
            {separator}
          </span>
        ))}
      </div>
    </div>
  )
}
