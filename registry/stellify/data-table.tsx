import type { ReactNode } from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  /** Stable key; also used as the sort field. */
  key: string
  /** Column header label. */
  header: string
  /** Cell renderer. Defaults to `String(row[key])`. */
  render?: (row: T) => ReactNode
  /** Enable click-to-sort on this column. */
  sortable?: boolean
  /** Text alignment. Defaults to "left". */
  align?: "left" | "right" | "center"
  /** Responsive visibility class, e.g. "hidden sm:table-cell". */
  hidden?: string
  className?: string
}

export interface DataTableSort {
  key: string
  dir: "asc" | "desc"
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  /** Stable row key extractor. */
  getRowKey: (row: T) => string | number
  /** Current sort state (controlled). */
  sort?: DataTableSort | null
  /** Called with the clicked column key; you compute the next sort. */
  onSortChange?: (key: string) => void
  /** Per-row trailing actions cell. */
  actions?: (row: T) => ReactNode
  /** Optional per-row class. */
  rowClassName?: (row: T) => string
  /** Show the loading skeleton instead of rows. */
  loading?: boolean
  /** Number of skeleton rows while loading. Defaults to 5. */
  skeletonRows?: number
  /** Rendered when there are no rows and not loading. */
  emptyState?: ReactNode
  /** Slot above the table (search, filters). */
  toolbar?: ReactNode
  /** Slot below the table (pagination). */
  footer?: ReactNode
  className?: string
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const

/**
 * Presentational, controlled data table.
 *
 * Deliberately does NOT fetch, paginate or debounce — that logic lives in the
 * consumer (e.g. a `useDataGrid`-style hook). Pass `rows`, react to
 * `onSortChange`, and drop your search/filters into `toolbar` and your
 * pagination into `footer`. This keeps the table reusable across very
 * different data sources.
 */
export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  sort,
  onSortChange,
  actions,
  rowClassName,
  loading = false,
  skeletonRows = 5,
  emptyState,
  toolbar,
  footer,
  className,
}: DataTableProps<T>) {
  const colCount = columns.length + (actions ? 1 : 0)

  return (
    <div className={cn("space-y-3", className)}>
      {toolbar}

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const isSorted = sort?.key === col.key
                return (
                  <TableHead
                    key={col.key}
                    className={cn(
                      alignClass[col.align ?? "left"],
                      col.hidden,
                      col.sortable && "cursor-pointer select-none",
                      col.className
                    )}
                    onClick={
                      col.sortable
                        ? () => onSortChange?.(col.key)
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable &&
                        (isSorted ? (
                          sort?.dir === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                        ))}
                    </span>
                  </TableHead>
                )
              })}
              {actions && (
                <TableHead className="w-0 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {Array.from({ length: colCount }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount} className="h-32 p-0">
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  className={rowClassName?.(row)}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        alignClass[col.align ?? "left"],
                        col.hidden,
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : String(
                            (row as Record<string, unknown>)[col.key] ?? ""
                          )}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {footer}
    </div>
  )
}

export { DataTable }
