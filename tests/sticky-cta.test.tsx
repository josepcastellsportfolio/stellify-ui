import { render, screen } from "@testing-library/react"
import { Phone } from "lucide-react"
import { StickyCta } from "@stellify/sticky-cta"

describe("StickyCta", () => {
  it("renders a mobile-only fixed bar and a matching in-flow spacer", () => {
    const { container } = render(<StickyCta label="Pide presupuesto" href="/contacto" />)
    const bar = container.querySelector('[data-slot="sticky-cta"]')!
    expect(bar).toHaveClass("fixed", "bottom-0", "z-40", "md:hidden")
    const spacer = container.querySelector('[data-slot="sticky-cta-spacer"]')!
    expect(spacer).toHaveAttribute("aria-hidden", "true")
    expect(spacer).toHaveClass("md:hidden")
    expect(screen.getByRole("link", { name: "Pide presupuesto" })).toHaveAttribute("href", "/contacto")
  })

  it("names an icon-only secondary action by its label", () => {
    render(
      <StickyCta
        label="Pide presupuesto"
        href="/contacto"
        secondary={{ label: "Llamar", href: "tel:+34600000000", icon: <Phone /> }}
      />
    )
    expect(screen.getByRole("link", { name: "Llamar" })).toHaveAttribute("href", "tel:+34600000000")
  })

  it("shows a text secondary action without an icon", () => {
    render(<StickyCta label="Reservar" href="/reservar" secondary={{ label: "Precios", href: "/precios" }} />)
    expect(screen.getByRole("link", { name: "Precios" })).toBeInTheDocument()
  })

  it("renders nothing when hidden", () => {
    const { container } = render(<StickyCta label="Reservar" href="/reservar" hidden />)
    expect(container).toBeEmptyDOMElement()
  })
})
