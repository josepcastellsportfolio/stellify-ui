import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface DataTablePaginationLabels {
  rowsPerPage: string
  /** "1–10 de 42". */
  range: (from: number, to: number, total: number) => string
  previous: string
  next: string
  /** Name of a page button. */
  page: (n: number) => string
  /** Name of the page list. */
  pages: string
}

const fmt = (n: number) => n.toLocaleString("es-ES")

const DEFAULT_LABELS: DataTablePaginationLabels = {
  rowsPerPage: "Filas por página",
  range: (from, to, total) => (total === 0 ? "0 de 0" : `${fmt(from)}–${fmt(to)} de ${fmt(total)}`),
  previous: "Anterior",
  next: "Siguiente",
  page: (n) => `Página ${n}`,
  pages: "Paginación",
}

export interface DataTablePaginationProps {
  /** Total number of rows across all pages. */
  total: number
  /** Current page (1-based). */
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  /** Omit to hide the size selector. */
  onPageSizeChange?: (size: number) => void
  /** Defaults to [10, 25, 50, 100]. */
  pageSizeOptions?: number[]
  /** Copy. Spanish defaults. */
  labels?: Partial<DataTablePaginationLabels>
  className?: string
}

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100]

/** Up to 7 slots: first, last, current ±1, with gaps. */
function pageList(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const out: (number | "gap")[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  if (start > 2) out.push("gap")
  for (let i = start; i <= end; i++) out.push(i)
  if (end < totalPages - 1) out.push("gap")
  out.push(totalPages)
  return out
}

/**
 * Controlled pagination for `data-table`'s `footer` slot: rows per page, the
 * visible range, and numbered pages. Paging logic stays in the consumer.
 */
export default function DataTablePagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  labels,
  className,
}: DataTablePaginationProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div
      data-slot="data-table-pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground", className)}
    >
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="hidden shrink-0 sm:inline">{l.rowsPerPage}</span>
            <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
              <SelectTrigger className="h-8 w-[72px] font-mono text-xs tabular-nums" aria-label={l.rowsPerPage}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)} className="font-mono text-xs tabular-nums">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <span className="font-mono text-xs tabular-nums" aria-live="polite">
          {l.range(from, to, total)}
        </span>
      </div>

      {totalPages > 1 && (
        <nav aria-label={l.pages} className="flex items-center gap-1">
          <Button
            variant="base"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label={l.previous}
            className="px-2"
          >
            <ChevronLeft aria-hidden />
          </Button>
          {pageList(page, totalPages).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="w-6 text-center" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={l.page(p)}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "h-8 min-w-8 rounded-md px-2 font-mono text-xs tabular-nums transition-colors duration-(--duration-fast)",
                  p === page ? "bg-foreground text-background" : "hover:bg-surface-3 hover:text-foreground"
                )}
              >
                {p}
              </button>
            )
          )}
          <Button
            variant="base"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label={l.next}
            className="px-2"
          >
            <ChevronRight aria-hidden />
          </Button>
        </nav>
      )}
    </div>
  )
}

export { DataTablePagination }
