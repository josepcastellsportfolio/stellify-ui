import type { ReactNode } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DataTableToolbarProps {
  /** Current search text (controlled). */
  search: string
  /** Called as the user types (and with "" when cleared). */
  onSearchChange: (value: string) => void
  /** Placeholder for the search box. Defaults to "Search…". */
  searchPlaceholder?: string
  /** Show a filters toggle button. */
  showFilterToggle?: boolean
  /** Whether the filter panel is currently open (controls the toggle style). */
  filtersOpen?: boolean
  /** Called when the filters toggle is clicked. */
  onToggleFilters?: () => void
  /** Show a "clear" button (e.g. when filters/search are active). */
  showReset?: boolean
  /** Called when reset is clicked. */
  onReset?: () => void
  /** Reset button label. Defaults to "Clear". */
  resetLabel?: string
  /** Trailing slot, e.g. an "Add" button. */
  actions?: ReactNode
  /** aria-label for the clear-search button. Defaults to "Clear search". */
  clearSearchLabel?: string
  className?: string
}

/**
 * Search + filters toolbar for `data-table`.
 *
 * Presentational: owns no filter state. Wire `search`/`onSearchChange`, and use
 * the `filtersOpen` + `onToggleFilters` pair to drive your own filter panel
 * (render it yourself below the table). Drop into the table's `toolbar` slot.
 * Copy is passed via props (English defaults).
 */
export default function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  showFilterToggle = false,
  filtersOpen = false,
  onToggleFilters,
  showReset = false,
  onReset,
  resetLabel = "Clear",
  actions,
  clearSearchLabel = "Clear search",
  className,
}: DataTableToolbarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 pl-9 text-sm"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => onSearchChange("")}
            aria-label={clearSearchLabel}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showFilterToggle && (
        <Button
          variant={filtersOpen ? "primary" : "secondary"}
          size="icon"
          onClick={onToggleFilters}
          aria-pressed={filtersOpen}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      )}

      {showReset && (
        <Button variant="base" size="sm" onClick={onReset}>
          {resetLabel}
        </Button>
      )}

      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}

export { DataTableToolbar }
