import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { z } from "zod"
import { FormModal, type FieldConfig, type FormValues } from "@stellify/form-modal"

interface Entry {
  id: number
  name: string
  amount: string
  active: boolean
}

const fields: FieldConfig[] = [
  { name: "name", label: "Nombre", type: "text", required: true, colSpan: "half" },
  { name: "amount", label: "Importe", type: "number", colSpan: "half" },
  { name: "active", label: "Activo", type: "switch", activeLabel: "Sí", inactiveLabel: "No" },
]

const schema = z.object({
  name: z.string().min(1, "Obligatorio"),
  amount: z.string().optional(),
  active: z.boolean(),
})

function setup(overrides: Partial<Parameters<typeof FormModal<Entry>>[0]> = {}) {
  const props = {
    open: true,
    entity: null,
    createTitle: "Nueva entrada",
    editTitle: "Editar entrada",
    fields,
    defaultValues: { name: "", amount: "", active: false } as FormValues,
    schema,
    entityToFormValues: (e: Entry): FormValues => ({ name: e.name, amount: e.amount, active: e.active }),
    formValuesToPayload: (v: FormValues) => ({ ...v, amount: Number(v.amount) }),
    onSave: vi.fn(async (data: never) => ({ id: 1, ...(data as object) }) as Entry),
    onUpdate: vi.fn(async (id: number, data: never) => ({ id, ...(data as object) }) as Entry),
    getId: (e: Entry) => e.id,
    onClose: vi.fn(),
    onNotify: vi.fn(),
    messages: { created: "Creado", updated: "Actualizado", error: "No se pudo guardar" },
    saveLabel: "Guardar",
    cancelLabel: "Cancelar",
    ...overrides,
  }
  render(<FormModal<Entry> {...props} />)
  return props
}

describe("form-modal", () => {
  it("validates with the zod schema before creating", async () => {
    const props = setup()
    expect(screen.getByRole("dialog", { name: "Nueva entrada" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
    expect(await screen.findByText("Obligatorio")).toBeInTheDocument()
    expect(props.onSave).not.toHaveBeenCalled()

    await userEvent.type(screen.getByLabelText("Nombre *"), "Luz")
    await userEvent.type(screen.getByLabelText("Importe"), "12")
    await userEvent.click(screen.getByRole("switch"))
    expect(screen.getByText("Sí")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
    await waitFor(() => expect(props.onClose).toHaveBeenCalled())
    expect(props.onSave).toHaveBeenCalledWith({ name: "Luz", amount: 12, active: true })
    expect(props.onNotify).toHaveBeenCalledWith("success", "Creado")
  })

  it("edits an entity through onUpdate with its id", async () => {
    const props = setup({ entity: { id: 7, name: "Agua", amount: "35", active: true } })
    expect(screen.getByRole("dialog", { name: "Editar entrada" })).toBeInTheDocument()
    expect(screen.getByLabelText("Nombre *")).toHaveValue("Agua")
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
    await waitFor(() => expect(props.onUpdate).toHaveBeenCalledWith(7, { name: "Agua", amount: 35, active: true }))
    expect(props.onSave).not.toHaveBeenCalled()
    expect(props.onNotify).toHaveBeenCalledWith("success", "Actualizado")
  })

  it("reports a failed save and stays open", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const props = setup({
      entity: { id: 7, name: "Agua", amount: "35", active: true },
      onUpdate: vi.fn(async () => {
        throw new Error("boom")
      }),
    })
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
    await waitFor(() => expect(props.onNotify).toHaveBeenCalledWith("error", "No se pudo guardar"))
    expect(props.onClose).not.toHaveBeenCalled()
    error.mockRestore()
  })

  it("closes from Cancel", async () => {
    const props = setup()
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(props.onClose).toHaveBeenCalled()
  })
})
