import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DataTable, type DataTableColumn, type DataTableSort } from "@stellify/data-table"

interface Row {
  id: number
  sector: string
  volume: number
}

const ROWS: Row[] = [
  { id: 1, sector: "Peluquería", volume: 1200 },
  { id: 2, sector: "Clínica dental", volume: 800 },
]

const COLUMNS: DataTableColumn<Row>[] = [
  { key: "sector", header: "Sector", sortable: true },
  { key: "volume", header: "Volumen", sortable: true, align: "right" },
  { key: "id", header: "Id" },
]

function Table(props: { sort?: DataTableSort | null; onSortChange?: (key: string) => void; actionsLabel?: string }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={ROWS}
      getRowKey={(r) => r.id}
      actions={() => <button type="button">Abrir</button>}
      {...props}
    />
  )
}

describe("DataTable", () => {
  it("renders sortable headers as buttons with aria-sort on the header cell", () => {
    render(<Table sort={{ key: "volume", dir: "desc" }} />)
    expect(screen.getByRole("columnheader", { name: "Sector" })).toHaveAttribute("aria-sort", "none")
    expect(screen.getByRole("columnheader", { name: "Volumen" })).toHaveAttribute("aria-sort", "descending")
    expect(screen.getByRole("columnheader", { name: "Id" })).not.toHaveAttribute("aria-sort")
    expect(within(screen.getByRole("columnheader", { name: "Sector" })).getByRole("button", { name: "Sector" })).toBeInTheDocument()
    expect(within(screen.getByRole("columnheader", { name: "Id" })).queryByRole("button")).toBeNull()
  })

  it("reports ascending sort", () => {
    render(<Table sort={{ key: "sector", dir: "asc" }} />)
    expect(screen.getByRole("columnheader", { name: "Sector" })).toHaveAttribute("aria-sort", "ascending")
  })

  it("sorts by click and by keyboard, once per activation", async () => {
    const onSortChange = vi.fn()
    render(<Table onSortChange={onSortChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Sector" }))
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Volumen" })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await userEvent.keyboard(" ")
    expect(onSortChange.mock.calls).toEqual([["sector"], ["volume"], ["volume"]])
  })

  it("still sorts when the header cell itself is clicked", async () => {
    const onSortChange = vi.fn()
    render(<Table onSortChange={onSortChange} />)
    await userEvent.click(screen.getByRole("columnheader", { name: "Volumen" }))
    expect(onSortChange).toHaveBeenCalledExactlyOnceWith("volume")
  })

  it("labels the actions column only with the given copy", () => {
    const { rerender } = render(<Table actionsLabel="Acciones" />)
    expect(screen.getByRole("columnheader", { name: "Acciones" })).toBeInTheDocument()
    rerender(<Table />)
    expect(screen.queryByText("Actions")).toBeNull()
    expect(screen.getAllByRole("columnheader")).toHaveLength(4)
  })
})
