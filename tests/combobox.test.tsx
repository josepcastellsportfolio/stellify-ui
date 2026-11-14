import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { Combobox, type ComboboxOption } from "@stellify/combobox"
import { Field } from "@stellify/field"

const VEHICULOS: ComboboxOption[] = [
  { value: "camion", label: "Camión", group: "Pesados" },
  { value: "autobus", label: "Autobús", group: "Pesados", disabled: true },
  { value: "furgoneta", label: "Furgoneta", group: "Ligeros" },
  { value: "turismo", label: "Turismo", group: "Ligeros", description: "Hasta 9 plazas" },
]

function Single({ initial = null as string | null, onChange = (_: string | null) => {}, ...rest }) {
  const [v, setV] = useState<string | null>(initial)
  return (
    <Combobox
      aria-label="Vehículo"
      options={VEHICULOS}
      value={v}
      onValueChange={(next) => {
        setV(next)
        onChange(next)
      }}
      {...rest}
    />
  )
}

function Multiple({ initial = [] as string[], onCreate }: { initial?: string[]; onCreate?: (q: string) => void }) {
  const [opts, setOpts] = useState(VEHICULOS)
  const [vs, setVs] = useState<string[]>(initial)
  return (
    <Combobox
      multiple
      aria-label="Vehículos"
      options={opts}
      values={vs}
      onValuesChange={setVs}
      onCreate={
        onCreate &&
        ((q) => {
          onCreate(q)
          setOpts((o) => [...o, { value: q.toLowerCase(), label: q }])
          setVs((v) => [...v, q.toLowerCase()])
        })
      }
    />
  )
}

