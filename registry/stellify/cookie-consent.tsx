import type { FC, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CookieConsentLink {
  href: string
  label: string
}

export interface CookieConsentLabels {
  policy: string
  accept: string
  reject: string
}

const DEFAULT_LABELS: CookieConsentLabels = {
  policy: "Política de cookies",
  accept: "Aceptar",
  reject: "Rechazar",
}

export interface CookieConsentProps {
  /**
   * Controlled by the app, which owns the stored choice. Keeping storage out
   * of the component means the prerendered HTML never depends on the visitor.
   */
  open: boolean
  title?: string
  /** What is collected and why. Plain text or inline markup (e.g. a `<p>`). */
  description: ReactNode
  policyHref: string
  /** Copy. Defaults: "Política de cookies", "Aceptar", "Rechazar". */
  labels?: Partial<CookieConsentLabels>
  onAccept: () => void
  onReject: () => void
  /**
   * Renders the policy link. Apps with a client router pass their own Link so
   * navigation stays client-side; the default is a plain anchor.
   */
  renderLink?: (link: CookieConsentLink, props: { className: string }) => ReactNode
  className?: string
}

const policyLinkClass =
  "font-medium text-foreground underline underline-offset-4 hover:no-underline rounded-sm " +
  ""

/**
 * Analytics-cookie consent banner. Purely presentational.
 *
 * Non-modal (a labelled region, no focus trap): the page stays usable and
 * nothing is assumed until the visitor chooses. Accept and Reject share the
 * same variant and size — under the GDPR, refusing must be as easy as
 * accepting — and there is deliberately no close button, because dismissing
 * would have to mean one of the two. Sits at z-50, above `sticky-cta` (z-40).
 */
export const CookieConsent: FC<CookieConsentProps> = ({
  open,
  title = "Cookies de analítica",
  description,
  policyHref,
  labels,
  onAccept,
  onReject,
  renderLink,
  className,
}) => {
  if (!open) return null

  const l = { ...DEFAULT_LABELS, ...labels }
  const policy = { href: policyHref, label: l.policy }

  return (
    <div
      role="region"
      aria-label={title}
      data-slot="cookie-consent"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 text-foreground",
        "pb-[calc(1rem+env(safe-area-inset-bottom))]",
        "md:inset-x-auto md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] md:left-6 md:max-w-sm",
        "md:rounded-lg md:border-0 md:bg-popover md:p-5 md:shadow-(--shadow-overlay)",
        "animate-in fade-in-0 slide-in-from-bottom-4 duration-(--duration-base) motion-reduce:animate-none",
        className,
      )}
    >
      <p data-slot="cookie-consent-title" className="font-semibold tracking-(--tracking-display)">
        {title}
      </p>
      <div
        data-slot="cookie-consent-description"
        className="mt-2 text-sm leading-relaxed text-muted-foreground"
      >
        {description}
      </div>
      <p className="mt-2 text-sm">
        {renderLink?.(policy, { className: policyLinkClass }) ?? (
          <a href={policyHref} className={policyLinkClass}>
            {l.policy}
          </a>
        )}
      </p>
      <div data-slot="cookie-consent-actions" className="mt-4 grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" onClick={onReject}>
          {l.reject}
        </Button>
        <Button type="button" variant="secondary" onClick={onAccept}>
          {l.accept}
        </Button>
      </div>
    </div>
  )
}

export default CookieConsent
