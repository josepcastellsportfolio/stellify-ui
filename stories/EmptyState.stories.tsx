import type { Meta, StoryObj } from "@storybook/react-vite"
import { Receipt } from "lucide-react"
import { Button } from "@stellify/button"
import { EmptyState } from "@stellify/empty-state"

const meta = {
  title: "Blocks/App/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    illustration: "nautilus",
    title: "Todavía no hay documentos",
    description: "Sube el primero o conecta una fuente y aparecerá aquí.",
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

/** First-run screen: a plate in the product's brand color. */
export const Default: Story = {}

export const WithAction: Story = {
  args: {
    illustration: "beetles",
    title: "Sin resultados",
    description: "Ningún documento cumple los filtros. Prueba a quitar alguno.",
    action: <Button variant="secondary">Quitar filtros</Button>,
  },
}

/** Compact, for a panel or a table: an icon instead of a plate. */
export const WithIcon: Story = {
  args: {
    illustration: undefined,
    icon: Receipt,
    title: "Sin gastos este mes",
    description: "Añade el primero para empezar a llevar las cuentas.",
  },
}
