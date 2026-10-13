import { useId } from "react"
import type { FC } from "react"

import { cn } from "@/lib/utils"

export interface KeyTakeawaysProps {
  /**
   * One short, self-contained sentence per item. Plain strings, not markup:
   * these are the lines search engines and answer engines lift verbatim, so
   * each should make sense without the rest of the page.
   */
  items: string[]
  /**
   * Rendered as an h2 so the box can sit between the page's h1 intro and its
   * first h2 section without skipping a level.
   */
  title?: string
  className?: string
}

/**
 * "En resumen" box for the top of a long page.
 *
 * An `<aside>` labelled by its own heading: assistive tech announces it as a
 * named complementary region, and readers who only want the gist can stop
 * here. Renders nothing when there is nothing to summarise, so pages can pass
 * an optional array without guarding.
 */
export const KeyTakeaways: FC<KeyTakeawaysProps> = ({
  items,
  title = "En resumen",
  className,
}) => {
  const headingId = useId()

  if (items.length === 0) return null

  return (
    <aside
      data-slot="key-takeaways"
      aria-labelledby={headingId}
      className={cn("border-l-2 border-primary bg-muted/40 py-5 pl-6 pr-5", className)}
    >
      <h2
        id={headingId}
        data-slot="key-takeaways-title"
        className="text-base font-semibold tracking-display text-foreground"
      >
        {title}
      </h2>
      <ul
        data-slot="key-takeaways-list"
        className="mt-3 flex list-disc flex-col gap-2 pl-5 leading-body text-foreground marker:text-primary"
      >
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  )
}

export default KeyTakeaways
