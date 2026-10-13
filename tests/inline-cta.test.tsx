import { render, screen } from "@testing-library/react"
import { InlineCta } from "@stellify/inline-cta"

describe("InlineCta", () => {
  it("renders the sentence and a real link styled as a primary button", () => {
    render(<InlineCta text="¿Lo hablamos?" actionLabel="Pide presupuesto" href="/contacto" />)
    expect(screen.getByText("¿Lo hablamos?")).toBeInTheDocument()
    const link = screen.getByRole("link", { name: "Pide presupuesto" })
    expect(link).toHaveAttribute("href", "/contacto")
    expect(link).toHaveClass("bg-primary")
  })

  it("delegates the link to renderLink with the button classes", () => {
    render(
      <InlineCta
        text="¿Lo hablamos?"
        actionLabel="Pide presupuesto"
        href="/contacto"
        renderLink={(link, props) => (
          <a data-router href={link.href} className={props.className}>
            {link.label}
          </a>
        )}
      />
    )
    const link = screen.getByRole("link", { name: "Pide presupuesto" })
    expect(link).toHaveAttribute("data-router")
    expect(link).toHaveClass("bg-primary")
  })
})
