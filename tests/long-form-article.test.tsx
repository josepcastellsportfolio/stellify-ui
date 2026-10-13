import { render, screen } from "@testing-library/react"
import { LongFormArticle } from "@stellify/long-form-article"

const content = {
  title: "Proyecto",
  intro: "Introducción.",
  status: "En producción",
  stats: [{ label: "Usuarios", value: "120" }],
  sections: [{ heading: "Contexto", paragraphs: ["Texto."] }],
  stack: ["React"],
  related: [{ href: "/otro", label: "Otro proyecto" }],
}

const follows = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)

describe("LongFormArticle slots", () => {
  it("renders afterIntro after the status badge and before the figures", () => {
    render(<LongFormArticle content={content} afterIntro={<div data-testid="after-intro" />} />)
    const slot = screen.getByTestId("after-intro")
    expect(follows(screen.getByText("En producción"), slot)).toBe(true)
    expect(follows(slot, screen.getByText("Usuarios"))).toBe(true)
  })

  it("renders afterContent after the stack and before the related links", () => {
    render(<LongFormArticle content={content} afterContent={<div data-testid="after-content" />} />)
    const slot = screen.getByTestId("after-content")
    expect(follows(screen.getByText("React"), slot)).toBe(true)
    expect(follows(slot, screen.getByRole("navigation", { name: "Enlaces relacionados" }))).toBe(true)
  })

  it("stays unchanged without the slots", () => {
    const { container } = render(<LongFormArticle content={content} />)
    expect(container.querySelector('[data-testid]')).toBeNull()
  })
})
