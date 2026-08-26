import { useEffect, useRef, useState } from "react"
import type { FC, ReactNode } from "react"
import { Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface SiteNavLink {
  /** Route path, rendered as a real href so crawlers can follow it. */
  href: string
  label: string
}

export interface SiteNavProps {
  links: SiteNavLink[]
  /** Brand slot on the left — usually a logo linking to "/". */
  brand?: ReactNode
  /** Optional call to action on the right of the desktop bar. */
  action?: ReactNode
  /**
   * Renders each link. Apps using a client router pass their own Link so
   * navigation stays client-side; the default is a plain anchor.
   */
  renderLink?: (link: SiteNavLink, props: { className: string; onClick?: () => void }) => ReactNode
  className?: string
}

/**
 * Public site navigation with an accessible mobile menu.
 *
 * Links are real anchors, not `onClick={navigate()}` buttons: they are the
 * site's crawlable link graph, so a search engine that does not execute JS
 * must still be able to follow them.
 *
 * The mobile menu traps focus while open, closes on Escape and on outside
 * click, restores focus to the toggle on close, and marks the rest of the bar
 * with aria-expanded/aria-controls.
 */
export const SiteNav: FC<SiteNavProps> = ({
  links,
  brand,
  action,
  renderLink,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Escape closes; focus returns to the toggle so keyboard users are not
  // dropped at the top of the document.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (event.key !== "Tab") return

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusables?.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus()
  }, [open])

  const linkClass =
    "text-sm text-muted-foreground transition-colors hover:text-foreground " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"

  const renderOne = (link: SiteNavLink, onClick?: () => void) =>
    renderLink?.(link, { className: linkClass, onClick }) ?? (
      <a href={link.href} className={linkClass} onClick={onClick}>
        {link.label}
      </a>
    )

  return (
    <nav
      className={cn("flex items-center justify-between gap-6 py-6", className)}
      aria-label="Principal"
    >
      {brand}

      <ul className="hidden items-center gap-8 md:flex">
        {links.map(link => (
          <li key={link.href}>{renderOne(link)}</li>
        ))}
      </ul>

      <div className="hidden md:block">{action}</div>

      <button
        ref={toggleRef}
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
        aria-expanded={open}
        aria-controls="site-nav-mobile"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen(value => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/*
        Always in the DOM so the links are part of the prerendered HTML and
        remain crawlable; `hidden` keeps them out of the a11y tree when closed.
      */}
      <div
        id="site-nav-mobile"
        ref={panelRef}
        hidden={!open}
        className={cn(
          "absolute inset-x-0 top-full z-50 border-b border-border bg-background px-[--container-pad] py-6 md:hidden",
        )}
      >
        <ul className="flex flex-col gap-5">
          {links.map(link => (
            <li key={link.href}>{renderOne(link, () => setOpen(false))}</li>
          ))}
        </ul>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </nav>
  )
}
