import { render, screen } from "@testing-library/react"
import { LayoutGrid, MapPin } from "lucide-react"
import { AppShell } from "@stellify/app-shell"
import { Sidebar, SidebarGroup, SidebarItem } from "@stellify/sidebar"

function Nav({ active }: { active: string }) {
  return (
    <Sidebar aria-label="Navegación">
      <SidebarGroup label="Captación">
        <SidebarItem icon={LayoutGrid} href="/app/cuadrante" active={active === "q"}>
          Cuadrante
        </SidebarItem>
        <SidebarItem icon={MapPin} href="/app/c3" active={active === "c3"} trailing={<span>Tu vía</span>}>
          C3 · Prospección
        </SidebarItem>
      </SidebarGroup>
    </Sidebar>
  )
}

describe("Sidebar", () => {
  it("groups items under a label and marks the active one as the current page", () => {
    render(<Nav active="c3" />)
    expect(screen.getByRole("navigation", { name: "Navegación" })).toBeInTheDocument()
    expect(screen.getByText("Captación")).toBeInTheDocument()
    const active = screen.getByRole("link", { name: /C3 · Prospección/ })
    expect(active).toHaveAttribute("aria-current", "page")
    expect(active).toHaveAttribute("href", "/app/c3")
    expect(screen.getByRole("link", { name: "Cuadrante" })).not.toHaveAttribute("aria-current")
  })

  it("renders the trailing slot (badge or spinner) inside the item", () => {
    render(<Nav active="q" />)
    expect(screen.getByRole("link", { name: /C3 · Prospección/ })).toHaveTextContent("Tu vía")
  })

  it("supports asChild so a router Link can be the item", () => {
    render(
      <SidebarItem asChild icon={MapPin} active>
        <a href="/routed" data-router="yes">
          Router link
        </a>
      </SidebarItem>
    )
    const link = screen.getByRole("link", { name: "Router link" })
    expect(link).toHaveAttribute("data-router", "yes")
    expect(link).toHaveAttribute("data-slot", "sidebar-item")
    expect(link.querySelector("svg")).not.toBeNull()
  })
})

describe("AppShell", () => {
  it("places sidebar, topbar and scrollable content", () => {
    render(
      <AppShell sidebar={<Nav active="q" />} topbar={<span>Nicho: Club de pádel</span>}>
        <p>página</p>
      </AppShell>
    )
    expect(screen.getByRole("navigation")).toBeInTheDocument()
    expect(screen.getByRole("banner")).toHaveTextContent("Nicho: Club de pádel")
    expect(screen.getByRole("main")).toHaveTextContent("página")
  })

  it("hides the sidebar when collapsed", () => {
    render(
      <AppShell sidebar={<Nav active="q" />} sidebarOpen={false}>
        x
      </AppShell>
    )
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
  })
})

describe("Sidebar layout", () => {
  it("keeps labels and the trailing badge on one line", () => {
    render(<Nav active="c3" />)
    const item = screen.getByRole("link", { name: /C3 · Prospección/ })
    expect(item).toHaveClass("whitespace-nowrap")
    expect(item.lastElementChild).toHaveClass("shrink-0")
  })
})
