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
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnFilter } from "@/components/data-table-column-filter"
import { defaultFilterValue, type ActiveFilters, type ActiveFilterValue, type FilterDef } from "@/lib/data-table-filters"
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
  /** Makes the column filterable: a filter button in its header (and in the advanced panel). */
  filter?: FilterDef
  className?: string
}

export type RowKey = string | number

export interface DataTableLabels {
  /** Name of the select-all checkbox. */
  selectAll: string
  /** Name of a row checkbox. */
  selectRow: string
  /** "3 seleccionadas" in the bulk bar. */
  selected: (count: number) => string
  /** Button that clears the selection. */
  clearSelection: string
}

const DEFAULT_LABELS: DataTableLabels = {
  selectAll: "Seleccionar todas las filas",
  selectRow: "Seleccionar fila",
  selected: (n) => (n === 1 ? "1 seleccionada" : `${n} seleccionadas`),
  clearSelection: "Deseleccionar",
}

export interface DataTableSort {
  key: string
  dir: "asc" | "desc"
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  /** Stable row key extractor. */
  getRowKey: (row: T) => RowKey
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
  /** Slot below the table (pagination). Renders inside the frame. */
  footer?: ReactNode
  /** Active column filters (controlled). Needed for header filter buttons. */
  filters?: ActiveFilters
  /** Called when a header filter changes. */
  onFilterChange?: (key: string, value: ActiveFilterValue) => void
  /** Selected row keys (controlled). Passing it adds the checkbox column. */
  selectedKeys?: ReadonlySet<RowKey>
  onSelectedKeysChange?: (keys: Set<RowKey>) => void
  /** Bulk actions for the selection, shown in a bar above the rows while any are selected. */
  bulkActions?: (keys: Set<RowKey>) => ReactNode
  /** Copy. Spanish defaults. */
  labels?: Partial<DataTableLabels>
  className?: string
}

// Right-aligned columns are figures: Geist Mono with tabular digits so they line up.
const alignClass = {
  left: "text-left",
  right: "text-right font-mono tabular-nums",
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
  filters,
  onFilterChange,
  selectedKeys,
  onSelectedKeysChange,
  bulkActions,
  labels,
  className,
}: DataTableProps<T>) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const selectable = selectedKeys !== undefined
  const colCount = columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)

  const pageKeys = rows.map(getRowKey)
  const selectedOnPage = selectable ? pageKeys.filter((k) => selectedKeys.has(k)).length : 0
  const allOnPage = pageKeys.length > 0 && selectedOnPage === pageKeys.length
  const someOnPage = selectedOnPage > 0 && !allOnPage

  const toggleAll = () => {
    if (!selectedKeys) return
    const next = new Set(selectedKeys)
    for (const k of pageKeys) (allOnPage ? next.delete(k) : next.add(k))
    onSelectedKeysChange?.(next)
  }
  const toggleRow = (key: RowKey) => {
    if (!selectedKeys) return
    const next = new Set(selectedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSelectedKeysChange?.(next)
  }
  const selectionCount = selectedKeys?.size ?? 0

  return (
    <div data-slot="data-table" className={cn("space-y-3", className)}>
      {toolbar}

      <div data-slot="data-table-frame" className="overflow-hidden rounded-lg border bg-background">
        {bulkActions && selectionCount > 0 && (
          <div
            data-slot="data-table-bulk-bar"
            className="flex flex-wrap items-center gap-3 border-b bg-brand-subtle px-3 py-2 text-sm text-brand [--field:var(--surface-1)]"
          >
            <span className="font-mono text-xs tabular-nums">{l.selected(selectionCount)}</span>
            <div className="flex flex-wrap items-center gap-2">{bulkActions(new Set(selectedKeys))}</div>
            <button
              type="button"
              onClick={() => onSelectedKeysChange?.(new Set())}
              className="ml-auto text-xs underline-offset-4 hover:underline"
            >
              {l.clearSelection}
            </button>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-10 pr-0">
                  <Checkbox
                    checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                    aria-label={l.selectAll}
                    disabled={rows.length === 0}
                  />
                </TableHead>
              )}
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
                    <span className={cn("inline-flex items-center gap-0.5", col.align === "right" && "flex-row-reverse")}>
                    {col.sortable ? (
                      <button
                        type="button"
                        data-slot="data-table-sort"
                        className="-mx-1 inline-flex items-center gap-1 rounded-sm px-1 uppercase transition-colors duration-(--duration-fast) hover:text-foreground"
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
                    {col.filter && filters && onFilterChange && (
                      <span onClick={(e) => e.stopPropagation()}>
                        <DataTableColumnFilter
                          columnKey={col.key}
                          header={col.header}
                          def={col.filter}
                          value={filters[col.key] ?? defaultFilterValue(col.filter)}
                          onChange={onFilterChange}
                        />
                      </span>
                    )}
                    </span>
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
                      <div className="h-4 w-full animate-pulse rounded-sm bg-surface-3" />
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
              rows.map((row) => {
                const key = getRowKey(row)
                const isSelected = selectable && selectedKeys.has(key)
                return (
                <TableRow
                  key={key}
                  data-state={isSelected ? "selected" : undefined}
                  className={rowClassName?.(row)}
                >
                  {selectable && (
                    <TableCell className="w-10 pr-0">
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleRow(key)} aria-label={l.selectRow} />
                    </TableCell>
                  )}
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
                )
              })
            )}
          </TableBody>
        </Table>
        {footer && (
          <div data-slot="data-table-footer" className="border-t bg-surface-2 px-3 py-2 [--field-hover:color-mix(in_oklch,var(--surface-3)_85%,var(--foreground))] [--field:var(--surface-3)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export { DataTable }
