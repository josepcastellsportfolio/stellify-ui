import { render, screen, within } from "@testing-library/react"
import { MapPin, Megaphone, PenLine, Rocket } from "lucide-react"
import { QuadrantCell } from "@stellify/quadrant-cell"
import { QuadrantGrid } from "@stellify/quadrant-grid"
import { ReasonList } from "@stellify/reason-list"

function Grid({ active }: { active: string }) {
  return (
    <QuadrantGrid
      aria-label="Cuadrante de captación"
      columns={["Atracción · Vienen a ti", "Búsqueda activa · Vas tú"]}
      rows={["Tiempo", "Inversión"]}
    >
      <QuadrantCell icon={PenLine} code="C1 · Atracción · Tiempo" title="Contenido orgánico" description="d" active={active === "C1"} />
      <QuadrantCell icon={MapPin} code="C3 · Búsqueda activa · Tiempo" title="Prospección manual" description="d" active={active === "C3"} />
      <QuadrantCell icon={Megaphone} code="C2 · Atracción · Inversión" title="Publicidad y embudo" description="d" active={active === "C2"} />
      <QuadrantCell icon={Rocket} code="C4 · Búsqueda activa · Inversión" title="Captación a escala" description="d" active={active === "C4"} />
    </QuadrantGrid>
  )
}

describe("QuadrantGrid", () => {
  it("renders column headers, row labels and four cells", () => {
    render(<Grid active="C3" />)
    const grid = screen.getByRole("group", { name: "Cuadrante de captación" })
    expect(within(grid).getByText("Atracción · Vienen a ti")).toBeInTheDocument()
    expect(within(grid).getByText("Inversión")).toBeInTheDocument()
    expect(grid.querySelectorAll("[data-slot='quadrant-cell']")).toHaveLength(4)
  })

  it("throws a clear error unless it gets exactly four cells", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() =>
      render(
        <QuadrantGrid columns={["a", "b"]} rows={["c", "d"]}>
          <QuadrantCell icon={Rocket} code="x" title="x" description="x" />
        </QuadrantGrid>
      )
    ).toThrow(/exactly 4/)
  })
})

describe("QuadrantCell", () => {
  it("marks only the active cell and shows the TU VÍA badge there", () => {
    render(<Grid active="C3" />)
    const active = screen.getByText("Prospección manual").closest("[data-slot='quadrant-cell']")!
    expect(active).toHaveAttribute("data-active", "true")
    expect(within(active as HTMLElement).getByText("Tu vía")).toBeInTheDocument()
    expect(screen.getAllByText("Tu vía")).toHaveLength(1)
  })

  it("exposes the active state to assistive tech", () => {
    render(<Grid active="C1" />)
    expect(screen.getByText("Contenido orgánico").closest("[aria-current]")).toHaveAttribute("aria-current", "true")
  })
})

describe("ReasonList", () => {
  it("renders every reason as a list item", () => {
    render(<ReasonList reasons={["Dispones de tiempo.", "Prefieres no aparecer en cámara."]} />)
    const items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(2)
    expect(items[1]).toHaveTextContent("Prefieres no aparecer en cámara.")
  })

  it("renders nothing for an empty list", () => {
    const { container } = render(<ReasonList reasons={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
