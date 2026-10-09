import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Actionable } from "@stellify/actionable"
import { InteluiChatPanel } from "@stellify/intelui-chat-panel"
import { InteluiChip } from "@stellify/intelui-chip"
import { InteluiConversationList } from "@stellify/intelui-conversation-list"
import { InteluiDropdown } from "@stellify/intelui-dropdown"
import { InteluiFloatingBar, type InteluiFloatingBarLabels } from "@stellify/intelui-floating-bar"
import { InteluiPill } from "@stellify/intelui-pill"
import { InteluiTabs } from "@stellify/intelui-tabs"
import type { InteluiChatMessage, InteluiConversation, InteluiTab } from "@stellify/intelui-types"

/**
 * intelUI assistant pieces. Engine-agnostic: the host owns state and copy.
 * The `--intelui-accent` token and the halo come from `@stellify/intelui-highlight`;
 * this story sets the token inline so it renders without installing that layer.
 */
const meta = {
  title: "intelUI/Assistant",
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ ["--intelui-accent" as string]: "oklch(0.525 0.095 126)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const LABELS: InteluiFloatingBarLabels = {
  thinking: "Pensando…",
  you: "Tú",
  assistant: "intelUI",
  emptyHint: "Pídeme que mueva, cree o resuma algo de esta vista.",
  tabs: "Conversaciones abiertas",
  closeTab: "Cerrar pestaña",
  newConversation: "Nueva conversación",
  region: "Asistente intelUI",
  disable: "Desactivar intelUI",
  inputPlaceholder: "Pide algo…",
  inputLabel: "Mensaje para el asistente",
  send: "Enviar",
  stop: "Detener",
  expandChat: "Abrir conversación",
  collapseChat: "Cerrar conversación",
  suggestionsTitle: "Sugerencias",
}

const SUGGESTIONS = [
  { id: "week", label: "Resume mi semana" },
  { id: "move", label: "Mueve la reunión del lunes" },
]

const MESSAGES: InteluiChatMessage[] = [
  { id: "1", role: "user", text: "¿Qué tengo el lunes?" },
  { id: "2", role: "assistant", text: "Una reunión a las 10:00 y el gimnasio a las 19:00." },
  { id: "3", role: "assistant", text: "", pending: true },
]

const HISTORY: InteluiConversation[] = [
  { id: "c1", title: "Gastos de marzo" },
  { id: "c2", title: "Planificar la semana del 14" },
]

export const Pill: Story = {
  name: "InteluiPill",
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex w-56 flex-col gap-2">
        <InteluiPill label="intelUI" openLabel="Abrir intelUI" expanded active={false} open={open} onClick={() => setOpen(!open)} />
        <InteluiPill label="intelUI" openLabel="Abrir intelUI" expanded active open={false} onClick={() => {}} />
        <InteluiPill label="intelUI" openLabel="Abrir intelUI" expanded active={false} open={false} disabled disabledHint="Disponible solo en Planner" onClick={() => {}} />
      </div>
    )
  },
}

export const Dropdown: Story = {
  name: "InteluiDropdown + ConversationList",
  render: () => {
    const [active, setActive] = useState(true)
    const [history, setHistory] = useState(HISTORY)
    return (
      <div className="w-72 rounded-lg border bg-popover p-3 shadow-md">
        <InteluiDropdown
          active={active}
          onToggle={setActive}
          actions={[{ id: "plan", label: "Planificar la semana" }]}
          onRunAction={() => {}}
          history={history}
          onOpenConversation={() => {}}
          onDeleteConversation={(id) => setHistory(history.filter((c) => c.id !== id))}
          onNewConversation={() => {}}
          labels={{
            modeLabel: "Modo intelUI",
            modeDescription: "Resalta lo que el asistente puede hacer",
            actions: "Acciones",
            conversations: "Conversaciones",
            newConversation: "Nueva conversación",
            emptyHistory: "Aún no hay conversaciones",
            deleteConversation: "Borrar conversación",
          }}
        />
      </div>
    )
  },
}