describe("Combobox", () => {
  it("wires the combobox, listbox and active option", async () => {
    render(<Single />)
    const input = screen.getByRole("combobox", { name: "Vehículo" })
    expect(input).toHaveAttribute("aria-autocomplete", "list")
    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("listbox")).toBeNull()

    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(input).toHaveAttribute("aria-expanded", "true")
    const listbox = screen.getByRole("listbox")
    expect(input).toHaveAttribute("aria-controls", listbox.id)
    const first = screen.getByRole("option", { name: "Camión" })
    expect(input).toHaveAttribute("aria-activedescendant", first.id)
    expect(first).toHaveAttribute("aria-selected", "false")
    expect(screen.getByRole("option", { name: "Autobús" })).toHaveAttribute("aria-disabled", "true")
    // Grouped under a named group.
    expect(within(screen.getByRole("group", { name: "Ligeros" })).getAllByRole("option")).toHaveLength(2)
    // Focus never leaves the input.
    input.focus()
    expect(input).toHaveFocus()
  })

  it("filters accent- and case-insensitively, trims, and highlights the match", async () => {
    render(<Single />)
    const input = screen.getByRole("combobox")
    await userEvent.type(input, "  CAMION ")
    const options = screen.getAllByRole("option")
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent("Camión")
    const match = options[0].querySelector("[data-slot='combobox-match']")
    expect(match).toHaveTextContent("Camión")
    expect(match).toHaveClass("font-semibold", "text-foreground")

    await userEvent.clear(input)
    await userEvent.type(input, "zzz")
    expect(screen.queryAllByRole("option")).toHaveLength(0)
    expect(screen.getByText("Sin resultados")).toBeInTheDocument()
  })

  it("moves with arrows (wrapping, skipping disabled), Home/End, and selects with Enter", () => {
    const onChange = vi.fn()
    render(<Single onChange={onChange} />)
    const input = screen.getByRole("combobox")
    const activeName = () => document.getElementById(input.getAttribute("aria-activedescendant")!)?.textContent

    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(activeName()).toBe("Camión")
    fireEvent.keyDown(input, { key: "ArrowDown" }) // skips Autobús
    expect(activeName()).toBe("Furgoneta")
    fireEvent.keyDown(input, { key: "End" })
    expect(activeName()).toMatch(/^Turismo/)
    fireEvent.keyDown(input, { key: "ArrowDown" }) // wraps
    expect(activeName()).toBe("Camión")
    fireEvent.keyDown(input, { key: "ArrowUp" }) // wraps back
    expect(activeName()).toMatch(/^Turismo/)
    fireEvent.keyDown(input, { key: "Home" })
    fireEvent.keyDown(input, { key: "ArrowDown" })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(onChange).toHaveBeenCalledWith("furgoneta")
    expect(input).toHaveValue("Furgoneta")
    expect(input).toHaveAttribute("aria-expanded", "false")
  })

  it("Escape closes, a second Escape clears; Tab closes without selecting", async () => {
    const onChange = vi.fn()
    render(<Single initial="camion" onChange={onChange} />)
    const input = screen.getByRole("combobox")
    expect(input).toHaveValue("Camión")

    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(screen.getByRole("option", { name: "Camión" })).toHaveAttribute("aria-selected", "true")
    fireEvent.keyDown(input, { key: "Escape" })
    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(input).toHaveValue("Camión")
    fireEvent.keyDown(input, { key: "Escape" })
    expect(input).toHaveValue("")
    expect(onChange).toHaveBeenLastCalledWith(null)

    onChange.mockClear()
    fireEvent.keyDown(input, { key: "ArrowDown" })
    fireEvent.keyDown(input, { key: "Tab" })
    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(onChange).not.toHaveBeenCalled()
  })

  it("selects with a click and keeps focus in the input", async () => {
    const onChange = vi.fn()
    render(<Single onChange={onChange} />)
    const input = screen.getByRole("combobox")
    await userEvent.click(input)
    await userEvent.click(screen.getByRole("option", { name: "Furgoneta" }))
    expect(onChange).toHaveBeenCalledWith("furgoneta")
    expect(input).toHaveFocus()
  })

  it("multiple: shows chips, toggles with Enter and removes the last with Backspace", async () => {
    render(<Multiple initial={["camion"]} />)
    const input = screen.getByRole("combobox", { name: "Vehículos" })
    expect(screen.getByRole("button", { name: "Quitar Camión" })).toBeInTheDocument()

    await userEvent.type(input, "turi")
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true")
    fireEvent.keyDown(input, { key: "Enter" })
    expect(screen.getByRole("button", { name: "Quitar Turismo" })).toBeInTheDocument()
    expect(input).toHaveValue("")
    // Stays open for the next pick.
    expect(input).toHaveAttribute("aria-expanded", "true")

    fireEvent.keyDown(input, { key: "Backspace" })
    expect(screen.queryByRole("button", { name: "Quitar Turismo" })).toBeNull()
    expect(screen.getByRole("button", { name: "Quitar Camión" })).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Quitar Camión" }))
    expect(screen.queryByRole("button", { name: /^Quitar/ })).toBeNull()
  })

  it("offers to create a missing option and calls onCreate with the trimmed query", async () => {
    const onCreate = vi.fn()
    render(<Multiple onCreate={onCreate} />)
    const input = screen.getByRole("combobox")

    await userEvent.type(input, "camión")
    expect(screen.queryByRole("option", { name: /Crear/ })).toBeNull() // exact match exists

    await userEvent.clear(input)
    await userEvent.type(input, "  Tractor ")
    const create = screen.getByRole("option", { name: "Crear «Tractor»" })
    expect(input).toHaveAttribute("aria-activedescendant", create.id)
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onCreate).toHaveBeenCalledWith("Tractor")
    expect(screen.getByRole("button", { name: "Quitar Tractor" })).toBeInTheDocument()
  })

  it("works as the control of Field and accepts labels", () => {
    render(
      <Field label="Vehículo" error="Elige uno">
        <Combobox options={VEHICULOS} value={null} onValueChange={() => {}} labels={{ empty: "Nada" }} />
      </Field>
    )
    const input = screen.getByRole("combobox", { name: "Vehículo" })
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAccessibleDescription("Elige uno")
    expect(input.closest("[data-slot='combobox']")).toHaveClass("bg-danger-subtle")

    fireEvent.change(input, { target: { value: "xyz" } })
    expect(screen.getByText("Nada")).toBeInTheDocument()
  })

  it("does nothing when disabled", () => {
    render(<Single disabled />)
    const input = screen.getByRole("combobox")
    expect(input).toBeDisabled()
    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(screen.queryByRole("listbox")).toBeNull()
  })
})
