import { render, screen } from "@testing-library/react"
import { Field } from "@stellify/field"
import { Input } from "@stellify/input"
import { Badge } from "@stellify/badge"
import { StatusBadge } from "@stellify/status-badge"
import { Spinner } from "@stellify/spinner"
import { Button } from "@stellify/button"
import { Card } from "@stellify/card"

describe("Field", () => {
  it("wires label, required, error and description onto the control", () => {
    const { rerender } = render(
      <Field label="Email" required description="Te escribiremos aquí">
        <Input type="email" />
      </Field>
    )
    const input = screen.getByLabelText(/Email/)
    expect(input).toBeRequired()
    expect(input).toHaveAccessibleDescription("Te escribiremos aquí")
    expect(input).not.toHaveAttribute("aria-invalid")

    rerender(
      <Field label="Email" required description="Te escribiremos aquí" error="Formato no válido">
        <Input type="email" />
      </Field>
    )
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAccessibleDescription("Formato no válido")
  })

  it("respects an id set on the child and supports a render function", () => {
    render(
      <>
        <Field label="Nombre">
          <Input id="nombre" />
        </Field>
        <Field label="Ciudad">{(control) => <input {...control} />}</Field>
      </>
    )
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("id", "nombre")
    expect(screen.getByLabelText("Ciudad")).toBeInTheDocument()
  })
})

describe("Badge family", () => {
  it("maps tone x appearance and keeps shadcn variants working", () => {
    render(
      <>
        <Badge tone="danger">Error</Badge>
        <Badge tone="success" appearance="solid">Hecho</Badge>
        <Badge variant="destructive">Antiguo</Badge>
      </>
    )
    expect(screen.getByText("Error")).toHaveClass("bg-danger-subtle", "text-danger")
    expect(screen.getByText("Hecho")).toHaveClass("bg-success", "text-success-foreground")
    expect(screen.getByText("Antiguo")).toHaveClass("bg-danger-subtle")
  })

  it("status-badge is a badge with its own slot", () => {
    render(<StatusBadge status="warning">Pendiente</StatusBadge>)
    const el = screen.getByText("Pendiente")
    expect(el).toHaveAttribute("data-slot", "status-badge")
    expect(el).toHaveClass("bg-warning-subtle")
  })
})

describe("Spinner", () => {
  it("announces Cargando by default and hides when decorative", () => {
    render(<Spinner />)
    expect(screen.getByRole("status", { name: "Cargando" })).toBeInTheDocument()
  })

  it("is decorative inside a loading button, which keeps its name", () => {
    render(<Button loading>Guardar</Button>)
    const btn = screen.getByRole("button", { name: "Guardar" })
    expect(btn).toHaveAttribute("aria-busy", "true")
    expect(screen.queryByRole("status")).toBeNull()
  })
})

describe("v2 surfaces", () => {
  it("card is a tonal surface with parts, no border or shadow", () => {
    render(
      <Card data-testid="c">
        <Card.Header>
          <Card.Title>Ventas</Card.Title>
        </Card.Header>
      </Card>
    )
    const card = screen.getByTestId("c")
    expect(card).toHaveClass("bg-card")
    expect(card.className).not.toMatch(/\bborder\b|\bshadow-/)
    expect(screen.getByText("Ventas")).toHaveAttribute("data-slot", "card-title")
  })
})
