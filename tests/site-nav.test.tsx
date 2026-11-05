import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SiteNav, type MegaMenuCategory, type SiteNavMenuMotionProps } from "@stellify/site-nav"

// jsdom has no PointerEvent: without it `pointerType` never reaches React.
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    pointerType: string
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init)
      this.pointerType = init.pointerType ?? ""
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent
}

const links = [
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
]

const menu: MegaMenuCategory[] = [
  {
    id: "servicios",
    label: "Servicios",
    groups: [
      {
        id: "web",
        label: "Web",
        links: [
          { id: "landing", href: "/servicios/landing", label: "Landing pages", summary: "Una página que convierte." },
          { id: "seo", href: "/servicios/seo", label: "SEO" },
        ],
      },
    ],
    cta: { href: "/servicios", label: "Todos los servicios" },
  },
  {
    id: "recursos",
    label: "Recursos",
    groups: [{ id: "blog", label: "Blog", links: [{ id: "articulos", href: "/articulos", label: "Artículos" }] }],
  },
]

describe("SiteNav — links only (original API)", () => {
  it("keeps the mobile dropdown in the DOM, hidden, and opens it from the toggle", async () => {
    const user = userEvent.setup()
    render(<SiteNav links={links} brand={<a href="/">Logo</a>} action={<a href="/cta">Pedir</a>} />)
    const toggle = screen.getByRole("button", { name: "Abrir menú" })
    const panel = document.getElementById("site-nav-mobile")!
    expect(panel).toHaveAttribute("hidden")
    // Both links plus the action, crawlable while closed.
    expect(panel.querySelectorAll("a[href]")).toHaveLength(3)
    expect(toggle).toHaveAttribute("aria-controls", "site-nav-mobile")

    await user.click(toggle)
    expect(panel).not.toHaveAttribute("hidden")
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(toggle).toHaveAccessibleName("Cerrar menú")
    expect(within(panel).getByRole("link", { name: "Sobre mí" })).toHaveFocus()
    expect(within(panel).getByRole("link", { name: "Pedir" })).toBeInTheDocument()

    await user.keyboard("{Escape}")
    expect(panel).toHaveAttribute("hidden")
    await waitFor(() => expect(toggle).toHaveFocus())
  })

  it("wraps Tab inside the open dropdown", async () => {
    const user = userEvent.setup()
    render(<SiteNav links={links} />)
    await user.click(screen.getByRole("button", { name: "Abrir menú" }))
    const panel = document.getElementById("site-nav-mobile")!
    const [, last] = within(panel).getAllByRole("link")
    last.focus()
    await user.tab()
    expect(within(panel).getAllByRole("link")[0]).toHaveFocus()
  })

  it("passes className, onClick and the label as children to renderLink", () => {
    const renderLink = vi.fn((link, props) => <a data-router href={link.href} {...props} />)
    render(<SiteNav links={links} renderLink={renderLink} />)
    expect(renderLink).toHaveBeenCalledWith(
      links[0],
      expect.objectContaining({ className: expect.any(String), children: "Sobre mí" }),
    )
    expect(document.querySelectorAll("a[data-router]").length).toBeGreaterThan(0)
  })

  it("takes its strings from labels", () => {
    render(<SiteNav links={links} labels={{ nav: "Main", openMenu: "Open menu" }} />)
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument()
  })
})

