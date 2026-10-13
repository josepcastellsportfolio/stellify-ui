import type { Meta, StoryObj } from "@storybook/react-vite"
import { Phone } from "lucide-react"
import { StickyCta } from "@stellify/sticky-cta"

const meta = {
  title: "Marketing/StickyCta",
  component: StickyCta,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "Only visible below `md` — use the mobile viewport." } },
  },
  globals: { viewport: { value: "mobile1" } },
  args: { label: "Pedir presupuesto", href: "#contacto" },
  render: args => (
    <div>
      <div className="flex flex-col gap-4 p-6">
        {Array.from({ length: 8 }, (_, i) => (
          <p key={i} className="leading-body text-muted-foreground">
            Párrafo de ejemplo para que la página tenga scroll y se vea la barra fija abajo.
          </p>
        ))}
      </div>
      <footer className="border-t border-border p-6 text-sm text-muted-foreground">
        Pie de página: el espaciador evita que la barra lo tape.
      </footer>
      <StickyCta {...args} />
    </div>
  ),
} satisfies Meta<typeof StickyCta>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithPhone: Story = {
  args: { secondary: { label: "Llamar", href: "tel:+34600000000", icon: <Phone /> } },
}

export const WithTextSecondary: Story = {
  args: { secondary: { label: "Precios", href: "#precios" } },
}
