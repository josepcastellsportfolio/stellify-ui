import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TextField } from "@stellify/text-field"

describe("text-field", () => {
  it("links label and input, and marks required with an asterisk", () => {
    render(<TextField label="Zona" required />)
    const input = screen.getByLabelText(/Zona/)
    expect(input).toBeRequired()
    expect(screen.getByText("*")).toBeInTheDocument()
  })

  it("announces the error and sets aria-invalid", () => {
    render(<TextField label="Email" error="Email no válido" />)
    const input = screen.getByLabelText("Email")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAccessibleDescription("Email no válido")
  })

  it("shows helper text when there is no error", async () => {
    render(<TextField label="Sector" helperText="Ej.: clínicas dentales" />)
    const input = screen.getByLabelText("Sector")
    expect(input).toHaveAccessibleDescription("Ej.: clínicas dentales")
    await userEvent.type(input, "pádel")
    expect(input).toHaveValue("pádel")
  })
})
