import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { applyFilters, countActiveFilters, matchesFilter, Filters, type ActiveFilters } from "@stellify/data-table-filters"
import { DataTable, type RowKey } from "@stellify/data-table"
import { DataTablePagination } from "@stellify/data-table-pagination"
import { DataTableAdvancedFilters } from "@stellify/data-table-advanced-filters"

const rows = [
  { id: 1, title: "Informe de riesgos", source: "kpmg", words: 400, published: "2026-11-03" },
  { id: 2, title: "Agentes autónomos", source: "bain", words: 1200, published: "2026-10-01" },
  { id: 3, title: "Riesgo climático", source: "kpmg", words: 90, published: "2026-11-01" },
]

describe("applyFilters", () => {
  it("combines string, multiselect, number range and date range", () => {
    const f: ActiveFilters = {
      title: { type: "string", value: "riesgo", operator: "contains" },
      source: { type: "multiselect", values: ["kpmg"] },
      words: { type: "number_range", from: "100", to: "" },
      published: { type: "date_range", from: "2026-11-01", to: "2026-11-30" },
    }
    expect(applyFilters(rows, f).map((r) => r.id)).toEqual([1])
    expect(countActiveFilters(f)).toBe(4)
  })

  it("lets inactive filters through and compares dates by local day", () => {
    expect(applyFilters(rows, { title: { type: "string", value: " ", operator: "contains" } })).toHaveLength(3)
    expect(matchesFilter("2026-11-01", { type: "date", value: "2026-11-01" })).toBe(true)
    expect(matchesFilter(5, { type: "number", value: "5", operator: "gte" })).toBe(true)
  })

  it("honours the times of a datetime range, inclusive to the minute", () => {
    const range = { type: "datetime_range", from: "2026-11-14T10:00", to: "2026-11-14T12:00" } as const
    expect(matchesFilter("2026-11-14T11:30", range)).toBe(true)
    expect(matchesFilter("2026-11-14T12:00:45", range)).toBe(true)
    expect(matchesFilter("2026-11-14T09:59", range)).toBe(false)
    expect(matchesFilter("2026-11-14T23:00", range)).toBe(false)
    // A bound without a time covers its whole day.
    expect(matchesFilter("2026-11-14T23:00", { type: "datetime_range", from: "", to: "2026-11-14" })).toBe(true)
    expect(matchesFilter(new Date(2026, 10, 14, 11, 0), range)).toBe(true)
  })

  it("reads a date-only string as that local day", () => {
    expect(matchesFilter(new Date(2026, 10, 1, 0, 30), { type: "date", value: "2026-11-01" })).toBe(true)
    expect(matchesFilter("2026-11-01", { type: "date_range", from: "2026-11-01", to: "2026-11-01" })).toBe(true)
  })
})

describe("DataTable selection and header filters", () => {
  function Demo() {
    const [selected, setSelected] = useState<Set<RowKey>>(new Set())
    const [filters, setFilters] = useState<ActiveFilters>({})
    return (
      <DataTable
        columns={[
          { key: "title", header: "Título", filter: Filters.string() },
          { key: "words", header: "Palabras", align: "right" },
        ]}
        rows={applyFilters(rows, filters)}
        getRowKey={(r) => r.id}
        filters={filters}
        onFilterChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        bulkActions={() => <button type="button">Exportar</button>}
      />
    )
  }

  it("selects all on the page, shows the bulk bar and clears", async () => {
    render(<Demo />)
    await userEvent.click(screen.getByRole("checkbox", { name: "Seleccionar todas las filas" }))
    expect(screen.getByText("3 seleccionadas")).toBeInTheDocument()
    expect(screen.getAllByRole("row").filter((r) => r.getAttribute("data-state") === "selected")).toHaveLength(3)
    await userEvent.click(screen.getByRole("button", { name: "Deseleccionar" }))
    expect(screen.queryByText(/seleccionadas/)).toBeNull()
  })

  it("filters from the header button", async () => {
    render(<Demo />)
    await userEvent.click(screen.getByRole("button", { name: "Filtrar Título" }))
    fireEvent.change(screen.getByPlaceholderText(/./, { exact: false }), { target: { value: "agentes" } })
    expect(screen.getAllByRole("row")).toHaveLength(2) // header + 1
  })
})

describe("DataTablePagination", () => {
  it("shows the range and numbered pages in Spanish", async () => {
    const onPageChange = vi.fn()
    render(<DataTablePagination total={95} page={5} pageSize={10} onPageChange={onPageChange} />)
    expect(screen.getByText("41–50 de 95")).toBeInTheDocument()
    const nav = screen.getByRole("navigation", { name: "Paginación" })
    expect(within(nav).getByRole("button", { name: "Página 5" })).toHaveAttribute("aria-current", "page")
    expect(within(nav).getByRole("button", { name: "Página 10" })).toBeInTheDocument()
    await userEvent.click(within(nav).getByRole("button", { name: "Siguiente" }))
    expect(onPageChange).toHaveBeenCalledWith(6)
  })
})

describe("DataTableAdvancedFilters", () => {
  it("counts active filters on the trigger", () => {
    render(
      <DataTableAdvancedFilters
        columns={[{ key: "title", header: "Título", filter: Filters.string() }]}
        filters={{ title: { type: "string", value: "x", operator: "contains" } }}
        onChange={() => {}}
        onClearAll={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: /Filtros\s*1/ })).toBeInTheDocument()
  })
})
