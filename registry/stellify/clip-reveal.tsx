import { useRef, type FC, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export interface ClipRevealProps {
  children: ReactNode
  /** Classes for the clipped panel (its surface, e.g. a dark background). */
  className?: string
  /** Classes for the outer `<section>` (spacing around the panel). */
  rootClassName?: string
  id?: string
  /** `clip-path` the panel starts from. Defaults to `inset(6% 8% round 48px)`. */
  from?: string
  /** `clip-path` the panel ends at. Defaults to `inset(0% 0% round 28px)`. */
  to?: string
  /** ScrollTrigger start. Defaults to `"top bottom"`. */
  start?: string
  /** ScrollTrigger end. Defaults to `"top 25%"`. */
  end?: string
}

/**
 * A panel that opens from a rounded inset to its full size as it scrolls in,
 * scrubbed to the scroll position.
 *
 * The markup is the open state: the inset only exists while the scrub runs,
 * so prerendered HTML and reduced motion show the panel whole. Keep the final
 * radius of `to` in sync with the panel's own `rounded-*` class.
 */
export const ClipReveal: FC<ClipRevealProps> = ({
  children,
  className,
  rootClassName,
  id,
  from = "inset(6% 8% round 48px)",
  to = "inset(0% 0% round 28px)",
  start = "top bottom",
  end = "top 25%",
}) => {
  const rootRef = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reducedMotion || !rootRef.current) return
      gsap.fromTo(
        '[data-clip="panel"]',
        { clipPath: from },
        {
          clipPath: to,
          ease: "none",
          scrollTrigger: { trigger: rootRef.current, start, end, scrub: true },
        },
      )
    },
    { scope: rootRef, dependencies: [reducedMotion, from, to, start, end] },
  )

  return (
    <section id={id} ref={rootRef} data-slot="clip-reveal" className={cn("scroll-mt-24 px-2 md:px-4", rootClassName)}>
      <div data-clip="panel" className={cn("overflow-hidden rounded-[28px]", className)}>
        {children}
      </div>
    </section>
  )
}
