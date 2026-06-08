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
  className,
}: DataTableMobileProps<T>) {
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: skeletonCards }).map((_, i) => (
          <Card key={i} className="border-l-4 border-l-primary/30">
            <CardContent className="space-y-2 px-3 pb-2 pt-3">
              {Array.from({ length: 3 }).map((__, j) => (
                <div
                  key={j}
                  className="flex animate-pulse items-center justify-between gap-2"
                >
                  <div className="h-3 w-1/3 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
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
    <div className={cn("space-y-3", className)}>
      {rows.map((row) => (
        <Card key={getRowKey(row)} className="border-l-4 border-l-primary">
          <CardContent className="px-3 pb-2 pt-3">
            {primary && (
              <p className="mb-1 truncate text-sm font-medium">
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
              <div className="mt-1 flex justify-end gap-1 border-t border-border pt-2">
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
