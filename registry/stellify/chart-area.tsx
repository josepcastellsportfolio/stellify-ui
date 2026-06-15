"use client"

import type { ReactNode } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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

export interface ChartAreaProps {
  /** Rows of data. Defaults to a 6-month demo dataset. */
  data?: Record<string, string | number>[]
  /** Chart config (series key → label/color). Defaults to a single series. */
  config?: ChartConfig
  /** X-axis category key. Defaults to "month". */
  xKey?: string
  /** Series keys to draw as areas. Defaults to the config keys. */
  seriesKeys?: string[]
  /** Optional Intl formatter for tooltip values. */
  valueFormat?: ChartFormat
  title?: string
  description?: string
  footer?: ReactNode
  className?: string
}

/**
 * Area chart. Data-driven: pass `data` + `config`, or render with no props for
 * the demo. Colors resolve from the config via `var(--color-<key>)`.
 */
export default function Component({
  data = DEFAULT_DATA,
  config = DEFAULT_CONFIG,
  xKey = "month",
  seriesKeys,
  valueFormat,
  title = "Area Chart",
  description = "Showing data for the last 6 months",
  footer,
  className,
}: ChartAreaProps = {}) {
  const keys = seriesKeys ?? Object.keys(config)
  const valueFormatter = makeFormatter(valueFormat)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <AreaChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                typeof value === "string" ? value.slice(0, 3) : String(value)
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => valueFormatter(value)}
                />
              }
            />
            {keys.map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`var(--color-${key})`}
                fillOpacity={0.4}
                stroke={`var(--color-${key})`}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {footer}
    </Card>
  )
}
