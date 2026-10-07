import type { Meta, StoryObj } from "@storybook/react-vite"
import { KeyTakeaways } from "@stellify/key-takeaways"

const meta = {
  title: "Marketing/KeyTakeaways",
  component: KeyTakeaways,
  tags: ["autodocs"],
  args: {
    items: [
      "Una web a medida tarda entre dos y cuatro semanas, según el contenido que ya tengas.",
      "Pagas por proyecto cerrado: sin cuotas mensuales ni permanencia.",
      "El código y el dominio son tuyos desde el primer día.",
    ],
    className: "max-w-2xl",
  },
} satisfies Meta<typeof KeyTakeaways>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** As it sits on a page: after the h1 intro, before the first h2. */
export const InContext: Story = {
  render: args => (
    <article className="max-w-2xl">
      <h1 className="text-4xl font-bold tracking-display">Desarrollo web a medida</h1>
      <p className="mt-4 leading-body text-muted-foreground">
        Webs rápidas, accesibles y fáciles de mantener para negocios que quieren dejar de depender de plantillas.
      </p>
      <KeyTakeaways {...args} className="mt-8" />
      <h2 className="mt-12 text-2xl font-semibold tracking-display">Qué incluye</h2>
    </article>
  ),
}
