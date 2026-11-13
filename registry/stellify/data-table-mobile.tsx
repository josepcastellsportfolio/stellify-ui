import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DataTableColumn } from "@/components/data-table"

export interface DataTableMobileProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  /** Stable row key extractor. */
  getRowKey: (row: T) => string | number
  /** Per-row trailing actions. */
  actions?: (row: T) => ReactNode
  /** Show loading skeleton cards instead of rows. */
  loading?: boolean
  /** Number of skeleton cards while loading. Defaults to 3. */
  skeletonCards?: number
  /** Rendered when there are no rows and not loading. */
  emptyState?: ReactNode
  /** `list`: one card per row (phones). `grid`: a responsive card grid, for a "cards" view on any screen. */
  layout?: "list" | "grid"
  /** Optional per-card class (e.g. dim rows already read). */
  rowClassName?: (row: T) => string | undefined
  className?: string
}

function cellValue<T>(col: DataTableColumn<T>, row: T): ReactNode {
  return col.render
    ? col.render(row)
    : String((row as Record<string, unknown>)[col.key] ?? "")
}

/**
 * Card-per-row mobile view for the same `columns` used by `data-table`.
 *
 * The first column is shown prominently; the rest become a compact, label-less
 * row of values. Pair with `data-table` behind a breakpoint:
 * `<div className="hidden md:block"><DataTable …/></div>` +
 * `<div className="md:hidden"><DataTableMobile …/></div>`.
 */
export default function DataTableMobile<T>({
  columns,
  rows,
  getRowKey,
  actions,
  loading = false,
  skeletonCards = 3,
  emptyState,
  layout = "list",
  rowClassName,
  className,
}: DataTableMobileProps<T>) {
  const container = layout === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"
  if (loading) {
    return (
      <div className={cn(container, className)}>
        {Array.from({ length: skeletonCards }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-2 px-3 pb-2 pt-3">
              {Array.from({ length: 3 }).map((__, j) => (
                <div
                  key={j}
                  className="flex animate-pulse items-center justify-between gap-2"
                >
                  <div className="h-3 w-1/3 rounded-sm bg-surface-3" />
                  <div className="h-4 w-1/2 rounded-sm bg-surface-3" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return <div className={className}>{emptyState}</div>
  }

  const [primary, ...rest] = columns

  return (
    <div className={cn(container, className)}>
      {rows.map((row) => (
        <Card key={getRowKey(row)} className={cn("flex flex-col transition-colors duration-(--duration-fast) hover:bg-surface-3", rowClassName?.(row))}>
          <CardContent className="flex flex-1 flex-col px-4 pb-2 pt-4">
            {primary && (
              <p className={cn("mb-1 text-sm font-medium", layout === "grid" ? "line-clamp-2" : "truncate")}>
                {cellValue(primary, row)}
              </p>
            )}

            {rest.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {rest.map((col) => (
                  <span key={col.key} className="text-xs text-muted-foreground">
                    {cellValue(col, row)}
                  </span>
                ))}
              </div>
            )}

            {actions && (
              <div className="mt-auto flex justify-end gap-1 border-t pt-2">
                {actions(row)}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export { DataTableMobile }
