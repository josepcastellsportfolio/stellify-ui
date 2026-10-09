import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Actionable } from "@stellify/actionable"
import { InteluiChatPanel, type InteluiChatPanelLabels } from "@stellify/intelui-chat-panel"
import { InteluiChip } from "@stellify/intelui-chip"
import { InteluiConversationList } from "@stellify/intelui-conversation-list"
import { InteluiDropdown } from "@stellify/intelui-dropdown"
import { InteluiFloatingBar, type InteluiFloatingBarLabels } from "@stellify/intelui-floating-bar"
import { InteluiPill } from "@stellify/intelui-pill"
import { InteluiTabs } from "@stellify/intelui-tabs"

const panelLabels: InteluiChatPanelLabels = {
  thinking: "Pensando…",
  you: "Tú",
  assistant: "Asistente",
  emptyHint: "Pregunta lo que quieras",
  tabs: "Conversaciones abiertas",
  closeTab: "Cerrar pestaña",
  newConversation: "Nueva conversación",
}

const barLabels: InteluiFloatingBarLabels = {
  ...panelLabels,
  region: "Asistente",
  disable: "Desactivar intelUI",
  inputPlaceholder: "Escribe…",
  inputLabel: "Mensaje al asistente",
  send: "Enviar",
  stop: "Detener",
  expandChat: "Abrir chat",
  collapseChat: "Cerrar chat",
  suggestionsTitle: "Sugerencias",
}

describe("intelui-pill", () => {
  it("opens the dropdown and reports its state", async () => {
    const onClick = vi.fn()
    const { rerender } = render(
      <InteluiPill label="intelUI" openLabel="Abrir asistente" expanded active={false} open={false} onClick={onClick} />
    )
    const pill = screen.getByRole("button", { name: "Abrir asistente" })
    expect(pill).toHaveAttribute("aria-haspopup", "dialog")
    expect(pill).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(pill)
    expect(onClick).toHaveBeenCalledTimes(1)
    rerender(<InteluiPill label="intelUI" openLabel="Abrir asistente" expanded active open onClick={onClick} />)
    expect(pill).toHaveAttribute("aria-expanded", "true")
    expect(pill).toHaveClass("bg-primary")
  })

  it("is disabled with its hint as the name", () => {
    render(
      <InteluiPill label="intelUI" openLabel="Abrir" expanded={false} active={false} open={false} disabled disabledHint="Solo en Planner" onClick={() => {}} />
    )
    const pill = screen.getByRole("button", { name: "Solo en Planner" })
    expect(pill).toBeDisabled()
    expect(pill).not.toHaveAttribute("aria-expanded")
  })
})

describe("intelui-conversation-list", () => {
  it("selects and deletes without selecting", async () => {
    const onSelect = vi.fn()
    const onDelete = vi.fn()
    render(
      <InteluiConversationList
        conversations={[{ id: "a", title: "Mover la reunión" }]}
        emptyLabel="Sin historial"
        deleteLabel="Borrar conversación"
        onSelect={onSelect}
        onDelete={onDelete}
      />
    )
    await userEvent.click(screen.getByRole("button", { name: "Mover la reunión" }))
    expect(onSelect).toHaveBeenCalledWith("a")
    await userEvent.click(screen.getByRole("button", { name: "Borrar conversación" }))
    expect(onDelete).toHaveBeenCalledWith("a")
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it("shows the empty label", () => {
    render(<InteluiConversationList conversations={[]} emptyLabel="Sin historial" deleteLabel="Borrar" />)
    expect(screen.getByText("Sin historial")).toBeInTheDocument()
  })
})

describe("intelui-tabs", () => {
  it("is a labelled tablist: select by click or keyboard, close, new", async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()
    const onNew = vi.fn()
    render(
      <InteluiTabs
        tabs={[
          { id: "a", title: "Uno" },
          { id: "b", title: "Dos" },
        ]}
        activeId="a"
        tabsLabel="Conversaciones abiertas"
        closeLabel="Cerrar pestaña"
        newLabel="Nueva conversación"
        onSelect={onSelect}
        onClose={onClose}
        onNew={onNew}
      />
    )
    const list = screen.getByRole("tablist", { name: "Conversaciones abiertas" })
    expect(within(list).getByRole("tab", { name: /Uno/ })).toHaveAttribute("aria-selected", "true")
    const dos = within(list).getByRole("tab", { name: /Dos/ })
    dos.focus()
    await userEvent.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalledWith("b")
    await userEvent.click(within(dos).getByRole("button", { name: "Cerrar pestaña" }))
    expect(onClose).toHaveBeenCalledWith("b")
    expect(onSelect).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole("button", { name: "Nueva conversación" }))
    expect(onNew).toHaveBeenCalledTimes(1)
  })
})

