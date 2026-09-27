import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Badge } from "@stellify/badge"
import { Progress } from "@stellify/progress"
import { Textarea } from "@stellify/textarea"

describe("progress size", () => {
  it("keeps h-4 by default and is thin with size=sm", () => {
    const { rerender } = render(<Progress value={50} aria-label="p" />)
    expect(screen.getByRole("progressbar")).toHaveClass("h-4")
    rerender(<Progress value={50} size="sm" aria-label="p" />)
    expect(screen.getByRole("progressbar")).toHaveClass("h-1")
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-slot", "progress")
  })
})

describe("textarea autoResize", () => {
  it("grows to its content height when autoResize is set", async () => {
    render(<Textarea aria-label="t" autoResize />)
    const box = screen.getByRole("textbox")
    Object.defineProperty(box, "scrollHeight", { configurable: true, value: 140 })
    await userEvent.type(box, "línea{enter}otra")
    expect(box.style.height).toBe("140px")
    expect(box).toHaveClass("resize-none")
  })

  it("leaves height alone without autoResize", async () => {
    render(<Textarea aria-label="t" />)
    const box = screen.getByRole("textbox")
    await userEvent.type(box, "x")
    expect(box.style.height).toBe("")
  })
})

describe("badge size and uppercase", () => {
  it("defaults are unchanged", () => {
    render(<Badge>Nuevo</Badge>)
    const badge = screen.getByText("Nuevo")
    expect(badge).toHaveClass("text-xs", "px-2.5")
    expect(badge).not.toHaveClass("uppercase")
  })

  it("xs + uppercase for the TU VÍA badge", () => {
    render(
      <Badge size="xs" uppercase>
        Tu vía
      </Badge>
    )
    expect(screen.getByText("Tu vía")).toHaveClass("uppercase", "text-[10px]")
  })
})
