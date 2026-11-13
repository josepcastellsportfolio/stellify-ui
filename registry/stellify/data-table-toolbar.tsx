import type { ReactNode } from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DataTableToolbarLabels {
  searchPlaceholder: string
  clearSearch: string
  reset: string
}

const DEFAULT_LABELS: DataTableToolbarLabels = {
  searchPlaceholder: "Buscar…",
  clearSearch: "Borrar la búsqueda",
  reset: "Limpiar",
}

export interface DataTableToolbarProps {
  /** Current search text (controlled). */
  search: string
  /** Called as the user types (and with "" when cleared). */
  onSearchChange: (value: string) => void
  /** Slot after the search box: `DataTableAdvancedFilters`, a column toggle… */
  filters?: ReactNode
  /** Show a "Limpiar" button (e.g. when filters or search are active). */
  showReset?: boolean
  onReset?: () => void
  /** Trailing slot, e.g. an "Añadir" button. */
  actions?: ReactNode
  /** Slot under the row, e.g. `DataTableActiveFilters`. */
  children?: ReactNode
  /** Copy. Spanish defaults. */
  labels?: Partial<DataTableToolbarLabels>
  className?: string
}

/**
 * Search + filters row for `data-table`. Presentational: owns no filter
 * state. Drop it into the table's `toolbar` slot.
 */
export default function DataTableToolbar({
  search,
  onSearchChange,
  filters,
  showReset = false,
  onReset,
  actions,
  children,
  labels,
  className,
}: DataTableToolbarProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  return (
    <div data-slot="data-table-toolbar" className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            className="pl-9 [&::-webkit-search-cancel-button]:appearance-none"
            placeholder={l.searchPlaceholder}
            aria-label={l.searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-surface-3 hover:text-foreground"
              onClick={() => onSearchChange("")}
              aria-label={l.clearSearch}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </div>
        {filters}
        {showReset && (
          <Button variant="base" onClick={onReset}>
            {l.reset}
          </Button>
        )}
        {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export { DataTableToolbar }
