import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import PowerChart from "@stellify/power-chart"
import type { TimeRange } from "@stellify/time-range-selector"

const meta = {
  title: "Charts/PowerChart",
  component: PowerChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof PowerChart>

export default meta
type Story = StoryObj<typeof meta>

const MONTHLY = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 173, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
]

const TWO_SERIES = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile" },
]

export const Playground: Story = {
  args: {
    type: "area",
    title: "Visitors",
    data: MONTHLY,
    xKey: "month",
    series: TWO_SERIES,
    legend: { show: true, interactive: true },
  },
}

export const Thresholds: Story = {
  name: "Reference lines / thresholds",
  args: {
    type: "bar",
    title: "Monthly spend vs budget",
    data: MONTHLY,
    xKey: "month",
    series: [{ key: "desktop", label: "Spend", color: "var(--chart-3)" }],
    referenceLines: [
      { value: 250, label: "Budget", color: "warning" },
      { value: 300, label: "Hard cap", color: "destructive" },
    ],
  },
}

export const InteractiveLegend: Story = {
  name: "Interactive legend + currency tooltip",
  args: {
    type: "line",
    title: "Revenue by channel",
    data: MONTHLY,
    xKey: "month",
    series: TWO_SERIES,
    legend: { show: true, interactive: true },
    formatters: { value: { kind: "currency", currency: "EUR", locale: "es-ES" } },
  },
}

export const Stacked: Story = {
  args: {
    type: "bar",
    title: "Stacked traffic",
    data: MONTHLY,
    xKey: "month",
    series: TWO_SERIES,
    stacked: true,
    legend: { show: true, interactive: true },
  },
}

function BrushDemo() {
  const [range, setRange] = useState<TimeRange>("30d")
  // Daily series across ~90 days so the range filter + brush are meaningful.
  const data = Array.from({ length: 90 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (89 - i))
    return {
      date: d.toISOString().slice(0, 10),
      desktop: 120 + Math.round(60 * Math.sin(i / 6)) + (i % 7) * 5,
    }
  })
  return (
    <PowerChart
      type="area"
      title="Daily visitors"
      data={data}
      xKey="date"
      series={[{ key: "desktop", label: "Desktop" }]}
      brush
      timeRange={{ value: range, onChange: setRange }}
      formatters={{
        label: { kind: "date", locale: "en-US", options: { month: "short", day: "numeric" } },
      }}
      height={260}
    />
  )
}

export const BrushAndTimeRange: Story = {
  name: "Brush + time-range selector",
  render: () => <BrushDemo />,
}

export const Loading: Story = {
  args: { type: "area", title: "Loading…", data: [], xKey: "month", series: TWO_SERIES, loading: true },
}

export const Empty: Story = {
  args: {
    type: "bar",
    title: "No data",
    data: [],
    xKey: "month",
    series: TWO_SERIES,
    emptyTitle: "Nothing to show",
    emptyDescription: "Try a different range.",
  },
}

export const ErrorState: Story = {
  name: "Error + retry",
  args: {
    type: "line",
    title: "Failed to load",
    data: [],
    xKey: "month",
    series: TWO_SERIES,
    error: true,
    errorTitle: "Could not load data",
    errorDescription: "Check your connection and retry.",
    onRetry: () => alert("retry"),
  },
}

export const Pie: Story = {
  args: {
    type: "pie",
    title: "Browser share",
    xKey: "name",
    series: [{ key: "value" }],
    legend: { show: true, interactive: false },
    data: [
      { name: "Chrome", value: 275 },
      { name: "Safari", value: 200 },
      { name: "Firefox", value: 187 },
      { name: "Edge", value: 173 },
      { name: "Other", value: 90 },
    ],
  },
}
