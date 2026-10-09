import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { DataTableActiveFilters } from "@stellify/data-table-active-filters"
import { DataTableColumnFilter } from "@stellify/data-table-column-filter"
import { FilterWidget } from "@stellify/data-table-filter-widget"
import { Filters, type ActiveFilters, type ActiveFilterValue, type FilterDef } from "@stellify/data-table-filters"

/**
 * Per-column filters for `data-table`: a header popover (`DataTableColumnFilter`)
 * rendering `FilterWidget`, plus active-filter chips above the table.
 */
const meta = { title: "Components/DataTable filters", parameters: { layout: "padded" } } satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const COLUMNS: { key: string; header: string; filter: FilterDef }[] = [
  { key: "description", header: "Descripción", filter: Filters.string({ placeholder: "Buscar descripción..." }) },
  { key: "amount", header: "Importe", filter: Filters.numberRange({ fromPlaceholder: "Min €", toPlaceholder: "Max €" }) },
  { key: "date", header: "Fecha", filter: Filters.dateRange() },
  {
    key: "category",
    header: "Categoría",
    filter: Filters.select([
      { value: "food", label: "Comida" },
      { value: "home", label: "Casa" },
    ]),
  },
  {
    key: "tags",
    header: "Etiquetas",
    filter: Filters.multiselect([
      { value: "fixed", label: "Fijo" },
      { value: "shared", label: "Compartido" },
    ]),
  },
]

function useFilters(initial: ActiveFilters = {}) {
  const [filters, setFilters] = useState<ActiveFilters>(initial)
  const onChange = (key: string, value: ActiveFilterValue) => setFilters((f) => ({ ...f, [key]: value }))
  return { filters, onChange }
}

export const HeaderPopoversAndChips: Story = {
  name: "Column popovers + active chips",
  render: () => {
    const { filters, onChange } = useFilters({
      description: { type: "string", value: "luz", operator: "contains" },
      category: { type: "select", value: "home" },
    })
    return (
      <div className="space-y-3">
        <DataTableActiveFilters columns={COLUMNS} filters={filters} onChange={onChange} />
        <table className="w-full text-sm">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} className="border-b px-2 py-2 text-left font-medium">
                  <span className="inline-flex items-center">
                    {col.header}
                    <DataTableColumnFilter columnKey={col.key} def={col.filter} value={filters[col.key]} onChange={onChange} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
    )
  },
}

export const Widgets: Story = {
  name: "FilterWidget (every type)",
  render: () => {
    const { filters, onChange } = useFilters()
    const all: { key: string; header: string; filter: FilterDef }[] = [
      ...COLUMNS,
      { key: "n", header: "Número", filter: Filters.number() },
      { key: "d", header: "Fecha exacta", filter: Filters.date() },
      { key: "dt", header: "Fecha y hora", filter: Filters.datetime() },
      { key: "dtr", header: "Rango con hora", filter: Filters.datetimeRange() },
      {
        key: "cv",
        header: "Valores de la columna (async)",
        filter: Filters.columnValues(async () => [
          { value: "a", label: "Alfa" },
          { value: "b", label: "Beta" },
        ]),
      },
    ]
    return (
      <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
        {all.map((col) => (
          <div key={col.key} className="space-y-2">
            <p className="text-xs font-medium">{col.header}</p>
            <FilterWidget columnKey={col.key} def={col.filter} value={filters[col.key]} onChange={onChange} />
          </div>
        ))}
      </div>
    )
  },
}
