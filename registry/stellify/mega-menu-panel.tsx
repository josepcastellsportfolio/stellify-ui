import { useEffect, useState, type FC, type ReactNode } from "react"
import { ArrowRight } from "lucide-react"

import {
  NavPreviewCard,
  NavAnchor,
  type NavLinkRenderProps,
  type RenderNavLink,
} from "@/components/ui/nav-preview-card"
import { megaMenuPanelId } from "@/hooks/use-mega-menu"
import { cn } from "@/lib/utils"

export type { NavLinkRenderProps, RenderNavLink }

export interface MegaMenuLink {
  /** Stable id: React key and preview state. */
  id: string
  href: string
  /** Visible text (already translated). */
  label: string
  /** One line for the preview card. */
  summary?: string
  /** Photo for the preview card; without one the card is the dark panel. */
  image?: string
}

export interface MegaMenuGroup {
  id: string
  /** Small muted label above the links. */
  label: string
  links: MegaMenuLink[]
}

export interface MegaMenuCategory {
  /** Also the panel's DOM id suffix (`nav-panel-<id>` by default). */
  id: string
  /** The top-level trigger. */
  label: string
  /** One to three link columns. */
  groups: MegaMenuGroup[]
  /**
   * Cards in the right column. The first one is the live preview: it shows the
   * hovered or focused link and falls back to this entry. Defaults to the
   * first link. Every featured link must also appear in a group: the cards are
   * a mouse convenience and are kept out of the tab order.
   */
  featured?: MegaMenuLink[]
  /** Optional call to action under the columns. */
  cta?: { href: string; label: string }
}

/** Default inner width of a panel (match it to your header's container). */
export const MEGA_MENU_INNER = "mx-auto w-full max-w-[90rem] px-4 md:px-6 lg:px-10"

/** Static class names, so Tailwind sees them (no `grid-cols-${n}`). */
const GROUP_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
}

const FOCUS_RING =
  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export interface MegaMenuPanelProps {
  category: MegaMenuCategory
  /** Shown (open, or animating out). Closed panels stay in the DOM, `hidden`. */
  visible: boolean
  /** A link was followed: the owner closes the panel. */
  onNavigate?: () => void
  /** DOM id; the trigger's `aria-controls` must match. Defaults to `megaMenuPanelId(category.id)`. */
  panelId?: string
  renderLink?: RenderNavLink
  /** Top-right ornament of the large preview card without a photo (e.g. `FacetGrid`). */
  previewDecoration?: (link: MegaMenuLink) => ReactNode
  /** Inner container classes. Defaults to `MEGA_MENU_INNER`. */
  containerClassName?: string
  /**
   * `"none"` (default) leaves the `data-nav-*` hooks to `useMegaMenuMotion`;
   * `"css"` adds a short CSS fade/slide-in for apps without GSAP.
   */
  motion?: "none" | "css"
  className?: string
}

/**
 * One category's mega-menu panel: link columns on the left, preview cards on
 * the right, positioned under its header (`absolute inset-x-0 top-full`).
 *
 * Always rendered (hidden when closed) so prerendered HTML carries every link.
 * The background (`data-nav-bg`), clipped content (`data-nav-content`) and
 * staggered items (`data-nav-item`) are the hooks `useMegaMenuMotion` animates.
 */
export const MegaMenuPanel: FC<MegaMenuPanelProps> = ({
  category,
  visible,
  onNavigate,
  panelId,
  renderLink,
  previewDecoration,
  containerClassName = MEGA_MENU_INNER,
  motion = "none",
  className,
}) => {
  const id = panelId ?? megaMenuPanelId(category.id)
  const [previewId, setPreviewId] = useState<string | null>(null)

  // A panel opens on its default preview, not on whatever was hovered last time.
  useEffect(() => {
    if (!visible) setPreviewId(null)
  }, [visible])

  const links = category.groups.flatMap(group => group.links)
  const featured = category.featured?.length ? category.featured : links.slice(0, 1)
  const preview = links.find(link => link.id === previewId) ?? featured[0]
  // The other featured cards keep their slots whatever is previewed above them.
  const secondary = featured.filter(link => link.id !== preview?.id).slice(0, featured.length - 1)

  const renderOne = (link: { href: string; label: string }, props: NavLinkRenderProps) =>
    renderLink?.(link, props) ?? <NavAnchor href={link.href} {...props} />

  const card = (link: MegaMenuLink, size: "lg" | "sm") => (
    <NavPreviewCard
      href={link.href}
      title={link.label}
      summary={link.summary}
      image={link.image}
      size={size}
      previewKey={link.id}
      decoration={size === "lg" ? previewDecoration?.(link) : undefined}
      onClick={onNavigate}
      renderLink={renderLink}
    />
  )

  return (
    <div
      id={id}
      hidden={!visible}
      data-slot="mega-menu-panel"
      data-state={visible ? "open" : "closed"}
      className={cn("absolute inset-x-0 top-full", className)}
    >
      <div
        data-nav-bg
        aria-hidden="true"
        className={cn(
          "absolute inset-0 origin-top bg-background/[0.97] shadow-[0_40px_80px_-24px_oklch(0.208_0.042_265.755/0.28)] backdrop-blur-lg",
          motion === "css" && "animate-in fade-in-0 duration-200 motion-reduce:animate-none",
        )}
      />
      <div
        data-nav-content
        className={cn(
          containerClassName,
          "relative grid grid-cols-12 gap-8 pb-12 pt-8 lg:gap-12",
          motion === "css" && "animate-in fade-in-0 slide-in-from-top-2 duration-200 motion-reduce:animate-none",
        )}
      >
        <div className="col-span-7 flex flex-col gap-10 lg:col-span-8">
          <div className={cn("grid gap-8", GROUP_COLS[Math.min(Math.max(category.groups.length, 1), 3)])}>
            {category.groups.map(group => {
              const labelId = `${id}-${group.id}`
              return (
                <div key={group.id} className="min-w-0">
                  <p id={labelId} data-nav-item className="text-sm text-muted-foreground">
                    {group.label}
                  </p>
                  <ul aria-labelledby={labelId} className="mt-4 flex flex-col gap-3">
                    {group.links.map(link => (
                      <li key={link.id} data-nav-item>
                        {renderOne(link, {
                          className: cn(
                            "inline-block text-base font-normal leading-snug text-foreground transition-colors",
                            "duration-150 hover:text-primary lg:text-xl",
                            FOCUS_RING,
                          ),
                          children: link.label,
                          onMouseEnter: () => setPreviewId(link.id),
                          onFocus: () => setPreviewId(link.id),
                          onClick: onNavigate,
                        })}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {category.cta ? (
            <div data-nav-item>
              {renderOne(category.cta, {
                className: cn(
                  "inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4",
                  "hover:text-primary hover:underline",
                  FOCUS_RING,
                ),
                children: (
                  <>
                    {category.cta.label}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                ),
                onClick: onNavigate,
              })}
            </div>
          ) : null}
        </div>

        <div className="col-span-5 flex flex-col gap-4 lg:col-span-4">
          {preview ? <div data-nav-item>{card(preview, "lg")}</div> : null}
          {secondary.map(link => (
            <div key={link.id} data-nav-item>
              {card(link, "sm")}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