describe("SiteNav — mega-menu (desktop)", () => {
  it("renders every panel hidden so all links are in the HTML", () => {
    render(<SiteNav links={links} menu={menu} />)
    const panel = document.getElementById("nav-panel-servicios")!
    expect(panel).toHaveAttribute("hidden")
    expect(panel.querySelector('a[href="/servicios/seo"]')).not.toBeNull()
    expect(document.getElementById("nav-panel-recursos")).toHaveAttribute("hidden")
  })

  it("opens a panel from its trigger and closes it with Escape, back on the trigger", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<SiteNav links={links} menu={menu} onOpenChange={onOpenChange} />)
    const trigger = screen.getByRole("button", { name: "Servicios" })
    expect(trigger).toHaveAttribute("aria-controls", "nav-panel-servicios")

    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(document.getElementById("nav-panel-servicios")).not.toHaveAttribute("hidden")
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    await user.keyboard("{Escape}")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(document.getElementById("nav-panel-servicios")).toHaveAttribute("hidden")
    expect(trigger).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("dims the other triggers with the muted token, not opacity, while a panel is open", async () => {
    const user = userEvent.setup()
    render(<SiteNav links={links} menu={menu} />)
    const [open, ...others] = menu.map(category => screen.getByRole("button", { name: category.label }))
    for (const trigger of [open, ...others]) expect(trigger).not.toHaveAttribute("data-dimmed")

    await user.click(open)
    expect(open).not.toHaveAttribute("data-dimmed")
    for (const trigger of others) {
      expect(trigger).toHaveAttribute("data-dimmed")
      expect(trigger.className).toContain("data-[dimmed]:text-muted-foreground")
      expect(trigger.className).not.toMatch(/\bopacity-/)
    }
  })

  it("opens on ArrowDown and moves focus to the first link", async () => {
    const user = userEvent.setup()
    render(<SiteNav links={links} menu={menu} />)
    screen.getByRole("button", { name: "Servicios" }).focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("link", { name: "Landing pages" })).toHaveFocus()
  })

  it("switches category and closes on a press outside", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <SiteNav links={links} menu={menu} />
        <button type="button">fuera</button>
      </div>,
    )
    await user.click(screen.getByRole("button", { name: "Servicios" }))
    await user.click(screen.getByRole("button", { name: "Recursos" }))
    expect(document.getElementById("nav-panel-servicios")).toHaveAttribute("hidden")
    expect(document.getElementById("nav-panel-recursos")).not.toHaveAttribute("hidden")
    fireEvent.pointerDown(screen.getByRole("button", { name: "fuera" }))
    expect(document.getElementById("nav-panel-recursos")).toHaveAttribute("hidden")
  })

  it("opens on mouse hover but not on touch hover", () => {
    render(<SiteNav links={links} menu={menu} />)
    const trigger = screen.getByRole("button", { name: "Servicios" })
    fireEvent.pointerEnter(trigger, { pointerType: "touch" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    fireEvent.pointerEnter(trigger, { pointerType: "mouse" })
    expect(trigger).toHaveAttribute("aria-expanded", "true")
  })

  it("closes when a panel link is followed and reports onNavigate", async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <SiteNav
        links={links}
        menu={menu}
        onNavigate={onNavigate}
        renderLink={(link, props) => <a href={link.href} {...props} onClick={e => { e.preventDefault(); props.onClick?.() }} />}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Servicios" }))
    await user.click(screen.getByRole("link", { name: "SEO" }))
    expect(onNavigate).toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Servicios" })).toHaveAttribute("aria-expanded", "false")
  })

  it("hands the menu state to menuMotion and uses idPrefix for the ids", async () => {
    const user = userEvent.setup()
    const seen: SiteNavMenuMotionProps[] = []
    const Motion = (props: SiteNavMenuMotionProps) => {
      seen.push(props)
      return null
    }
    render(<SiteNav links={links} menu={menu} menuMotion={Motion} idPrefix="hdr" />)
    expect(document.getElementById("hdr-panel-servicios")).not.toBeNull()
    expect(document.getElementById("hdr-mobile")).toBeNull() // sheet mounts only when open
    await user.click(screen.getByRole("button", { name: "Servicios" }))
    const last = seen[seen.length - 1]
    expect(last.openId).toBe("servicios")
    expect(last.panelId("servicios")).toBe("hdr-panel-servicios")
    expect(last.rootRef.current?.tagName).toBe("NAV")
  })
})

