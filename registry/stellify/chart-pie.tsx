"use client"

import type { ReactNode } from "react"
import { Pie, PieChart } from "recharts"

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
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]

const DEFAULT_CONFIG = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "var(--chart-1)" },
  safari: { label: "Safari", color: "var(--chart-2)" },
  firefox: { label: "Firefox", color: "var(--chart-3)" },
  edge: { label: "Edge", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig

export interface ChartPieProps {
  data?: Record<string, string | number>[]
  config?: ChartConfig
  /** Slice value key. Defaults to "visitors". */
  dataKey?: string
  /** Slice label key. Defaults to "browser". */
  nameKey?: string
  /** Inner radius (px). 0 = full pie, >0 = donut. Defaults to 60. */
  innerRadius?: number
  valueFormat?: ChartFormat
  title?: string
  description?: string
  footer?: ReactNode
  className?: string
}

/** Pie / donut chart. Data-driven; renders a demo dataset with no props. */
export default function Component({
  data = DEFAULT_DATA,
  config = DEFAULT_CONFIG,
  dataKey = "visitors",
  nameKey = "browser",
  innerRadius = 60,
  valueFormat,
  title = "Pie Chart",
  description = "Donut",
  footer,
  className,
}: ChartPieProps = {}) {
  const valueFormatter = makeFormatter(valueFormat)

  return (
    <Card className={className ?? "flex flex-col"}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent hideLabel formatter={(value) => valueFormatter(value)} />
              }
            />
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={innerRadius} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      {footer}
    </Card>
  )
}
