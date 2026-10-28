import type { Meta, StoryObj } from "@storybook/react-vite"
import { ClosingPanel } from "@stellify/closing-panel"

const meta = {
  title: "Marketing/ClosingPanel",
  component: ClosingPanel,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    title: "¿Hablamos de tu negocio?",
    intro: "Una llamada de 20 minutos para ver qué se puede automatizar.",
    action: (
      <a href="#contacto" className="inline-flex h-12 items-center rounded-lg bg-white px-6 text-sm font-semibold text-[oklch(0.16_0.02_265)]">
        Reservar llamada
      </a>
    ),
  },
  render: args => (
    <div className="py-8">
      <ClosingPanel {...args} />
    </div>
  ),
} satisfies Meta<typeof ClosingPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Static: Story = { args: { animated: false } }
export const WithoutGrid: Story = { args: { dotGrid: false, intro: undefined } }
