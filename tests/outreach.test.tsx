import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LoadingState } from "@stellify/loading-state"
import { OutreachCard } from "@stellify/outreach-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@stellify/tabs"

describe("Tabs plain variant", () => {
  it("keeps the default look and removes the muted pill background when plain", () => {
    const { rerender } = render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByRole("tablist")).toHaveClass("bg-muted")
    rerender(
      <Tabs defaultValue="a">
        <TabsList variant="plain">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">contenido</TabsContent>
      </Tabs>
    )
    expect(screen.getByRole("tablist")).not.toHaveClass("bg-muted")
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("data-variant", "plain")
  })
})

describe("LoadingState", () => {
  it("announces progress", () => {
    render(<LoadingState title="Redactando comunicaciones…" description="Puedes cambiar de sección." progress={{ done: 2, total: 5 }} />)
    const region = screen.getByRole("status")
    expect(within(region).getByRole("heading", { name: "Redactando comunicaciones…" })).toBeInTheDocument()
    expect(within(region).getByText("2 de 5")).toBeInTheDocument()
    expect(within(region).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40")
  })
})

const email = {
  name: "PádelOn Murcia",
  diagnosis: "El volumen de reseñas sugiere carga en reservas.",
  channelLabel: "Correo en frío",
  subject: "Reservas para PádelOn",
  body: "Vuestra valoración de 4,7 con 219 reseñas…",
}

describe("OutreachCard", () => {
  it("shows name, diagnosis, channel tab, subject and body", () => {
    render(<OutreachCard status="ready" {...email} onSave={() => {}} />)
    const card = screen.getByRole("article", { name: "PádelOn Murcia" })
    expect(within(card).getByText(email.diagnosis)).toBeInTheDocument()
    expect(within(card).getByRole("tab", { name: "Correo en frío" })).toHaveAttribute("aria-selected", "true")
    expect(within(card).getByLabelText("Asunto")).toHaveValue(email.subject)
    expect(within(card).getByLabelText("Mensaje")).toHaveValue(email.body)
  })

  it("saves edits only when something changed", async () => {
    const onSave = vi.fn()
    render(<OutreachCard status="ready" {...email} onSave={onSave} />)
    const save = screen.getByRole("button", { name: "Guardar cambios" })
    expect(save).toBeDisabled()
    await userEvent.clear(screen.getByLabelText("Asunto"))
    await userEvent.type(screen.getByLabelText("Asunto"), "Nuevo asunto")
    await userEvent.click(save)
    expect(onSave).toHaveBeenCalledWith({ subject: "Nuevo asunto", body: email.body })
  })

  it("copies subject and body to the clipboard", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText")
    render(<OutreachCard status="ready" {...email} onSave={() => {}} />)
    await user.click(screen.getByRole("button", { name: /Copiar/ }))
    expect(writeText).toHaveBeenCalledWith(`${email.subject}\n\n${email.body}`)
    expect(await screen.findByText("Copiado")).toBeInTheDocument()
  })

  it("shows the objections of a call script in their own tab, without a subject", async () => {
    render(
      <OutreachCard
        status="ready"
        name="Pádel Churra"
        diagnosis="d"
        channelLabel="WhatsApp"
        body="Apertura: …"
        objections={[{ objecion: "No tenemos presupuesto", respuesta: "El diagnóstico es gratuito." }]}
        onSave={() => {}}
      />
    )
    expect(screen.queryByLabelText("Asunto")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("tab", { name: "Objeciones" }))
    expect(screen.getByText("No tenemos presupuesto")).toBeInTheDocument()
  })

  it("shows progress, queue and failure states instead of the message", () => {
    const { rerender } = render(<OutreachCard status="generating" name="A" onSave={() => {}} />)
    expect(screen.getByRole("status", { name: /Redactando/ })).toBeInTheDocument()
    rerender(<OutreachCard status="queued" name="A" retryLabel="Reintento a las 10:05" onSave={() => {}} />)
    expect(screen.getByText(/Reintento a las 10:05/)).toBeInTheDocument()
    rerender(<OutreachCard status="failed" name="A" error="Sin forma de contacto." onSave={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Sin forma de contacto.")
    expect(screen.queryByLabelText("Mensaje")).not.toBeInTheDocument()
  })
})
