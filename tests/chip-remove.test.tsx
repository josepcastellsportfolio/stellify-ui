import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Chip } from "@stellify/chip"

describe("Chip onRemove", () => {
  it("is read-only by default", () => {
    render(<Chip>Sin página web</Chip>)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("adds an accessible remove button when onRemove is given", async () => {
    const onRemove = vi.fn()
    render(<Chip onRemove={onRemove}>Reservas por WhatsApp</Chip>)
    await userEvent.click(screen.getByRole("button", { name: "Quitar Reservas por WhatsApp" }))
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it("lets the remove label be translated", () => {
    render(<Chip onRemove={() => {}} removeLabel="Remove">Topic</Chip>)
    expect(screen.getByRole("button", { name: "Remove Topic" })).toBeInTheDocument()
  })
})
