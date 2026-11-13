import { act, render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRef, useState } from "react"
import { Inbox } from "lucide-react"
import { ConfirmDialog } from "@stellify/confirm-dialog"
import { Dialog, DialogContent, DialogTitle } from "@stellify/dialog"
import { EmptyState } from "@stellify/empty-state"
import { LoadingState } from "@stellify/loading-state"
import { SegmentedControl } from "@stellify/segmented-control"
import { Textarea } from "@stellify/textarea"
import { buttonVariants } from "@stellify/button"
import { usePersistedState } from "@stellify/use-persisted-state"
import { usePrefersReducedMotion } from "@stellify/use-prefers-reduced-motion"

describe("textarea autoResize", () => {
  function Box() {
    const [value, setValue] = useState("")
    return (
      <>
        <Textarea aria-label="Texto" autoResize maxHeight={100} value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="button" onClick={() => setValue("")}>
          Vaciar
        </button>
      </>
    )
  }

  it("grows to maxHeight, then scrolls, and shrinks back when cleared programmatically", async () => {
    // jsdom has no layout: scrollHeight follows the number of lines.
    const spy = vi
      .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLTextAreaElement) {
        return 24 * Math.max(1, this.value.split("\n").length)
      })
    const user = userEvent.setup()
    render(<Box />)
    const box = screen.getByRole("textbox", { name: "Texto" })
    await user.type(box, "a{Shift>}{Enter}{/Shift}b")
    expect(box.style.height).toBe("48px")
    expect(box.style.overflowY).toBe("hidden")
    await user.type(box, "{Shift>}{Enter}{Enter}{Enter}{Enter}{/Shift}c")
    expect(box.style.height).toBe("100px")
    expect(box.style.overflowY).toBe("auto")
    await user.click(screen.getByRole("button", { name: "Vaciar" }))
    expect(box.style.height).toBe("24px")
    spy.mockRestore()
  })
})

describe("dialog close button", () => {
  it("takes a translated name and is a 32px target (44px on touch)", () => {
    render(
      <Dialog open>
        <DialogContent labels={{ close: "Tancar" }}>
          <DialogTitle>Títol</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    const close = screen.getByRole("button", { name: "Tancar" })
    expect(close.className).toContain("size-8")
    expect(close.className).toContain("[@media(pointer:coarse)]:size-11")
  })
})

describe("button sizes", () => {
  it("default, lg and icon grow to 44px on coarse pointers; sm stays compact", () => {
    expect(buttonVariants({ size: "default" })).toContain("[@media(pointer:coarse)]:min-h-11")
    expect(buttonVariants({ size: "lg" })).toContain("[@media(pointer:coarse)]:min-h-11")
    expect(buttonVariants({ size: "icon" })).toContain("[@media(pointer:coarse)]:min-w-11")
    expect(buttonVariants({ size: "sm" })).not.toContain("pointer:coarse")
  })
})

describe("confirm-dialog focus return", () => {
  function Harness() {
    const [open, setOpen] = useState(false)
    const back = useRef<HTMLButtonElement>(null)
    return (
      <>
        <button ref={back} type="button">
          Opciones
        </button>
        <button type="button" onClick={() => setOpen(true)}>
          Abrir
        </button>
        <ConfirmDialog open={open} onOpenChange={setOpen} title="¿Borrar?" onConfirm={() => setOpen(false)} returnFocusRef={back} />
      </>
    )
  }

  it("sends focus to returnFocusRef when it closes", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole("button", { name: "Abrir" }))
    await user.click(await screen.findByRole("button", { name: "Cancelar" }))
    expect(screen.getByRole("button", { name: "Opciones" })).toHaveFocus()
  })
})

describe("heading levels", () => {
  it("empty-state and loading-state take headingLevel (default 3)", () => {
    const { rerender } = render(<EmptyState icon={Inbox} title="Vacío" description="Nada" headingLevel={2} />)
    expect(screen.getByRole("heading", { level: 2, name: "Vacío" })).toBeInTheDocument()
    rerender(<LoadingState title="Cargando datos" headingLevel={4} />)
    expect(screen.getByRole("heading", { level: 4, name: "Cargando datos" })).toBeInTheDocument()
    rerender(<LoadingState title="Por defecto" />)
    expect(screen.getByRole("heading", { level: 3, name: "Por defecto" })).toBeInTheDocument()
  })
})

describe("segmented-control", () => {
  it("names a short label in full for assistive tech, and has a 44px size", () => {
    render(
      <SegmentedControl
        aria-label="Idioma"
        size="lg"
        value="es"
        onValueChange={() => {}}
        options={[
          { value: "es", label: "es", accessibleLabel: "Español" },
          { value: "en", label: "en", accessibleLabel: "Inglés" },
        ]}
      />
    )
    const es = screen.getByRole("radio", { name: "Español" })
    expect(es.className).toContain("h-11")
  })
})

describe("usePersistedState", () => {
  beforeEach(() => window.localStorage.clear())

  it("reads the stored value, writes changes, and keeps two hooks on one key in step", () => {
    window.localStorage.setItem("k", JSON.stringify(3))
    const a = renderHook(() => usePersistedState("k", 0))
    const b = renderHook(() => usePersistedState("k", 0))
    expect(a.result.current[0]).toBe(3)
    act(() => a.result.current[1]((n) => n + 1))
    expect(window.localStorage.getItem("k")).toBe("4")
    expect(b.result.current[0]).toBe(4)
  })

  it("falls back to the default on malformed storage and survives a throwing setItem", () => {
    window.localStorage.setItem("bad", "{nope")
    const { result } = renderHook(() => usePersistedState("bad", "x"))
    expect(result.current[0]).toBe("x")
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota")
    })
    act(() => result.current[1]("y"))
    expect(result.current[0]).toBe("y")
    spy.mockRestore()
  })
})

describe("usePrefersReducedMotion", () => {
  it("follows the media query", () => {
    const listeners: (() => void)[] = []
    let matches = false
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches,
      media: query,
      addEventListener: (_: string, fn: () => void) => listeners.push(fn),
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
    matches = true
    act(() => listeners.forEach((fn) => fn()))
    expect(result.current).toBe(true)
    window.matchMedia = original
  })
})
