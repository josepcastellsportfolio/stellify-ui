import { act, fireEvent, render, renderHook, screen } from "@testing-library/react"
import { MegaMenuPanel, type MegaMenuCategory } from "@stellify/mega-menu-panel"
import { FacetGrid, NavPreviewCard } from "@stellify/nav-preview-card"
import { MEGA_MENU_CLOSE_DELAY_MS, megaMenuPanelId, useMegaMenu } from "@stellify/use-mega-menu"

const category: MegaMenuCategory = {
  id: "servicios",
  label: "Servicios",
  groups: [
    {
      id: "web",
      label: "Web",
      links: [
        { id: "landing", href: "/landing", label: "Landing", summary: "Una página que convierte." },
        { id: "seo", href: "/seo", label: "SEO", summary: "Que te encuentren." },
      ],
    },
    { id: "ia", label: "IA", links: [{ id: "agente", href: "/agente", label: "Agente", image: "/agente.webp" }] },
  ],
  featured: [
    { id: "landing", href: "/landing", label: "Landing", summary: "Una página que convierte." },
    { id: "agente", href: "/agente", label: "Agente", image: "/agente.webp" },
  ],
  cta: { href: "/servicios", label: "Ver todo" },
}

describe("MegaMenuPanel", () => {
  it("renders hidden with every link when closed", () => {
    const { container } = render(<MegaMenuPanel category={category} visible={false} />)
    const panel = container.querySelector('[data-slot="mega-menu-panel"]')!
    expect(panel).toHaveAttribute("id", "nav-panel-servicios")
    expect(panel).toHaveAttribute("hidden")
    expect(panel.querySelector('a[href="/seo"]')).not.toBeNull()
  })

  it("labels each column and previews the hovered or focused link", () => {
    const { container } = render(<MegaMenuPanel category={category} visible />)
    expect(screen.getByRole("list", { name: "Web" })).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "IA" })).toBeInTheDocument()
    const lead = () => container.querySelector('[data-slot="nav-preview-card"]')!
    expect(lead()).toHaveAttribute("href", "/landing")

    fireEvent.mouseEnter(screen.getByRole("link", { name: "SEO" }))
    expect(lead()).toHaveAttribute("href", "/seo")
    expect(lead()).toHaveTextContent("Que te encuentren.")
    fireEvent.focus(screen.getByRole("link", { name: "Agente" }))
    expect(lead()).toHaveAttribute("href", "/agente")
  })

  it("keeps preview cards out of the tab order and closes through onNavigate", () => {
    const onNavigate = vi.fn()
    const { container } = render(<MegaMenuPanel category={category} visible onNavigate={onNavigate} />)
    const cards = container.querySelectorAll('[data-slot="nav-preview-card"]')
    expect(cards).toHaveLength(2)
    cards.forEach(card => {
      expect(card).toHaveAttribute("tabindex", "-1")
      expect(card).toHaveAttribute("aria-hidden", "true")
    })
    // jsdom cannot navigate; keep the clicks in the page.
    const stay = (event: Event) => event.preventDefault()
    document.addEventListener("click", stay)
    fireEvent.click(screen.getByRole("link", { name: "Ver todo" }))
    fireEvent.click(cards[0])
    document.removeEventListener("click", stay)
    expect(onNavigate).toHaveBeenCalledTimes(2)
  })

  it("routes every link through renderLink", () => {
    const { container } = render(
      <MegaMenuPanel category={category} visible renderLink={(link, props) => <a data-router href={link.href} {...props} />} />,
    )
    expect(container.querySelectorAll("a:not([data-router])")).toHaveLength(0)
    expect(screen.getByRole("link", { name: "SEO" })).toHaveAttribute("data-router")
  })

  it("adds the CSS motion only when asked", () => {
    const { container, rerender } = render(<MegaMenuPanel category={category} visible />)
    expect(container.querySelector("[data-nav-content]")).not.toHaveClass("animate-in")
    rerender(<MegaMenuPanel category={category} visible motion="css" />)
    expect(container.querySelector("[data-nav-content]")).toHaveClass("animate-in")
  })
})

describe("NavPreviewCard / FacetGrid", () => {
  it("shows the photo with a scrim, or the decoration on the large dark card", () => {
    const { container, rerender } = render(<NavPreviewCard href="/a" title="A" image="/a.webp" />)
    expect(container.querySelector("img")).toHaveAttribute("src", "/a.webp")
    expect(container.querySelector('[data-slot="nav-preview-scrim"]')).not.toBeNull()

    rerender(<NavPreviewCard href="/a" title="A" summary="Resumen" decoration={<FacetGrid seed="a" />} />)
    expect(container.querySelector("img")).toBeNull()
    expect(container.querySelector('[data-slot="facet-grid"]')).not.toBeNull()
    expect(container).toHaveTextContent("Resumen")

    rerender(<NavPreviewCard href="/a" title="A" summary="Resumen" size="sm" decoration={<FacetGrid seed="a" />} />)
    expect(container.querySelector('[data-slot="facet-grid"]')).toBeNull()
    expect(container).not.toHaveTextContent("Resumen")
  })

  it("lights the same tiles for the same seed", () => {
    const lit = (seed: string) => {
      const { container, unmount } = render(<FacetGrid seed={seed} />)
      const result = Array.from(container.querySelectorAll("polygon")).map(p => p.getAttribute("data-lit"))
      unmount()
      return result
    }
    const a = lit("landing")
    expect(a).toEqual(lit("landing"))
    expect(a.filter(v => v === "full")).toHaveLength(1)
    expect(a.filter(v => v === "half")).toHaveLength(1)
  })
})

describe("useMegaMenu", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("opens instantly and closes after the grace delay unless cancelled", () => {
    const { result } = renderHook(() => useMegaMenu())
    act(() => result.current.open("a"))
    expect(result.current.openId).toBe("a")
    act(() => result.current.scheduleClose())
    act(() => vi.advanceTimersByTime(MEGA_MENU_CLOSE_DELAY_MS - 10))
    act(() => result.current.cancelClose())
    act(() => vi.advanceTimersByTime(100))
    expect(result.current.openId).toBe("a")
    act(() => result.current.scheduleClose())
    act(() => vi.advanceTimersByTime(MEGA_MENU_CLOSE_DELAY_MS))
    expect(result.current.openId).toBeNull()
  })

  it("keeps the closing panel visible until finishClosing, unless animate is false", () => {
    const { result } = renderHook(() => useMegaMenu())
    act(() => result.current.open("a"))
    act(() => result.current.close())
    expect(result.current.openId).toBeNull()
    expect(result.current.visibleId).toBe("a")
    act(() => result.current.finishClosing())
    expect(result.current.visibleId).toBeNull()

    act(() => result.current.open("b"))
    act(() => result.current.close({ animate: false }))
    expect(result.current.visibleId).toBeNull()
  })

  it("builds panel ids", () => {
    expect(megaMenuPanelId("x")).toBe("nav-panel-x")
    expect(megaMenuPanelId("x", "hdr")).toBe("hdr-x")
  })
})
