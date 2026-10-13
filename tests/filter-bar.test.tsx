import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { FilterBar, FilterSelect, FilterText } from "@stellify/filter-bar"

// Radix Select relies on pointer capture and scrollIntoView, which jsdom lacks.
beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
})

const ZONES = [
  { value: "tortosa", label: "Tortosa" },
  { value: "amposta", label: "Amposta" },
]

function Bar({ onZone = () => {}, onText = () => {}, debounceMs = 0 }: { onZone?: (v: string) => void; onText?: (v: string) => void; debounceMs?: number }) {
  const [zone, setZone] = useState("")
  const [q, setQ] = useState("")
  return (
    <FilterBar
      label="Filtros"
      clearLabel="Limpiar"
      clearDisabled={!zone && !q}
      onClear={() => {
        setZone("")
        setQ("")
      }}
    >
      <FilterSelect
        label="Zona"
        allLabel="Todos"
        value={zone}
        options={ZONES}
        onValueChange={(v) => {
          setZone(v)
          onZone(v)
        }}
      />
      <FilterText
        label="Buscar"
        placeholder="Nombre o email"
        value={q}
        debounceMs={debounceMs}
        onValueChange={(v) => {
          setQ(v)
          onText(v)
        }}
      />
    </FilterBar>
  )
}

describe("FilterBar", () => {
  it("is a named form with one column per field and a clear button", () => {
    render(<Bar />)
    const form = screen.getByRole("form", { name: "Filtros" })
    expect(form).toHaveAttribute("data-slot", "filter-bar")
    expect(form.style.getPropertyValue("--filter-bar-fields")).toBe("2")
    expect(within(form).getByRole("combobox", { name: "Zona" })).toHaveTextContent("Todos")
    expect(within(form).getByRole("searchbox", { name: "Buscar" })).toHaveAttribute("placeholder", "Nombre o email")
    expect(within(form).getByRole("button", { name: "Limpiar" })).toBeDisabled()
  })

  it("maps the 'all' option to an empty value and clears every field", async () => {
    const onZone = vi.fn()
    render(<Bar onZone={onZone} />)
    const pick = async (name: string) => {
      await userEvent.click(screen.getByRole("combobox", { name: "Zona" }))
      await userEvent.click(await screen.findByRole("option", { name }))
    }
    await pick("Amposta")
    expect(screen.getByRole("combobox", { name: "Zona" })).toHaveTextContent("Amposta")
    await pick("Todos")
    expect(screen.getByRole("combobox", { name: "Zona" })).toHaveTextContent("Todos")
    expect(onZone.mock.calls).toEqual([["amposta"], [""]])

    await pick("Tortosa")
    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar" }), "anna")
    expect(screen.getByRole("searchbox", { name: "Buscar" })).toHaveValue("anna")
    await userEvent.click(screen.getByRole("button", { name: "Limpiar" }))
    expect(screen.getByRole("combobox", { name: "Zona" })).toHaveTextContent("Todos")
    expect(screen.getByRole("searchbox", { name: "Buscar" })).toHaveValue("")
    expect(screen.getByRole("button", { name: "Limpiar" })).toBeDisabled()
  })

  it("commits the text once typing pauses", () => {
    vi.useFakeTimers()
    try {
      const onText = vi.fn()
      render(<Bar onText={onText} debounceMs={250} />)
      const box = screen.getByRole("searchbox", { name: "Buscar" })
      fireEvent.change(box, { target: { value: "an" } })
      act(() => vi.advanceTimersByTime(100))
      fireEvent.change(box, { target: { value: "anna" } })
      act(() => vi.advanceTimersByTime(249))
      expect(onText).not.toHaveBeenCalled()
      act(() => vi.advanceTimersByTime(1))
      expect(onText.mock.calls).toEqual([["anna"]])
    } finally {
      vi.useRealTimers()
    }
  })

  it("cancels the native submit on Enter", async () => {
    const submits: SubmitEvent[] = []
    const listener = (e: Event) => submits.push(e as SubmitEvent)
    window.addEventListener("submit", listener)
    try {
      render(<Bar />)
      await userEvent.type(screen.getByRole("searchbox", { name: "Buscar" }), "x{Enter}")
      expect(submits).toHaveLength(1)
      expect(submits[0].defaultPrevented).toBe(true)
    } finally {
      window.removeEventListener("submit", listener)
    }
  })

  it("keeps the typed text when the committed value echoes back late", () => {
    vi.useFakeTimers()
    try {
      const onValueChange = vi.fn()
      const { rerender } = render(<FilterText label="Buscar" value="" debounceMs={250} onValueChange={onValueChange} />)
      const box = screen.getByRole("searchbox", { name: "Buscar" })
      fireEvent.change(box, { target: { value: "an" } })
      act(() => vi.advanceTimersByTime(250))
      expect(onValueChange).toHaveBeenLastCalledWith("an")
      fireEvent.change(box, { target: { value: "ann" } })
      rerender(<FilterText label="Buscar" value="an" debounceMs={250} onValueChange={onValueChange} />)
      expect(box).toHaveValue("ann")
      rerender(<FilterText label="Buscar" value="" debounceMs={250} onValueChange={onValueChange} />)
      expect(box).toHaveValue("")
    } finally {
      vi.useRealTimers()
    }
  })
})
