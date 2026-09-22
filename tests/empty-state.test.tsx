import { render, screen } from "@testing-library/react"
import { Inbox } from "lucide-react"
import { EmptyState } from "@stellify/empty-state"

describe("empty-state", () => {
  it("renders title, description and the optional action", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Aún no hay campañas"
        description="C2 llegará más adelante."
        action={<button type="button">Volver</button>}
      />
    )
    expect(screen.getByRole("heading", { name: "Aún no hay campañas" })).toBeInTheDocument()
    expect(screen.getByText("C2 llegará más adelante.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument()
  })

  it("renders without an action", () => {
    render(<EmptyState icon={Inbox} title="Vacío" description="Nada aquí." />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
