import { useRef, type FC, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export interface ScrollRevealProps {
  children: ReactNode
  /** Classes of the widening background layer. Defaults to `bg-muted`. */
  surface?: string
  className?: string
  id?: string
  /** Gutter the background starts from on each side, in px. Defaults to 24 (12 below `md`). */
  gutter?: { desktop: number; mobile: number }
  /** Top corner radius the background starts with, in px. Defaults to 28. */
  radius?: number
}

const DEFAULT_GUTTER = { desktop: 24, mobile: 12 }

/**
 * A section whose background starts as an inset rounded card and widens to
 * the full width, its top corners flattening, while the section scrolls up to
 * the top. Only the background layer moves; the content stays put, so nothing
 * reflows.
 *
 * The markup is the finished, full-width state. The inset is applied on the
 * client, on a scrub, and never under reduced motion.
 */
export const ScrollReveal: FC<ScrollRevealProps> = ({
  children,
  surface = "bg-muted",
  className,
  id,
  gutter = DEFAULT_GUTTER,
  radius = 28,
}) => {
  const rootRef = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const { desktop, mobile } = gutter

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || reducedMotion) return
      const layer = root.querySelector<HTMLElement>('[data-reveal="layer"]')
      if (!layer) return

      const side = () => (window.innerWidth < 768 ? mobile : desktop)
      gsap.fromTo(
        layer,
        {
          scaleX: () => 1 - (2 * side()) / Math.max(root.offsetWidth, 1),
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
        },
        {
          scaleX: 1,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true },
        },
      )
    },
    { scope: rootRef, dependencies: [reducedMotion, desktop, mobile, radius] },
  )

  return (
    <section id={id} ref={rootRef} data-slot="scroll-reveal" className={cn("relative isolate scroll-mt-24", className)}>
      <div aria-hidden="true" data-reveal="layer" className={cn("absolute inset-0 -z-10 origin-top", surface)} />
      {children}
    </section>
  )
}
