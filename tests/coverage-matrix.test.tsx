import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CoverageMatrix, type CoverageCell } from "@stellify/coverage-matrix"

const CELLS: Record<string, CoverageCell> = {
  "pelu|tortosa": { state: "done", label: "Hecha 29/09", description: "hecha el 29/09/2026" },
  "padel|amposta": { state: "planned", label: "Día 1" },
}

function Matrix(props: Partial<React.ComponentProps<typeof CoverageMatrix>>) {
  return (
    <CoverageMatrix
      aria-label="Mapa de cobertura"
      rows={[
        { key: "pelu", label: "Peluquería" },
        { key: "padel", label: "Club de pádel" },
      ]}
      columns={[
        { key: "tortosa", label: "Tortosa", hint: "Català" },
        { key: "amposta", label: "Amposta" },
      ]}
      getCell={(r, c) => CELLS[`${r}|${c}`]}
      actionLabels={{ done: "Filtrar", planned: "Filtrar", empty: "Añadir al plan" }}
      {...props}
    />
  )
}

describe("CoverageMatrix", () => {
  it("renders the three states with their text and an accessible name", () => {
    render(<Matrix />)
    const table = screen.getByRole("table", { name: "Mapa de cobertura" })
    const done = within(table).getByRole("button", {
      name: "Peluquería en Tortosa: hecha. hecha el 29/09/2026. Filtrar",
    })
    expect(done).toHaveTextContent("Hecha 29/09")
    expect(done).toHaveAttribute("data-state", "done")
    const planned = within(table).getByRole("button", { name: "Club de pádel en Amposta: en el plan. Filtrar" })
    expect(planned).toHaveTextContent("Día 1")
    const empty = within(table).getByRole("button", { name: "Peluquería en Amposta: sin tocar. Añadir al plan" })
    expect(empty).toHaveTextContent("+")
    expect(within(table).getByText("Català")).toBeInTheDocument()
    expect(within(table).getAllByRole("button")).toHaveLength(4)
  })

  it("reports the clicked cell and its state", async () => {
    const onCellClick = vi.fn()
    render(<Matrix onCellClick={onCellClick} />)
    await userEvent.click(screen.getByRole("button", { name: /Peluquería en Tortosa/ }))
    await userEvent.click(screen.getByRole("button", { name: /Peluquería en Amposta/ }))
    expect(onCellClick.mock.calls).toEqual([
      ["pelu", "tortosa", "done"],
      ["pelu", "amposta", "empty"],
    ])
  })

  it("fades cells outside the filters and marks the selected one", () => {
    render(<Matrix isDimmed={(row) => row !== "padel"} selected={{ row: "padel", column: "amposta" }} />)
    expect(screen.getByRole("button", { name: /Peluquería en Tortosa/ })).toHaveAttribute("data-dimmed", "true")
    expect(screen.getByRole("button", { name: /Club de pádel en Tortosa/ })).not.toHaveAttribute("data-dimmed")
    expect(screen.getByRole("button", { name: /Club de pádel en Amposta/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /Club de pádel en Tortosa/ })).toHaveAttribute("aria-pressed", "false")
  })

  it("shows a legend of the three states", () => {
    render(<Matrix />)
    const legend = screen.getByRole("list", { name: "Leyenda" })
    expect(within(legend).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Hecha",
      "En el plan",
      "Sin tocar",
    ])
  })
})
