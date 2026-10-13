import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ChartContainer } from "@stellify/chart"
import PowerChart from "@stellify/power-chart"

// Recharts' ResponsiveContainer needs ResizeObserver, which jsdom lacks.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  // jsdom has no layout, so recharts warns about a 0×0 container; expected here.
  const warn = console.warn
  vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    if (String(args[0]).includes("of chart should be greater than 0")) return
    warn(...args)
  })
})

const MONTHS = ["nov", "dic", "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct"]
const DATA = MONTHS.map((month, i) => ({ month, volume: 1000 + i * 250 }))

const DATA_TABLE = { caption: "Búsquedas al mes, últimos 12 meses", xHeader: "Mes" }

describe("ChartContainer", () => {
  it("renders the chart primitive with its config as CSS variables", () => {
    const { container } = render(
      <ChartContainer config={{ volume: { label: "Búsquedas", color: "var(--chart-1)" } }}>
        <div />
      </ChartContainer>
    )
    const chart = container.querySelector("[data-chart]")
    expect(chart).not.toBeNull()
    expect(container.querySelector("style")?.textContent).toContain("--color-volume: var(--chart-1)")
  })
})

describe("PowerChart", () => {
  it("exposes a 12-month single series as a hidden data table with formatted values", () => {
    render(
      <PowerChart
        type="line"
        title="Demanda"
        data={DATA}
        xKey="month"
        series={[{ key: "volume", label: "Búsquedas" }]}
        formatters={{ value: { kind: "custom", format: (v) => `${v} búsquedas` } }}
        dataTable={DATA_TABLE}
      />
    )
    const table = screen.getByRole("table", { name: DATA_TABLE.caption })
    expect(table).toHaveClass("sr-only")
    expect(table).toHaveAttribute("data-slot", "power-chart-table")
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Mes", "Búsquedas"])
    const rows = within(table).getAllByRole("row").slice(1)
    expect(rows).toHaveLength(12)
    expect(within(rows[0]).getByRole("rowheader")).toHaveTextContent("nov")
    expect(within(rows[0]).getByRole("cell")).toHaveTextContent("1000 búsquedas")
    expect(within(rows[11]).getByRole("rowheader")).toHaveTextContent("oct")
    expect(within(rows[11]).getByRole("cell")).toHaveTextContent("3750 búsquedas")
  })

  it("fills the width of its card instead of the default 16:9 box", () => {
    const { container } = render(
      <PowerChart type="line" title="Demanda" data={DATA} xKey="month" series={[{ key: "volume" }]} />
    )
    const chart = container.querySelector("[data-chart]")
    expect(chart).toHaveClass("aspect-auto", "w-full")
    expect(chart).not.toHaveClass("aspect-video")
  })

  it("uses header overrides and one column per series", () => {
    render(
      <PowerChart
        type="bar"
        title="Comparativa"
        data={[{ month: "ene", a: 1, b: 2 }]}
        xKey="month"
        series={[{ key: "a", label: "Tortosa" }, { key: "b" }]}
        formatters={{ label: { kind: "custom", format: (v) => `mes ${v}` } }}
        dataTable={{ ...DATA_TABLE, seriesHeaders: { b: "Amposta" } }}
      />
    )
    const table = screen.getByRole("table")
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Mes", "Tortosa", "Amposta"])
    expect(within(table).getByRole("rowheader")).toHaveTextContent("mes ene")
  })

  it("renders no table without dataTable, nor while loading", () => {
    const { rerender } = render(
      <PowerChart type="line" title="Demanda" data={DATA} xKey="month" series={[{ key: "volume" }]} />
    )
    expect(screen.queryByRole("table")).toBeNull()
    rerender(
      <PowerChart type="line" title="Demanda" data={DATA} xKey="month" series={[{ key: "volume" }]} dataTable={DATA_TABLE} loading />
    )
    expect(screen.queryByRole("table")).toBeNull()
  })

  it("shows the error state with the given retry copy", async () => {
    const onRetry = vi.fn()
    render(
      <PowerChart
        type="line"
        title="Demanda"
        data={DATA}
        xKey="month"
        series={[{ key: "volume" }]}
        error
        errorTitle="No se pudo cargar"
        onRetry={onRetry}
        retryLabel="Reintentar"
      />
    )
    expect(screen.getByText("No se pudo cargar")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
