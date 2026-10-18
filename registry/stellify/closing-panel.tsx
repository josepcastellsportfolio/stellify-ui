import type { ElementType, FC, ReactNode } from "react"

import { AnimatedText } from "@/components/animated-text"
import { cn } from "@/lib/utils"

export interface ClosingPanelProps {
  title: string
  intro?: string
  /** The call to action (a button or link of your own). */
  action?: ReactNode
  /** Heading level of the title. Defaults to `h2`. */
  titleAs?: ElementType
  /** Reveal the title word by word and the intro line by line (GSAP). Defaults to true. */
  animated?: boolean
  /** Dotted grid behind the copy. Defaults to true. */
  dotGrid?: boolean
  className?: string
  id?: string
}

/**
 * The dark closing panel at the end of a landing page: a big headline, one
 * line of intro and a single call to action over a faded dot grid.
 *
 * One colour in light and dark themes (like a dark band on a light page);
 * override it with the `--closing-bg`, `--closing-fg` and `--closing-muted`
 * CSS variables (any CSS colour). The markup is the final state, so it
 * prerenders whole; the reveal runs on the client and not under reduced motion.
 */
export const ClosingPanel: FC<ClosingPanelProps> = ({
  title,
  intro,
  action,
  titleAs = "h2",
  animated = true,
  dotGrid = true,
  className,
  id,
}) => {
  const titleClass =
    "mx-auto max-w-3xl text-balance text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1] tracking-display"
  const introClass =
    "mx-auto mt-5 max-w-xl text-pretty text-lg leading-body text-[var(--closing-muted,oklch(0.78_0.02_265))]"
  const Title = titleAs

  return (
    <section
      id={id}
      data-slot="closing-panel"
      className={cn(
        "relative isolate mx-2 overflow-hidden rounded-[28px] md:mx-4",
        "bg-[var(--closing-bg,oklch(0.16_0.02_265))] text-[var(--closing-fg,oklch(0.98_0_0))]",
        className,
      )}
    >
      {dotGrid ? (
        <div
          aria-hidden="true"
          data-slot="closing-panel-grid"
          className={cn(
            "absolute inset-0 -z-10 [background-size:22px_22px]",
            "[background-image:radial-gradient(oklch(1_0_0/0.14)_1px,transparent_1px)]",
            "[mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_70%)]",
          )}
        />
      ) : null}
      <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
        {animated ? (
          <AnimatedText as={titleAs} split="words" className={titleClass}>
            {title}
          </AnimatedText>
        ) : (
          <Title className={titleClass}>{title}</Title>
        )}
        {intro ? (
          animated ? (
            <AnimatedText className={introClass}>{intro}</AnimatedText>
          ) : (
            <p className={introClass}>{intro}</p>
          )
        ) : null}
        {action ? <div className="mt-10 flex justify-center">{action}</div> : null}
      </div>
    </section>
  )
}
