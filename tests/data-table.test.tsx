import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { DataTable, type DataTableColumn } from "@stellify/data-table"
import { DataTableActiveFilters } from "@stellify/data-table-active-filters"
import { DataTableColumnFilter } from "@stellify/data-table-column-filter"
import { FilterWidget } from "@stellify/data-table-filter-widget"
import { Filters, type ActiveFilters, type ActiveFilterValue } from "@stellify/data-table-filters"
import { DataTableMobile } from "@stellify/data-table-mobile"
import { DataTablePagination } from "@stellify/data-table-pagination"
import { DataTableToolbar } from "@stellify/data-table-toolbar"

interface Row {
  id: number
  name: string
  amount: number
}

const rows: Row[] = [
  { id: 1, name: "Luz", amount: 120 },
  { id: 2, name: "Agua", amount: 35 },
]

const columns: DataTableColumn<Row>[] = [
  { key: "name", header: "Concepto", sortable: true },
  { key: "amount", header: "Importe", align: "right", render: (r) => `${r.amount} €` },
]

describe("data-table", () => {
  it("renders headers, default and custom cells, and row actions", () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        actions={(r) => <button type="button">Editar {r.name}</button>}
      />
    )
    expect(screen.getByRole("columnheader", { name: "Concepto" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "Luz" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "120 €" })).toHaveClass("text-right")
    expect(screen.getByRole("button", { name: "Editar Agua" })).toBeInTheDocument()
  })

  it("emits the sort key only for sortable columns", async () => {
    const onSortChange = vi.fn()
    render(
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} sort={{ key: "name", dir: "asc" }} onSortChange={onSortChange} />
    )
    await userEvent.click(screen.getByRole("columnheader", { name: "Concepto" }))
    await userEvent.click(screen.getByRole("columnheader", { name: "Importe" }))
    expect(onSortChange).toHaveBeenCalledTimes(1)
    expect(onSortChange).toHaveBeenCalledWith("name")
  })

  it("shows skeleton rows while loading and the empty state without rows", () => {
    const { container, rerender } = render(
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} loading skeletonRows={3} />
    )
    expect(screen.queryByText("Luz")).not.toBeInTheDocument()
    expect(container.querySelectorAll("tbody tr")).toHaveLength(3)
    rerender(<DataTable columns={columns} rows={[]} getRowKey={(r) => r.id} emptyState={<p>Nada aún</p>} />)
    expect(screen.getByText("Nada aún")).toBeInTheDocument()
  })
})

describe("data-table-mobile", () => {
  it("renders one card per row, first column prominent", () => {
    render(<DataTableMobile columns={columns} rows={rows} getRowKey={(r) => r.id} actions={() => <button type="button">Ver</button>} />)
    expect(screen.getByText("Luz")).toHaveClass("font-medium")
    expect(screen.getByText("35 €")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "Ver" })).toHaveLength(2)
  })

  it("shows the empty state without rows", () => {
    render(<DataTableMobile columns={columns} rows={[]} getRowKey={(r) => r.id} emptyState={<p>Nada aún</p>} />)
    expect(screen.getByText("Nada aún")).toBeInTheDocument()
  })
})

