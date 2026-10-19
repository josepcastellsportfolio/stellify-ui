import { useRef, type ElementType, type FC, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { useGSAP } from "@gsap/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

export interface AnimatedTextProps {
  /** Element to render. Defaults to `p`. */
  as?: ElementType
  children: ReactNode
  className?: string
  /** `"lines"` slides each line up out of a mask; `"words"` staggers word by word (headlines). */
  split?: "lines" | "words"
  /** Seconds before the reveal starts. */
  delay?: number
  /** Play on mount instead of when it scrolls into view (above-the-fold copy). */
  immediate?: boolean
}

/**
 * Text that rises out of a mask, line by line or word by word, the first time
 * it enters the viewport.
 *
 * The markup is the finished text. SplitText only runs on the client and
 * re-splits on resize and font load (`autoSplit`), so wrapped lines stay
 * right. Under reduced motion nothing moves.
 */
export const AnimatedText: FC<AnimatedTextProps> = ({
  as: Tag = "p",
  children,
  className,
  split = "lines",
  delay = 0,
  immediate = false,
}) => {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reducedMotion) return
      // useGSAP's context reverts the split and its tween on cleanup.
      SplitText.create(el, {
        type: split === "words" ? "words,lines" : "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(split === "words" ? self.words : self.lines, {
            yPercent: 110,
            duration: 0.9,
            ease: "expo.out",
            stagger: split === "words" ? 0.05 : 0.08,
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
          })
        },
      })
    },
    { scope: ref, dependencies: [reducedMotion, split, delay, immediate] },
  )

  return (
    <Tag ref={ref} data-slot="animated-text" className={className}>
      {children}
    </Tag>
  )
}
