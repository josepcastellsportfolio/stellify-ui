import type { FC, ReactNode } from "react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface OfferCardProps {
  title: string
  /** What the client actually receives. */
  deliverable: string
  /** When this offer is the right fit. */
  fit: string
  /** Project or article that backs the claim. Without proof it is just a claim. */
  proof?: { href: string; label: string }
  icon?: ReactNode
  renderLink?: (
    proof: { href: string; label: string },
    props: { className: string },
  ) => ReactNode
  className?: string
}

/**
 * Service card for the marketing home.
 *
 * All content is visible without hovering: hover-to-expand hides content
 * behind a gesture that does not exist on touch, and forces pagination dots
 * as a workaround. These sit in a grid, all readable at once.
 */
export const OfferCard: FC<OfferCardProps> = ({
  title,
  deliverable,
  fit,
  proof,
  icon,
  renderLink,
  className,
}) => {
  const linkClass =
    "inline-flex items-center gap-2 text-sm font-medium text-primary " +
    "underline-offset-4 hover:underline focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-card border border-border bg-card p-7",
        "shadow-card transition-[transform,box-shadow] duration-base ease-out-soft",
        "hover:-translate-y-1 hover:shadow-card-hover",
        "motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
    >
      {icon ? (
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-icon bg-accent text-accent-foreground">
          {icon}
        </div>
      ) : null}

      <h3 className="text-xl font-semibold tracking-display text-card-foreground">
        {title}
      </h3>

      <p className="mt-4 text-sm leading-body text-muted-foreground">
        {deliverable}
      </p>

      <p className="mt-4 text-sm leading-body text-muted-foreground">
        <span className="font-medium text-card-foreground">Cuándo tiene sentido: </span>
        {fit}
      </p>

      {proof ? (
        <div className="mt-6 pt-2">
          {renderLink?.(proof, { className: linkClass }) ?? (
            <a href={proof.href} className={linkClass}>
              {proof.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      ) : null}
    </article>
  )
}
