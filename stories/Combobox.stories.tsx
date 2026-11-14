import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState, type ReactNode } from "react"
import { Combobox, type ComboboxOption } from "@stellify/combobox"
import { Field } from "@stellify/field"

/**
 * Type to filter a list, then pick one or several. Accents and case don't
 * matter ("camion" finds "Camión") and stray spaces are ignored. Focus stays
 * in the input: arrows move the active option, Enter picks, Escape closes and
 * a second Escape clears. Multiple mode shows the picks as chips; Backspace
 * on an empty input removes the last one.
 */
const meta = {
  title: "UI/Combobox",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

const PROVINCIAS: ComboboxOption[] = [
  { value: "a-coruna", label: "A Coruña" },
  { value: "alava", label: "Álava" },
  { value: "almeria", label: "Almería" },
  { value: "avila", label: "Ávila" },
  { value: "barcelona", label: "Barcelona" },
  { value: "caceres", label: "Cáceres" },
  { value: "cadiz", label: "Cádiz" },
  { value: "castellon", label: "Castellón" },
  { value: "cordoba", label: "Córdoba" },
  { value: "girona", label: "Girona" },
  { value: "jaen", label: "Jaén" },
  { value: "leon", label: "León" },
  { value: "lleida", label: "Lleida" },
  { value: "malaga", label: "Málaga" },
  { value: "tarragona", label: "Tarragona" },
  { value: "valencia", label: "Valencia" },
]

const FLOTA: ComboboxOption[] = [
  { value: "camion-rigido", label: "Camión rígido", group: "Pesados", description: "Hasta 26 t" },
  { value: "trailer", label: "Tráiler", group: "Pesados", description: "Cabeza tractora con semirremolque" },
  { value: "autobus", label: "Autobús", group: "Pesados", disabled: true, description: "Sin conductores disponibles" },
  { value: "furgoneta", label: "Furgoneta", group: "Ligeros", description: "Hasta 3,5 t" },
  { value: "turismo", label: "Turismo", group: "Ligeros" },
  { value: "moto", label: "Motocicleta", group: "Reparto urbano" },
  { value: "bici", label: "Bicicleta de carga", group: "Reparto urbano" },
]

const Frame = ({ children }: { children: ReactNode }) => <div className="max-w-sm">{children}</div>

export const Single: Story = {
  render: function Render() {
    const [v, setV] = useState<string | null>("lleida")
    return (
      <Frame>
        <Combobox aria-label="Provincia" options={PROVINCIAS} value={v} onValueChange={setV} placeholder="Busca una provincia" />
      </Frame>
    )
  },
}

export const Multiple: Story = {
  render: function Render() {
    const [vs, setVs] = useState<string[]>(["barcelona", "girona"])
    return (
      <Frame>
        <Combobox
          multiple
          aria-label="Provincias de reparto"
          options={PROVINCIAS}
          values={vs}
          onValuesChange={setVs}
          placeholder="Añade provincias"
        />
      </Frame>
    )
  },
}

export const Grouped: Story = {
  render: function Render() {
    const [v, setV] = useState<string | null>(null)
    return (
      <Frame>
        <Combobox aria-label="Vehículo" options={FLOTA} value={v} onValueChange={setV} placeholder="Elige un vehículo" />
      </Frame>
    )
  },
}

export const Creatable: Story = {
  render: function Render() {
    const [options, setOptions] = useState<ComboboxOption[]>([
      { value: "urgente", label: "Urgente" },
      { value: "fragil", label: "Frágil" },
      { value: "refrigerado", label: "Refrigerado" },
    ])
    const [vs, setVs] = useState<string[]>(["fragil"])
    return (
      <Frame>
        <Combobox
          multiple
          aria-label="Etiquetas del envío"
          options={options}
          values={vs}
          onValuesChange={setVs}
          placeholder="Busca o crea una etiqueta"
          onCreate={(label) => {
            const value = label.toLowerCase()
            setOptions((o) => [...o, { value, label }])
            setVs((v) => [...v, value])
          }}
        />
      </Frame>
    )
  },
}

export const InAField: Story = {
  name: "In a Field",
  render: function Render() {
    const [origen, setOrigen] = useState<string | null>(null)
    const [destino, setDestino] = useState<string | null>("valencia")
    return (
      <div className="grid max-w-sm gap-4">
        <Field label="Origen" required error={origen ? undefined : "Elige la provincia de origen"}>
          <Combobox options={PROVINCIAS} value={origen} onValueChange={setOrigen} placeholder="Busca una provincia" />
        </Field>
        <Field label="Destino" description="Solo provincias con almacén propio">
          <Combobox options={PROVINCIAS} value={destino} onValueChange={setDestino} />
        </Field>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="grid max-w-sm gap-4">
      <Field label="Provincia">
        <Combobox options={PROVINCIAS} value="malaga" onValueChange={() => {}} disabled />
      </Field>
      <Field label="Provincias de reparto">
        <Combobox multiple options={PROVINCIAS} values={["cadiz", "cordoba"]} onValuesChange={() => {}} disabled />
      </Field>
    </div>
  ),
}
