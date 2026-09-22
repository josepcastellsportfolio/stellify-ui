import { render, screen } from "@testing-library/react"
import { LoadingSpinner } from "@stellify/loading-spinner"

describe("loading-spinner", () => {
  it("is an accessible status with a translatable label", () => {
    render(<LoadingSpinner label="Redactando comunicaciones…" />)
    expect(screen.getByRole("status", { name: "Redactando comunicaciones…" })).toBeInTheDocument()
  })

  it("fills the viewport when fullScreen", () => {
    render(<LoadingSpinner fullScreen />)
    expect(screen.getByRole("status")).toHaveClass("h-screen")
  })
})
