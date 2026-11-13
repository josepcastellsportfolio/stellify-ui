import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Mail } from "lucide-react"
import { Field } from "@stellify/field"
import { Input } from "@stellify/input"
import { Textarea } from "@stellify/textarea"
import { NumberInput } from "@stellify/number-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@stellify/select"
import { TextField } from "@stellify/text-field"
import { Card } from "@stellify/card"
import { Button } from "@stellify/button"

/**
 * Filled fields (no border) inside `Field`, which owns the label, help, error
 * and their wiring. Invalid tints the fill `danger-subtle`; there is no red
 * border. Inside a card the fill steps up to `surface-3` on its own.
 */
const meta = {
  title: "UI/Field",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

function Controls() {
  const [n, setN] = useState<number | null>(3)
  return (
    <div className="grid max-w-md gap-4">
      <Field label="Nombre" required description="Como aparece en la factura">
        <Input placeholder="Ana Pérez" />
      </Field>
      <Field label="Email" error="Formato no válido">
        <Input type="email" defaultValue="ana@" />
      </Field>
      <Field label="Plazas">
        <NumberInput value={n} onChange={setN} min={0} max={10} />
      </Field>
      <Field label="Provincia">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Elige una" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="b">Barcelona</SelectItem>
            <SelectItem value="t">Tarragona</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Notas">
        <Textarea autoResize placeholder="Opcional" />
      </Field>
    </div>
  )
}

export const OnThePage: Story = { name: "On the page", render: () => <Controls /> }

export const InACard: Story = {
  name: "In a card",
  render: () => (
    <Card className="max-w-md">
      <Card.Header>
        <Card.Title>Datos de contacto</Card.Title>
        <Card.Description>Los campos pasan a surface-3 dentro de la tarjeta.</Card.Description>
      </Card.Header>
      <Card.Content className="space-y-4">
        <TextField label="Email" leadingIcon={Mail} placeholder="ana@empresa.com" />
        <TextField label="Teléfono" error="Falta el prefijo" defaultValue="600 000 000" />
      </Card.Content>
      <Card.Footer className="justify-end">
        <Button variant="secondary">Cancelar</Button>
        <Button>Guardar</Button>
      </Card.Footer>
    </Card>
  ),
}