describe("intelui-chat-panel", () => {
  const base = {
    reducedMotion: false,
    contextTitle: "Planner",
    suggestions: [{ id: "s1", label: "Resume la semana" }],
    onPickSuggestion: vi.fn(),
    tabs: [],
    activeId: null,
    onSelectTab: () => {},
    onCloseTab: () => {},
    onNewTab: () => {},
    labels: panelLabels,
  }

  it("renders the log with roles and a pending placeholder, and sends suggestions", async () => {
    render(
      <InteluiChatPanel
        {...base}
        expanded
        messages={[
          { id: "1", role: "user", text: "Hola" },
          { id: "2", role: "assistant", text: "", pending: true },
        ]}
      />
    )
    const log = screen.getByRole("log")
    expect(log).toHaveTextContent("TúHola")
    expect(log).toHaveTextContent("AsistentePensando…")
    await userEvent.click(screen.getByRole("button", { name: "Resume la semana" }))
    expect(base.onPickSuggestion).toHaveBeenCalledWith("s1")
  })

  it("is hidden from assistive tech while collapsed", () => {
    const { container } = render(<InteluiChatPanel {...base} expanded={false} messages={[]} />)
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
    expect(screen.queryByRole("log")).not.toBeInTheDocument()
  })
})

describe("intelui-dropdown", () => {
  it("toggles the mode, runs actions and manages history", async () => {
    const props = {
      active: false,
      onToggle: vi.fn(),
      actions: [{ id: "plan", label: "Planificar la semana" }],
      onRunAction: vi.fn(),
      history: [{ id: "c1", title: "Gastos de marzo" }],
      onOpenConversation: vi.fn(),
      onDeleteConversation: vi.fn(),
      onNewConversation: vi.fn(),
      labels: {
        modeLabel: "Modo intelUI",
        modeDescription: "Resalta lo que el asistente puede hacer",
        actions: "Acciones",
        conversations: "Conversaciones",
        newConversation: "Nueva conversación",
        emptyHistory: "Sin historial",
        deleteConversation: "Borrar conversación",
      },
    }
    render(<InteluiDropdown {...props} />)
    await userEvent.click(screen.getByRole("switch", { name: "Modo intelUI" }))
    expect(props.onToggle).toHaveBeenCalledWith(true)
    await userEvent.click(screen.getByRole("button", { name: "Planificar la semana" }))
    expect(props.onRunAction).toHaveBeenCalledWith("plan")
    await userEvent.click(screen.getByRole("button", { name: "Gastos de marzo" }))
    expect(props.onOpenConversation).toHaveBeenCalledWith("c1")
    await userEvent.click(screen.getByRole("button", { name: "Borrar conversación" }))
    expect(props.onDeleteConversation).toHaveBeenCalledWith("c1")
    await userEvent.click(screen.getByRole("button", { name: "Nueva conversación" }))
    expect(props.onNewConversation).toHaveBeenCalledTimes(1)
  })
})

