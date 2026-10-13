import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { FilterBar, FilterSelect, FilterText } from "@stellify/filter-bar"

const CATEGORIES = [
  { value: "food", label: "Food" },
  { value: "utilities", label: "Utilities" },
  { value: "transport", label: "Transport" },
]
const STATUSES = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
]
const ACCOUNTS = [
  { value: "personal", label: "Personal" },
  { value: "business", label: "Business" },
]

const EMPTY = { category: "", status: "", account: "", q: "" }

function FourFields() {
  const [filters, setFilters] = useState(EMPTY)
  const set = (patch: Partial<typeof EMPTY>) => setFilters((f) => ({ ...f, ...patch }))
  const active = Object.values(filters).some(Boolean)
  return (
    <div className="flex flex-col gap-4">
      <FilterBar label="Filters" clearLabel="Clear" clearDisabled={!active} onClear={() => setFilters(EMPTY)}>
        <FilterSelect label="Category" allLabel="All" value={filters.category} options={CATEGORIES} onValueChange={(category) => set({ category })} />
        <FilterSelect label="Status" allLabel="All" value={filters.status} options={STATUSES} onValueChange={(status) => set({ status })} />
        <FilterSelect label="Account" allLabel="All" value={filters.account} options={ACCOUNTS} onValueChange={(account) => set({ account })} />
        <FilterText label="Search" placeholder="Description or payee" value={filters.q} debounceMs={250} onValueChange={(q) => set({ q })} />
      </FilterBar>
      <pre className="text-xs text-muted-foreground">{JSON.stringify(filters)}</pre>
    </div>
  )
}

function TwoFields() {
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  return (
    <FilterBar
      label="Expense filters"
      clearLabel="Clear"
      clearDisabled={!category && !status}
      onClear={() => {
        setCategory("")
        setStatus("")
      }}
    >
      <FilterSelect label="Category" allLabel="All" value={category} options={CATEGORIES} onValueChange={setCategory} />
      <FilterSelect label="Status" allLabel="All" value={status} options={STATUSES} onValueChange={setStatus} />
    </FilterBar>
  )
}

const meta = {
  title: "Components/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FilterBar>

export default meta
type Story = StoryObj<typeof meta>

/** Three selects with an "All" option, a debounced search box and a clear button. */
export const Default: Story = {
  args: { label: "Filters", children: null },
  render: () => <FourFields />,
}

/** The grid adapts to the number of fields. */
export const TwoSelects: Story = {
  args: { label: "Expense filters", children: null },
  render: () => <TwoFields />,
}
