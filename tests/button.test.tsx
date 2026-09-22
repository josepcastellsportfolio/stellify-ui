import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "@stellify/button"

describe("button", () => {
  it("renders the primary variant", () => {
    render(<Button variant="primary">Guardar</Button>)
    expect(screen.getByRole("button", { name: "Guardar" })).toHaveClass("bg-primary")
  })

  it("keeps the shadcn aliases working (ghost === base)", () => {
    render(<Button variant="ghost">Cancelar</Button>)
    expect(screen.getByRole("button")).toHaveClass("hover:bg-accent")
  })

  it("is disabled and does not fire clicks while loading", async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Guardar
      </Button>
    )
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
