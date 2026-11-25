import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { Field } from "@stellify/field"
import { OtpInput } from "@stellify/otp-input"
import { ProgressChecklist } from "@stellify/progress-checklist"
import { Stepper, stepStatus } from "@stellify/stepper"
import { SuccessState } from "@stellify/success-state"

const ORDER = [
  { id: "o", label: "Pedido" },
  { id: "p", label: "Preparado" },
  { id: "s", label: "Enviado", description: "Llega el jueves" },
  { id: "d", label: "Entregado" },
]

describe("Stepper", () => {
  it("is an ordered list with the current step marked and every status in text", () => {
    render(<Stepper aria-label="Estado del pedido" steps={ORDER} current={2} />)
    const list = screen.getByRole("list", { name: "Estado del pedido" })
    const items = within(list).getAllByRole("listitem")
    expect(items.map((li) => li.getAttribute("data-status"))).toEqual(["complete", "complete", "current", "upcoming"])
    expect(items[2]).toHaveAttribute("aria-current", "step")
    expect(items[0]).toHaveTextContent("Pedido, completado")
    expect(items[3]).toHaveTextContent("Entregado, pendiente")
    // Connectors: one fewer than steps, filled up to the current one.
    const connectors = list.querySelectorAll("[data-slot='stepper-connector']")
    expect(connectors).toHaveLength(3)
    expect(Array.from(connectors).map((c) => c.hasAttribute("data-filled"))).toEqual([true, true, false])
  })

  it("marks everything complete when current is past the end", () => {
    expect([0, 1, 2].map((i) => stepStatus(i, 3))).toEqual(["complete", "complete", "complete"])
  })
})

describe("ProgressChecklist", () => {
  const items = [
    { id: "a", label: "Crear cuenta", done: true },
    { id: "b", label: "Añadir logo", done: true },
    { id: "c", label: "Elegir tema", done: false, description: "Puedes cambiarlo luego.", action: <button type="button">Empezar</button> },
    { id: "d", label: "Añadir un producto", done: false, action: <button type="button">Añadir</button> },
    { id: "e", label: "Conectar pagos", done: true },
  ]

  it("shows the count, the bar and how many steps are left", () => {
    render(<ProgressChecklist title="Configura tu tienda" items={items} />)
    const section = screen.getByRole("region", { name: "Configura tu tienda" })
    expect(within(section).getByText("3 de 5")).toBeInTheDocument()
    expect(within(section).getByText("Te faltan 2 pasos")).toBeInTheDocument()
    expect(within(section).getByRole("progressbar")).toHaveAttribute("aria-valuetext", "3 de 5")
  })

  it("only the first pending item is current and shows its action", () => {
    render(<ProgressChecklist title="Configura tu tienda" items={items} />)
    const rows = screen.getAllByRole("listitem")
    expect(rows[2]).toHaveAttribute("aria-current", "step")
    expect(screen.getByRole("button", { name: "Empezar" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Añadir" })).toBeNull()
    expect(screen.getByText("Puedes cambiarlo luego.")).toBeInTheDocument()
  })

  it("says when it's all done", () => {
    render(<ProgressChecklist title="Listo" items={items.map((i) => ({ ...i, done: true }))} />)
    expect(screen.getByText("Todo listo")).toBeInTheDocument()
  })
})

function Code({ onComplete = (_: string) => {}, initial = "" }) {
  const [v, setV] = useState(initial)
  return (
    <Field label="Código">
      <OtpInput length={4} value={v} onValueChange={setV} onComplete={onComplete} />
    </Field>
  )
}

describe("OtpInput", () => {
  it("is labelled by Field on the first box and names the rest", () => {
    render(<Code />)
    expect(screen.getByLabelText("Código")).toHaveAttribute("autocomplete", "one-time-code")
    expect(screen.getByLabelText("Carácter 2 de 4")).toHaveAttribute("inputmode", "numeric")
  })

  it("moves on as you type, skips non-digits and completes", async () => {
    const done = vi.fn()
    render(<Code onComplete={done} />)
    await userEvent.click(screen.getByLabelText("Código"))
    await userEvent.keyboard("1a234")
    const boxes = screen.getAllByRole("textbox")
    expect(boxes.map((b) => (b as HTMLInputElement).value)).toEqual(["1", "2", "3", "4"])
    expect(done).toHaveBeenCalledWith("1234")
  })

  it("spreads a pasted code across the boxes", async () => {
    const done = vi.fn()
    render(<Code onComplete={done} />)
    await userEvent.click(screen.getByLabelText("Código"))
    await userEvent.paste("98-76")
    expect(screen.getAllByRole("textbox").map((b) => (b as HTMLInputElement).value)).toEqual(["9", "8", "7", "6"])
    expect(done).toHaveBeenCalledWith("9876")
  })

  it("Backspace on an empty box clears the one before and moves back", async () => {
    render(<Code initial="12" />)
    const boxes = screen.getAllByRole("textbox")
    await userEvent.click(boxes[2])
    await userEvent.keyboard("{Backspace}")
    expect(boxes.map((b) => (b as HTMLInputElement).value)).toEqual(["1", "", "", ""])
    expect(boxes[1]).toHaveFocus()
  })

  it("a click past the first empty box lands on it", async () => {
    render(<Code initial="1" />)
    const boxes = screen.getAllByRole("textbox")
    await userEvent.click(boxes[3])
    expect(boxes[1]).toHaveFocus()
  })
})

describe("SuccessState", () => {
  it("announces the outcome with its figure and next step", () => {
    render(
      <SuccessState
        title="Pago completado"
        value="240 € enviados"
        description="A Sam Lee"
        action={<button type="button">Hecho</button>}
      />
    )
    const status = screen.getByRole("status")
    expect(within(status).getByRole("heading", { level: 2, name: "Pago completado" })).toBeInTheDocument()
    expect(within(status).getByText("240 € enviados")).toHaveAttribute("data-slot", "success-state-value")
    expect(status.querySelector("[data-slot='success-state-mark']")).not.toBeNull()
    expect(within(status).getByRole("button", { name: "Hecho" })).toBeInTheDocument()
  })
})

describe("OtpInput edge cases", () => {
  it("is a single tab stop, so Tab leaves the code", async () => {
    render(
      <>
        <Code />
        <button type="button">Siguiente</button>
      </>
    )
    await userEvent.tab()
    expect(screen.getByLabelText("Código")).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Siguiente" })).toHaveFocus()
  })

  it("an input event that empties a box deletes its character", async () => {
    render(<Code initial="123" />)
    const boxes = screen.getAllByRole("textbox")
    await userEvent.clear(boxes[1])
    expect(boxes.map((b) => (b as HTMLInputElement).value)).toEqual(["1", "3", "", ""])
  })

  it("a full code arriving in a later box is written from the start", async () => {
    const done = vi.fn()
    render(<Code initial="1" onComplete={done} />)
    const boxes = screen.getAllByRole("textbox")
    await userEvent.click(boxes[1])
    await userEvent.paste("5678")
    expect(boxes.map((b) => (b as HTMLInputElement).value)).toEqual(["5", "6", "7", "8"])
    expect(done).toHaveBeenCalledWith("5678")
  })
})
