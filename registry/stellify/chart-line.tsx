"use client"

import type { ReactNode } from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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
  valueFormat?: ChartFormat
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
  title = "Line Chart",
  description = "Showing data for the last 6 months",
  footer,
  className,
}: ChartLineProps = {}) {
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
          <LineChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
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
                <ChartTooltipContent formatter={(value) => valueFormatter(value)} />
              }
            />
            {keys.map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="natural"
                stroke={`var(--color-${key})`}
                strokeWidth={2}
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
