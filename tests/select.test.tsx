import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@stellify/select"

function ChannelSelect({ onValueChange }: { onValueChange: (v: string) => void }) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Canal">
        <SelectValue placeholder="Elige canal" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="email">Correo</SelectItem>
        <SelectItem value="phone">Teléfono</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe("select", () => {
  it("shows the placeholder and selects an option", async () => {
    const onValueChange = vi.fn()
    render(<ChannelSelect onValueChange={onValueChange} />)
    const trigger = screen.getByRole("combobox", { name: "Canal" })
    expect(trigger).toHaveTextContent("Elige canal")
    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole("option", { name: "Teléfono" }))
    expect(onValueChange).toHaveBeenCalledWith("phone")
    expect(trigger).toHaveTextContent("Teléfono")
  })
})
