import type { Meta, StoryObj } from "@storybook/react-vite"
import { OverflowMarquee } from "@stellify/overflow-marquee"

const meta = {
  title: "Components/OverflowMarquee",
  component: OverflowMarquee,
  tags: ["autodocs"],
  args: {
    text: "Revisar la propuesta de PádelOn y preparar la demo del agente telefónico para el jueves",
    className: "w-64 rounded-md border px-3 py-2 text-sm",
    tabIndex: 0,
  },
} satisfies Meta<typeof OverflowMarquee>

export default meta
type Story = StoryObj<typeof meta>

/** Hover or focus to slide the full title into view. */
export const Overflowing: Story = {}

/** Fits: behaves exactly like `truncate` (no slide). */
export const Fits: Story = { args: { text: "Llamar a Ana" } }

export const Slow: Story = { args: { speed: 15 } }
