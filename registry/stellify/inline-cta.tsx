import type { FC, ReactNode } from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface InlineCtaLink {
  href: string
  label: string
}

export interface InlineCtaProps {
  /** One sentence: what the reader gets by acting now. */
  text: string
  /** Says exactly what happens on click ("Pide presupuesto", not "Enviar"). */
  actionLabel: string
  href: string
  /**
   * Renders the action link. Apps with a client router pass their own Link so
   * navigation stays client-side; the default is a plain anchor.
   */
  renderLink?: (link: InlineCtaLink, props: { className: string }) => ReactNode
  className?: string
}

/**
 * Compact call to action meant to sit right after a page's first paragraph.
 *
 * A real link styled as a button, not a `<button onClick={navigate}>`, so it
 * works in the prerendered HTML and crawlers can follow it. Stacks on mobile,
 * one row from `sm` up.
 */
export const InlineCta: FC<InlineCtaProps> = ({
  text,
  actionLabel,
  href,
  renderLink,
  className,
}) => {
  const actionClass = cn(buttonVariants({ variant: "primary" }), "shrink-0")
  const link = { href, label: actionLabel }

  return (
    <div
      data-slot="inline-cta"
      className={cn(
        "flex flex-col gap-4 rounded-card border border-border bg-card p-5",
        "sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        className,
      )}
    >
      <p data-slot="inline-cta-text" className="leading-body text-card-foreground">
        {text}
      </p>
      {renderLink?.(link, { className: actionClass }) ?? (
        <a href={href} className={actionClass}>
          {actionLabel}
        </a>
      )}
    </div>
  )
}

export default InlineCta
