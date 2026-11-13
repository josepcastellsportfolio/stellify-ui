import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRef, useState } from "react"
import { ChatComposer } from "@stellify/chat-composer"
import { ConversationList, type ConversationListItem } from "@stellify/conversation-list"
import { KeyboardShortcutsDialog } from "@stellify/keyboard-shortcuts-dialog"
import { MarkdownMessage } from "@stellify/markdown-message"
import { MessageBubble } from "@stellify/message-bubble"
import { PairingQr } from "@stellify/pairing-qr"
import { SideDrawer } from "@stellify/side-drawer"
import { ToolActivity } from "@stellify/tool-activity"
import { TurnStatus } from "@stellify/turn-status"

describe("MessageBubble", () => {
  it("is an article named by a hidden heading, at the level asked", () => {
    render(
      <MessageBubble role="assistant" heading="Respuesta" headingLevel={3} meta="Sonnet" footer={<p>pie</p>}>
        Hola
      </MessageBubble>
    )
    const article = screen.getByRole("article", { name: "Respuesta" })
    expect(within(article).getByRole("heading", { level: 3, name: "Respuesta" })).toBeInTheDocument()
    expect(article).toHaveTextContent("Sonnet")
    expect(article).toHaveTextContent("pie")
  })

  it("hides streaming text from assistive tech and never shows meta on user messages", () => {
    render(
      <MessageBubble role="user" heading="Tú" meta="no" hideFromAssistiveTech>
        texto
      </MessageBubble>
    )
    expect(screen.getByText("texto")).toHaveAttribute("aria-hidden", "true")
    expect(screen.queryByText("no")).not.toBeInTheDocument()
  })
})

describe("MarkdownMessage", () => {
  it("renders GFM, keeps the heading outline, drops HTML and images", () => {
    const { container } = render(
      <MarkdownMessage content={"# Título\n\n- uno\n- dos\n\n<b>html</b>\n\n![gato](https://x/y.png)\n\n| a |\n|---|\n| 1 |"} />
    )
    expect(screen.queryByRole("heading")).not.toBeInTheDocument()
    expect(screen.getByText("Título").tagName).toBe("P")
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
    expect(container.querySelector("b")).toBeNull()
    expect(container.querySelector("img")).toBeNull()
    expect(screen.getByText("[gato]")).toBeInTheDocument()
    expect(screen.getByRole("table")).toBeInTheDocument()
  })

  it("copies a code block and says so", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<MarkdownMessage content={"```ts\nconst a = 1\n```"} labels={{ copyCode: "Copiar código" }} />)
    expect(screen.getByText("ts")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Copiar código" }))
    expect(writeText).toHaveBeenCalledWith("const a = 1")
    expect(await screen.findByRole("button", { name: "Copiado" })).toBeInTheDocument()
  })

  it("links open in a new tab without an opener", () => {
    render(<MarkdownMessage content="[web](https://example.com)" />)
    const link = screen.getByRole("link", { name: "web" })
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })
})

