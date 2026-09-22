import { render, screen } from "@testing-library/react"
import { Logo } from "@stellify/logo"

describe("logo", () => {
  it("is an image named StellifyIT by default", () => {
    render(<Logo />)
    expect(screen.getByRole("img", { name: "StellifyIT" })).toBeInTheDocument()
  })

  it("is hidden from assistive tech when decorative", () => {
    const { container } = render(<Logo ariaHidden />)
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })
})
