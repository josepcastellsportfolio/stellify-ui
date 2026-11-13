import type { Meta, StoryObj } from "@storybook/react-vite"
import { useMemo, useState } from "react"
import { CheckCheck, ExternalLink, Eye, EyeOff, FileText, LayoutGrid, Star, Table2, Trash2 } from "lucide-react"
import { DataTable, type DataTableColumn, type DataTableSort, type RowKey } from "@stellify/data-table"
import { DataTableToolbar } from "@stellify/data-table-toolbar"
import { DataTablePagination } from "@stellify/data-table-pagination"
import { DataTableActiveFilters } from "@stellify/data-table-active-filters"
import { DataTableAdvancedFilters } from "@stellify/data-table-advanced-filters"
import { DataTableMobile } from "@stellify/data-table-mobile"
import {
  applyFilters,
  countActiveFilters,
  Filters,
  type ActiveFilters,
  type ActiveFilterValue,
} from "@stellify/data-table-filters"
import { SegmentedControl } from "@stellify/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@stellify/select"
import { Badge } from "@stellify/badge"
import { Button } from "@stellify/button"
import { ConfirmDialog } from "@stellify/confirm-dialog"
import { EmptyState } from "@stellify/empty-state"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@stellify/tooltip"
import { cn } from "@stellify/utils"

/**
 * Everything the table family does, together, on in-memory data: search,
 * quick filters in the toolbar, header filters, the advanced panel, chips,
 * sort, selection with bulk actions, inline row actions, a table/cards
 * toggle and pagination. Modelled on Market Radar's corpus browser.
 */
