"use client"

import type { ReactNode } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { type ChartFormat, makeFormatter } from "@/lib/chart-formatters"

const DEFAULT_DATA = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const DEFAULT_CONFIG = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
} satisfies ChartConfig

export interface ChartLineProps {
  data?: Record<string, string | number>[]
  config?: ChartConfig
  xKey?: string
  seriesKeys?: string[]
  /** Formats values in the tooltip (and the Y axis when `showYAxis`). */
  valueFormat?: ChartFormat
  /** Formats X ticks and the tooltip label. Default: first 3 chars of strings. */
  xFormat?: ChartFormat
  /** Show a Y axis, formatted with `valueFormat`. */
  showYAxis?: boolean
  /**
   * Per-series stroke dash (SVG strokeDasharray, e.g. "6 4", "2 3"), so lines
   * stay distinguishable without relying on color alone.
   */
  dashes?: Record<string, string | undefined>
  /** "linear" for piecewise-linear data, where a smoothed curve would lie. */
  curve?: "natural" | "linear" | "monotone" | "step"
  /** Chart area height in px. Default: the container's aspect-video ratio. */
  height?: number
  title?: string
  description?: string
  footer?: ReactNode
  className?: string
}

/** Line chart. Data-driven; renders a demo dataset with no props. */
export default function Component({
  data = DEFAULT_DATA,
  config = DEFAULT_CONFIG,
  xKey = "month",
  seriesKeys,
  valueFormat,
  xFormat,
  showYAxis = false,
  dashes,
  curve = "natural",
  height,
  title = "Line Chart",
  description = "Showing data for the last 6 months",
  footer,
  className,
}: ChartLineProps = {}) {
  const keys = seriesKeys ?? Object.keys(config)
  const valueFormatter = makeFormatter(valueFormat)
  const xFormatter = xFormat
    ? makeFormatter(xFormat)
    : (value: unknown) =>
        typeof value === "string" ? value.slice(0, 3) : String(value)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          className={height ? "aspect-auto w-full" : undefined}
          style={height ? { height } : undefined}
        >
          <LineChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              tickFormatter={(value) => xFormatter(value)}
            />
            {showYAxis && (
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={72}
                tickFormatter={(value) => valueFormatter(value)}
              />
            )}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) =>
                    xFormatter(payload?.[0]?.payload?.[xKey])
                  }
                  valueFormatter={(value) => valueFormatter(value)}
                />
              }
            />
            {keys.map((key) => (
              <Line
                key={key}
                dataKey={key}
                type={curve}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                strokeDasharray={dashes?.[key]}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      {footer}
    </Card>
  )
}
