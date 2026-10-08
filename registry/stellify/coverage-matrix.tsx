import { cn } from "@/lib/utils"

export type CoverageState = "done" | "planned" | "empty"

export interface CoverageAxisItem {
  key: string
  label: string
  /** Small line under a column header, e.g. the language of a zone. */
  hint?: string
}

export interface CoverageCell {
  state: CoverageState
  /** Text inside the cell ("Hecha 29/09", "Día 2"). Empty cells show "+" by default. */
  label?: string
  /** Extra words for screen readers ("hecha el 29/09/2026"). */
  description?: string
}

export interface CoverageMatrixProps {
  rows: CoverageAxisItem[]
  columns: CoverageAxisItem[]
  /** The cell at (row, column); undefined = empty. */
  getCell: (rowKey: string, columnKey: string) => CoverageCell | undefined
  /** Cells that do not match the active filters are faded, never hidden. */
  isDimmed?: (rowKey: string, columnKey: string) => boolean
  selected?: { row: string; column: string } | null
  onCellClick?: (rowKey: string, columnKey: string, state: CoverageState) => void
  /** Header of the row labels column (visually hidden). */
  rowHeader?: string
  stateLabels?: Record<CoverageState, string>
  /** Accessible action per state, appended to the cell's name ("Filtrar", "Añadir al plan"). */
  actionLabels?: Partial<Record<CoverageState, string>>
  /**
   * Accessible name of a cell, before its description and action. Defaults to
   * Spanish: "<row> en <column>: <state>".
   */
  cellLabel?: (row: string, column: string, state: string) => string
  /** Accessible name of the legend list. Defaults to "Leyenda". */
  legendLabel?: string
  "aria-label"?: string
  className?: string
}

const DEFAULT_STATE_LABELS: Record<CoverageState, string> = {
  done: "Hecha",
  planned: "En el plan",
  empty: "Sin tocar",
}

const defaultCellLabel = (row: string, column: string, state: string) =>
  `${row} en ${column}: ${state.toLowerCase()}`

const CELL_CLASS: Record<CoverageState, string> = {
  done: "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
  planned: "border-primary/50 bg-accent text-accent-foreground hover:border-primary",
  empty: "border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground",
}

const SWATCH_CLASS: Record<CoverageState, string> = {
  done: "border-primary bg-primary",
  planned: "border-primary/50 bg-accent",
  empty: "border-dashed border-border",
}

/** Rows × columns of three-state cells (done / planned / untouched): where you have already
 * been and what is next. Scrolls sideways on narrow screens with the row labels pinned.
 *
 * `getCell` runs once per cell on every render: back it with a Map (or an
 * object keyed by "row|column") built in a `useMemo`, not an array `find`. */
function CoverageMatrix({
  rows,
  columns,
  getCell,
  isDimmed,
  selected,
  onCellClick,
  rowHeader = "Fila",
  stateLabels = DEFAULT_STATE_LABELS,
  actionLabels,
  cellLabel = defaultCellLabel,
  legendLabel = "Leyenda",
  "aria-label": ariaLabel,
  className,
}: CoverageMatrixProps) {
  return (
    <div data-slot="coverage-matrix" className={cn("space-y-3", className)}>
      <div className="overflow-x-auto">
        <table aria-label={ariaLabel} className="w-full border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-background">
                <span className="sr-only">{rowHeader}</span>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="min-w-24 px-1 pb-1 text-center align-bottom text-xs font-semibold text-muted-foreground"
                >
                  <span className="block whitespace-nowrap">{col.label}</span>
                  {col.hint && <span className="block text-[11px] font-normal">{col.hint}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 whitespace-nowrap bg-background pr-3 text-left font-medium text-foreground"
                >
                  {row.label}
                </th>
                {columns.map((col) => {
                  const cell = getCell(row.key, col.key) ?? { state: "empty" as const }
                  const dimmed = isDimmed?.(row.key, col.key) ?? false
                  const isSelected = selected?.row === row.key && selected?.column === col.key
                  const name = [
                    cellLabel(row.label, col.label, stateLabels[cell.state]),
                    cell.description,
                    actionLabels?.[cell.state],
                  ]
                    .filter(Boolean)
                    .join(". ")
                  return (
                    <td key={col.key} className="p-0">
                      <button
                        type="button"
                        data-state={cell.state}
                        data-dimmed={dimmed || undefined}
                        aria-pressed={isSelected}
                        aria-label={name}
                        onClick={() => onCellClick?.(row.key, col.key, cell.state)}
                        className={cn(
                          "flex min-h-11 w-full items-center justify-center rounded-md border px-1 py-1 text-center text-xs font-semibold leading-tight transition-[opacity,colors] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          CELL_CLASS[cell.state],
                          dimmed && "opacity-30",
                          isSelected && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        )}
                      >
                        {cell.label ?? (cell.state === "empty" ? "+" : stateLabels[cell.state])}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-wrap gap-4 text-xs text-muted-foreground" aria-label={legendLabel}>
        {(Object.keys(SWATCH_CLASS) as CoverageState[]).map((state) => (
          <li key={state} className="inline-flex items-center gap-2">
            <span aria-hidden className={cn("inline-block size-3.5 rounded border", SWATCH_CLASS[state])} />
            {stateLabels[state]}
          </li>
        ))}
      </ul>
    </div>
  )
}

export { CoverageMatrix }
