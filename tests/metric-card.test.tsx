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

  it("keeps the arrow for an explicit direction (back-compat)", () => {
    const { container, rerender } = render(<MetricCard label="Ingresos" value="1" delta={{ value: "-2%", positive: false }} />)
    expect(screen.getByText("-2%")).toHaveClass("text-rose-600")
    expect(container.querySelector('[data-slot="metric-card-delta"] svg')).toBeInTheDocument()
    rerender(<MetricCard label="Ingresos" value="1" delta={{ value: "+2%", positive: true }} />)
    expect(container.querySelector('[data-slot="metric-card-delta"] svg')).toBeInTheDocument()
  })

  it("renders a neutral delta with no arrow in muted text", () => {
    const { container, rerender } = render(
      <MetricCard label="Leads" value="12" delta={{ value: "= mes anterior", tone: "neutral", positive: true }} />
    )
    const delta = screen.getByText("= mes anterior")
    expect(delta).toHaveClass("text-muted-foreground")
    expect(delta).not.toHaveClass("text-emerald-600")
    expect(container.querySelector('[data-slot="metric-card-delta"] svg')).not.toBeInTheDocument()
    // No direction at all is neutral too (it used to render a red down arrow).
    rerender(<MetricCard label="Leads" value="12" delta={{ value: "sin cambios" }} />)
    expect(screen.getByText("sin cambios")).toHaveClass("text-muted-foreground")
    expect(screen.getByText("sin cambios")).not.toHaveClass("text-rose-600")
    expect(container.querySelector('[data-slot="metric-card-delta"] svg')).not.toBeInTheDocument()
  })

  it("truncates the hint only in compact size", () => {
    const long = "para no bajar de 0 durante los próximos veinticuatro meses"
    const { rerender } = render(<MetricCard label="Facturación" value="2.400 €" hint={long} size="compact" />)
    expect(screen.getByText(long)).toHaveClass("truncate")
    expect(screen.getByText(long)).toHaveAttribute("title", long)
    rerender(<MetricCard label="Facturación" value="2.400 €" hint={long} />)
    expect(screen.getByText(long)).not.toHaveClass("truncate")
  })

  it("exposes progress as a labelled progressbar, clamped to 0–100", () => {
    const { rerender } = render(<MetricCard label="Objetivo mensual" value="7 / 10" progress={70} />)
    const bar = screen.getByRole("progressbar", { name: "Objetivo mensual" })
    expect(bar).toHaveAttribute("aria-valuenow", "70")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
    rerender(<MetricCard label="Objetivo mensual" value="14 / 10" progress={140} />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100")
    rerender(<MetricCard label="Objetivo mensual" value="-" progress={-5} />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0")
  })

  it("renders no progressbar without a finite progress", () => {
    const { rerender } = render(<MetricCard label="Objetivo" value="7" />)
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    rerender(<MetricCard label="Objetivo" value="7" progress={Number.NaN} />)
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
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
