import * as React from "react"

import { cn } from "@/lib/utils"

export interface StaggerProps {
  children: React.ReactNode
  /** Delay between items, ms. Defaults to `--stagger-step` (40ms). */
  step?: number
  /**
   * Items after this index share the last delay, so a long list never takes
   * longer than `step × max` to settle (default 8 → 320ms).
   */
  max?: number
  /** Replay the entrance when this changes (e.g. a new page of results). */
  replayKey?: React.Key
}

/**
 * Staggered entrance: each direct child fades and rises a few pixels, one
 * after the other. It adds a class and a delay to each child, so the markup
 * stays yours (`<ul><Stagger>{items.map(li)}</Stagger></ul>`).
 *
 * Use it for content that arrives (results, cards on first load), never for
 * something the person is acting on: a stagger delays the thing they want.
 * Reduced motion turns it off through `stellify-base`.
 */
function Stagger({ children, step, max = 8, replayKey }: StaggerProps) {
  let i = 0
  const items = React.Children.map(children, (child) => {
    if (!React.isValidElement<{ className?: string; style?: React.CSSProperties }>(child)) return child
    const n = Math.min(i++, max)
    const delay = step === undefined ? `calc(var(--stagger-step) * ${n})` : `${step * n}ms`
    return React.cloneElement(child, {
      key: `${child.key ?? n}-${replayKey ?? ""}`,
      className: cn(
        "animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-(--duration-base) ease-(--ease-out)",
        child.props.className
      ),
      style: { ...child.props.style, animationDelay: delay },
    })
  })
  return <>{items}</>
}

export { Stagger }
