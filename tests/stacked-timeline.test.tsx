import { render, screen, within } from "@testing-library/react"
import { StackedTimeline, type StackedTimelineDatum, type StackedTimelineSeries } from "@stellify/stacked-timeline"

const SERIES: StackedTimelineSeries[] = [
  { key: "api", label: "API", color: "var(--chart-1)" },
  { key: "fijo", label: "Fijos", color: "var(--chart-3)" },
  { key: "tiempo", label: "Tiempo", color: "var(--muted-foreground)", countsTowardsCap: false },
]
const DATA: StackedTimelineDatum[] = [
  { label: "01/09", fullLabel: "01/09/2026", values: { api: 1, fijo: 4, tiempo: 60 } },
  { label: "02/09", values: { api: 2 } },
]
const eur = (v: number) => `${v.toFixed(2)} €`

describe("StackedTimeline", () => {
  it("draws one rect per non-zero value and the cap line", () => {
    const { container } = render(<StackedTimeline title="Gasto" series={SERIES} data={DATA} capLine={3} formatValue={eur} />)
    expect(screen.getByRole("img", { name: "Gasto" })).toBeInTheDocument()
    expect(container.querySelectorAll("rect")).toHaveLength(4)
    expect(screen.getByTestId("cap-line")).toBeInTheDocument()
  })

  it("keeps every figure in an accessible table, with the cap", () => {
    render(<StackedTimeline title="Gasto" series={SERIES} data={DATA} capLine={3} formatValue={eur} />)
    const table = screen.getByRole("table", { name: "Gasto" })
    const first = within(table).getByRole("row", { name: /01\/09\/2026/ })
    expect(first).toHaveTextContent("1.00 €4.00 €60.00 €")
    expect(within(table).getByRole("row", { name: /Tope/ })).toHaveTextContent("3.00 €")
  })

  it("says in the legend which series never counts towards the cap", () => {
    render(<StackedTimeline title="Gasto" series={SERIES} data={DATA} />)
    const legend = screen.getAllByRole("listitem", { hidden: true }).map((li) => li.textContent)
    expect(legend).toEqual(["API", "Fijos", "Tiempo (no cuenta para el tope)"])
    expect(screen.queryByTestId("cap-line")).not.toBeInTheDocument()
  })

  it("shows the empty label without data", () => {
    render(<StackedTimeline title="Gasto" series={SERIES} data={[]} emptyLabel="Nada" />)
    expect(screen.getByText("Nada")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })
})
