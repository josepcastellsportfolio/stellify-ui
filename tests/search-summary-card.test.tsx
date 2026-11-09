import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { SearchSummaryCard } from "@stellify/search-summary-card"

function Card(props: Partial<React.ComponentProps<typeof SearchSummaryCard>>) {
  const [open, setOpen] = useState(false)
  return (
    <SearchSummaryCard
      title="Clínicas dentales · Tarragona"
      meta="8 oct 2026 · catalán"
      total={20}
      withEmail={9}
      summary="9 con email · 4 borradores · 2 contactados"
      open={open}
      onOpenChange={setOpen}
      {...props}
    >
      <p>Clínica Dental Sant Pere</p>
    </SearchSummaryCard>
  )
}

describe("SearchSummaryCard", () => {
  it("names the article by its title and describes the ring", () => {
    render(<Card />)
    expect(screen.getByRole("article", { name: "Clínicas dentales · Tarragona" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "9 de 20 con email" })).toHaveTextContent("20")
    expect(screen.getByText("9 con email · 4 borradores · 2 contactados")).toBeInTheDocument()
  })

  it("toggles the region from the title button", async () => {
    render(<Card />)
    const toggle = screen.getByRole("button", { name: "Clínicas dentales · Tarragona" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("Clínica Dental Sant Pere")).not.toBeInTheDocument()
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    const region = document.getElementById(toggle.getAttribute("aria-controls")!)
    expect(region).toHaveTextContent("Clínica Dental Sant Pere")
  })

  it("fills the ring by the email ratio and leaves it empty without businesses", () => {
    const { container, rerender } = render(<Card />)
    const arc = () => container.querySelectorAll("circle")[1]
    const c = 2 * Math.PI * 22
    expect(arc().getAttribute("stroke-dasharray")).toBe(`${c * 0.45} ${c}`)
    rerender(<Card total={0} withEmail={0} />)
    expect(arc()).toHaveClass("hidden")
    expect(screen.getByRole("img", { name: "0 de 0 con email" })).toHaveTextContent("0")
  })

  it("marks every part with data-slot and the open state on the card", async () => {
    const { container } = render(<Card />)
    const card = container.querySelector('[data-slot="search-summary-card"]')!
    expect(card).toHaveAttribute("data-state", "closed")
    for (const slot of ["search-summary-header", "search-summary-ring", "search-summary-title", "search-summary-toggle"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull()
    }
    expect(container.querySelector('[data-slot="search-summary-region"]')).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: "Clínicas dentales · Tarragona" }))
    expect(card).toHaveAttribute("data-state", "open")
    expect(container.querySelector('[data-slot="search-summary-region"]')).not.toBeNull()
  })
})
