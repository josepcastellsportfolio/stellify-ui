import type { FC, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface SiteFooterLink {
  href: string
  label: string
  /** Opens in a new tab with the usual rel hardening. */
  external?: boolean
}

export interface SiteFooterGroup {
  title: string
  links: SiteFooterLink[]
}

export interface SiteFooterProps {
  groups: SiteFooterGroup[]
  /** Copyright / legal line under the groups. */
  legal?: ReactNode
  renderLink?: (link: SiteFooterLink, props: { className: string }) => ReactNode
  className?: string
}

/**
 * Site footer.
 *
 * Because it renders on every public page it doubles as the site's crawlable
 * link graph — real anchors, never `onClick={navigate()}`.
 */
export const SiteFooter: FC<SiteFooterProps> = ({
  groups,
  legal,
  renderLink,
  className,
}) => {
  const linkClass =
    "text-sm text-muted-foreground underline-offset-4 transition-colors " +
    "hover:text-foreground hover:underline focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"

  return (
    <footer className={cn("border-t border-border py-12", className)}>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map(group => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-sm font-semibold text-foreground">{group.title}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map(link => (
                <li key={link.href}>
                  {renderLink?.(link, { className: linkClass }) ?? (
                    <a
                      href={link.href}
                      className={linkClass}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {legal ? (
        <p className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground">
          {legal}
        </p>
      ) : null}
    </footer>
  )
}
