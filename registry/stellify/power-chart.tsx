"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartReferenceLine,
  ChartTooltip,
  ChartTooltipContent,
  type ChartThresholdColor,
  getThresholdColor,
} from "@/components/ui/chart"
import ChartCard from "@/components/ui/chart-card"
import {
  TimeRangeSelector,
  type TimeRange,
  getRangeBounds,
} from "@/components/ui/time-range-selector"
import {
  type ChartFormat,
  makeAxisTickFormatter,
  makeFormatter,
} from "@/lib/chart-formatters"
import { useSeriesToggle } from "@/hooks/use-series-toggle"

export type ChartType = "area" | "bar" | "line" | "pie" | "radar" | "radial"

const CARTESIAN: ChartType[] = ["area", "bar", "line"]

export interface SeriesDef {
  /** dataKey into each row. */
  key: string
  label?: string
  /** Defaults to var(--chart-N) by index. */
  color?: string
  /** Curve type for area/line. */
  type?: "natural" | "linear" | "monotone" | "step"
  /** Shared stackId for stacked bars/areas. */
  stackId?: string
}

export interface ReferenceLineDef {
  /** "y" (horizontal, default) or "x" (vertical). */
  axis?: "x" | "y"
  value: number | string
  label?: string
  color?: ChartThresholdColor
  strokeDasharray?: string
}

export interface PowerChartFormatters {
  /** Tooltip values + Y-axis ticks. */
  value?: ChartFormat
  /** Tooltip header / X-axis ticks (e.g. dates). */
  label?: ChartFormat
}

export interface PowerChartTimeRange {
  value: TimeRange
  onChange: (range: TimeRange) => void
  ranges?: TimeRange[]
  labels?: Partial<Record<TimeRange, string>>
}

export interface PowerChartProps<Row = Record<string, unknown>> {
  type: ChartType
  data: Row[]
  /** x/category key (cartesian) or nameKey (pie/radial). */
  xKey: string
  series: SeriesDef[]
  config?: ChartConfig

  // advanced (cartesian only)
  referenceLines?: ReferenceLineDef[]
  brush?: boolean
  brushHeight?: number
  timeRange?: PowerChartTimeRange

  legend?: { show?: boolean; interactive?: boolean; verticalAlign?: "top" | "bottom" }
  formatters?: PowerChartFormatters
  showGrid?: boolean
  showTooltip?: boolean
  tooltipIndicator?: "dot" | "line" | "dashed"
  stacked?: boolean

  // chart-card states
  title: string
  loading?: boolean
  empty?: boolean
  error?: boolean
  onRetry?: () => void
  emptyIcon?: LucideIcon
  emptyTitle?: string
  emptyDescription?: string
  errorTitle?: string
  errorDescription?: string

  height?: number
  className?: string
  footer?: React.ReactNode
}

function deriveConfig(series: SeriesDef[]): ChartConfig {
  const config: ChartConfig = {}
  series.forEach((s, i) => {
    config[s.key] = {
      label: s.label ?? s.key,
      color: s.color ?? `var(--chart-${(i % 5) + 1})`,
    }
  })
  return config
}

/**
 * A configurable, dashboard-grade chart on top of the shadcn chart primitive:
 * thresholds (reference lines), interactive legend (click to toggle series),
 * Intl-formatted tooltips/axes, brush + time-range selection, and built-in
 * loading / empty / error states (via ChartCard).
 *
 * `brush` and `referenceLines` apply to cartesian charts (area/bar/line) only;
 * they're ignored for pie/radar/radial, where power comes from the interactive
 * legend, tooltips and states.
 */
