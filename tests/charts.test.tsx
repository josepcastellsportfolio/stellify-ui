import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ComponentType } from "react"
import { Inbox } from "lucide-react"
import ChartArea from "@stellify/chart-area"
import ChartBar from "@stellify/chart-bar"
import ChartLine from "@stellify/chart-line"
import ChartPie from "@stellify/chart-pie"
import ChartRadar from "@stellify/chart-radar"
import ChartRadial from "@stellify/chart-radial"
import PowerChart from "@stellify/power-chart"

// jsdom has no layout, so Recharts' ResponsiveContainer draws nothing: these
// tests cover the card shell, copy and the theme wiring (config → CSS vars).
const styleText = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("style"))
    .map((s) => s.textContent)
    .join("\n")

const charts: [string, ComponentType<{ title?: string; description?: string }>, string][] = [
  ["chart-area", ChartArea, "Area Chart"],
  ["chart-bar", ChartBar, "Bar Chart"],
  ["chart-line", ChartLine, "Line Chart"],
  ["chart-pie", ChartPie, "Pie Chart"],
  ["chart-radar", ChartRadar, "Radar Chart"],
  ["chart-radial", ChartRadial, "Radial Chart"],
]

describe.each(charts)("%s", (_, Chart, defaultTitle) => {
  it("renders the demo with no props, themed through --chart-* tokens", () => {
    const { container } = render(<Chart />)
    expect(screen.getByText(defaultTitle)).toBeInTheDocument()
    expect(container.querySelector("[data-chart]")).toBeInTheDocument()
    expect(styleText(container)).toMatch(/--color-[\w-]+: var\(--chart-\d\)/)
  })

  it("takes its copy from props", () => {
    render(<Chart title="Gasto mensual" description="Últimos 6 meses" />)
    expect(screen.getByText("Gasto mensual")).toBeInTheDocument()
    expect(screen.getByText("Últimos 6 meses")).toBeInTheDocument()
  })
})

describe("power-chart", () => {
  const rows = [
    { month: "Jan", spend: 120 },
    { month: "Feb", spend: 90 },
  ]

  it("derives the config from the series (custom color, else --chart-N)", () => {
    const { container } = render(
      <PowerChart
        type="bar"
        title="Gasto"
        data={rows}
        xKey="month"
        series={[{ key: "spend", label: "Gasto", color: "var(--warning)" }, { key: "budget" }]}
      />
    )
    expect(screen.getByText("Gasto")).toBeInTheDocument()
    const css = styleText(container)
    expect(css).toContain("--color-spend: var(--warning)")
    expect(css).toContain("--color-budget: var(--chart-2)")
  })

  it("shows the empty state for no data and the error state with retry", async () => {
    const onRetry = vi.fn()
    const { rerender } = render(
      <PowerChart type="line" title="Gasto" data={[]} xKey="month" series={[{ key: "spend" }]} emptyTitle="Sin datos" emptyIcon={Inbox} />
    )
    expect(screen.getByRole("heading", { name: "Sin datos" })).toBeInTheDocument()
    rerender(
      <PowerChart
        type="line"
        title="Gasto"
        data={rows}
        xKey="month"
        series={[{ key: "spend" }]}
        error
        errorTitle="Error al cargar"
        onRetry={onRetry}
      />
    )
    expect(screen.getByRole("heading", { name: "Error al cargar" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it("filters by the time range and emits range changes", async () => {
    const onChange = vi.fn()
    const old = new Date()
    old.setDate(old.getDate() - 200)
    render(
      <PowerChart
        type="area"
        title="Visitas"
        data={[{ date: old.toISOString().slice(0, 10), v: 1 }]}
        xKey="date"
        series={[{ key: "v" }]}
        emptyTitle="Nada en este rango"
        emptyIcon={Inbox}
        timeRange={{ value: "30d", onChange }}
      />
    )
    expect(screen.getByRole("heading", { name: "Nada en este rango" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "30d" })).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(screen.getByRole("button", { name: "All" }))
    expect(onChange).toHaveBeenCalledWith("all")
  })
})
