import { useRef, type ElementType, type FC } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { useGSAP } from "@gsap/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

export interface ScrubWordsProps {
  /** Element to render. Defaults to `p`. */
  as?: ElementType
  /** Plain text only: it is split into words on the client. */
  children: string
  className?: string
  /** Opacity of a word before it lights up. Defaults to 0.12. */
  dimOpacity?: number
  /** ScrollTrigger start. Defaults to `"top 80%"`. */
  start?: string
  /** ScrollTrigger end. Defaults to `"bottom 45%"`. */
  end?: string
}

/**
 * One large statement whose words light up one after another as it scrolls
 * through the viewport, scrubbed to the scroll position.
 *
 * The markup is the lit text; the dim start state is applied on the client
 * only (GSAP SplitText, re-split on resize and font load), never under
 * reduced motion.
 */
export const ScrubWords: FC<ScrubWordsProps> = ({
  as: Tag = "p",
  children,
  className,
  dimOpacity = 0.12,
  start = "top 80%",
  end = "bottom 45%",
}) => {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reducedMotion) return
      // useGSAP's context reverts the split and its tween on cleanup.
      SplitText.create(el, {
        type: "words",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.words, {
            opacity: dimOpacity,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: el, start, end, scrub: true },
          })
        },
      })
    },
    { scope: ref, dependencies: [reducedMotion, children, dimOpacity, start, end] },
  )

  return (
    <Tag ref={ref} data-slot="scrub-words" className={cn(className)}>
      {children}
    </Tag>
  )
}