export default function PowerChart<Row extends Record<string, unknown>>({
  type,
  data,
  xKey,
  series,
  config,
  referenceLines,
  brush = false,
  brushHeight = 28,
  timeRange,
  legend,
  formatters,
  showGrid = true,
  showTooltip = true,
  tooltipIndicator = "dot",
  stacked = false,
  title,
  loading = false,
  empty = false,
  error = false,
  onRetry,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  errorTitle,
  errorDescription,
  height = 240,
  className,
  footer,
}: PowerChartProps<Row>) {
  const chartConfig = config ?? deriveConfig(series)
  const seriesKeys = series.map((s) => s.key)
  const toggle = useSeriesToggle(seriesKeys)

  const isCartesian = CARTESIAN.includes(type)
  const valueFormatter = makeFormatter(formatters?.value)
  const labelFormatter = makeFormatter(formatters?.label)
  const xTickFormatter = makeAxisTickFormatter(formatters?.label)
  const yTickFormatter = makeAxisTickFormatter(formatters?.value)

  // Time-range filtering (cartesian time series only).
  const filteredData = React.useMemo(() => {
    if (!timeRange) return data
    const { from, to } = getRangeBounds(timeRange.value)
    if (!from) return data
    return data.filter((row) => {
      const raw = row[xKey]
      const d = raw instanceof Date ? raw : new Date(raw as string | number)
      if (isNaN(d.getTime())) return true
      return (!from || d >= from) && (!to || d <= to)
    })
  }, [data, timeRange, xKey])

  const showLegend = legend?.show ?? series.length > 1
  const interactive = legend?.interactive ?? false
  const legendVerticalAlign = legend?.verticalAlign ?? "bottom"

  const tooltip = showTooltip ? (
    <ChartTooltip
      cursor={false}
      content={
        <ChartTooltipContent
          indicator={tooltipIndicator}
          formatter={(value) => valueFormatter(value)}
          labelFormatter={
            formatters?.label ? (label) => labelFormatter(label) : undefined
          }
        />
      }
    />
  ) : null

  const legendEl = showLegend ? (
    <ChartLegend
      verticalAlign={legendVerticalAlign}
      content={
        <ChartLegendContent
          onLegendClick={interactive ? toggle.toggle : undefined}
          hiddenKeys={interactive ? toggle.hidden : undefined}
        />
      }
    />
  ) : null

  const refLines = isCartesian
    ? referenceLines?.map((r, i) => (
        <ChartReferenceLine
          key={i}
          {...(r.axis === "x" ? { x: r.value } : { y: r.value })}
          stroke={getThresholdColor(r.color)}
          strokeDasharray={r.strokeDasharray ?? "4 4"}
          label={r.label}
        />
      ))
    : null

  const brushEl =
    isCartesian && brush ? (
      <Brush dataKey={xKey} height={brushHeight} travellerWidth={8} stroke="var(--border)" />
    ) : null

  const renderChart = () => {
    switch (type) {
      case "area":
        return (
          <AreaChart accessibilityLayer data={filteredData} margin={{ left: 12, right: 12 }}>
            {showGrid && <CartesianGrid vertical={false} />}
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} tickFormatter={xTickFormatter} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={yTickFormatter} width={48} />
            {tooltip}
            {legendEl}
            {refLines}
            {series.map((s) => (
              <Area
                key={s.key}
                dataKey={s.key}
                type={s.type ?? "natural"}
                stackId={stacked ? s.stackId ?? "stack" : s.stackId}
                fill={`var(--color-${s.key})`}
                fillOpacity={0.4}
                stroke={`var(--color-${s.key})`}
                hide={toggle.isHidden(s.key)}
              />
            ))}
            {brushEl}
          </AreaChart>
        )
      case "bar":
        return (
          <BarChart accessibilityLayer data={filteredData}>
            {showGrid && <CartesianGrid vertical={false} />}
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={10} tickFormatter={xTickFormatter} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={yTickFormatter} width={48} />
            {tooltip}
            {legendEl}
            {refLines}
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId={stacked ? s.stackId ?? "stack" : s.stackId}
                fill={`var(--color-${s.key})`}
                radius={4}
                hide={toggle.isHidden(s.key)}
              />
            ))}
            {brushEl}
          </BarChart>
        )
      case "line":
        return (
          <LineChart accessibilityLayer data={filteredData} margin={{ left: 12, right: 12 }}>
            {showGrid && <CartesianGrid vertical={false} />}
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} tickFormatter={xTickFormatter} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={yTickFormatter} width={48} />
            {tooltip}
            {legendEl}
            {refLines}
            {series.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                type={s.type ?? "natural"}
                stroke={`var(--color-${s.key})`}
                strokeWidth={2}
                dot={false}
                hide={toggle.isHidden(s.key)}
              />
            ))}
            {brushEl}
          </LineChart>
        )
      case "pie":
        return (
          <PieChart>
            {tooltip}
            {legendEl}
            <Pie data={filteredData} dataKey={series[0].key} nameKey={xKey} innerRadius={60}>
              {filteredData.map((_, i) => (
                <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
              ))}
            </Pie>
          </PieChart>
        )
      case "radar":
        return (
          <RadarChart data={filteredData}>
            {tooltip}
            {legendEl}
            <PolarGrid />
            <PolarAngleAxis dataKey={xKey} />
            {series.map((s) => (
              <Radar
                key={s.key}
                dataKey={s.key}
                fill={`var(--color-${s.key})`}
                fillOpacity={0.6}
                stroke={`var(--color-${s.key})`}
                hide={toggle.isHidden(s.key)}
              />
            ))}
          </RadarChart>
        )
      case "radial":
        return (
          <RadialBarChart data={filteredData} innerRadius={30} outerRadius={110}>
            {tooltip}
            {legendEl}
            <RadialBar dataKey={series[0].key} background>
              {filteredData.map((_, i) => (
                <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
              ))}
            </RadialBar>
          </RadialBarChart>
        )
    }
  }

  return (
    <ChartCard
      title={title}
      loading={loading}
      empty={!loading && (empty || filteredData.length === 0)}
      error={error}
      onRetry={onRetry}
      emptyIcon={emptyIcon}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      errorTitle={errorTitle}
      errorDescription={errorDescription}
      skeletonHeight={height}
      headerActions={
        timeRange ? (
          <TimeRangeSelector
            value={timeRange.value}
            onChange={timeRange.onChange}
            ranges={timeRange.ranges}
            labels={timeRange.labels}
          />
        ) : undefined
      }
    >
      <ChartContainer config={chartConfig} className={className} style={{ height }}>
        {renderChart()}
      </ChartContainer>
      {footer}
    </ChartCard>
  )
}

