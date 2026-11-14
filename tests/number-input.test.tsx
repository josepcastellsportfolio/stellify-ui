import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { NumberInput, parseNumber } from "@stellify/number-input"

function Controlled(props: { min?: number; max?: number; initial?: number | null }) {
  const [value, setValue] = useState<number | null>(props.initial ?? 10)
  return <NumberInput label="Clientes o reuniones al mes" value={value} onChange={setValue} min={props.min} max={props.max} />
}

describe("NumberInput", () => {
  it("steps up and down with the stepper buttons", async () => {
    render(<Controlled />)
    const input = screen.getByLabelText("Clientes o reuniones al mes")
    await userEvent.click(screen.getByRole("button", { name: "Aumentar" }))
    expect(input).toHaveValue("11")
    await userEvent.click(screen.getByRole("button", { name: "Disminuir" }))
    await userEvent.click(screen.getByRole("button", { name: "Disminuir" }))
    expect(input).toHaveValue("9")
  })

  it("clamps to min and max and disables the stepper at the edge", async () => {
    render(<Controlled min={0} max={11} initial={11} />)
    expect(screen.getByRole("button", { name: "Aumentar" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Aumentar" }))
    expect(screen.getByLabelText("Clientes o reuniones al mes")).toHaveValue("11")
  })

  it("accepts typed values and empties to null", async () => {
    const onChange = vi.fn()
    render(<NumberInput label="n" value={5} onChange={onChange} />)
    const input = screen.getByLabelText("n")
    await userEvent.clear(input)
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it("reads liberal input (Postel) and clamps on blur, not while typing", async () => {
    const onChange = vi.fn()
    render(<NumberInput label="n" value={null} onChange={onChange} min={10} max={5000} />)
    const input = screen.getByLabelText("n")
    await userEvent.type(input, "1.234,5 €")
    expect(onChange).toHaveBeenLastCalledWith(1234.5)
    await userEvent.clear(input)
    await userEvent.type(input, "1")
    expect(onChange).toHaveBeenLastCalledWith(1)
    await userEvent.tab()
    expect(onChange).toHaveBeenLastCalledWith(10)
  })

  it("steps with the arrow keys", async () => {
    render(<Controlled />)
    const input = screen.getByRole("spinbutton")
    input.focus()
    await userEvent.keyboard("{ArrowUp}{ArrowUp}")
    expect(input).toHaveValue("12")
  })
})

describe("parseNumber", () => {
  it.each([
    ["12,5", 12.5],
    ["1.234,56", 1234.56],
    ["1,234.56", 1234.56],
    ["1 234,5", 1234.5],
    ["1.234.567", 1234567],
    ["\u22123", -3],
    ["50 %", 50],
    ["abc", null],
    ["", null],
  ])("%s → %s", (text, expected) => {
    expect(parseNumber(text)).toBe(expected)
  })
})