const meta = {
  title: "Data table/Complete",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

// ── Data ────────────────────────────────────────────────────────────────────

type Scope = "unread" | "read" | "favorite" | "trash"

interface Doc {
  id: number
  title: string
  source: string
  published: string
  words: number
  favorite: boolean
  read: boolean
  deleted: boolean
}

const SOURCES = ["kpmg", "bain", "mckinsey", "deloitte", "bcg"]
const TOPICS = [
  "Gestión del riesgo TIC: avances, puntos ciegos y prioridades",
  "El BCE sube el listón de la ciberresiliencia con IA",
  "NIIF 9: el escrutinio continúa",
  "Gobernanza de la IA: expectativas supervisoras del BCE",
  "Generar confianza en la IA",
  "Lo que la consultoría enseña a los fundadores",
  "Ampliar el régimen SDR",
  "Novedades del centro fiscal europeo",
  "SREP 2026: resultados preliminares",
  "Más allá del sesgo: IA con equidad social",
  "Competir en la transición verde europea",
  "Acelerar la transición limpia",
  "Equipos distribuidos",
  "Nueva estrategia de ubicación",
  "Prácticas de ingeniería y talento técnico",
  "Nuevos modelos de proveedor para servicios TI",
  "Funciones de soporte y control transformadas",
  "DevSecOps en banca",
  "Arquitectura modular",
  "Backlogs convergentes",
  "¿Qué implica de verdad una transformación con IA?",
  "Asia-Pacífico pasa a agentes de IA autónomos",
]

const DOCS: Doc[] = Array.from({ length: 64 }, (_, i) => {
  const d = new Date(2026, 10, 4)
  d.setDate(d.getDate() - Math.floor(i * 1.3))
  return {
    id: 1600 - i,
    title: TOPICS[i % TOPICS.length] + (i >= TOPICS.length ? ` (${Math.floor(i / TOPICS.length) + 1})` : ""),
    source: SOURCES[i % SOURCES.length],
    published: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    words: 140 + ((i * 397) % 4100),
    favorite: i % 9 === 0,
    read: i % 4 === 3,
    deleted: false,
  }
})

const fmt = (n: number) => n.toLocaleString("es-ES")

// ── Story ───────────────────────────────────────────────────────────────────

function CompleteTable() {
  const [docs, setDocs] = useState(DOCS)
  const [search, setSearch] = useState("")
  const [scope, setScope] = useState<Scope>("unread")
  const [filters, setFilters] = useState<ActiveFilters>({})
  const [sort, setSort] = useState<DataTableSort | null>({ key: "published", dir: "desc" })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<Set<RowKey>>(new Set())
  const [view, setView] = useState<"table" | "cards">("table")
  const [pendingDelete, setPendingDelete] = useState<RowKey[] | null>(null)

  const patch = (ids: RowKey[], change: Partial<Doc>) =>
    setDocs((all) => all.map((d) => (ids.includes(d.id) ? { ...d, ...change } : d)))

  const columns: DataTableColumn<Doc>[] = [
    {
      key: "title",
      header: "Título",
      sortable: true,
      filter: Filters.string({ placeholder: "Texto del título" }),
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "source",
      header: "Fuente",
      sortable: true,
      filter: Filters.multiselect(SOURCES.map((s) => ({ value: s, label: s }))),
      render: (r) => <Badge tone="info">{r.source}</Badge>,
    },
    {
      key: "published",
      header: "Publicado",
      sortable: true,
      filter: Filters.dateRange(),
      render: (r) => <span className="font-mono text-xs tabular-nums text-muted-foreground">{r.published}</span>,
    },
    {
      key: "words",
      header: "Palabras",
      align: "right",
      sortable: true,
      filter: Filters.numberRange({ fromPlaceholder: "Mín.", toPlaceholder: "Máx." }),
      render: (r) => fmt(r.words),
    },
  ]

  const inScope = docs.filter((d) =>
    scope === "trash" ? d.deleted : !d.deleted && (scope === "unread" ? !d.read : scope === "read" ? d.read : d.favorite)
  )
  const searched = inScope.filter((d) => d.title.toLocaleLowerCase("es").includes(search.trim().toLocaleLowerCase("es")))
  const filtered = applyFilters(searched, filters)
  const sorted = useMemo(() => {
    if (!sort) return filtered
    const k = sort.key as keyof Doc
    return [...filtered].sort((a, b) => {
      const cmp = a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0
      return sort.dir === "asc" ? cmp : -cmp
    })
  }, [filtered, sort])
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize)

  const setFilter = (key: string, value: ActiveFilterValue) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }
  const clearAll = () => {
    setFilters({})
    setSearch("")
    setScope("unread")
    setPage(1)
  }

  const iconButton = (label: string, onClick: () => void, icon: React.ReactNode, className?: string) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="base" size="icon" className={cn("size-8 text-muted-foreground hover:text-foreground", className)} onClick={onClick} aria-label={label}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )

  const actions = (r: Doc) => (
    <div className="flex items-center justify-end gap-0.5">
      {iconButton(
        r.favorite ? "Quitar de favoritos" : "Marcar favorito",
        () => patch([r.id], { favorite: !r.favorite }),
        <Star className={cn(r.favorite && "fill-current")} />,
        r.favorite ? "text-warning hover:text-warning" : undefined
      )}
      {iconButton(
        r.read ? "Devolver a pendientes" : "Marcar como leído",
        () => patch([r.id], { read: !r.read }),
        r.read ? <EyeOff /> : <Eye />
      )}
      {iconButton("Descartar", () => setPendingDelete([r.id]), <Trash2 />)}
      {iconButton("Abrir original", () => {}, <ExternalLink />)}
    </div>
  )

  const filtering = search !== "" || countActiveFilters(filters) > 0
  const emptyState = (
    <EmptyState
      icon={FileText}
      title={filtering ? "Sin resultados" : "Nada pendiente"}
      description={filtering ? "Ningún documento coincide con los filtros actuales." : "No queda nada por leer en esta vista."}
    />
  )

  const toolbar = (
    <DataTableToolbar
      search={search}
      onSearchChange={(v) => {
        setSearch(v)
        setPage(1)
      }}
      labels={{ searchPlaceholder: "Buscar por título…" }}
      filters={
        <>
          <Select
            value={scope}
            onValueChange={(v) => {
              setScope(v as Scope)
              setSelected(new Set())
              setPage(1)
            }}
          >
            <SelectTrigger className="w-36" aria-label="Estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unread">Pendientes</SelectItem>
              <SelectItem value="read">Leídos</SelectItem>
              <SelectItem value="favorite">Favoritos</SelectItem>
              <SelectItem value="trash">Descartados</SelectItem>
            </SelectContent>
          </Select>
          <DataTableAdvancedFilters columns={columns} filters={filters} onChange={setFilter} onClearAll={() => setFilters({})} />
        </>
      }
      actions={
        <SegmentedControl
          aria-label="Vista"
          size="sm"
          value={view}
          onValueChange={setView}
          options={[
            { value: "table", label: <Table2 className="size-4" aria-label="Tabla" /> },
            { value: "cards", label: <LayoutGrid className="size-4" aria-label="Tarjetas" /> },
          ]}
        />
      }
    >
      <DataTableActiveFilters columns={columns} filters={filters} onChange={setFilter} onClearAll={clearAll} />
    </DataTableToolbar>
  )

  const footer = (
    <DataTablePagination
      total={sorted.length}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={(n) => {
        setPageSize(n)
        setPage(1)
      }}
    />
  )

  return (
    <TooltipProvider delayDuration={300}>
      {view === "table" ? (
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.id}
          sort={sort}
          onSortChange={(key) =>
            setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }))
          }
          filters={filters}
          onFilterChange={setFilter}
          selectedKeys={selected}
          onSelectedKeysChange={setSelected}
          bulkActions={(keys) => (
            <>
              <Button size="sm" variant="secondary" onClick={() => { patch([...keys], { read: true }); setSelected(new Set()) }}>
                <CheckCheck aria-hidden /> Marcar leídos
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPendingDelete([...keys])}>
                <Trash2 aria-hidden /> Descartar
              </Button>
            </>
          )}
          actions={actions}
          actionsLabel="Acciones"
          rowClassName={(r) => (r.read && scope !== "read" ? "text-muted-foreground" : "")}
          emptyState={emptyState}
          toolbar={toolbar}
          footer={footer}
        />
      ) : (
        <div className="space-y-3">
          {toolbar}
          <DataTableMobile
            layout="grid"
            columns={columns}
            rows={rows}
            getRowKey={(r) => r.id}
            actions={actions}
            rowClassName={(r) => (r.read ? "opacity-60" : undefined)}
            emptyState={emptyState}
          />
          <div className="rounded-lg bg-surface-2 px-3 py-2 [--field:var(--surface-3)]">{footer}</div>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title={pendingDelete && pendingDelete.length > 1 ? `¿Descartar ${pendingDelete.length} documentos?` : "¿Descartar este documento?"}
        description="Se ocultará de las vistas y podrás restaurarlo desde «Descartados»."
        labels={{ confirm: "Descartar" }}
        destructive
        onConfirm={() => {
          if (pendingDelete) patch(pendingDelete, { deleted: true })
          setSelected(new Set())
          setPendingDelete(null)
        }}
      />
    </TooltipProvider>
  )
}

export const Complete: Story = { name: "Complete (filters, selection, views)", render: () => <CompleteTable /> }
