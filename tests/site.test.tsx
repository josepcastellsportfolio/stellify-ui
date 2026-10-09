import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { OfferCard } from "@stellify/offer-card"
import { OverflowMarquee } from "@stellify/overflow-marquee"
import { ProcessSteps } from "@stellify/process-steps"
import { ProfileIntro } from "@stellify/profile-intro"
import { SiteChat } from "@stellify/site-chat"
import { SiteFooter } from "@stellify/site-footer"
import { SiteNav } from "@stellify/site-nav"

describe("site-nav", () => {
  const links = [
    { href: "/servicios", label: "Servicios" },
    { href: "/proyectos", label: "Proyectos" },
  ]

  it("keeps real anchors in the DOM and toggles the mobile menu", async () => {
    render(<SiteNav links={links} brand={<a href="/">Inicio</a>} />)
    const nav = screen.getByRole("navigation", { name: "Principal" })
    // Desktop list + hidden mobile panel: both are crawlable anchors.
    expect(nav.querySelectorAll('a[href="/servicios"]')).toHaveLength(2)
    const panel = nav.querySelector("#site-nav-mobile") as HTMLElement
    expect(panel).not.toBeVisible()

    const toggle = screen.getByRole("button", { name: "Abrir menú" })
    expect(toggle).toHaveAttribute("aria-controls", "site-nav-mobile")
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(panel).toBeVisible()
    expect(within(panel).getByRole("link", { name: "Servicios" })).toHaveFocus()
  })

  it("closes on Escape and returns focus to the toggle", async () => {
    render(<SiteNav links={links} />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    await userEvent.keyboard("{Escape}")
    const toggle = screen.getByRole("button", { name: "Abrir menú" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(toggle).toHaveFocus()
  })

  it("uses renderLink for client-side routing", () => {
    render(
      <SiteNav
        links={links}
        renderLink={(link, props) => (
          <a href={link.href} className={props.className} data-router="">
            {link.label}
          </a>
        )}
      />
    )
    expect(screen.getAllByText("Servicios")[0]).toHaveAttribute("data-router")
  })
})

describe("site-footer", () => {
  it("renders labelled link groups, hardening external links", () => {
    render(
      <SiteFooter
        groups={[
          {
            title: "Contacto",
            links: [
              { href: "/contacto", label: "Escríbenos" },
              { href: "https://github.com/x", label: "GitHub", external: true },
            ],
          },
        ]}
        legal="© 2026 StellifyIT"
      />
    )
    const group = screen.getByRole("navigation", { name: "Contacto" })
    expect(within(group).getByRole("link", { name: "Escríbenos" })).not.toHaveAttribute("target")
    const external = within(group).getByRole("link", { name: "GitHub" })
    expect(external).toHaveAttribute("target", "_blank")
    expect(external).toHaveAttribute("rel", "noopener noreferrer")
    expect(screen.getByText("© 2026 StellifyIT")).toBeInTheDocument()
  })
})

describe("profile-intro", () => {
  it("renders a sized, lazy photo with the name as a heading", () => {
    render(
      <ProfileIntro name="Josep" role="Ingeniero de software" photoSrc="/me.jpg" photoAlt="Foto de Josep" photoWidth={160} photoHeight={160}>
        <p>Diez años de experiencia.</p>
      </ProfileIntro>
    )
    const img = screen.getByRole("img", { name: "Foto de Josep" })
    expect(img).toHaveAttribute("width", "160")
    expect(img).toHaveAttribute("height", "160")
    expect(img).toHaveAttribute("loading", "lazy")
    expect(screen.getByRole("heading", { level: 2, name: "Josep" })).toBeInTheDocument()
    expect(screen.getByText("Diez años de experiencia.")).toBeInTheDocument()
  })
})

describe("offer-card", () => {
  it("shows all content and links to the proof", () => {
    render(
      <OfferCard
        title="Agente telefónico"
        deliverable="Un agente que reserva por teléfono."
        fit="Cuando el teléfono no para."
        proof={{ href: "/proyectos/padelon", label: "Ver PádelOn" }}
      />
    )
    const card = screen.getByRole("article")
    expect(within(card).getByRole("heading", { level: 3, name: "Agente telefónico" })).toBeInTheDocument()
    expect(card).toHaveTextContent("Cuándo tiene sentido: Cuando el teléfono no para.")
    expect(within(card).getByRole("link", { name: "Ver PádelOn" })).toHaveAttribute("href", "/proyectos/padelon")
  })

  it("renders no link without proof", () => {
    render(<OfferCard title="A" deliverable="B" fit="C" />)
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})

describe("process-steps", () => {
  it("is an ordered list of numbered steps", () => {
    render(
      <ProcessSteps
        steps={[
          { title: "Diagnóstico", description: "Hablamos." },
          { title: "Propuesta", description: "Te enviamos un plan." },
        ]}
      />
    )
    const list = screen.getByRole("list")
    expect(list.tagName).toBe("OL")
    const items = within(list).getAllByRole("listitem")
    expect(items).toHaveLength(2)
    expect(within(items[1]).getByRole("heading", { name: "Propuesta" })).toBeInTheDocument()
  })
})

describe("site-chat", () => {
  const faqs = [{ question: "¿Cuánto cuesta?", answer: "Desde 500 €.", href: "/precios" }]

  it("is a FAQ block with links and no composer when disabled", () => {
    render(<SiteChat title="Preguntas" faqs={faqs} />)
    expect(screen.getByText("¿Cuánto cuesta?")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Ver más" })).toHaveAttribute("href", "/precios")
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })

  it("sends a trimmed question when enabled and shows cited answers", async () => {
    const onSend = vi.fn()
    render(
      <SiteChat
        title="Preguntas"
        faqs={faqs}
        enabled
        onSend={onSend}
        messages={[{ role: "assistant", text: "Desde 500 €.", citations: [{ label: "Precios", href: "/precios" }] }]}
      />
    )
    expect(within(screen.getByRole("log", { name: "Conversación" })).getByRole("link", { name: "Precios" })).toBeInTheDocument()
    const send = screen.getByRole("button", { name: "Enviar" })
    expect(send).toBeDisabled()
    await userEvent.type(screen.getByRole("textbox", { name: "Escribe tu pregunta" }), "  ¿Y el mantenimiento?  ")
    await userEvent.click(send)
    expect(onSend).toHaveBeenCalledWith("¿Y el mantenimiento?")
    expect(screen.getByRole("textbox", { name: "Escribe tu pregunta" })).toHaveValue("")
  })

  it("names the phase and blocks input when busy or out of turns", () => {
    const { rerender } = render(<SiteChat title="P" faqs={faqs} enabled phase="searching" />)
    expect(screen.getByText("Buscando en el contenido…")).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toBeDisabled()
    rerender(<SiteChat title="P" faqs={faqs} enabled turnsUsed={8} maxTurns={8} />)
    expect(screen.getByText(/máximo de preguntas/)).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toBeDisabled()
  })
})

describe("overflow-marquee", () => {
  function mockWidths(scrollWidth: number, clientWidth: number) {
    const sw = vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(scrollWidth)
    const cw = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(clientWidth)
    return () => {
      sw.mockRestore()
      cw.mockRestore()
    }
  }

  it("behaves like truncate when the text fits", () => {
    const restore = mockWidths(100, 100)
    try {
      render(<OverflowMarquee text="Corto" />)
      const el = screen.getByTitle("Corto")
      expect(el).toHaveAttribute("data-slot", "overflow-marquee")
      expect(el).not.toHaveAttribute("data-overflowing")
    } finally {
      restore()
    }
  })

  it("measures the overflow and derives the slide from it", () => {
    const restore = mockWidths(300, 100)
    try {
      render(<OverflowMarquee text="Un título larguísimo" speed={52} tailGap={8} />)
      const el = screen.getByTitle("Un título larguísimo")
      expect(el).toHaveAttribute("data-overflowing", "true")
      const inner = el.firstElementChild as HTMLElement
      expect(inner.style.getPropertyValue("--marquee-shift")).toBe("208px")
      expect(inner.style.transitionDuration).toBe("4000ms")
    } finally {
      restore()
    }
  })
})
