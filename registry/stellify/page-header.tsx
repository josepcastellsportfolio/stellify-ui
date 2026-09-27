import type { FC, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  /** Small uppercase line above the title (e.g. "C3 · Búsqueda activa · Tiempo"). */
  eyebrow?: string
  /** Page title. */
  title: string
  /** Optional supporting text under the title. */
  description?: string
  /** Slot on the right for actions (buttons, selectors, etc.). */
  actions?: ReactNode
  /** Optional content rendered below the title row (e.g. tabs, breadcrumbs). */
  children?: ReactNode
  className?: string
}

/**
 * Standard page heading: title + optional description on the left, actions on
 * the right, with an optional row below for tabs/breadcrumbs.
 *
 * Presentational only. The app's real header logic (auth menu, theme/locale
 * switchers, navigation) stays in the consumer — this is just the title block.
 */
const PageHeader: FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}) => (
  <div data-slot="page-header" className={cn("mb-6 flex flex-col gap-4", className)}>
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
    {children}
  </div>
)

export default PageHeader
export { PageHeader }
