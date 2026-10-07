import type { Meta, StoryObj } from "@storybook/react-vite"
import { InlineCta } from "@stellify/inline-cta"

const meta = {
  title: "Marketing/InlineCta",
  component: InlineCta,
  tags: ["autodocs"],
  args: {
    text: "Cuéntanos qué necesitas y te respondemos con un precio cerrado en 48 horas.",
    actionLabel: "Pedir presupuesto",
    href: "#contacto",
    className: "max-w-2xl",
  },
} satisfies Meta<typeof InlineCta>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = { globals: { viewport: { value: "mobile1" } } }
