import type { FC, ReactNode } from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface StickyCtaLink {
  href: string
  label: string
}

export interface StickyCtaSecondary extends StickyCtaLink {
  /**
   * When set, the secondary action becomes a square icon button and `label`
   * moves to its accessible name — e.g. a phone icon for a `tel:` link.
   */
  icon?: ReactNode
}

export interface StickyCtaProps {
  label: string
  href: string
  /**
   * Optional second action. Always a plain anchor: it is typically `tel:` or
   * `mailto:`, which a client router cannot handle anyway.
   */
  secondary?: StickyCtaSecondary
  /**
   * Renders the primary link. Apps with a client router pass their own Link
   * so navigation stays client-side; the default is a plain anchor.
   */
  renderLink?: (link: StickyCtaLink, props: { className: string }) => ReactNode
  /**
   * Render nothing — for pages that already end in the same CTA (the contact
   * page itself) or while a modal flow is open.
   */
  hidden?: boolean
  className?: string
}

/**
 * Mobile-only bottom bar with the page's main action.
 *
 * Fixed at z-40 (below `cookie-consent` at z-50, so the consent choice is
 * never covered) and padded by the safe-area inset for phones with a home
 * indicator. An in-flow spacer of the same height is rendered too, so the bar
 * never hides the end of the page or the footer. Hidden from `md` up, where
 * the header CTA is always visible.
 */
export const StickyCta: FC<StickyCtaProps> = ({
  label,
  href,
  secondary,
  renderLink,
  hidden = false,
  className,
}) => {
  if (hidden) return null

  const primaryClass = cn(buttonVariants({ variant: "primary", size: "lg" }), "flex-1 px-4")
  const secondaryClass = cn(
    buttonVariants({ variant: "secondary", size: secondary?.icon ? "icon" : "lg" }),
    secondary?.icon ? "size-11 shrink-0" : "px-4",
  )

  return (
    <>
      <div
        aria-hidden="true"
        data-slot="sticky-cta-spacer"
        className="h-[calc(72px+env(safe-area-inset-bottom))] md:hidden"
      />
      <div
        data-slot="sticky-cta"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur",
          "px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden",
          className,
        )}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          {renderLink?.({ href, label }, { className: primaryClass }) ?? (
            <a href={href} className={primaryClass}>
              {label}
            </a>
          )}
          {secondary ? (
            <a
              href={secondary.href}
              className={secondaryClass}
              aria-label={secondary.icon ? secondary.label : undefined}
            >
              {secondary.icon ? <span aria-hidden="true">{secondary.icon}</span> : secondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default StickyCta
