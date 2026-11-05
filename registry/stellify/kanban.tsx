import { GripVertical } from "lucide-react"
import { createContext, useContext, useId, useState, type DragEvent, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface KanbanColumnDef {
  id: string
  title: string
}

interface KanbanContextValue {
  columns: KanbanColumnDef[]
  onMove: (cardId: string, toColumnId: string) => void
}

const KanbanContext = createContext<KanbanContextValue | null>(null)

function useKanban(): KanbanContextValue {
  const ctx = useContext(KanbanContext)
  if (!ctx) throw new Error("KanbanColumn and KanbanCard must be inside a KanbanBoard")
  return ctx
}

// Only drags that started on a KanbanCard are accepted by a column.
const DRAG_TYPE = "application/x-stellify-kanban-card"

export interface KanbanBoardProps {
  columns: KanbanColumnDef[]
  /** A card was dropped on another column, or moved with its «Mover a…» menu. */
  onMove: (cardId: string, toColumnId: string) => void
  /** Accessible name of the board. */
  label?: string
  children: ReactNode
  className?: string
}

/** Columns side by side (horizontal scroll on small screens). Cards move by native drag and drop
 *  on desktop or with the «Mover a…» menu on each card, which works with keyboard and touch. */
function KanbanBoard({ columns, onMove, label = "Tablero", children, className }: KanbanBoardProps) {
  return (
    <KanbanContext.Provider value={{ columns, onMove }}>
      <div
        role="region"
        aria-label={label}
        data-slot="kanban-board"
        className={cn(
          "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:snap-none md:overflow-visible md:px-0",
          className
        )}
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
    </KanbanContext.Provider>
  )
}

export interface KanbanColumnProps {
  id: string
  /** Defaults to the title given in the board's `columns`. */
  title?: string
  /** Shown next to the title. */
  count?: number
  /** Shown when the column has no cards. */
  emptyText?: ReactNode
  children?: ReactNode
  className?: string
}

function KanbanColumn({ id, title, count, emptyText = "Sin elementos", children, className }: KanbanColumnProps) {
  const { columns, onMove } = useKanban()
  const headingId = useId()
  const [over, setOver] = useState(false)
  const name = title ?? columns.find((c) => c.id === id)?.title ?? id
  const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : []

  const accepts = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes(DRAG_TYPE)
  return (
    <section
      aria-labelledby={headingId}
      data-slot="kanban-column"
      data-over={over || undefined}
      onDragOver={(e) => {
        if (!accepts(e)) return
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        setOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
      }}
      onDrop={(e) => {
        setOver(false)
        if (!accepts(e)) return
        e.preventDefault()
        const { cardId, from } = JSON.parse(e.dataTransfer.getData(DRAG_TYPE)) as { cardId: string; from: string }
        if (from !== id) onMove(cardId, id)
      }}
      className={cn(
        "flex w-[80vw] max-w-xs shrink-0 snap-start flex-col gap-3 rounded-[var(--radius-card,var(--radius))] bg-muted/50 p-3 transition-colors md:w-auto md:max-w-none",
        over && "bg-primary/10 ring-2 ring-primary/40",
        className
      )}
    >
      <header className="flex items-center justify-between gap-2 px-1">
        <h2 id={headingId} className="text-sm font-semibold">
          {name}
        </h2>
        {count !== undefined && (
          <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {count}
          </span>
        )}
      </header>
      {items.length > 0 ? (
        <ul role="list" className="flex flex-col gap-3">
          {items}
        </ul>
      ) : (
        <p className="px-1 py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
      )}
    </section>
  )
}

export interface KanbanCardProps {
  id: string
  /** The column the card is in: it is left out of the «Mover a…» menu. */
  columnId: string
  title: string
  /** Line under the title (address, score…). */
  subtitle?: ReactNode
  /** Badges row (follow-up pending, «revisar»…). */
  badges?: ReactNode
  /** Buttons at the bottom of the card. */
  actions?: ReactNode
  /** Extra content between the badges and the actions (a collapsible message…). */
  children?: ReactNode
  className?: string
}

function KanbanCard({ id, columnId, title, subtitle, badges, actions, children, className }: KanbanCardProps) {
  const { columns, onMove } = useKanban()
  const titleId = useId()
  const [dragging, setDragging] = useState(false)
  const targets = columns.filter((c) => c.id !== columnId)
  return (
    <li
      draggable
      data-slot="kanban-card"
      data-dragging={dragging || undefined}
      aria-labelledby={titleId}
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ cardId: id, from: columnId }))
        e.dataTransfer.effectAllowed = "move"
        setDragging(true)
      }}
      onDragEnd={() => setDragging(false)}
      className={cn(
        "flex flex-col gap-2 rounded-[var(--radius-card,var(--radius))] bg-card p-3 text-card-foreground shadow-sm transition-[box-shadow,opacity] hover:shadow-[var(--shadow-card,none)] md:cursor-grab",
        dragging && "opacity-50",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 hidden size-4 shrink-0 text-muted-foreground md:block" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="truncate text-sm font-semibold" title={title}>
            {title}
          </h3>
          {subtitle && <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
      {badges && <div className="flex flex-wrap gap-1.5">{badges}</div>}
      {children}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {actions}
        {targets.length > 0 && (
          <select
            value=""
            aria-label={`Mover ${title} a`}
            onChange={(e) => e.target.value && onMove(id, e.target.value)}
            className="ml-auto h-8 rounded-md border bg-background px-2 text-sm text-foreground"
          >
            <option value="">Mover a…</option>
            {targets.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        )}
      </div>
    </li>
  )
}

export { KanbanBoard, KanbanCard, KanbanColumn }
