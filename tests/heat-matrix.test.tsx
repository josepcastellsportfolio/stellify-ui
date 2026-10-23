import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { HeatMatrix, heatStep, type HeatMatrixCell } from "@stellify/heat-matrix"

const CELLS: Record<string, HeatMatrixCell> = {
  "rest|N": { value: 22, description: "total 22, nivel 1", children: <span>Nivel 1</span> },
  "rest|E": { value: 15, description: "total 15, nivel 3" },
  "salud|N": { value: 12, muted: true, description: "total 12, no pasa", children: <span>no pasa</span> },
}

function Matrix(props: Partial<React.ComponentProps<typeof HeatMatrix>>) {
  return (
    <HeatMatrix
      aria-label="Matriz"
      rows={[
        { key: "rest", label: "Restauración" },
        { key: "salud", label: "Salud", tag: <span>candidata</span> },
      ]}
      columns={[
        { key: "N", label: "Negocio local", hint: "1 de 2 pasan" },
        { key: "E", label: "Empresa" },
      ]}
      getCell={(r, c) => CELLS[`${r}|${c}`]}
      min={15}
      max={25}
      rowHeader="Industria"
      emptyLabel="Sin datos"
      actionLabel="Ver detalle"
      onCellClick={() => {}}
      legend={{ label: "Leyenda", low: "15", high: "25", muted: "No pasa" }}
      {...props}
    />
  )
}

describe("heatStep", () => {
  it("maps the value onto five steps and clamps outside the range", () => {
    expect([10, 15, 17, 20, 23, 25, 30].map((v) => heatStep(v, 15, 25))).toEqual([0, 0, 1, 2, 3, 4, 4])
  })

  it("uses the darkest step when the range is empty", () => {
    expect(heatStep(5, 5, 5)).toBe(4)
  })
})

describe("HeatMatrix", () => {
  it("renders each cell with its figure, lines and accessible name", () => {
    render(<Matrix />)
    const table = screen.getByRole("table", { name: "Matriz" })
    const top = within(table).getByRole("button", { name: "Restauración, Negocio local: total 22, nivel 1. Ver detalle" })
    expect(top).toHaveTextContent("22")
    expect(top).toHaveTextContent("Nivel 1")
    expect(top).toHaveAttribute("data-step", "3")
    expect(within(table).getByRole("button", { name: /Restauración, Empresa/ })).toHaveAttribute("data-step", "0")
    expect(within(table).getByText("1 de 2 pasan")).toBeInTheDocument()
    expect(within(table).getByText("candidata")).toBeInTheDocument()
  })

  it("greys out muted cells and leaves cells without data as plain text", () => {
    render(<Matrix />)
    const muted = screen.getByRole("button", { name: /Salud, Negocio local: total 12, no pasa/ })
    expect(muted).toHaveAttribute("data-muted", "true")
    expect(muted).not.toHaveAttribute("data-step")
    expect(screen.getByText("Sin datos")).toBeInTheDocument()
    expect(screen.getAllByRole("button")).toHaveLength(3)
  })

  it("reports the clicked cell and marks the selected one", async () => {
    const onCellClick = vi.fn()
    render(<Matrix onCellClick={onCellClick} selected={{ row: "rest", column: "E" }} />)
    await userEvent.click(screen.getByRole("button", { name: /Restauración, Negocio local/ }))
    expect(onCellClick).toHaveBeenCalledWith("rest", "N")
    expect(screen.getByRole("button", { name: /Restauración, Empresa/ })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /Restauración, Negocio local/ })).toHaveAttribute("aria-pressed", "false")
  })

  it("is read-only without onCellClick", () => {
    render(<Matrix onCellClick={undefined} />)
    expect(screen.queryAllByRole("button")).toHaveLength(0)
    expect(screen.getByText("22")).toBeInTheDocument()
  })

  it("shows the scale and the muted meaning in the legend", () => {
    render(<Matrix />)
    const legend = screen.getByRole("list", { name: "Leyenda" })
    expect(within(legend).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["1525", "No pasa"])
  })

  it("marks every part with data-slot", () => {
    const { container } = render(<Matrix />)
    for (const slot of [
      "heat-matrix",
      "heat-matrix-scroll",
      "heat-matrix-table",
      "heat-matrix-column-header",
      "heat-matrix-row-header",
      "heat-matrix-legend",
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull()
    }
    expect(container.querySelectorAll('[data-slot="heat-matrix-cell"]')).toHaveLength(4)
  })
})
