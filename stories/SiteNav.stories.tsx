import type { Meta, StoryObj } from "@storybook/react-vite"
import { SiteNav } from "@stellify/site-nav"
import { FacetGrid } from "@stellify/nav-preview-card"
import { MegaMenuMotion } from "@stellify/use-mega-menu-motion"
import { demoMenu } from "./fixtures/nav-menu"

const links = [
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#contacto", label: "Contacto" },
]

const brand = (
  <a href="#" className="text-base font-semibold tracking-display">
    Marca
  </a>
)
const action = (
  <a href="#cta" className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
    Pedir diagnóstico
  </a>
)
const dock = (
  <div className="grid grid-cols-2 gap-3">
    <a href="#login" className="inline-flex h-12 items-center justify-center rounded-lg border border-foreground/20 text-sm font-medium">
      Entrar
    </a>
    <a href="#cta" className="inline-flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
      Pedir diagnóstico
    </a>
  </div>
)

const meta = {
  title: "Marketing/SiteNav",
  component: SiteNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Links only → original inline mobile dropdown. With `menu` → desktop mega-menu panels and a mobile drill-down sheet. Pass `menuMotion={MegaMenuMotion}` for the GSAP motion.",
      },
    },
  },
  args: { links, brand, action },
  render: args => (
    <header className="sticky top-0 z-50 bg-background">
      <div className="relative mx-auto max-w-[90rem] px-4 md:px-6">
        <SiteNav {...args} />
      </div>
    </header>
  ),
} satisfies Meta<typeof SiteNav>

export default meta
type Story = StoryObj<typeof meta>

export const LinksOnly: Story = {}

export const MegaMenu: Story = {
  args: { menu: demoMenu, mobileActions: dock, previewDecoration: link => <FacetGrid seed={link.id} /> },
  render: args => (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto max-w-[90rem] px-4 md:px-6">
        <SiteNav {...args} />
      </div>
      <div className="h-[60vh]" />
    </header>
  ),
}

export const MegaMenuWithGsapMotion: Story = {
  ...MegaMenu,
  args: { ...MegaMenu.args, menuMotion: MegaMenuMotion },
}

export const MobileSheet: Story = {
  ...MegaMenu,
  globals: { viewport: { value: "mobile1" } },
}
