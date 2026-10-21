import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { KanbanBoard, KanbanCard, KanbanColumn } from "@stellify/kanban"

const COLUMNS = [
  { id: "new", title: "Nuevo" },
  { id: "contacted", title: "Contactado" },
  { id: "replied", title: "Respondió" },
]

function Board({ onMove = vi.fn() }: { onMove?: (card: string, to: string) => void }) {
  return (
    <KanbanBoard columns={COLUMNS} onMove={onMove} label="Seguimiento">
      <KanbanColumn id="new" count={1}>
        <KanbanCard id="7" columnId="new" title="PádelOn" subtitle="Murcia · 72" badges={<span>Revisar</span>} />
      </KanbanColumn>
      <KanbanColumn id="contacted" count={0} emptyText="Nadie contactado aún" />
      <KanbanColumn id="replied" count={0} />
    </KanbanBoard>
  )
}

/** A DataTransfer stand-in: jsdom has none. */
function transfer() {
  const data: Record<string, string> = {}
  return {
    data,
    get types() {
      return Object.keys(data)
    },
    setData: (type: string, value: string) => {
      data[type] = value
    },
    getData: (type: string) => data[type] ?? "",
    dropEffect: "none",
    effectAllowed: "all",
  }
}

describe("Kanban", () => {
  it("names the board and each column, with its count and empty text", () => {
    render(<Board />)
    const board = screen.getByRole("region", { name: "Seguimiento" })
    const nuevo = within(board).getByRole("region", { name: "Nuevo" })
    expect(nuevo).toHaveTextContent("1")
    expect(within(nuevo).getByRole("listitem", { name: "PádelOn" })).toHaveTextContent("Murcia · 72")
    expect(screen.getByRole("region", { name: "Contactado" })).toHaveTextContent("Nadie contactado aún")
  })

  it("moves a card with its menu, which leaves out the current column", async () => {
    const onMove = vi.fn()
    render(<Board onMove={onMove} />)
    const menu = screen.getByRole("combobox", { name: "Mover PádelOn a" })
    expect(within(menu).queryByRole("option", { name: "Nuevo" })).not.toBeInTheDocument()
    await userEvent.selectOptions(menu, "contacted")
    expect(onMove).toHaveBeenCalledWith("7", "contacted")
  })

  it("moves a card dropped on another column", () => {
    const onMove = vi.fn()
    render(<Board onMove={onMove} />)
    const dt = transfer()
    fireEvent.dragStart(screen.getByRole("listitem", { name: "PádelOn" }), { dataTransfer: dt })
    const target = screen.getByRole("region", { name: "Respondió" })
    fireEvent.dragOver(target, { dataTransfer: dt })
    expect(target).toHaveAttribute("data-over", "true")
    fireEvent.drop(target, { dataTransfer: dt })
    expect(onMove).toHaveBeenCalledWith("7", "replied")
    expect(target).not.toHaveAttribute("data-over")
  })

  it("ignores a drop on its own column and drags that are not cards", () => {
    const onMove = vi.fn()
    render(<Board onMove={onMove} />)
    const dt = transfer()
    fireEvent.dragStart(screen.getByRole("listitem", { name: "PádelOn" }), { dataTransfer: dt })
    fireEvent.drop(screen.getByRole("region", { name: "Nuevo" }), { dataTransfer: dt })
    const file = transfer()
    file.setData("Files", "x")
    fireEvent.drop(screen.getByRole("region", { name: "Contactado" }), { dataTransfer: file })
    expect(onMove).not.toHaveBeenCalled()
  })

  it("throws outside a board", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<KanbanColumn id="x" />)).toThrow(/inside a KanbanBoard/)
  })
})