describe("SiteNav — mobile sheet", () => {
  afterEach(() => {
    document.body.style.overflow = ""
  })

  it("opens a modal sheet with focus trapped and the page scroll locked", async () => {
    const user = userEvent.setup()
    render(<SiteNav links={links} menu={menu} mobileActions={<a href="/login">Entrar</a>} />)
    const toggle = screen.getByRole("button", { name: "Abrir menú" })
    await user.click(toggle)

    const sheet = screen.getByRole("dialog", { name: "Menú" })
    expect(sheet).toHaveAttribute("aria-modal", "true")
    expect(sheet.parentElement).toBe(document.body)
    expect(document.body.style.overflow).toBe("hidden")
    expect(within(sheet).getByRole("button", { name: "Servicios" })).toBeInTheDocument()
    expect(within(sheet).getByRole("link", { name: "Contacto" })).toBeInTheDocument()
    expect(within(sheet).getByRole("link", { name: "Entrar" })).toBeInTheDocument()

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(document.body.style.overflow).toBe("")
    await waitFor(() => expect(toggle).toHaveFocus())
  })

  it("drills into a category and back, keeping the hidden pane inert", async () => {
    const user = userEvent.setup()
    render(<SiteNav links={links} menu={menu} />)
    await user.click(screen.getByRole("button", { name: "Abrir menú" }))
    const sheet = screen.getByRole("dialog")
    const root = sheet.querySelector('[data-slot="site-nav-sheet-root"]')!
    const detail = sheet.querySelector('[data-slot="site-nav-sheet-detail"]')!
    expect(detail).toHaveAttribute("inert")

    await user.click(within(sheet).getByRole("button", { name: "Servicios" }))
    expect(root).toHaveAttribute("inert")
    expect(detail).not.toHaveAttribute("inert")
    expect(within(detail as HTMLElement).getByRole("heading", { name: "Servicios" })).toBeInTheDocument()
    expect(within(detail as HTMLElement).getByRole("link", { name: "Landing pages" })).toHaveAttribute("href", "/servicios/landing")
    expect(within(detail as HTMLElement).getByRole("link", { name: "Todos los servicios" })).toBeInTheDocument()
    await waitFor(() => expect(within(sheet).getByRole("button", { name: "Atrás" })).toHaveFocus())

    await user.click(within(sheet).getByRole("button", { name: "Atrás" }))
    expect(detail).toHaveAttribute("inert")
    await waitFor(() => expect(within(sheet).getByRole("button", { name: "Servicios" })).toHaveFocus())
  })

  it("closes when a link in the sheet or its dock is followed", async () => {
    const user = userEvent.setup()
    render(
      <SiteNav
        links={links}
        menu={menu}
        mobileActions={<a href="#entrar">Entrar</a>}
        renderLink={(link, props) => <a href={`#${link.href}`} {...props} />}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Abrir menú" }))
    await user.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Entrar" }))
    expect(screen.queryByRole("dialog")).toBeNull()

    await user.click(screen.getByRole("button", { name: "Abrir menú" }))
    await user.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Contacto" }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("closes on a brand link and still runs the link's own handler (client routing)", async () => {
    const user = userEvent.setup()
    const routed = vi.fn()
    render(
      <SiteNav
        links={links}
        menu={menu}
        mobileBrand={
          <a href="/" onClick={event => (event.preventDefault(), routed())}>
            Inicio
          </a>
        }
      />,
    )
    await user.click(screen.getByRole("button", { name: "Abrir menú" }))
    await user.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Inicio" }))
    expect(routed).toHaveBeenCalledOnce()
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("can use the sheet without a mega-menu", async () => {
    const user = userEvent.setup()
    render(<SiteNav links={links} mobileVariant="sheet" />)
    expect(document.getElementById("site-nav-mobile")).toBeNull()
    await user.click(screen.getByRole("button", { name: "Abrir menú" }))
    const sheet = screen.getByRole("dialog")
    expect(within(sheet).getAllByRole("link")).toHaveLength(2)
    act(() => {
      within(sheet).getByRole("button", { name: "Cerrar menú" }).click()
    })
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})
