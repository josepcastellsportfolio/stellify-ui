import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Field } from "@stellify/field"
import { OtpInput } from "@stellify/otp-input"

/**
 * Parkinson's law: make the task quicker than people expect. Each box moves on
 * by itself, Backspace goes back, and a pasted or autofilled code spreads
 * across the boxes. Try pasting "482 913".
 */
const meta = {
  title: "UI/OtpInput",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

export const InAField: Story = {
  render: function Render() {
    const [v, setV] = useState("")
    const [sent, setSent] = useState<string | null>(null)
    return (
      <div className="max-w-sm space-y-3">
        <Field label="Código de verificación" description="Te lo hemos enviado por SMS.">
          <OtpInput value={v} onValueChange={setV} onComplete={setSent} />
        </Field>
        {sent && <p className="text-sm text-muted-foreground">Verificando {sent}…</p>}
      </div>
    )
  },
}

export const Invalid: Story = {
  render: function Render() {
    const [v, setV] = useState("1234")
    return (
      <Field label="Código" error="El código no es correcto.">
        <OtpInput length={4} value={v} onValueChange={setV} />
      </Field>
    )
  },
}

export const Alphanumeric: Story = {
  render: function Render() {
    const [v, setV] = useState("")
    return <OtpInput aria-label="Código de invitación" mode="alphanumeric" length={5} value={v} onValueChange={setV} />
  },
}
