import { render, screen } from "@testing-library/react"
import { TrendIndicator, trendDirection, trendTone } from "@stellify/trend-indicator"

describe("TrendIndicator", () => {
  it("reads the accessible label and hides the arrow and visible value from assistive tech", () => {
    render(<TrendIndicator direction="up" value="+12 %" label="Tendencia: sube 12 %" />)
    const indicator = screen.getByText("Tendencia: sube 12 %").parentElement!
    expect(indicator).toHaveAttribute("data-slot", "trend-indicator")
    expect(screen.getByText("+12 %")).toHaveAttribute("aria-hidden")
    expect(indicator.querySelector("svg")).toHaveAttribute("aria-hidden")
    expect(screen.getByText("Tendencia: sube 12 %")).toHaveClass("sr-only")
  })

  it.each([
    ["up", "success", "text-success"],
    ["down", "danger", "text-destructive"],
    ["flat", "neutral", "text-muted-foreground"],
  ] as const)("%s maps to the %s tone", (direction, tone, className) => {
    render(<TrendIndicator direction={direction} label="x" />)
    const indicator = screen.getByText("x").parentElement!
    expect(indicator).toHaveAttribute("data-direction", direction)
    expect(indicator).toHaveAttribute("data-tone", tone)
    expect(indicator).toHaveClass(className)
  })

  it("derives the direction from a numeric change and a flat threshold", () => {
    const { rerender } = render(<TrendIndicator change={0.12} flatThreshold={0.05} label="x" />)
    const get = () => screen.getByText("x").parentElement!
    expect(get()).toHaveAttribute("data-direction", "up")
    rerender(<TrendIndicator change={-0.03} flatThreshold={0.05} label="x" />)
    expect(get()).toHaveAttribute("data-direction", "flat")
    rerender(<TrendIndicator change={-0.2} flatThreshold={0.05} label="x" />)
    expect(get()).toHaveAttribute("data-direction", "down")
  })

  it("inverts or forces the tone", () => {
    const { rerender } = render(<TrendIndicator direction="up" inverted label="x" />)
    const get = () => screen.getByText("x").parentElement!
    expect(get()).toHaveAttribute("data-tone", "danger")
    rerender(<TrendIndicator direction="up" tone="neutral" label="x" />)
    expect(get()).toHaveAttribute("data-tone", "neutral")
  })

  it("exposes the pure helpers", () => {
    expect(trendDirection(0)).toBe("flat")
    expect(trendDirection(5, 5)).toBe("flat")
    expect(trendDirection(5.1, 5)).toBe("up")
    expect(trendTone("down")).toBe("danger")
    expect(trendTone("down", true)).toBe("success")
    expect(trendTone("flat", true)).toBe("neutral")
  })
})
