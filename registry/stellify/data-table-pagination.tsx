import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface DataTablePaginationProps {
  /** Total number of rows across all pages. */
  total: number
  /** Current page (1-based). */
  page: number
  /** Current page size. */
  pageSize: number
  /** Called with the requested page. */
  onPageChange: (page: number) => void
  /** Called with the requested page size; omit to hide the size selector. */
  onPageSizeChange?: (size: number) => void
  /** Page size options. Defaults to [10, 25, 50, 100]. */
  pageSizeOptions?: number[]
  /** Label before the size selector. Defaults to "Rows per page". */
  rowsPerPageLabel?: string
  /** Label before the total count. Defaults to "of". */
  ofLabel?: string
  /** Previous-button label. Defaults to "Previous". */
  previousLabel?: string
  /** Next-button label. Defaults to "Next". */
  nextLabel?: string
  className?: string
}

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100]

/**
 * Controlled pagination footer for `data-table`.
 *
 * Presentational: it reflects `page`/`pageSize`/`total` and emits change
 * intents — paging logic stays in the consumer. All copy is passed via props
 * (English defaults). Drop into the table's `footer` slot.
 */
export default function DataTablePagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  rowsPerPageLabel = "Rows per page",
  ofLabel = "of",
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 pt-2 text-sm text-muted-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0">{rowsPerPageLabel}</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange?.(Number(v))}
          disabled={!onPageSizeChange}
        >
          <SelectTrigger className="h-8 w-[70px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)} className="text-xs">
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="shrink-0">
          {ofLabel} {total}
        </span>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {previousLabel}
          </Button>

          <span className="px-2">
            {page} / {totalPages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            {nextLabel}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export { DataTablePagination }
