"use client"

import type { ReactNode } from "react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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
  { month: "April", desktop: 273 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const DEFAULT_CONFIG = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
} satisfies ChartConfig

export interface ChartRadarProps {
  data?: Record<string, string | number>[]
  config?: ChartConfig
  /** Angle/category key. Defaults to "month". */
  angleKey?: string
  /** Series keys to plot. Defaults to the config keys. */
  seriesKeys?: string[]
  valueFormat?: ChartFormat
  title?: string
  description?: string
  footer?: ReactNode
  className?: string
}

/** Radar chart. Data-driven; renders a demo dataset with no props. */
export default function Component({
  data = DEFAULT_DATA,
  config = DEFAULT_CONFIG,
  angleKey = "month",
  seriesKeys,
  valueFormat,
  title = "Radar Chart",
  description = "Showing data for the last 6 months",
  footer,
  className,
}: ChartRadarProps = {}) {
  const keys = seriesKeys ?? Object.keys(config)
  const valueFormatter = makeFormatter(valueFormat)

  return (
    <Card className={className}>
      <CardHeader className="items-center pb-4">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
          <RadarChart data={data}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(value) => valueFormatter(value)} />}
            />
            <PolarAngleAxis dataKey={angleKey} />
            <PolarGrid />
            {keys.map((key) => (
              <Radar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                fillOpacity={0.6}
                stroke={`var(--color-${key})`}
              />
            ))}
          </RadarChart>
        </ChartContainer>
      </CardContent>
      {footer}
    </Card>
  )
}
