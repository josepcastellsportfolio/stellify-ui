import type { FC, ReactNode } from "react"

import { cn } from "@/lib/utils"

const COLS = 6
const ROWS = 3
const TILE = 14
const GAP = 4
const CUT = 4

/** A tile with its corners cut at 45°. */
function facet(col: number, row: number): string {
  const x = col * (TILE + GAP)
  const y = row * (TILE + GAP)
  const s = TILE
  return [
    [x + CUT, y], [x + s - CUT, y], [x + s, y + CUT], [x + s, y + s - CUT],
    [x + s - CUT, y + s], [x + CUT, y + s], [x, y + s - CUT], [x, y + CUT],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(" ")
}

const TILES = Array.from({ length: COLS * ROWS }, (_, i) => facet(i % COLS, Math.floor(i / COLS)))

/** Small stable hash, so each seed lights its own pair of tiles. */
function hash(value: string): number {
  let h = 0
  for (const char of value) h = (h * 31 + char.charCodeAt(0)) >>> 0
  return h
}

export interface FacetGridProps {
  /** Any stable string (a link id): the same seed always lights the same tiles. */
  seed: string
  /** Colour comes from `currentColor` (`text-*`). Defaults to `text-primary`. */
  className?: string
}

/**
 * Decorative 6×3 grid of faceted tiles, one lit and one half-lit, picked from
 * `seed`. Hidden from assistive tech. A default decoration for a
 * `NavPreviewCard` without a photo.
 */
export const FacetGrid: FC<FacetGridProps> = ({ seed, className }) => {
  const h = hash(seed)
  const lit = h % TILES.length
  const half = (lit + 1 + ((h >>> 5) % (TILES.length - 1))) % TILES.length
  return (
    <svg
      data-slot="facet-grid"
      viewBox={`0 0 ${COLS * (TILE + GAP) - GAP} ${ROWS * (TILE + GAP) - GAP}`}
      className={cn("h-auto w-28 text-primary", className)}
      aria-hidden="true"
    >
      {TILES.map((points, i) => (
        <polygon
          key={points}
          points={points}
          data-lit={i === lit ? "full" : i === half ? "half" : undefined}
          className={cn(
            i === lit && "fill-current",
            i === half && "fill-current opacity-35",
            i !== lit && i !== half && "fill-none stroke-white/15",
          )}
        />
      ))}
    </svg>
  )
}

/** Props a nav link renderer receives; spread them all onto your Link. */
export interface NavLinkRenderProps {
  className: string
  children: ReactNode
  onClick?: () => void
  onMouseEnter?: () => void
  onFocus?: () => void
  tabIndex?: number
  "aria-hidden"?: boolean
  "data-slot"?: string
}

/**
 * Renders one navigation link. Apps with a client router pass their own Link
 * so navigation stays client-side; the default is a plain anchor:
 * `(link, props) => <Link to={link.href} {...props} />`.
 */
export type RenderNavLink = (link: { href: string; label: string }, props: NavLinkRenderProps) => ReactNode

/** The default link: a plain anchor taking the render props (children passed explicitly). */
export const NavAnchor: FC<Partial<NavLinkRenderProps> & { href: string; className: string }> = ({
  href,
  children,
  ...props
}) => (
  <a href={href} {...props}>
    {children}
  </a>
)

export interface NavPreviewCardProps {
  href: string
  /** Visible title (already translated). */
  title: string
  /** One line under the title (large card only). */
  summary?: string
  /** Photo URL. Without one the card is the dark panel (plus `decoration`). */
  image?: string
  /** Defaults to `"lg"`. The small card shows the title only. */
  size?: "lg" | "sm"
  /**
   * Top-right ornament for a large card without a photo, e.g.
   * `<FacetGrid seed={link.id} />`. Nothing by default.
   */
  decoration?: ReactNode
  /** Called when the card is followed (the owner closes its menu). */
  onClick?: () => void
  /** Re-keys the text so a new preview fades in. Defaults to `href`. */
  previewKey?: string
  /** Client-router link; spread every prop (they keep the card out of the tab order). */
  renderLink?: RenderNavLink
  className?: string
}

/**
 * Preview card for a mega-menu panel: a photo with a scrim, or a dark panel
 * with the title, summary and an optional decoration. One colour in light and
 * dark themes; override it with the `--nav-preview-bg`, `--nav-preview-fg`
 * and `--nav-preview-muted` CSS variables (any CSS colour).
 *
 * It links to the previewed page but is kept out of the tab order and the
 * accessibility tree: the same link must also be in the panel's columns.
 */
export const NavPreviewCard: FC<NavPreviewCardProps> = ({
  href,
  title,
  summary,
  image,
  size = "lg",
  decoration,
  previewKey,
  onClick,
  renderLink,
  className,
}) => {
  const classes = cn(
    "group/preview relative flex flex-col justify-end overflow-hidden rounded-card",
    "bg-[var(--nav-preview-bg,oklch(0.16_0.02_265))] text-[var(--nav-preview-fg,oklch(0.98_0_0))]",
    size === "lg" ? "min-h-[15rem] p-6" : "min-h-[7.5rem] p-5",
    className,
  )

  const children = (
    <>
      {image ? (
        <>
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            width={640}
            height={400}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover/preview:scale-[1.03] motion-reduce:transition-none"
          />
          <span
            data-slot="nav-preview-scrim"
            className="absolute inset-0 [background-image:linear-gradient(to_top,oklch(0.16_0.02_265/0.92)_0%,oklch(0.16_0.02_265/0.2)_70%)]"
          />
        </>
      ) : size === "lg" && decoration ? (
        // The small card has no room beside its title for a decoration.
        <span className="absolute right-5 top-5">{decoration}</span>
      ) : null}

      {/* Keyed so a new preview fades in instead of swapping text in place. */}
      <span
        key={previewKey ?? href}
        className="relative flex flex-col gap-2 animate-in fade-in-0 duration-150 motion-reduce:animate-none"
      >
        <span className={cn("leading-tight tracking-display", size === "lg" ? "text-2xl" : "text-lg")}>{title}</span>
        {summary && size === "lg" ? (
          <span className="line-clamp-3 max-w-[38ch] text-sm leading-body text-[var(--nav-preview-muted,oklch(0.78_0.02_265))]">
            {summary}
          </span>
        ) : null}
      </span>
    </>
  )

  const props = {
    className: classes,
    tabIndex: -1,
    "aria-hidden": true,
    "data-slot": "nav-preview-card",
    onClick,
    children,
  } satisfies NavLinkRenderProps

  return renderLink?.({ href, label: title }, props) ?? <NavAnchor href={href} {...props} />
}
