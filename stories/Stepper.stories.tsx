import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Button } from "@stellify/button"
import { Stepper } from "@stellify/stepper"

/**
 * Uniform connectedness: steps joined by a line read as one sequence. The line
 * fills with the brand up to the current step; the status of each step is
 * also read as text, never color alone.
 */
const meta = {
  title: "UI/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

const ORDER = [
  { id: "ordered", label: "Pedido", description: "Lun 18" },
  { id: "packed", label: "Preparado", description: "Mar 19" },
  { id: "shipped", label: "Enviado", description: "Llega el jueves" },
  { id: "delivered", label: "Entregado" },
]

export const OrderTracking: Story = {
  args: { "aria-label": "Pedido #4821", steps: ORDER, current: 2, className: "max-w-xl" },
}

/** Always a row, even on phones: only for three short labels or fewer. */
export const Horizontal: Story = {
  args: { "aria-label": "Alta", steps: ORDER.slice(0, 3), current: 1, orientation: "horizontal", className: "max-w-md" },
}

export const Vertical: Story = {
  args: { "aria-label": "Alta", steps: ORDER, current: 1, orientation: "vertical" },
}

export const Interactive: Story = {
  args: { steps: ORDER, current: 0 },
  render: function Render(args) {
    const [current, setCurrent] = useState(0)
    return (
      <div className="max-w-xl space-y-6">
        <Stepper {...args} aria-label="Pedido" current={current} />
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
            Atrás
          </Button>
          <Button onClick={() => setCurrent((c) => Math.min(ORDER.length, c + 1))}>Avanzar</Button>
        </div>
      </div>
    )
  },
}
