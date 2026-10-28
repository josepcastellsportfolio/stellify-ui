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
    expect(legend).toEqual(["API3.00", "Fijos4.00", "Tiempo60.00 (no cuenta para el tope)"])
    expect(screen.queryByTestId("cap-line")).not.toBeInTheDocument()
  })

  it("puts each series' period total in the legend, and the cap's value", () => {
    render(<StackedTimeline title="Gasto" series={SERIES} data={DATA} capLine={3} capLabel="Tope" formatValue={eur} />)
    const legend = screen.getAllByRole("listitem", { hidden: true }).map((li) => li.textContent)
    expect(legend).toEqual(["API3.00 €", "Fijos4.00 €", "Tiempo60.00 € (no cuenta para el tope)", "Tope: 3.00 €"])
  })

  it("labels the amount axis from zero to the highest bar", () => {
    render(<StackedTimeline title="Gasto" series={SERIES} data={DATA} formatValue={eur} />)
    const axis = screen.getByTestId("y-axis")
    expect(within(axis).getAllByText(/€/).map((t) => t.textContent)).toEqual(["60.00 €", "30.00 €", "0.00 €"])
  })

  it("shows the empty label when buckets exist but nothing was spent", () => {
    const zeros = DATA.map((d) => ({ ...d, values: { api: 0, fijo: 0, tiempo: 0 } }))
    render(<StackedTimeline title="Gasto" series={SERIES} data={zeros} capLine={3} emptyLabel="Nada" />)
    expect(screen.getByText("Nada")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(screen.queryByText("01/09")).not.toBeInTheDocument()
  })

  it("takes the legend note and the table header as props", () => {
    render(
      <StackedTimeline title="Spend" series={SERIES} data={DATA} apartNote="(outside the cap)" periodHeader="Period" />
    )
    const legend = screen.getAllByRole("listitem", { hidden: true }).map((li) => li.textContent)
    expect(legend[2]).toBe("Tiempo60.00 (outside the cap)")
    expect(within(screen.getByRole("table", { name: "Spend" })).getByRole("columnheader", { name: "Period" })).toBeInTheDocument()
  })

  it("shows the empty label without data", () => {
    render(<StackedTimeline title="Gasto" series={SERIES} data={[]} emptyLabel="Nada" />)
    expect(screen.getByText("Nada")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })
})
