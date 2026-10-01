import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { KpiCard } from "@stellify/kpi-card"
import { VatToggle } from "@stellify/vat-toggle"

describe("KpiCard", () => {
  it("shows label, value and hint", () => {
    render(<KpiCard label="CAC medio" value="41,10 €" hint="3 clientes" />)
    expect(screen.getByText("CAC medio")).toBeInTheDocument()
    expect(screen.getByText("41,10 €")).toBeInTheDocument()
    expect(screen.getByText("3 clientes")).toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
  })

  it("clamps the progress bar to 0–100", () => {
    render(<KpiCard label="Tope" value="130 %" progress={130} />)
    expect(screen.getByRole("progressbar", { name: "Tope" })).toHaveAttribute("aria-valuenow", "100")
  })
})

describe("VatToggle", () => {
  it("marks the active option and reports the other", async () => {
    const onChange = vi.fn()
    render(<VatToggle withVat={false} onChange={onChange} />)
    expect(screen.getByRole("radio", { name: "Base" })).toHaveAttribute("aria-checked", "true")
    await userEvent.click(screen.getByRole("radio", { name: "Con IVA" }))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
