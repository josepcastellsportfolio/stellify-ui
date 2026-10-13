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
  /**
   * Visually hidden header of the actions column, read by screen readers
   * (e.g. "Acciones"). No default: the consumer owns the copy.
   */
  actionsLabel?: string
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
  actionsLabel,
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
    <div data-slot="data-table" className={cn("space-y-3", className)}>
      {toolbar}

      <div className="rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const isSorted = sort?.key === col.key
                return (
                  <TableHead
                    key={col.key}
                    aria-sort={
                      col.sortable
                        ? isSorted
                          ? sort?.dir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                        : undefined
                    }
                    className={cn(
                      alignClass[col.align ?? "left"],
                      col.hidden,
                      col.sortable && "cursor-pointer select-none",
                      col.className
                    )}
                    // The click is delegated to the whole header cell (larger
                    // hit area); the inner <button> is the focusable control,
                    // and Enter/Space on it bubble a click up to here.
                    onClick={
                      col.sortable
                        ? () => onSortChange?.(col.key)
                        : undefined
                    }
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        data-slot="data-table-sort"
                        className="-mx-1 inline-flex items-center gap-1 rounded-sm px-1 font-medium outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {col.header}
                        {isSorted ? (
                          sort?.dir === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                          )
                        ) : (
                          <ChevronsUpDown
                            className="h-3.5 w-3.5 text-muted-foreground/50"
                            aria-hidden
                          />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                )
              })}
              {actions && (
                <TableHead className="w-0 text-right">
                  {actionsLabel && (
                    <span className="sr-only">{actionsLabel}</span>
                  )}
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
