import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { renderHook } from "@testing-library/react"

import { Button } from "@stellify/button"
import { Stagger } from "@stellify/stagger"
import { Spinner } from "@stellify/spinner"
import { SegmentedControl } from "@stellify/segmented-control"
import { useViewTransition } from "@stellify/use-view-transition"

describe("Button loading", () => {
  it("keeps the label in the layout (invisible) and overlays a delayed spinner", () => {
    render(<Button loading>Guardar</Button>)
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(screen.getByText("Guardar").className).toContain("invisible")
    const spinner = button.querySelector('[data-slot="spinner"]') as HTMLElement
    expect(spinner.style.transitionDelay).toBe("var(--delay-feedback)")
  })

  it("renders content unwrapped (display: contents) when idle", () => {
    render(<Button>Guardar</Button>)
    expect(screen.getByText("Guardar").className).toBe("contents")
  })
})

describe("Spinner delay", () => {
  it("takes a number of ms", () => {
    const { container } = render(<Spinner delay={300} />)
    expect((container.firstChild as HTMLElement).style.transitionDelay).toBe("300ms")
  })
})

describe("Stagger", () => {
  it("delays each child in turn and caps the delay", () => {
    const { container } = render(
      <ul>
        <Stagger step={40} max={2}>
          {["a", "b", "c", "d"].map((x) => (
            <li key={x}>{x}</li>
          ))}
        </Stagger>
      </ul>
    )
    const delays = Array.from(container.querySelectorAll("li")).map((li) => li.style.animationDelay)
    expect(delays).toEqual(["0ms", "40ms", "80ms", "80ms"])
    expect(container.querySelector("li")!.className).toContain("animate-in")
  })
})

describe("useViewTransition", () => {
  it("runs the update directly when the API is missing", () => {
    const { result } = renderHook(() => useViewTransition())
    const update = vi.fn()
    result.current(update)
    expect(update).toHaveBeenCalledOnce()
  })

  it("goes through document.startViewTransition when present", () => {
    const start = vi.fn((cb: () => void) => {
      cb()
      return { finished: Promise.resolve() }
    })
    Object.assign(document, { startViewTransition: start })
    const { result } = renderHook(() => useViewTransition())
    const update = vi.fn()
    result.current(update)
    expect(start).toHaveBeenCalledOnce()
    expect(update).toHaveBeenCalledOnce()
    delete (document as { startViewTransition?: unknown }).startViewTransition
  })
})

describe("SegmentedControl (Hick's law)", () => {
  it("warns above five options", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const options = ["a", "b", "c", "d", "e", "f"].map((v) => ({ value: v, label: v }))
    render(<SegmentedControl aria-label="x" value="a" onValueChange={() => {}} options={options} />)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
