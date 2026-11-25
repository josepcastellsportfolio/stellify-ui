import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { ChoiceCard, ChoiceCardGroup } from "@stellify/choice-card"

function Camera() {
  const [value, setValue] = useState("no")
  return (
    <ChoiceCardGroup aria-label="Cámara" value={value} onValueChange={setValue}>
      <ChoiceCard value="yes" title="Sí, sin problema" description="Vídeo a cámara." />
      <ChoiceCard value="no" title="Prefiero no aparecer" description="Voz en off y texto." />
    </ChoiceCardGroup>
  )
}

describe("ChoiceCardGroup", () => {
  it("is a radiogroup with one checked radio", () => {
    render(<Camera />)
    expect(screen.getByRole("radiogroup", { name: "Cámara" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Prefiero no aparecer/ })).toBeChecked()
    expect(screen.getByRole("radio", { name: /Sí, sin problema/ })).not.toBeChecked()
  })

  it("selects on click and moves with arrow keys", async () => {
    render(<Camera />)
    await userEvent.click(screen.getByRole("radio", { name: /Sí, sin problema/ }))
    expect(screen.getByRole("radio", { name: /Sí, sin problema/ })).toBeChecked()
    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getByRole("radio", { name: /Prefiero no aparecer/ })).toHaveFocus()
  })

  it("marks the selected card with data-state and a check", () => {
    render(<Camera />)
    const selected = screen.getByRole("radio", { name: /Prefiero no aparecer/ })
    expect(selected).toHaveAttribute("data-state", "checked")
    expect(selected).toHaveAttribute("data-slot", "choice-card")
    expect(selected.querySelector("[data-slot='choice-card-check']")).not.toBeNull()
  })
})

describe("ChoiceCard featured", () => {
  it("marks one option as featured with a solid badge, separate from the checked state", () => {
    render(
      <ChoiceCardGroup aria-label="Plan" defaultValue="basic">
        <ChoiceCard value="basic" title="Básico" description="9 € / mes" />
        <ChoiceCard value="pro" title="Pro" description="19 € / mes" featured badge="Recomendado" />
        <ChoiceCard value="team" title="Equipo" description="49 € / mes" badge="Nuevo" />
      </ChoiceCardGroup>
    )
    const pro = screen.getByRole("radio", { name: /Pro/ })
    expect(pro).toHaveAttribute("data-featured")
    expect(pro).not.toBeChecked()
    expect(pro.querySelector("[data-slot='choice-card-badge']")!.className).toContain("bg-brand")
    const team = screen.getByRole("radio", { name: /Equipo/ })
    expect(team).not.toHaveAttribute("data-featured")
    expect(team.querySelector("[data-slot='choice-card-badge']")!.className).toContain("bg-brand-subtle")
  })
})
