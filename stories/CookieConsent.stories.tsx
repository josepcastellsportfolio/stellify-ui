import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { fn } from "storybook/test"
import { CookieConsent } from "@stellify/cookie-consent"

const meta = {
  title: "Marketing/CookieConsent",
  component: CookieConsent,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    description:
      "Usamos analítica para saber qué páginas se leen y mejorarlas. Solo se activa si aceptas; puedes cambiarlo cuando quieras.",
    policyHref: "#cookies",
    onAccept: fn(),
    onReject: fn(),
  },
  render: args => {
    const [open, setOpen] = useState(args.open)
    return (
      <div className="min-h-[420px] p-6">
        <p className="text-sm text-muted-foreground">
          {open ? "Elige una opción en el aviso." : "Decisión guardada."}
        </p>
        <CookieConsent
          {...args}
          open={open}
          onAccept={() => {
            args.onAccept()
            setOpen(false)
          }}
          onReject={() => {
            args.onReject()
            setOpen(false)
          }}
        />
      </div>
    )
  },
} satisfies Meta<typeof CookieConsent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = { globals: { viewport: { value: "mobile1" } } }
