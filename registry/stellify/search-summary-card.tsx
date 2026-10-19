import { ChevronDown } from "lucide-react"
import { useId, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface SearchSummaryCardProps {
  title: string
  /** One line under the title (date · offer · language…). */
  meta?: ReactNode
  /** Businesses found: the number in the ring. */
  total: number
  /** Businesses with an email: how much of the ring is filled. */
  withEmail: number
  /** Line under the meta, e.g. «9 con email · 4 borradores · 2 contactados». */
  summary?: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Accessible text of the ring; defaults to «9 de 20 con email». */
  ringLabel?: string
  /** The region shown while open. */
  children?: ReactNode
  className?: string
}

const R = 22
const CIRCUMFERENCE = 2 * Math.PI * R

/** Ring whose filled arc is `value / total`, with `total` written in the centre. */
function Ring({ value, total, label }: { value: number; total: number; label: string }) {
  const ratio = total > 0 ? Math.min(value / total, 1) : 0
  return (
    <span data-slot="search-summary-ring" role="img" aria-label={label} className="relative size-13 shrink-0">
      <svg viewBox="0 0 52 52" className="size-13 -rotate-90" aria-hidden>
        <circle cx="26" cy="26" r={R} strokeWidth="5" fill="none" className="stroke-muted" />
        <circle
          cx="26"
          cy="26"
          r={R}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE * ratio} ${CIRCUMFERENCE}`}
          className={cn("stroke-primary", ratio === 0 && "hidden")}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-semibold tabular-nums" aria-hidden>
        {total}
      </span>
    </span>
  )
}

/** Borderless card for a done search: the whole header toggles the region below it (a disclosure
 *  button named by the title; aria-expanded carries the state). */
function SearchSummaryCard({
  title,
  meta,
  total,
  withEmail,
  summary,
  open,
  onOpenChange,
  ringLabel,
  children,
  className,
}: SearchSummaryCardProps) {
  const id = useId()
  const regionId = `${id}-region`
  return (
    <article
      data-slot="search-summary-card"
      data-state={open ? "open" : "closed"}
      aria-labelledby={`${id}-title`}
      className={cn(
        "rounded-[var(--radius-card,var(--radius))] bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-[var(--shadow-card,none)]",
        className
      )}
    >
      {/* The button's ::after covers the whole header, so a click anywhere on it toggles. */}
      <div data-slot="search-summary-header" className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
        <Ring value={withEmail} total={total} label={ringLabel ?? `${withEmail} de ${total} con email`} />
        <div className="min-w-0">
          <h3 data-slot="search-summary-title" id={`${id}-title`} className="font-semibold">
            <button
              data-slot="search-summary-toggle"
              type="button"
              aria-expanded={open}
              aria-controls={regionId}
              onClick={() => onOpenChange(!open)}
              className="text-left after:absolute after:inset-0 after:rounded-[var(--radius-card,var(--radius))] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary/40"
            >
              {title}
            </button>
          </h3>
          {meta && <p className="text-sm text-muted-foreground">{meta}</p>}
          {summary && <p className="mt-1 text-xs text-muted-foreground tabular-nums">{summary}</p>}
        </div>
        <ChevronDown
          aria-hidden
          className={cn("hidden size-5 text-muted-foreground transition-transform duration-200 sm:block", open && "rotate-180")}
        />
      </div>
      {open && (
        <div data-slot="search-summary-region" id={regionId} className="mx-4 border-t border-border pb-1">
          {children}
        </div>
      )}
    </article>
  )
}

export { SearchSummaryCard }