export const ConversationListEmpty: Story = {
  name: "InteluiConversationList · empty",
  render: () => (
    <div className="w-64">
      <InteluiConversationList conversations={[]} emptyLabel="Aún no hay conversaciones" deleteLabel="Borrar" />
    </div>
  ),
}

export const Tabs: Story = {
  name: "InteluiTabs",
  render: () => {
    const [tabs, setTabs] = useState<InteluiTab[]>([
      { id: "a", title: "Semana del 14" },
      { id: "b", title: "Gastos de marzo con un título largo" },
    ])
    const [activeId, setActiveId] = useState<string | null>("a")
    return (
      <div className="w-96 rounded-lg border">
        <InteluiTabs
          tabs={tabs}
          activeId={activeId}
          tabsLabel={LABELS.tabs}
          closeLabel={LABELS.closeTab}
          newLabel={LABELS.newConversation}
          onSelect={setActiveId}
          onClose={(id) => setTabs(tabs.filter((t) => t.id !== id))}
          onNew={() => {
            const id = String(Date.now())
            setTabs([...tabs, { id, title: "Nueva" }])
            setActiveId(id)
          }}
        />
      </div>
    )
  },
}

export const ChatPanel: Story = {
  name: "InteluiChatPanel",
  render: () => (
    <div className="relative mt-[60vh] w-[28rem]">
      <InteluiChatPanel
        expanded
        reducedMotion={false}
        contextTitle="Planner"
        messages={MESSAGES}
        suggestions={SUGGESTIONS}
        onPickSuggestion={() => {}}
        tabs={[{ id: "a", title: "Semana del 14" }]}
        activeId="a"
        onSelectTab={() => {}}
        onCloseTab={() => {}}
        onNewTab={() => {}}
        labels={LABELS}
      />
    </div>
  ),
}

export const FloatingBar: Story = {
  name: "InteluiFloatingBar (portaled, bottom-left)",
  render: () => {
    const [target, setTarget] = useState<HTMLElement | null>(null)
    const [active, setActive] = useState(true)
    const [expanded, setExpanded] = useState(false)
    const [messages, setMessages] = useState<InteluiChatMessage[]>([])
    return (
      <div ref={setTarget} className="min-h-[70vh]" style={{ ["--intelui-sidebar-w" as string]: "3.5rem" }}>
        {!active && (
          <button type="button" className="text-sm underline" onClick={() => setActive(true)}>
            Activar intelUI
          </button>
        )}
        <InteluiFloatingBar
          portalTarget={target}
          active={active}
          reducedMotion={false}
          contextTitle="Planner"
          messages={messages}
          sending={false}
          chatExpanded={expanded}
          onChatExpandedChange={setExpanded}
          suggestions={SUGGESTIONS}
          onPickSuggestion={() => {}}
          onSend={(text) =>
            setMessages((m) => [...m, { id: `${m.length}`, role: "user", text }, { id: `${m.length + 1}`, role: "assistant", text: "Hecho." }])
          }
          onCancel={() => {}}
          onDisable={() => setActive(false)}
          tabs={[]}
          activeId={null}
          onSelectTab={() => {}}
          onCloseTab={() => {}}
          onNewTab={() => {}}
          labels={LABELS}
        />
      </div>
    )
  },
}

export const ChipAndActionable: Story = {
  name: "InteluiChip + Actionable",
  render: () => {
    const [selected, setSelected] = useState<string | null>("Reunión con Ana")
    return (
      <div data-intelui="on" className="space-y-4">
        <div className="flex gap-2">
          {["Reunión con Ana", "Gimnasio"].map((title) => (
            <Actionable key={title} type="evento" hasActions selected={selected === title} className="rounded-md border p-3 text-sm">
              <button type="button" onClick={() => setSelected(title)}>
                {title}
              </button>
            </Actionable>
          ))}
          <Actionable type="nota" className="rounded-md border p-3 text-sm text-muted-foreground">
            Sin acciones (inerte)
          </Actionable>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-md border px-2">
          {selected && <InteluiChip label={selected} type="evento" removeLabel="Quitar selección" onRemove={() => setSelected(null)} />}
          <span className="text-sm text-muted-foreground">Pide algo…</span>
        </div>
      </div>
    )
  },
}
