import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Wallet } from "lucide-react"
import { MetricCard } from "@stellify/metric-card"

describe("metric-card", () => {
  it("renders label, value, unit and hint", () => {
    render(<MetricCard label="Saldo mínimo" value="1.234 €" unit="EUR" hint="mar 2027" icon={Wallet} />)
    expect(screen.getByText("Saldo mínimo")).toBeInTheDocument()
    expect(screen.getByText("1.234 €")).toBeInTheDocument()
    expect(screen.getByText("EUR")).toBeInTheDocument()
    expect(screen.getByText("mar 2027")).toBeInTheDocument()
  })

  it("paints a negative value in the destructive color", () => {
    render(<MetricCard label="Saldo" value="−500 €" tone="negative" />)
    expect(screen.getByText("−500 €")).toHaveClass("text-destructive")
  })

  it("compact size uses the small type scale", () => {
    render(<MetricCard label="Meses en negativo" value="3 / 24" size="compact" />)
    expect(screen.getByText("Meses en negativo")).toHaveClass("uppercase")
    expect(screen.getByText("3 / 24")).toHaveClass("text-base")
  })

  it("colors the delta by direction, inverted when asked", () => {
    const { rerender } = render(<MetricCard label="Gasto" value="980" delta={{ value: "+3%", positive: true }} />)
    expect(screen.getByText("+3%")).toHaveClass("text-emerald-600")
    rerender(<MetricCard label="Gasto" value="980" invertDelta delta={{ value: "+3%", positive: true }} />)
    expect(screen.getByText("+3%")).toHaveClass("text-rose-600")
  })

  it("is a keyboard-operable button when clickable", async () => {
    const onClick = vi.fn()
    render(<MetricCard label="Ingresos" value="8.420" onClick={onClick} />)
    const card = screen.getByRole("button")
    card.focus()
    await userEvent.keyboard("{Enter}")
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