describe("ToolActivity and TurnStatus", () => {
  it("lists tools with their status in words; a detail is a disclosure", async () => {
    render(
      <ToolActivity
        label="Herramientas"
        items={[
          { id: "1", label: "Repositorio consultado", status: "done", detail: "git log", duration: "2,4 s" },
          { id: "2", label: "Buscando…", status: "running" },
        ]}
      />
    )
    const list = screen.getByRole("list", { name: "Herramientas" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getByText("git log")).not.toBeVisible()
    await userEvent.click(screen.getByText("Repositorio consultado"))
    expect(screen.getByText("git log")).toBeVisible()
  })

  it("renders nothing without items", () => {
    const { container } = render(<ToolActivity label="x" items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("turn status carries the state as data and text", () => {
    render(<TurnStatus status="error" label="Sin conexión" />)
    expect(screen.getByText("Sin conexión").parentElement).toHaveAttribute("data-status", "error")
  })
})

function Composer({ onSubmit = (_: string) => {}, onStop = () => {}, state = "idle" as "idle" | "streaming" | "blocked" }) {
  const [value, setValue] = useState("")
  return (
    <ChatComposer
      value={value}
      onValueChange={setValue}
      onSubmit={(text) => {
        onSubmit(text)
        setValue("")
      }}
      onStop={onStop}
      state={state}
      labels={{ hint: "Intro envía" }}
    />
  )
}

describe("ChatComposer", () => {
  it("Enter sends the trimmed text, Shift+Enter adds a line, an empty box does not send", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Composer onSubmit={onSubmit} />)
    const box = screen.getByRole("textbox", { name: "Mensaje" })
    expect(box).toHaveAccessibleDescription("Intro envía")
    await user.click(box)
    await user.keyboard("{Enter}")
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Enviar" })).toHaveAttribute("aria-disabled", "true")
    await user.keyboard("  hola{Shift>}{Enter}{/Shift}mundo {Enter}")
    expect(onSubmit).toHaveBeenCalledWith("hola\nmundo")
    expect(box).toHaveValue("")
  })

  it("while streaming, stop replaces send and Escape stops", async () => {
    const user = userEvent.setup()
    const onStop = vi.fn()
    render(<Composer state="streaming" onStop={onStop} />)
    await user.click(screen.getByRole("textbox"))
    await user.keyboard("{Escape}")
    await user.click(screen.getByRole("button", { name: "Detener" }))
    expect(onStop).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole("button", { name: "Enviar" })).not.toBeInTheDocument()
  })
})

const ITEMS: ConversationListItem[] = [
  { id: "a", title: "Plan de viaje", group: "Hoy" },
  { id: "b", title: "Receta", group: "Hoy", tag: "temporal", tagDescription: "No se guarda" },
  { id: "c", title: "Notas", group: "Ayer" },
]

describe("ConversationList", () => {
  it("groups under headings and marks the current one", () => {
    render(<ConversationList items={ITEMS} activeId="b" onSelect={() => {}} onRename={() => {}} onDelete={() => {}} />)
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Hoy", "Ayer"])
    expect(screen.getByRole("button", { name: /^Receta/ })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("button", { name: /^Receta temporal\s*: No se guarda$/ })).toBeInTheDocument()
  })

  it("renames in place from the row menu and puts focus back on the row", async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    render(<ConversationList items={ITEMS} activeId="a" onSelect={() => {}} onRename={onRename} onDelete={() => {}} />)
    await user.click(screen.getByRole("button", { name: "Opciones de «Notas»" }))
    await user.click(await screen.findByRole("menuitem", { name: "Renombrar" }))
    const input = screen.getByRole("textbox", { name: "Nuevo nombre" })
    expect(input).toHaveFocus()
    await user.clear(input)
    await user.keyboard("Ideas{Enter}")
    expect(onRename).toHaveBeenCalledWith("c", "Ideas")
    await act(() => new Promise((r) => requestAnimationFrame(() => r(null))))
    expect(screen.getByRole("button", { name: "Notas" })).toHaveFocus()
  })

  it("asks to delete and says when it is empty", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const { rerender } = render(<ConversationList items={ITEMS} activeId={null} onSelect={() => {}} onRename={() => {}} onDelete={onDelete} />)
    await user.click(screen.getByRole("button", { name: "Opciones de «Plan de viaje»" }))
    await user.click(await screen.findByRole("menuitem", { name: "Borrar" }))
    expect(onDelete).toHaveBeenCalledWith("a")
    rerender(<ConversationList items={[]} activeId={null} onSelect={() => {}} onRename={() => {}} onDelete={onDelete} />)
    expect(screen.getByText("Todavía no hay conversaciones.")).toBeInTheDocument()
  })
})

function Drawer() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)
  return (
    <>
      <button ref={ref} type="button" onClick={() => setOpen(true)}>
        Menú
      </button>
      <SideDrawer open={open} onOpenChange={setOpen} label="Conversaciones">
        <button type="button">Primera</button>
        <button type="button">Segunda</button>
      </SideDrawer>
    </>
  )
}

describe("SideDrawer", () => {
  it("is a modal dialog that traps focus, closes on Escape and returns focus", async () => {
    const user = userEvent.setup()
    render(<Drawer />)
    await user.click(screen.getByRole("button", { name: "Menú" }))
    expect(screen.getByRole("dialog", { name: "Conversaciones" })).toHaveAttribute("aria-modal", "true")
    expect(screen.getByRole("button", { name: "Primera" })).toHaveFocus()
    await user.tab()
    await user.tab()
    expect(screen.getByRole("button", { name: "Primera" })).toHaveFocus()
    expect(document.body.style.overflow).toBe("hidden")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Menú" })).toHaveFocus()
  })
})

describe("KeyboardShortcutsDialog", () => {
  it("lists shortcuts with <kbd> keys and a translatable close button", () => {
    render(
      <KeyboardShortcutsDialog
        open
        onOpenChange={() => {}}
        shortcuts={[{ label: "Nueva conversación", keys: [["Ctrl", "Mayús", "O"], ["Alt", "N"]] }]}
        labels={{ close: "Tancar", or: "o" }}
      />
    )
    const dialog = screen.getByRole("dialog", { name: "Atajos de teclado" })
    expect(within(dialog).getByText("Nueva conversación").tagName).toBe("DT")
    expect(dialog.querySelectorAll("kbd")).toHaveLength(5)
    expect(within(dialog).getByRole("button", { name: "Tancar" })).toBeInTheDocument()
  })
})

describe("PairingQr", () => {
  afterEach(() => vi.useRealTimers())

  it("shows the code, counts down as a timer and offers a new code when it expires", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] })
    vi.setSystemTime(new Date("2026-11-13T10:00:00Z"))
    const onRegenerate = vi.fn()
    render(<PairingQr value="https://example.com/pair#abc" code="ABC-123" expiresAt={Date.now() + 2000} onRegenerate={onRegenerate} />)
    expect(screen.getByText("ABC-123")).toBeInTheDocument()
    expect(screen.getByRole("timer")).toHaveTextContent("Caduca en 0:02")
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByRole("status")).toHaveTextContent("El código ha caducado.")
    fireEvent.click(screen.getByRole("button", { name: "Generar otro código" }))
    expect(onRegenerate).toHaveBeenCalled()
    vi.useRealTimers()
    expect(await screen.findByRole("img", { name: "Código QR para vincular el dispositivo" })).toBeInTheDocument()
  })
})
