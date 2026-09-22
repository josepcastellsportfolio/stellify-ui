import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Checkbox } from "@stellify/checkbox"

describe("checkbox", () => {
  it("toggles and reports the change", async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Seleccionar negocio" onCheckedChange={onCheckedChange} />)
    const box = screen.getByRole("checkbox", { name: "Seleccionar negocio" })
    expect(box).not.toBeChecked()
    await userEvent.click(box)
    expect(box).toBeChecked()
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it("does not toggle when disabled", async () => {
    render(<Checkbox aria-label="x" disabled />)
    const box = screen.getByRole("checkbox")
    await userEvent.click(box)
    expect(box).not.toBeChecked()
  })
})
