import * as React from "react"

import { cn } from "@/lib/utils"

export interface StackedTimelineSeries {
  key: string
  label: string
  /** Any CSS color, e.g. "var(--chart-1)". */
  color: string
  /**
   * false: drawn as a separate thin bar next to the stack, never stacked with the rest and
   * never compared with the cap line (e.g. hours of work next to money spend).
   */
  countsTowardsCap?: boolean
}

export interface StackedTimelineDatum {
  /** Short axis label, e.g. "29/09" or "sep". */
  label: string
  /** Longer label for the accessible table, e.g. "29/09/2026". Defaults to `label`. */
  fullLabel?: string
  values: Record<string, number>
}

export interface StackedTimelineProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  series: StackedTimelineSeries[]
  data: StackedTimelineDatum[]
  /** Horizontal reference line (e.g. the cap at the bucket's pace). Omit for none. */
  capLine?: number | null
  capLabel?: string
  /** Formats amounts for the tooltip and the accessible table. */
  formatValue?: (value: number) => string
  /** Accessible name of the chart and its table. */
  title: string
  /** Chart height in px. */
  height?: number
  emptyLabel?: React.ReactNode
}

const W = 100 // viewBox width in "percent" units; bars are laid out proportionally

/**
 * Stacked bars per bucket (plain SVG, no chart library) with an optional cap line. Series with
 * `countsTowardsCap: false` get their own thin bar beside the stack. A visually hidden table
 * carries every figure for screen readers.
 */
function StackedTimeline({
  series,
  data,
  capLine,
  capLabel = "Tope",
  formatValue = (v) => v.toFixed(2),
  title,
  height = 180,
  emptyLabel = "Sin datos en este periodo",
  className,
  ...props
}: StackedTimelineProps) {
  const stacked = series.filter((s) => s.countsTowardsCap !== false)
  const apart = series.filter((s) => s.countsTowardsCap === false)
  const sum = (d: StackedTimelineDatum, list: StackedTimelineSeries[]) =>
    list.reduce((acc, s) => acc + Math.max(0, d.values[s.key] ?? 0), 0)
  const max = Math.max(
    capLine ?? 0,
    ...data.map((d) => sum(d, stacked)),
    ...data.flatMap((d) => apart.map((s) => d.values[s.key] ?? 0)),
    0
  )
  const scale = (v: number) => (max > 0 ? (v / max) * height : 0)
  const slot = data.length ? W / data.length : W
  const barW = slot * (apart.length ? 0.55 : 0.7)
  const sideW = slot * 0.15

  return (
    <div data-slot="stacked-timeline" className={cn("flex flex-col gap-2", className)} {...props}>
      {data.length === 0 ? (
        <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height }}>
          {emptyLabel}
        </div>
      ) : (
        <svg
          role="img"
          aria-label={title}
          viewBox={`0 0 ${W} ${height}`}
          preserveAspectRatio="none"
          className="w-full overflow-visible"
          style={{ height }}
        >
          {data.map((d, i) => {
            const x = i * slot + (slot - barW - (apart.length ? sideW : 0)) / 2
            let y = height
            return (
              <g key={i}>
                <title>{`${d.fullLabel ?? d.label}: ${series
                  .map((s) => `${s.label} ${formatValue(d.values[s.key] ?? 0)}`)
                  .join(", ")}`}</title>
                {stacked.map((s) => {
                  const h = scale(Math.max(0, d.values[s.key] ?? 0))
                  y -= h
                  return h > 0 ? <rect key={s.key} x={x} y={y} width={barW} height={h} fill={s.color} /> : null
                })}
                {apart.map((s, j) => {
                  const h = scale(Math.max(0, d.values[s.key] ?? 0))
                  return h > 0 ? (
                    <rect
                      key={s.key}
                      x={x + barW + j * sideW}
                      y={height - h}
                      width={sideW * 0.8}
                      height={h}
                      fill={s.color}
                      opacity={0.6}
                    />
                  ) : null
                })}
              </g>
            )
          })}
          {capLine != null && capLine > 0 && (
            <line
              data-testid="cap-line"
              x1={0}
              x2={W}
              y1={height - scale(capLine)}
              y2={height - scale(capLine)}
              stroke="var(--destructive)"
              strokeDasharray="2 1.5"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      )}
      {data.length > 0 && (
        <div className="flex justify-between gap-1 text-[10px] text-muted-foreground" aria-hidden>
          {data.map((d, i) => (
            <span
              key={i}
              className="flex-1 truncate text-center"
              // Many buckets (a month by day): label every few so they stay legible.
              style={{ visibility: data.length > 12 && i % Math.ceil(data.length / 10) !== 0 ? "hidden" : undefined }}
            >
              {d.label}
            </span>
          ))}
        </div>
      )}
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden>
        {series.map((s) => (
          <li key={s.key} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: s.color, opacity: s.countsTowardsCap === false ? 0.6 : 1 }} />
            {s.label}
            {s.countsTowardsCap === false && " (no cuenta para el tope)"}
          </li>
        ))}
        {capLine != null && capLine > 0 && (
          <li className="inline-flex items-center gap-1.5">
            <span className="h-0 w-3 border-t border-dashed border-destructive" />
            {capLabel}
          </li>
        )}
      </ul>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Periodo</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <th scope="row">{d.fullLabel ?? d.label}</th>
              {series.map((s) => (
                <td key={s.key}>{formatValue(d.values[s.key] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
        {capLine != null && capLine > 0 && (
          <tfoot>
            <tr>
              <th scope="row">{capLabel}</th>
              <td colSpan={series.length}>{formatValue(capLine)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

export default StackedTimeline
export { StackedTimeline }
