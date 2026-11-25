import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Button } from "@stellify/button"
import { ProgressChecklist, type ChecklistItem } from "@stellify/progress-checklist"

/**
 * Zeigarnik (an unfinished list stays on the mind) and goal gradient (people
 * speed up near the end): the count, the bar and "te faltan N" stay in view.
 * Only the next item shows its action. Start with one step already done.
 */
const meta = {
  title: "Blocks/App/ProgressChecklist",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

const STEPS = [
  { id: "account", label: "Crear cuenta" },
  { id: "logo", label: "Añadir tu logo", description: "Aparece en la tienda y en los emails." },
  { id: "theme", label: "Elegir un tema", description: "Puedes cambiarlo cuando quieras." },
  { id: "product", label: "Añadir un producto", description: "Con uno basta para abrir." },
  { id: "payments", label: "Conectar pagos", description: "Stripe o transferencia." },
]

export const ShopSetup: Story = {
  render: function Render() {
    const [done, setDone] = useState(new Set(["account", "logo"]))
    const items: ChecklistItem[] = STEPS.map((s) => ({
      ...s,
      done: done.has(s.id),
      action: (
        <Button size="sm" onClick={() => setDone((d) => new Set(d).add(s.id))}>
          Hecho
        </Button>
      ),
    }))
    return <ProgressChecklist title="Configura tu tienda" items={items} className="max-w-md" />
  },
}

export const AlmostThere: Story = {
  render: () => (
    <ProgressChecklist
      title="Tarjeta de café"
      className="max-w-md"
      labels={{ remaining: (n) => `${n} más y el siguiente es gratis` }}
      items={STEPS.map((s, i) => ({ ...s, done: i < 4 }))}
    />
  ),
}
