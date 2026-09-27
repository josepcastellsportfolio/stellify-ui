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
