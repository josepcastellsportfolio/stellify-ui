import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "@stellify/button"
import { SuccessState } from "@stellify/success-state"

/**
 * Peak-end rule: a flow is remembered by its best moment and its end. Close a
 * task with a clear outcome, not a line of small text.
 */
const meta = {
  title: "Blocks/App/SuccessState",
  component: SuccessState,
  tags: ["autodocs"],
  args: {
    title: "Pago completado",
    value: "240,00 €",
    description: "Enviado a Sam Lee. Le llegará en unos minutos.",
    action: <Button>Hecho</Button>,
  },
} satisfies Meta<typeof SuccessState>

export default meta
type Story = StoryObj<typeof meta>

export const Payment: Story = {}

/** The end of a longer journey: a plate instead of the check. */
export const Onboarding: Story = {
  args: {
    illustration: "laurel",
    title: "Tu tienda está abierta",
    value: undefined,
    description: "Ya puedes compartir el enlace y recibir pedidos.",
    action: <Button>Ver mi tienda</Button>,
  },
}
