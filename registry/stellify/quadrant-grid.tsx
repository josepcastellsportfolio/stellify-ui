import { Children, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface QuadrantGridProps {
  /** Column headers, left to right. */
  columns: [ReactNode, ReactNode]
  /** Row labels, top to bottom (rendered vertically). */
  rows: [ReactNode, ReactNode]
  /** Exactly four cells in reading order: row 1 left, row 1 right, row 2 left, row 2 right. */
  children: ReactNode
  "aria-label"?: string
  className?: string
}

const header =
  "rounded-md bg-muted/60 px-3 py-2 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground"
const rowLabel =
  "flex items-center justify-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground [writing-mode:vertical-rl] rotate-180"

/** 2×2 grid with column headers and vertical row labels. */
function QuadrantGrid({ columns, rows, children, className, ...aria }: QuadrantGridProps) {
  const cells = Children.toArray(children)
  if (cells.length !== 4) {
    throw new Error(`QuadrantGrid needs exactly 4 cells, got ${cells.length}`)
  }
  return (
    <div
      role="group"
      data-slot="quadrant-grid"
      className={cn("grid grid-cols-[2rem_1fr_1fr] gap-3", className)}
      {...aria}
    >
      <span />
      <div className={header}>{columns[0]}</div>
      <div className={header}>{columns[1]}</div>
      <div className={rowLabel}>{rows[0]}</div>
      {cells[0]}
      {cells[1]}
      <div className={rowLabel}>{rows[1]}</div>
      {cells[2]}
      {cells[3]}
    </div>
  )
}

export { QuadrantGrid }