describe("data-table-pagination", () => {
  it("pages forward/back and disables at the bounds", async () => {
    const onPageChange = vi.fn()
    const { rerender } = render(
      <DataTablePagination total={45} page={1} pageSize={10} onPageChange={onPageChange} previousLabel="Anterior" nextLabel="Siguiente" ofLabel="de" />
    )
    expect(screen.getByText("1 / 5")).toBeInTheDocument()
    expect(screen.getByText("de 45")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    rerender(<DataTablePagination total={45} page={5} pageSize={10} onPageChange={onPageChange} nextLabel="Siguiente" />)
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled()
  })

  it("hides the pager on a single page and disables the size select without a handler", () => {
    render(<DataTablePagination total={5} page={1} pageSize={10} onPageChange={() => {}} />)
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument()
    expect(screen.getByRole("combobox")).toBeDisabled()
  })
})

describe("data-table-toolbar", () => {
  it("emits search text, clears it, and toggles filters", async () => {
    const onSearchChange = vi.fn()
    const onToggleFilters = vi.fn()
    render(
      <DataTableToolbar
        search="lu"
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar…"
        showFilterToggle
        filtersOpen
        onToggleFilters={onToggleFilters}
        clearSearchLabel="Borrar búsqueda"
      />
    )
    fireEvent.change(screen.getByPlaceholderText("Buscar…"), { target: { value: "luz" } })
    expect(onSearchChange).toHaveBeenLastCalledWith("luz")
    await userEvent.click(screen.getByRole("button", { name: "Borrar búsqueda" }))
    expect(onSearchChange).toHaveBeenLastCalledWith("")
    const toggle = screen.getByRole("button", { pressed: true })
    await userEvent.click(toggle)
    expect(onToggleFilters).toHaveBeenCalledTimes(1)
  })
})

describe("data-table-filter-widget", () => {
  it("edits a number range", () => {
    const onChange = vi.fn()
    render(<FilterWidget columnKey="amount" def={Filters.numberRange()} value={undefined} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText("Min"), { target: { value: "10" } })
    expect(onChange).toHaveBeenLastCalledWith("amount", { type: "number_range", from: "10", to: "" })
  })

  it("toggles multiselect options", async () => {
    const onChange = vi.fn()
    const def = Filters.multiselect([
      { value: "a", label: "Alfa" },
      { value: "b", label: "Beta" },
    ])
    render(<FilterWidget columnKey="tag" def={def} value={{ type: "multiselect", values: ["a"] }} onChange={onChange} />)
    expect(screen.getByRole("checkbox", { name: "Alfa" })).toBeChecked()
    await userEvent.click(screen.getByRole("checkbox", { name: "Beta" }))
    expect(onChange).toHaveBeenLastCalledWith("tag", { type: "multiselect", values: ["a", "b"] })
  })

  it("loads column values asynchronously", async () => {
    const def = Filters.columnValues(async () => [{ value: "x", label: "Equis" }])
    render(<FilterWidget columnKey="c" def={def} value={undefined} onChange={() => {}} />)
    expect(screen.getByText("Cargando...")).toBeInTheDocument()
    expect(await screen.findByRole("checkbox", { name: "Equis" })).toBeInTheDocument()
  })
})

describe("data-table-column-filter", () => {
  it("opens the filter widget in a popover and marks an active filter", async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <DataTableColumnFilter columnKey="name" def={Filters.string()} value={undefined} onChange={onChange} />
    )
    const trigger = screen.getByRole("button", { name: "Filtrar columna" })
    expect(trigger).toHaveClass("text-muted-foreground")
    await userEvent.click(trigger)
    fireEvent.change(await screen.findByPlaceholderText("Filtrar..."), { target: { value: "lu" } })
    expect(onChange).toHaveBeenLastCalledWith("name", { type: "string", value: "lu", operator: "contains" })
    rerender(
      <DataTableColumnFilter columnKey="name" def={Filters.string()} value={{ type: "string", value: "lu", operator: "contains" }} onChange={onChange} />
    )
    expect(screen.getByRole("button", { name: "Filtrar columna" })).toHaveClass("text-primary")
  })
})

describe("data-table-active-filters", () => {
  const filterColumns = [
    { key: "name", header: "Concepto", filter: Filters.string() },
    { key: "kind", header: "Tipo", filter: Filters.select([{ value: "fix", label: "Fijo" }]) },
    { key: "amount", header: "Importe" },
  ]

  function Harness() {
    const [filters, setFilters] = useState<ActiveFilters>({
      name: { type: "string", value: "luz", operator: "contains" },
      kind: { type: "select", value: "fix" },
    })
    return (
      <DataTableActiveFilters
        columns={filterColumns}
        filters={filters}
        onChange={(key: string, value: ActiveFilterValue) => setFilters((f) => ({ ...f, [key]: value }))}
      />
    )
  }

  it("shows a chip per active filter and clears one with its cross", async () => {
    render(<Harness />)
    expect(screen.getByRole("button", { name: /Concepto: luz/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Tipo: Fijo/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Quitar el filtro de Concepto" }))
    expect(screen.queryByRole("button", { name: /Concepto: luz/ })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Tipo: Fijo/ })).toBeInTheDocument()
  })

  it("reopens the column widget from the chip", async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole("button", { name: /Concepto: luz/ }))
    const dialog = await screen.findByRole("dialog")
    await waitFor(() => expect(within(dialog).getByDisplayValue("luz")).toBeInTheDocument())
  })

  it("renders nothing without active filters", () => {
    const { container } = render(<DataTableActiveFilters columns={filterColumns} filters={{}} onChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })
})
