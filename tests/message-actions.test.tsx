import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { MessageActions } from "@stellify/message-actions"

const labels = {
  group: "Acciones del mensaje",
  copy: "Copiar",
  copied: "Copiado",
  regenerate: "Regenerar",
  fork: "Seguir en una conversación nueva desde aquí",
  delete: "Borrar el mensaje y su respuesta",
}

describe("MessageActions", () => {
  it("copies the markdown and runs each action", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    const onRegenerate = vi.fn()
    const onFork = vi.fn()
    const onDelete = vi.fn()
    render(<MessageActions text="**hola**" labels={labels} onRegenerate={onRegenerate} onFork={onFork} onDelete={onDelete} />)
    expect(screen.getByRole("toolbar", { name: labels.group })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: labels.copy }))
    expect(writeText).toHaveBeenCalledWith("**hola**")
    expect(await screen.findByRole("button", { name: labels.copied })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: labels.regenerate }))
    fireEvent.click(screen.getByRole("button", { name: labels.fork }))
    fireEvent.click(screen.getByRole("button", { name: labels.delete }))
    expect([onRegenerate, onFork, onDelete].map((f) => f.mock.calls.length)).toEqual([1, 1, 1])
  })

  it("shows only copy without handlers, and disables changes while busy", () => {
    const { rerender } = render(<MessageActions text="x" labels={labels} />)
    expect(screen.getAllByRole("button")).toHaveLength(1)
    rerender(<MessageActions text="x" labels={labels} onDelete={() => {}} busy />)
    expect(screen.getByRole("button", { name: labels.delete })).toBeDisabled()
  })
})
