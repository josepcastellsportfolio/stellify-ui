import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface HeatMatrixAxisItem {
  key: string
  /** Plain text: shown in the header and used in each cell's accessible name. */
  label: string
  /** Small line under the label (e.g. "12 de 16 pasan"). */
  hint?: ReactNode
  /** Inline tag after a row label (e.g. a "candidata" badge). */
  tag?: ReactNode
}

export interface HeatMatrixCell {
  /** Drives the colour, scaled between the matrix's `min` and `max`. */
  value: number
  /** Cells outside the set that matters (e.g. not passing): grey and dashed, never coloured. */
  muted?: boolean
  /** Big figure in the cell. Defaults to `value`. */
  label?: ReactNode
  /** Small lines under the figure: badges, hints. Keep them short. */
  children?: ReactNode
  /** Words for screen readers, appended to "row, column:" ("total 21, nivel 1"). */
  description?: string
}

export interface HeatMatrixLegend {
  /** Text at the light end of the scale (e.g. "15"). */
  low: string
  /** Text at the dark end of the scale (e.g. "25"). */
  high: string
  /** What a muted cell means (e.g. "No pasa"). Hidden when omitted. */
  muted?: string
  /** Accessible name of the legend list (e.g. "Leyenda"). */
  label: string
}

export interface HeatMatrixProps {
  rows: HeatMatrixAxisItem[]
  columns: HeatMatrixAxisItem[]
  /** The cell at (row, column); undefined = no data there. */
  getCell: (rowKey: string, columnKey: string) => HeatMatrixCell | undefined
  /** Value of the lightest colour step. */
  min: number
  /** Value of the darkest colour step. */
  max: number
  selected?: { row: string; column: string } | null
  /** Makes each cell a button. Without it the matrix is read-only. */
  onCellClick?: (rowKey: string, columnKey: string) => void
  /** Accessible action appended to each cell's name (e.g. "Ver detalle"). */
  actionLabel?: string
  /** Header of the row labels column (visually hidden). */
  rowHeader: string
  /** Text of a cell without data (e.g. "Sin datos"). */
  emptyLabel: string
  legend?: HeatMatrixLegend
  "aria-label"?: string
  className?: string
}

/** Five colour steps, light to dark. Text stays dark until the solid step for contrast. */
const STEP_CLASS = [
  "border-primary/15 bg-primary/10 text-foreground",
  "border-primary/25 bg-primary/25 text-foreground",
  "border-primary/35 bg-primary/40 text-foreground",
  "border-primary/50 bg-primary/60 text-foreground",
  "border-primary bg-primary text-primary-foreground",
] as const

const MUTED_CLASS = "border-dashed border-border bg-muted/40 text-muted-foreground"

/** Index (0–4) of the colour step for `value` between `min` and `max`. */
export function heatStep(value: number, min: number, max: number): number {
  if (max <= min) return STEP_CLASS.length - 1
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)))
  return Math.round(t * (STEP_CLASS.length - 1))
}

/**
 * Rows × columns heat map: each cell is coloured by its value and can carry a figure and a
 * couple of short lines (badges, hints). Muted cells drop out of the scale. Scrolls sideways on
 * narrow screens with the row labels pinned. All copy comes in via props.
 */
function HeatMatrix({
  rows,
  columns,
  getCell,
  min,
  max,
  selected,
  onCellClick,
  actionLabel,
  rowHeader,
  emptyLabel,
  legend,
  "aria-label": ariaLabel,
  className,
}: HeatMatrixProps) {
  return (
    <div data-slot="heat-matrix" className={cn("space-y-3", className)}>
      <div data-slot="heat-matrix-scroll" className="overflow-x-auto">
        <table data-slot="heat-matrix-table" aria-label={ariaLabel} className="w-full border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-background">
                <span className="sr-only">{rowHeader}</span>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  data-slot="heat-matrix-column-header"
                  scope="col"
                  className="min-w-24 px-1 pb-1 text-center align-bottom text-xs font-semibold text-muted-foreground"
                >
                  <span className="block">{col.label}</span>
                  {col.hint && <span className="block text-[11px] font-normal tabular-nums">{col.hint}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th
                  data-slot="heat-matrix-row-header"
                  scope="row"
                  className="sticky left-0 z-10 bg-background pr-3 text-left align-middle font-medium text-foreground"
                >
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span>{row.label}</span>
                    {row.tag}
                  </span>
                  {row.hint && <span className="block text-xs font-normal text-muted-foreground">{row.hint}</span>}
                </th>
                {columns.map((col) => (
                  <td key={col.key} className="p-0 align-top">
                    <MatrixCell
                      cell={getCell(row.key, col.key)}
                      name={`${row.label}, ${col.label}`}
                      min={min}
                      max={max}
                      isSelected={selected?.row === row.key && selected?.column === col.key}
                      onClick={onCellClick ? () => onCellClick(row.key, col.key) : undefined}
                      actionLabel={actionLabel}
                      emptyLabel={emptyLabel}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {legend && <Legend legend={legend} />}
    </div>
  )
}

function MatrixCell({
  cell,
  name,
  min,
  max,
  isSelected,
  onClick,
  actionLabel,
  emptyLabel,
}: {
  cell: HeatMatrixCell | undefined
  name: string
  min: number
  max: number
  isSelected: boolean
  onClick?: () => void
  actionLabel?: string
  emptyLabel: string
}) {
  const base =
    "flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-md border px-1.5 py-2 text-center leading-tight"
  if (!cell) {
    return (
      <div data-slot="heat-matrix-cell" data-empty className={cn(base, "border-dashed border-border text-xs text-muted-foreground")}>
        {emptyLabel}
      </div>
    )
  }
  const step = cell.muted ? undefined : heatStep(cell.value, min, max)
  const className = cn(
    base,
    step === undefined ? MUTED_CLASS : STEP_CLASS[step],
    isSelected && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
  )
  const content = (
    <>
      <span className="text-lg font-semibold tabular-nums">{cell.label ?? cell.value}</span>
      {cell.children && <span className="flex flex-col items-center gap-0.5 text-[11px] font-medium">{cell.children}</span>}
    </>
  )
  const dataProps = { "data-slot": "heat-matrix-cell", "data-step": step, "data-muted": cell.muted || undefined }
  if (!onClick) {
    return (
      <div className={className} {...dataProps}>
        {content}
      </div>
    )
  }
  return (
    <button
      type="button"
      {...dataProps}
      aria-pressed={isSelected}
      aria-label={[`${name}: ${cell.description ?? cell.value}`, actionLabel].filter(Boolean).join(". ")}
      onClick={onClick}
      className={cn(
        className,
        "transition-[box-shadow,border-color] hover:border-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      {content}
    </button>
  )
}

function Legend({ legend }: { legend: HeatMatrixLegend }) {
  return (
    <ul data-slot="heat-matrix-legend" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground" aria-label={legend.label}>
      <li className="inline-flex items-center gap-2">
        <span>{legend.low}</span>
        <span aria-hidden className="inline-flex gap-0.5">
          {STEP_CLASS.map((cls) => (
            <span key={cls} className={cn("inline-block size-3.5 rounded border", cls)} />
          ))}
        </span>
        <span>{legend.high}</span>
      </li>
      {legend.muted && (
        <li className="inline-flex items-center gap-2">
          <span aria-hidden className={cn("inline-block size-3.5 rounded border", MUTED_CLASS)} />
          {legend.muted}
        </li>
      )}
    </ul>
  )
}

export { HeatMatrix }
