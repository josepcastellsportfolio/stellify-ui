import { useCallback, useEffect, useRef, useState } from "react"
import type {
  ComponentType,
  FC,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react"
import { createPortal } from "react-dom"
import { ArrowRight, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"

import {
  MegaMenuPanel,
  type MegaMenuCategory,
  type MegaMenuLink,
  type NavLinkRenderProps,
} from "@/components/ui/mega-menu-panel"
import { NavAnchor } from "@/components/ui/nav-preview-card"
import { useFocusTrap } from "@/hooks/use-focus-trap"
import { megaMenuPanelId, useMegaMenu } from "@/hooks/use-mega-menu"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type { MegaMenuCategory, MegaMenuLink }

export interface SiteNavLink {
  /** Route path, rendered as a real href so crawlers can follow it. */
  href: string
  label: string
}

/** Every string SiteNav renders on its own (Spanish defaults). */
export interface SiteNavLabels {
  /** `aria-label` of the `<nav>`. */
  nav: string
  openMenu: string
  closeMenu: string
  /** `aria-label` of the mobile sheet (dialog). */
  mobileNav: string
  /** Back button of the mobile drill-down pane. */
  back: string
}

const DEFAULT_LABELS: SiteNavLabels = {
  nav: "Principal",
  openMenu: "Abrir menú",
  closeMenu: "Cerrar menú",
  mobileNav: "Menú",
  back: "Atrás",
}

/** What `menuMotion` receives; `MegaMenuMotion` from `@stellify/use-mega-menu-motion` fits. */
export interface SiteNavMenuMotionProps {
  rootRef: RefObject<HTMLElement | null>
  openId: string | null
  reducedMotion: boolean
  onClosed: () => void
  panelId: (categoryId: string) => string
}

export interface SiteNavProps {
  links: SiteNavLink[]
  /** Brand slot on the left — usually a logo linking to "/". */
  brand?: ReactNode
  /** Optional call to action on the right of the desktop bar. */
  action?: ReactNode
  /**
   * Renders each link. Apps using a client router pass their own Link so
   * navigation stays client-side; the default is a plain anchor. Spread the
   * props: `(link, props) => <Link to={link.href} {...props} />` (`children`
   * is the label; mega-menu links also get hover/focus handlers).
   */
  renderLink?: (
    link: SiteNavLink,
    props: { className: string; onClick?: () => void } & Partial<NavLinkRenderProps>,
  ) => ReactNode
  className?: string

  /**
   * Mega-menu categories. On desktop each one is a trigger (before `links`)
   * that opens a full-width `MegaMenuPanel` on hover, click or ArrowDown; on
   * mobile they become a drill-down sheet (category list → that category's
   * links). Panels stay in the DOM, hidden, so every link is prerendered.
   */
  menu?: MegaMenuCategory[]
  /**
   * `"dropdown"`: the original inline panel under the bar, always in the DOM.
   * `"sheet"`: a full-screen modal (portal, focus trap, scroll lock) with
   * drill-down panes and an actions dock. Defaults to `"sheet"` when `menu`
   * is set, `"dropdown"` otherwise.
   */
  mobileVariant?: "dropdown" | "sheet"
  /** Brand in the mobile sheet's top bar. Defaults to `brand`. */
  mobileBrand?: ReactNode
  /** Dock at the bottom of the mobile sheet (or under the dropdown). Defaults to `action`. */
  mobileActions?: ReactNode
  /** UI strings; merged over the Spanish defaults. */
  labels?: Partial<SiteNavLabels>
  /**
   * Motion for the desktop panels, as a component (so SiteNav itself never
   * imports GSAP). Pass `MegaMenuMotion` from `@stellify/use-mega-menu-motion`.
   * Without it panels show with a short CSS fade and close instantly.
   */
  menuMotion?: ComponentType<SiteNavMenuMotionProps>
  /** Ornament of the large preview card without a photo, e.g. `link => <FacetGrid seed={link.id} />`. */
  previewDecoration?: (link: MegaMenuLink) => ReactNode
  /** Inner container classes of the mega-menu panels (match your header). */
  panelContainerClassName?: string
  /**
   * Prefix for DOM ids: the mobile menu is `<prefix>-mobile` and panels are
   * `<prefix>-panel-<category>`. Defaults to `site-nav-mobile` and
   * `nav-panel-<category>`.
   */
  idPrefix?: string
  /** Fires when any menu (a desktop panel or the mobile menu) opens or closes — e.g. to lock a hide-on-scroll header. */
  onOpenChange?: (open: boolean) => void
  /** A link was followed (after SiteNav closed its menus). */
  onNavigate?: () => void
}

/** A click within this long of a hover-open is the same gesture, not a toggle. */
const HOVER_CLICK_MS = 500

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background"

/**
 * Public site navigation with an accessible mobile menu and optional
 * mega-menu.
 *
 * Links are real anchors, not `onClick={navigate()}` buttons: they are the
 * site's crawlable link graph, so a search engine that does not execute JS
 * must still be able to follow them.
 *
 * The mobile menu traps focus while open, closes on Escape, restores focus to
 * the toggle on close, and marks the toggle with aria-expanded/aria-controls.
 * The mega-menu closes on Escape (focus back on its trigger), on a press
 * outside the nav and when focus leaves it.
 */
export const SiteNav: FC<SiteNavProps> = ({
  links,
  brand,
  action,
  renderLink,
  className,
  menu,
  mobileVariant,
  mobileBrand,
  mobileActions,
  labels: labelOverrides,
  menuMotion: MenuMotion,
  previewDecoration,
  panelContainerClassName,
  idPrefix,
  onOpenChange,
  onNavigate,
}) => {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides }
  const hasMenu = !!menu?.length
  const variant = mobileVariant ?? (hasMenu ? "sheet" : "dropdown")
  const mobileId = `${idPrefix ?? "site-nav"}-mobile`
  const panelId = useCallback(
    (categoryId: string) => (idPrefix ? `${idPrefix}-panel-${categoryId}` : megaMenuPanelId(categoryId)),
    [idPrefix],
  )

  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const reducedMotion = usePrefersReducedMotion()
  const { openId, visibleId, open: openPanel, close, scheduleClose, cancelClose, finishClosing } = useMegaMenu()
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const hoverOpenedAt = useRef(0)
  const focusOnOpen = useRef<string | null>(null)

  const closePanel = useCallback(
    () => close({ animate: !!MenuMotion && !reducedMotion }),
    [close, MenuMotion, reducedMotion],
  )

  const closeMobile = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => toggleRef.current?.focus({ preventScroll: true }))
  }, [])

  const navigated = useCallback(() => {
    closePanel()
    setOpen(false)
    onNavigate?.()
  }, [closePanel, onNavigate])

  // Report the combined open state, on change only.
  const anyOpen = open || openId !== null
  const reported = useRef(anyOpen)
  const onOpenChangeRef = useRef(onOpenChange)
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  }, [onOpenChange])
  useEffect(() => {
    if (reported.current === anyOpen) return
    reported.current = anyOpen
    onOpenChangeRef.current?.(anyOpen)
  }, [anyOpen])

  // Dropdown variant: Escape closes, Tab wraps, focus lands on the first link.
  useFocusTrap(panelRef, {
    active: open && variant === "dropdown",
    onEscape: closeMobile,
    initialFocus: "a[href]",
  })

  // The mobile menu is mobile-only: widening the window past md closes it.
  useEffect(() => {
    if (!open || typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(min-width: 768px)")
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [open])

  // Keyboard opening moves focus to the panel's first link.
  useEffect(() => {
    if (!openId || focusOnOpen.current !== openId) return
    focusOnOpen.current = null
    document.getElementById(panelId(openId))?.querySelector<HTMLElement>("a[href]")?.focus()
  }, [openId, panelId])

  // While a panel is open: Escape closes it (focus back on its trigger) and a
  // press anywhere outside the nav closes it.
  useEffect(() => {
    if (!openId) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      closePanel()
      triggerRefs.current.get(openId)?.focus()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) closePanel()
    }
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [openId, closePanel])

  const onTriggerPointerEnter = (id: string) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    // Touch and pen get no hover: their first tap opens, through onClick.
    if (event.pointerType !== "mouse") return
    if (openId !== id) hoverOpenedAt.current = Date.now()
    openPanel(id)
  }

  const onTriggerClick = (id: string) => (event: ReactMouseEvent<HTMLButtonElement>) => {
    const fromKeyboard = event.detail === 0
    const sameGesture = !fromKeyboard && Date.now() - hoverOpenedAt.current < HOVER_CLICK_MS
    if (openId === id) {
      if (!sameGesture) closePanel()
      return
    }
    if (fromKeyboard) focusOnOpen.current = id
    openPanel(id)
  }

  const onTriggerKeyDown = (id: string) => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown") return
    event.preventDefault()
    if (openId === id) {
      document.getElementById(panelId(id))?.querySelector<HTMLElement>("a[href]")?.focus()
      return
    }
    focusOnOpen.current = id
    openPanel(id)
  }

  const onNavBlur = (event: ReactFocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null
    if (openId && next && !navRef.current?.contains(next)) closePanel()
  }

  const linkClass =
    "text-sm text-muted-foreground transition-colors hover:text-foreground " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"

  const renderAny = (link: SiteNavLink, props: { className: string; onClick?: () => void } & Partial<NavLinkRenderProps>) =>
    renderLink?.(link, props) ?? <NavAnchor href={link.href} {...props} />

  const renderOne = (link: SiteNavLink, onClick?: () => void, className = linkClass) =>
    renderAny(link, { className, onClick, children: link.label })

  const dock = mobileActions ?? action

  return (
    <nav
      ref={navRef}
      className={cn("flex items-center justify-between gap-6 py-6", className)}
      aria-label={labels.nav}
      onMouseEnter={hasMenu ? cancelClose : undefined}
      onMouseLeave={hasMenu ? scheduleClose : undefined}
      onBlur={hasMenu ? onNavBlur : undefined}
    >
      {brand}

      <ul className="hidden items-center gap-8 md:flex">
        {menu?.map(category => {
          const expanded = openId === category.id
          return (
            <li key={`menu-${category.id}`} data-slot="site-nav-menu-item">
              <button
                ref={node => {
                  if (node) triggerRefs.current.set(category.id, node)
                  else triggerRefs.current.delete(category.id)
                }}
                type="button"
                data-slot="site-nav-trigger"
                aria-expanded={expanded}
                aria-controls={panelId(category.id)}
                onPointerEnter={onTriggerPointerEnter(category.id)}
                onClick={onTriggerClick(category.id)}
                onKeyDown={onTriggerKeyDown(category.id)}
                // The other triggers dim while a panel is open. Dimmed means the
                // muted-foreground token, never opacity: the token keeps text
                // contrast at 4.5:1, opacity over muted text does not. Apps that
                // recolour the triggers style `[data-dimmed]` the same way.
                data-dimmed={openId && !expanded ? "" : undefined}
                className={cn(
                  linkClass,
                  "transition-colors duration-200 motion-reduce:transition-none",
                  expanded && "text-foreground",
                  "data-[dimmed]:text-muted-foreground",
                )}
              >
                {category.label}
              </button>
              <MegaMenuPanel
                category={category}
                visible={visibleId === category.id}
                panelId={panelId(category.id)}
                onNavigate={navigated}
                renderLink={renderLink ? (link, props) => renderAny(link, props) : undefined}
                previewDecoration={previewDecoration}
                containerClassName={panelContainerClassName}
                motion={MenuMotion ? "none" : "css"}
              />
            </li>
          )
        })}
        {links.map(link => (
          <li key={link.href}>{renderOne(link, hasMenu ? navigated : undefined)}</li>
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
        aria-controls={mobileId}
        aria-label={open ? labels.closeMenu : labels.openMenu}
        onClick={() => setOpen(value => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {variant === "dropdown" ? (
        /*
          Always in the DOM so the links are part of the prerendered HTML and
          remain crawlable; `hidden` keeps them out of the a11y tree when closed.
        */
        <div
          id={mobileId}
          ref={panelRef}
          hidden={!open}
          className={cn(
            "absolute inset-x-0 top-full z-50 border-b border-border bg-background px-[var(--container-pad)] py-6 md:hidden",
          )}
        >
          <ul className="flex flex-col gap-5">
            {links.map(link => (
              <li key={link.href}>{renderOne(link, () => setOpen(false))}</li>
            ))}
          </ul>
          {dock ? <div className="mt-6">{dock}</div> : null}
        </div>
      ) : open ? (
        <MobileSheet
          id={mobileId}
          menu={menu ?? []}
          links={links}
          brand={mobileBrand ?? brand}
          dock={dock}
          labels={labels}
          renderAny={renderAny}
          onClose={closeMobile}
          onNavigate={navigated}
        />
      ) : null}

      {hasMenu && MenuMotion ? (
        <MenuMotion
          rootRef={navRef}
          openId={openId}
          reducedMotion={reducedMotion}
          onClosed={finishClosing}
          panelId={panelId}
        />
      ) : null}
    </nav>
  )
}

interface MobileSheetProps {
  id: string
  menu: MegaMenuCategory[]
  links: SiteNavLink[]
  brand?: ReactNode
  dock?: ReactNode
  labels: SiteNavLabels
  renderAny: (link: SiteNavLink, props: { className: string; onClick?: () => void } & Partial<NavLinkRenderProps>) => ReactNode
  onClose: () => void
  onNavigate: () => void
}

/**
 * Closes the sheet when a link inside an app slot (brand, dock) is followed.
 * It only observes link activation, which a keyboard Enter also fires as a
 * click, so it listens in the capture phase on a plain wrapper: the wrapper
 * itself is not interactive. React batches the close, so the link's own
 * handler (a client-router navigation) still runs.
 */
const closeOnLink = (onNavigate: () => void) => (event: ReactMouseEvent<HTMLElement>) => {
  if ((event.target as Element).closest("a[href]")) onNavigate()
}

/**
 * The mobile sheet: a full-screen dialog with the categories (plus the plain
 * links), a second pane that slides in with the chosen category's links, and
 * a dock for the actions. Mounted only while open (desktop panels already
 * carry every link in the prerendered HTML) and portalled to <body>, so a
 * transformed header (hide-on-scroll) cannot become its containing block.
 *
 * Modal: focus is trapped, Escape closes, the page behind does not scroll.
 * The off-screen pane is `inert`, so Tab never reaches it.
 */
const MobileSheet: FC<MobileSheetProps> = ({ id, menu, links, brand, dock, labels, renderAny, onClose, onNavigate }) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState(false)
  const selected = menu.find(category => category.id === selectedId) ?? null

  useFocusTrap(rootRef, { active: true, onEscape: onClose, lockScroll: true })

  const openCategory = (categoryId: string) => {
    setSelectedId(categoryId)
    setDetail(true)
    // preventScroll: focusing into the translating pane must not scroll the
    // overflow-hidden track, or the 200%-wide layout jumps.
    requestAnimationFrame(() => backRef.current?.focus({ preventScroll: true }))
  }

  const back = () => {
    setDetail(false)
    const current = selectedId
    requestAnimationFrame(() =>
      rootRef.current
        ?.querySelector<HTMLElement>(`[data-mobile-category="${current}"]`)
        ?.focus({ preventScroll: true }),
    )
  }

  const bigLink = cn("block rounded-md py-2 text-xl leading-snug text-foreground hover:text-primary", FOCUS_RING)

  return createPortal(
    <div
      ref={rootRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label={labels.mobileNav}
      data-slot="site-nav-sheet"
      className="fixed inset-0 z-[60] flex flex-col bg-background text-foreground md:hidden"
    >
      <div className="flex h-[var(--header-h,4rem)] shrink-0 items-center justify-between px-4">
        <div data-slot="site-nav-sheet-brand" onClickCapture={closeOnLink(onNavigate)}>
          {brand}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={labels.closeMenu}
          className={cn("inline-flex size-10 items-center justify-center rounded-lg", FOCUS_RING)}
        >
          <X className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <nav aria-label={labels.mobileNav} className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className={cn(
            "flex h-full w-[200%] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
            "motion-reduce:transition-none",
            detail && "-translate-x-1/2",
          )}
        >
          <div className="h-full w-1/2 overflow-y-auto px-4 pb-8 pt-2" inert={detail} data-slot="site-nav-sheet-root">
            <ul className="flex flex-col">
              {menu.map(category => (
                <li key={category.id}>
                  <button
                    type="button"
                    data-mobile-category={category.id}
                    aria-controls={`${id}-detail`}
                    onClick={() => openCategory(category.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md py-4 text-left text-3xl font-normal",
                      "tracking-display",
                      FOCUS_RING,
                    )}
                  >
                    {category.label}
                    <ChevronRight className="size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            {links.length ? (
              <ul className={cn("flex flex-col gap-1", menu.length && "mt-6 border-t border-border pt-6")}>
                {links.map(link => (
                  <li key={link.href}>
                    {renderAny(link, { className: bigLink, onClick: onNavigate, children: link.label })}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div
            id={`${id}-detail`}
            className="h-full w-1/2 overflow-y-auto px-4 pb-8 pt-2"
            inert={!detail}
            data-slot="site-nav-sheet-detail"
          >
            <button
              ref={backRef}
              type="button"
              onClick={back}
              className={cn("-ml-1 inline-flex items-center gap-1 rounded-md py-2 text-sm text-muted-foreground", FOCUS_RING)}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              {labels.back}
            </button>
            {selected ? (
              <>
                <h2 className="mt-4 text-3xl font-normal tracking-display">{selected.label}</h2>
                <div className="mt-8 flex flex-col gap-8">
                  {selected.groups.map(group => (
                    <div key={group.id}>
                      <p className="text-sm text-muted-foreground">{group.label}</p>
                      <ul className="mt-3 flex flex-col gap-1">
                        {group.links.map(link => (
                          <li key={link.id}>
                            {renderAny(link, { className: bigLink, onClick: onNavigate, children: link.label })}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {selected.cta
                    ? renderAny(selected.cta, {
                        className: cn("inline-flex items-center gap-2 self-start rounded-md text-base font-medium", FOCUS_RING),
                        onClick: onNavigate,
                        children: (
                          <>
                            {selected.cta.label}
                            <ArrowRight className="size-4" aria-hidden="true" />
                          </>
                        ),
                      })
                    : null}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      {dock ? (
        <div
          data-slot="site-nav-sheet-dock"
          onClickCapture={closeOnLink(onNavigate)}
          className="shrink-0 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {dock}
        </div>
      ) : null}
    </div>,
    document.body,
  )
}
