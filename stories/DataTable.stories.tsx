import type { Meta, StoryObj } from "@storybook/react-vite"
import { useMemo, useState } from "react"
import { Receipt } from "lucide-react"
import { DataTable, type DataTableColumn, type DataTableSort } from "@stellify/data-table"
import { DataTablePagination } from "@stellify/data-table-pagination"
import { DataTableToolbar } from "@stellify/data-table-toolbar"
import { DataTableMobile } from "@stellify/data-table-mobile"
import { EmptyState } from "@stellify/empty-state"
import { StatusBadge } from "@stellify/status-badge"

interface Expense {
  id: number
  description: string
  category: string
  amount: number
  status: "paid" | "pending" | "overdue"
}

const ALL: Expense[] = [
  { id: 1, description: "Groceries", category: "Food", amount: 82.4, status: "paid" },
  { id: 2, description: "Electricity", category: "Utilities", amount: 120, status: "pending" },
  { id: 3, description: "Gym", category: "Health", amount: 35, status: "paid" },
  { id: 4, description: "Internet", category: "Utilities", amount: 49.9, status: "overdue" },
  { id: 5, description: "Dinner out", category: "Food", amount: 64, status: "paid" },
  { id: 6, description: "Books", category: "Education", amount: 28.5, status: "pending" },
  { id: 7, description: "Parking", category: "Transport", amount: 12, status: "paid" },
]

const statusMap = {
  paid: "success",
  pending: "warning",
  overdue: "danger",
} as const

const columns: DataTableColumn<Expense>[] = [
  { key: "description", header: "Description", sortable: true },
  { key: "category", header: "Category", hidden: "hidden sm:table-cell" },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusBadge status={statusMap[r.status]}>{r.status}</StatusBadge>,
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    sortable: true,
    render: (r) => `€${r.amount.toFixed(2)}`,
  },
]

const meta = {
  title: "Components/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof DataTable<Expense>>

export default meta
type Story = StoryObj<typeof meta>

function FullExample() {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<DataTableSort | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    let rows = ALL.filter((r) =>
      r.description.toLowerCase().includes(search.toLowerCase())
    )
    if (sort) {
      rows = [...rows].sort((a, b) => {
        const av = a[sort.key as keyof Expense]
        const bv = b[sort.key as keyof Expense]
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sort.dir === "asc" ? cmp : -cmp
      })
    }
    return rows
  }, [search, sort])

  const toggleSort = (key: string) =>
    setSort((s) =>
      s?.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    )

  const empty = (
    <EmptyState icon={Receipt} title="No expenses" description="Nothing matches your search." />
  )

  return (
    <>
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(r) => r.id}
          sort={sort}
          onSortChange={toggleSort}
          emptyState={empty}
          toolbar={
            <DataTableToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search expenses…"
            />
          }
          footer={
            <DataTablePagination
              total={filtered.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          }
        />
      </div>
      <div className="md:hidden">
        <DataTableMobile
          columns={columns}
          rows={filtered}
          getRowKey={(r) => r.id}
          emptyState={empty}
        />
      </div>
    </>
  )
}

export const Composed: Story = {
  name: "Table + toolbar + pagination + mobile",
  render: () => <FullExample />,
}

export const Loading: Story = {
  render: () => (
    <DataTable
      columns={columns}
      rows={[]}
      getRowKey={(r) => r.id}
      loading
    />
  ),
}
