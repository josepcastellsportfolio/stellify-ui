import { render, screen } from "@testing-library/react"
import { Slider } from "@stellify/slider"

describe("slider", () => {
  it("renders one thumb for a single value", () => {
    render(<Slider defaultValue={[40]} max={100} aria-label="Precio" />)
    expect(screen.getAllByRole("slider")).toHaveLength(1)
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "40")
  })

  it("renders two thumbs for a range", () => {
    render(<Slider value={[20, 80]} max={100} />)
    const thumbs = screen.getAllByRole("slider")
    expect(thumbs).toHaveLength(2)
    expect(thumbs.map(t => t.getAttribute("aria-valuenow"))).toEqual(["20", "80"])
  })

  it("marks itself disabled", () => {
    render(<Slider defaultValue={[10]} disabled />)
    expect(screen.getByRole("slider")).toHaveAttribute("data-disabled")
  })
})
