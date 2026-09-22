import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NavFooter } from "@stellify/nav-footer"
import { OnboardingShell } from "@stellify/onboarding-shell"
import { StepHeading } from "@stellify/step-heading"

describe("OnboardingShell", () => {
  it("shows the step counter and a progress bar at step/total", () => {
    render(
      <OnboardingShell step={7} totalSteps={8}>
        <p>contenido</p>
      </OnboardingShell>
    )
    expect(screen.getByText("Paso 7 de 8")).toBeInTheDocument()
    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveAttribute("aria-valuenow", "87.5")
    expect(bar).toHaveClass("h-1")
    expect(screen.getByRole("img", { name: "StellifyIT" })).toBeInTheDocument()
    expect(screen.getByRole("main")).toHaveTextContent("contenido")
  })

  it("accepts a custom step label for other languages", () => {
    render(
      <OnboardingShell step={1} totalSteps={8} stepLabel={(s, t) => `Step ${s} of ${t}`}>
        x
      </OnboardingShell>
    )
    expect(screen.getByText("Step 1 of 8")).toBeInTheDocument()
  })
})

describe("StepHeading", () => {
  it("renders an h1 with its description", () => {
    render(<StepHeading title="¿Quieres aparecer en cámara?" description="Determina el formato." />)
    expect(screen.getByRole("heading", { level: 1, name: "¿Quieres aparecer en cámara?" })).toBeInTheDocument()
    expect(screen.getByText("Determina el formato.")).toBeInTheDocument()
  })
})

describe("NavFooter", () => {
  it("calls back and next", async () => {
    const onBack = vi.fn()
    const onNext = vi.fn()
    render(<NavFooter onBack={onBack} onNext={onNext} />)
    await userEvent.click(screen.getByRole("button", { name: /Atrás/ }))
    await userEvent.click(screen.getByRole("button", { name: /Siguiente/ }))
    expect(onBack).toHaveBeenCalledOnce()
    expect(onNext).toHaveBeenCalledOnce()
  })

  it("hides back on the first step and uses a custom last label", () => {
    render(<NavFooter onNext={() => {}} nextLabel="Ver cuál es la tuya" />)
    expect(screen.queryByRole("button", { name: /Atrás/ })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Ver cuál es la tuya/ })).toBeInTheDocument()
  })

  it("blocks next while disabled", async () => {
    const onNext = vi.fn()
    render(<NavFooter onNext={onNext} nextDisabled />)
    await userEvent.click(screen.getByRole("button", { name: /Siguiente/ }))
    expect(onNext).not.toHaveBeenCalled()
  })

  it("can submit a form", () => {
    render(<NavFooter nextType="submit" />)
    expect(screen.getByRole("button", { name: /Siguiente/ })).toHaveAttribute("type", "submit")
  })
})
