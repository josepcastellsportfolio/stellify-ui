import { render, screen, within } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { KeyTakeaways } from "@stellify/key-takeaways"

const items = ["Entregamos en dos semanas.", "Sin permanencia."]

describe("KeyTakeaways", () => {
  it("is a complementary region named by its h2, with one list item per takeaway", () => {
    render(<KeyTakeaways items={items} />)
    const aside = screen.getByRole("complementary", { name: "En resumen" })
    expect(within(aside).getByRole("heading", { level: 2, name: "En resumen" })).toBeInTheDocument()
    expect(within(aside).getAllByRole("listitem").map(li => li.textContent)).toEqual(items)
  })

  it("accepts a custom title", () => {
    render(<KeyTakeaways items={items} title="Lo esencial" />)
    expect(screen.getByRole("complementary", { name: "Lo esencial" })).toBeInTheDocument()
  })

  it("renders nothing without items", () => {
    const { container } = render(<KeyTakeaways items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("prerenders to static HTML", () => {
    expect(renderToStaticMarkup(<KeyTakeaways items={items} />)).toContain("<aside")
  })
})