describe("intelui-floating-bar", () => {
  function setup(overrides: Partial<Parameters<typeof InteluiFloatingBar>[0]> = {}) {
    const props = {
      portalTarget: document.body,
      active: true,
      reducedMotion: true,
      contextTitle: "Planner",
      messages: [],
      sending: false,
      chatExpanded: false,
      onChatExpandedChange: vi.fn(),
      suggestions: [],
      onPickSuggestion: vi.fn(),
      onSend: vi.fn(),
      onCancel: vi.fn(),
      onDisable: vi.fn(),
      onActivate: vi.fn(),
      tabs: [],
      activeId: null,
      onSelectTab: () => {},
      onCloseTab: () => {},
      onNewTab: () => {},
      labels: barLabels,
      ...overrides,
    }
    const utils = render(<InteluiFloatingBar {...props} />)
    return { props, ...utils }
  }

  it("sends trimmed text and expands the chat", async () => {
    const { props } = setup()
    expect(props.onActivate).toHaveBeenCalledTimes(1)
    const region = screen.getByRole("region", { name: "Asistente" })
    const send = within(region).getByRole("button", { name: "Enviar" })
    expect(send).toBeDisabled()
    await userEvent.type(within(region).getByRole("textbox", { name: "Mensaje al asistente" }), "  mueve la cita  ")
    await userEvent.click(send)
    expect(props.onSend).toHaveBeenCalledWith("mueve la cita")
    expect(props.onChatExpandedChange).toHaveBeenCalledWith(true)
  })

  it("collapses with Escape and stops a reply in flight", async () => {
    const { props } = setup({ chatExpanded: true, sending: true })
    expect(screen.getByRole("button", { name: "Cerrar chat" })).toHaveAttribute("aria-expanded", "true")
    await userEvent.type(screen.getByRole("textbox", { name: "Mensaje al asistente" }), "{Escape}")
    expect(props.onChatExpandedChange).toHaveBeenCalledWith(false)
    await userEvent.click(screen.getByRole("button", { name: "Detener" }))
    expect(props.onCancel).toHaveBeenCalledTimes(1)
  })

  it("renders nothing when inactive", () => {
    const { props } = setup({ active: false })
    expect(screen.queryByRole("region", { name: "Asistente" })).not.toBeInTheDocument()
    expect(props.onChatExpandedChange).toHaveBeenCalledWith(false)
    expect(props.onActivate).not.toHaveBeenCalled()
  })
})

describe("intelui-chip", () => {
  it("shows the entity and removes it", async () => {
    const onRemove = vi.fn()
    const { container } = render(<InteluiChip label="Reunión con Ana" type="evento" removeLabel="Quitar selección" onRemove={onRemove} />)
    expect(screen.getByText("Reunión con Ana")).toBeInTheDocument()
    expect(container.firstElementChild).toHaveAttribute("data-intelui-type", "evento")
    await userEvent.click(screen.getByRole("button", { name: "Quitar selección" }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})

describe("actionable", () => {
  it("paints the highlight markers only when it has actions", () => {
    const { rerender } = render(
      <Actionable type="tarea" hasActions selected data-testid="a">
        Tarea
      </Actionable>
    )
    const el = screen.getByTestId("a")
    expect(el).toHaveAttribute("data-intelui-actionable", "true")
    expect(el).toHaveAttribute("data-intelui-type", "tarea")
    expect(el).toHaveAttribute("data-selected", "true")
    rerender(
      <Actionable type="tarea" data-testid="a">
        Tarea
      </Actionable>
    )
    expect(screen.getByTestId("a")).not.toHaveAttribute("data-intelui-actionable")
    expect(screen.getByTestId("a")).not.toHaveAttribute("data-selected")
  })

  it("merges the markers onto its child with asChild", () => {
    const { container } = render(
      <Actionable asChild type="gasto" hasActions>
        <button type="button">Gasto</button>
      </Actionable>
    )
    const button = screen.getByRole("button", { name: "Gasto" })
    expect(button).toHaveAttribute("data-intelui-actionable", "true")
    // No wrapping node: the button is the rendered root.
    expect(container.firstElementChild).toBe(button)
  })
})
