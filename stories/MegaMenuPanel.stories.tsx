import type { Meta, StoryObj } from "@storybook/react-vite"
import { MegaMenuPanel } from "@stellify/mega-menu-panel"
import { FacetGrid, NavPreviewCard } from "@stellify/nav-preview-card"
import { demoMenu } from "./fixtures/nav-menu"

const meta = {
  title: "Marketing/MegaMenuPanel",
  component: MegaMenuPanel,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    category: demoMenu[0],
    visible: true,
    motion: "css",
    previewDecoration: link => <FacetGrid seed={link.id} />,
  },
  render: args => (
    <div className="relative h-[28rem]">
      <MegaMenuPanel {...args} />
    </div>
  ),
} satisfies Meta<typeof MegaMenuPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleColumn: Story = { args: { category: demoMenu[1] } }

export const PreviewCards: Story = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-2 gap-4 p-6">
      <NavPreviewCard href="#a" title="Landing pages" summary="Una página rápida que pide el contacto." decoration={<FacetGrid seed="landing" />} />
      <NavPreviewCard
        href="#b"
        title="Con foto"
        summary="La foto lleva un degradado para que el texto se lea."
        image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=640&q=60"
      />
      <NavPreviewCard href="#c" title="Pequeña" size="sm" />
      <NavPreviewCard href="#d" title="Otro color" size="sm" className="[--nav-preview-bg:var(--primary)]" />
    </div>
  ),
}
