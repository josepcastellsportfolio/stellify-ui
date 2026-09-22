import type { Meta, StoryObj } from "@storybook/react-vite"
import { Compass, KeyRound, LayoutGrid, LogOut, MapPin, Megaphone, PanelLeft, PenLine, Rocket, Users } from "lucide-react"
import { useState } from "react"
import { AppShell } from "@stellify/app-shell"
import { EmptyState } from "@stellify/empty-state"
import { Logo } from "@stellify/logo"
import { Sidebar, SidebarGroup, SidebarItem } from "@stellify/sidebar"
import { Button } from "@stellify/button"
import { Badge } from "@stellify/badge"

const meta = {
  title: "Components/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
  args: { sidebar: null, children: null },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

const tuVia = (
  <Badge size="xs" uppercase variant="outline" className="border-transparent text-primary">
    Tu vía
  </Badge>
)

const Nav = ({ spinner = false }: { spinner?: boolean }) => (
  <Sidebar aria-label="Navegación principal" logo={<Logo height={26} />}>
    <SidebarGroup label="Captación">
      <SidebarItem icon={LayoutGrid} href="#">Cuadrante</SidebarItem>
      <SidebarItem icon={PenLine} href="#">C1 · Contenido</SidebarItem>
      <SidebarItem icon={Megaphone} href="#">C2 · Publicidad</SidebarItem>
      <SidebarItem
        icon={MapPin}
        href="#"
        active
        trailing={spinner ? <span className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : tuVia}
      >
        C3 · Prospección
      </SidebarItem>
      <SidebarItem icon={Rocket} href="#">C4 · Escala</SidebarItem>
    </SidebarGroup>
    <SidebarGroup label="Resultados">
      <SidebarItem icon={Users} href="#">Seguimiento</SidebarItem>
      <SidebarItem icon={Compass} href="#">Mi perfil</SidebarItem>
    </SidebarGroup>
  </Sidebar>
)

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <AppShell
        sidebarOpen={open}
        sidebar={<Nav />}
        topbar={
          <>
            <Button variant="base" size="icon" aria-label="Mostrar u ocultar menú" onClick={() => setOpen(!open)}>
              <PanelLeft />
            </Button>
            <span className="text-sm text-muted-foreground">Nicho: Club de pádel</span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="base"><KeyRound />Claves de API</Button>
              <Button variant="base"><LogOut />Salir</Button>
            </div>
          </>
        }
      >
        <EmptyState icon={Rocket} title="C4 · Captación a escala" description="Llegará más adelante." />
      </AppShell>
    )
  },
}

export const JobRunning: Story = {
  render: () => (
    <AppShell sidebar={<Nav spinner />}>
      <p className="text-sm text-muted-foreground">Redactando comunicaciones…</p>
    </AppShell>
  ),
}
