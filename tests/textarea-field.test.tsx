import { render, screen } from "@testing-library/react"
import { TextareaField } from "@stellify/textarea-field"

describe("TextareaField", () => {
  it("labels the textarea, marks required and announces the error", () => {
    render(<TextareaField label="Resúmelos brevemente" required error="Obligatorio" />)
    const box = screen.getByLabelText(/Resúmelos brevemente/)
    expect(box).toBeRequired()
    expect(box).toHaveAttribute("aria-invalid", "true")
    expect(box).toHaveAccessibleDescription("Obligatorio")
    expect(box.closest("[data-slot='textarea-field']")).not.toBeNull()
  })
})
