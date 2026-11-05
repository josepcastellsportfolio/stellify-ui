import { fireEvent, render, screen } from "@testing-library/react"
import { AnimatedText } from "@stellify/animated-text"
import { ClipReveal } from "@stellify/clip-reveal"
import { ClosingPanel } from "@stellify/closing-panel"
import { Marquee } from "@stellify/marquee"
import { ScrollReveal } from "@stellify/scroll-reveal"
import { ScrubWords } from "@stellify/scrub-words"

function mockReducedMotion(matches: boolean) {
  const original = window.matchMedia
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
  return () => {
    window.matchMedia = original
  }
}

describe("GSAP scroll components", () => {
  it("render their final state as plain markup (prerender-safe)", () => {
    const restore = mockReducedMotion(true)
    const { container } = render(
      <>
        <ClipReveal id="clip" className="bg-black" rootClassName="my-4">
          <p>Panel</p>
        </ClipReveal>
        <ScrollReveal id="reveal" surface="bg-muted">
          <p>Sección</p>
        </ScrollReveal>
        <ScrubWords as="h2">Una frase que se ilumina</ScrubWords>
        <AnimatedText as="h3" split="words">
          Titular
        </AnimatedText>
      </>,
    )
    restore()

    const clip = container.querySelector('[data-slot="clip-reveal"]')!
    expect(clip).toHaveAttribute("id", "clip")
    expect(clip).toHaveClass("my-4")
    const panel = clip.querySelector('[data-clip="panel"]') as HTMLElement
    expect(panel).toHaveClass("bg-black")
    expect(panel.style.clipPath).toBe("")

    const layer = container.querySelector('[data-reveal="layer"]') as HTMLElement
    expect(layer).toHaveAttribute("aria-hidden", "true")
    expect(layer).toHaveClass("bg-muted")
    expect(layer.style.transform).toBe("")

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Una frase que se ilumina")
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Titular")
  })

  it("mount without errors when motion is allowed", () => {
    const restore = mockReducedMotion(false)
    expect(() =>
      render(
        <>
          <ClipReveal>
            <p>Panel</p>
          </ClipReveal>
          <ScrollReveal>
            <p>Sección</p>
          </ScrollReveal>
          <ScrubWords>Una frase</ScrubWords>
        </>,
      ),
    ).not.toThrow()
    restore()
  })
})

describe("Marquee", () => {
  const items = ["React", "Django", "FastAPI"]

  it("reads the list once and hides the doubled moving track", () => {
    const { container } = render(<Marquee label="Tecnologías" items={items} />)
    expect(container.querySelector(".sr-only")).toHaveTextContent("Tecnologías: React, Django, FastAPI")
    const track = container.querySelector('[data-slot="marquee-track"]')!
    expect(track).toHaveAttribute("aria-hidden", "true")
    expect(track.children).toHaveLength(6)
  })

  it("loops with the Web Animations API and pauses on hover", () => {
    const anim = { pause: vi.fn(), play: vi.fn(), cancel: vi.fn() }
    const animate = vi.fn(() => anim)
    const original = HTMLElement.prototype.animate
    HTMLElement.prototype.animate = animate as unknown as typeof HTMLElement.prototype.animate
    const { container, unmount } = render(<Marquee label="Clientes" items={items} duration={20} direction="right" />)

    expect(animate).toHaveBeenCalledWith(
      [{ transform: "translateX(-50%)" }, { transform: "translateX(0)" }],
      expect.objectContaining({ duration: 20000, iterations: Infinity }),
    )
    const root = container.querySelector('[data-slot="marquee"]')!
    fireEvent.mouseEnter(root)
    expect(anim.pause).toHaveBeenCalled()
    fireEvent.mouseLeave(root)
    expect(anim.play).toHaveBeenCalled()
    unmount()
    expect(anim.cancel).toHaveBeenCalled()
    HTMLElement.prototype.animate = original
  })

  it("does not move under reduced motion", () => {
    const restore = mockReducedMotion(true)
    const animate = vi.fn()
    const original = HTMLElement.prototype.animate
    HTMLElement.prototype.animate = animate as unknown as typeof HTMLElement.prototype.animate
    render(<Marquee label="Clientes" items={items} />)
    expect(animate).not.toHaveBeenCalled()
    HTMLElement.prototype.animate = original
    restore()
  })

  it("supports custom items and no separator", () => {
    const { container } = render(
      <Marquee label="Logos" items={["a", "b"]} separator={null} renderItem={item => <b>{item.toUpperCase()}</b>} />,
    )
    const track = container.querySelector('[data-slot="marquee-track"]')!
    expect(track.querySelectorAll("b")).toHaveLength(4)
    expect(track.querySelector(".rounded-full")).toBeNull()
  })
})

describe("ClosingPanel", () => {
  it("renders title, intro and the action slot", () => {
    render(
      <ClosingPanel title="Hablemos" intro="Una llamada de 20 minutos." action={<a href="/contacto">Reservar</a>} />,
    )
    expect(screen.getByRole("heading", { level: 2, name: "Hablemos" })).toBeInTheDocument()
    expect(screen.getByText("Una llamada de 20 minutos.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Reservar" })).toHaveAttribute("href", "/contacto")
  })

  it("can render without motion, grid or intro, at another heading level", () => {
    const { container } = render(<ClosingPanel title="Fin" titleAs="h3" animated={false} dotGrid={false} />)
    expect(screen.getByRole("heading", { level: 3, name: "Fin" })).toBeInTheDocument()
    expect(container.querySelector('[data-slot="closing-panel-grid"]')).toBeNull()
    expect(container.querySelector('[data-slot="animated-text"]')).toBeNull()
  })
})
