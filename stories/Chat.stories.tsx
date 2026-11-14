import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import { Cloud, Cpu, EyeOff } from "lucide-react"
import { ChatComposer, ChatComposerControl, chatComposerControlClassName } from "@stellify/chat-composer"
import { ChatSidebar } from "@stellify/chat-sidebar"
import { ConversationList, type ConversationListItem } from "@stellify/conversation-list"
import { KeyboardShortcutsDialog } from "@stellify/keyboard-shortcuts-dialog"
import { MarkdownMessage } from "@stellify/markdown-message"
import { MessageActions } from "@stellify/message-actions"
import { MessageBubble } from "@stellify/message-bubble"
import { MicButton, StopSpeakingButton, type MicButtonState } from "@stellify/mic-button"
import { ModelPicker, type ModelOption } from "@stellify/model-picker"
import { PairingQr } from "@stellify/pairing-qr"
import { SegmentedControl } from "@stellify/segmented-control"
import { SideDrawer } from "@stellify/side-drawer"
import { ToolActivity } from "@stellify/tool-activity"
import { TurnStatus } from "@stellify/turn-status"
import { Button } from "@stellify/button"

/**
 * The pieces of a chat screen. Every string comes in through props or
 * `labels` (Spanish defaults); none of them knows about a product.
 */
const meta = {
  title: "Blocks/Chat/Overview",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

const ANSWER = `Para listar las ramas ya integradas:

\`\`\`bash
git branch --merged main
\`\`\`

- Las que salen aquí se pueden **borrar** sin perder trabajo.
- Las demás tienen commits propios.

| Rama | Estado |
|---|---|
| feat/chat | integrada |
| fix/contraste | pendiente |`

export const Conversation: Story = {
  render: function Render() {
    const [shown, setShown] = useState(0)
    const streaming = shown < ANSWER.length
    useEffect(() => {
      if (!streaming) return
      const id = setTimeout(() => setShown((n) => Math.min(ANSWER.length, n + 24)), 120)
      return () => clearTimeout(id)
    }, [shown, streaming])
    return (
      <div className="flex max-w-2xl flex-col gap-6">
        <MessageBubble role="user" heading="Tú">
          ¿Cómo veo qué ramas ya están integradas?
        </MessageBubble>
        <MessageBubble
          role="assistant"
          heading="Respuesta"
          meta={<span>Sonnet</span>}
          hideFromAssistiveTech={streaming}
          footer={
            <>
              <ToolActivity
                label="Herramientas usadas"
                items={[
                  { id: "1", label: "Repositorio consultado", status: "done", detail: "git branch --merged main", duration: "0,4 s" },
                  { id: "2", label: "Leyendo la documentación…", status: streaming ? "running" : "done" },
                ]}
              />
              {streaming ? <TurnStatus status="responding" label="Escribiendo…" /> : <MessageActions text={ANSWER} onRegenerate={() => setShown(0)} onFork={() => {}} onDelete={() => {}} />}
            </>
          }
        >
          <MarkdownMessage content={ANSWER.slice(0, shown)} streaming={streaming} />
        </MessageBubble>
        <TurnStatus status="error" label="Sin conexión con el servidor. Reintenta en unos segundos." />
      </div>
    )
  },
}

const PICKER_MODELS: ModelOption[] = [
  { key: "sonnet", label: "Sonnet", group: "api", available: true, context: 200_000, tools: true, speedTps: 64 },
  { key: "qwen", label: "Qwen3 8B", group: "gpu", private: true, available: true, context: 16_384, tools: true, speedTps: 41 },
]

export const Composer: Story = {
  render: function Render() {
    const [value, setValue] = useState("")
    const [state, setState] = useState<"idle" | "streaming" | "blocked">("idle")
    const [mic, setMic] = useState<MicButtonState>("idle")
    const [model, setModel] = useState("sonnet")
    const [favorites, setFavorites] = useState<string[]>([])
    const [language, setLanguage] = useState("es")
    const [ephemeral, setEphemeral] = useState(false)
    const isPrivate = model === "qwen"
    return (
      <div className="max-w-2xl">
        <ChatComposer
          value={value}
          onValueChange={setValue}
          onSubmit={() => {
            setValue("")
            setState("streaming")
            setTimeout(() => setState("idle"), 2500)
          }}
          onStop={() => setState("idle")}
          state={state}
          tone={isPrivate ? "private" : "default"}
          labels={{ hint: "Intro envía · Mayús+Intro, nueva línea" }}
          leading={
            <>
              <ModelPicker
                groups={[
                  { id: "api", label: "API en la nube", icon: Cloud },
                  { id: "gpu", label: "Servidor con GPU", icon: Cpu },
                ]}
                models={PICKER_MODELS}
                value={model}
                onValueChange={setModel}
                favorites={favorites}
                onToggleFavorite={(k) => setFavorites((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]))}
                className={chatComposerControlClassName}
              />
              <ChatComposerControl aria-pressed={ephemeral} onClick={() => setEphemeral((v) => !v)}>
                <EyeOff aria-hidden />
                No guardar
              </ChatComposerControl>
            </>
          }
          controls={
            <>
              <MicButton
                state={mic}
                elapsedMs={4000}
                keyShortcuts="Alt+M"
                onToggle={() => setMic((s) => (s === "idle" ? "recording" : s === "recording" ? "transcribing" : "idle"))}
              />
            </>
          }
          notice={isPrivate ? <span>Modelo privado: nada sale de tu red.</span> : null}
        />
        <div className="mt-6 flex gap-2">
          <SegmentedControl
              aria-label="Idioma de la respuesta"
              size="sm"
              value={language}
              onValueChange={setLanguage}
              options={[
                { value: "es", label: "es", accessibleLabel: "Español" },
                { value: "ca", label: "ca", accessibleLabel: "Catalán" },
                { value: "en", label: "en", accessibleLabel: "Inglés" },
              ]}
          />
          <StopSpeakingButton label="Dejar de leer" onStop={() => {}} />
        </div>
      </div>
    )
  },
}

const HISTORY: ConversationListItem[] = [
  { id: "1", title: "Ramas integradas", group: "Hoy", time: "12 min" },
  { id: "2", title: "Receta de pan sin amasar", group: "Hoy", tag: "temporal", tagDescription: "No se guarda en el historial", time: "3 h" },
  { id: "3", title: "Presupuesto de la reforma", group: "Ayer", time: "1 d" },
  { id: "4", title: "Resumen de la reunión del lunes con un título bastante largo", group: "Esta semana", time: "4 d" },
]

export const History: Story = {
  render: function Render() {
    const [items, setItems] = useState(HISTORY)
    const [active, setActive] = useState<string | null>("1")
    const [drawer, setDrawer] = useState(false)
    const [query, setQuery] = useState("")
    const list = (
      <ConversationList
        query={query}
        items={items}
        activeId={active}
        onSelect={setActive}
        onRename={(id, title) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, title } : x)))}
        onDelete={(id) => setItems((xs) => xs.filter((x) => x.id !== id))}
      />
    )
    return (
      <div className="flex flex-col gap-4">
        <div className="h-[28rem] w-72 overflow-hidden rounded-lg border">
          <ChatSidebar
            brand={<span className="font-semibold">Mi chat</span>}
            onNewChat={() => setActive(null)}
            newChatHint="Ctrl ⇧ O"
            search={query}
            onSearchChange={setQuery}
            onCollapse={() => {}}
          >
            {list}
          </ChatSidebar>
        </div>
        <Button variant="secondary" className="self-start" onClick={() => setDrawer(true)}>
          Abrir como cajón
        </Button>
        <SideDrawer open={drawer} onOpenChange={setDrawer} label="Conversaciones">
          <ChatSidebar onNewChat={() => setDrawer(false)} search={query} onSearchChange={setQuery} onClose={() => setDrawer(false)} closeLabel="Cerrar el menú">
            {list}
          </ChatSidebar>
        </SideDrawer>
      </div>
    )
  },
}

export const ShortcutsAndPairing: Story = {
  name: "Shortcuts dialog & pairing QR",
  render: function Render() {
    const [open, setOpen] = useState(false)
    const [expiresAt, setExpiresAt] = useState(() => Date.now() + 15_000)
    return (
      <div className="flex flex-wrap items-start gap-10">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Atajos de teclado
        </Button>
        <KeyboardShortcutsDialog
          open={open}
          onOpenChange={setOpen}
          shortcuts={[
            { label: "Nueva conversación", keys: [["Ctrl", "Mayús", "O"]] },
            { label: "Hablar", keys: [["Alt", "M"]] },
            { label: "Elegir modelo 1…9", keys: [["Alt", "1…9"]] },
            { label: "Esta ayuda", keys: [["?"], ["Ctrl", "/"]] },
          ]}
        />
        <PairingQr
          value="https://example.com/pair#k3J9-x2"
          code="K3J9-X2"
          expiresAt={expiresAt}
          labels={{ copyLink: "Copiar enlace", linkCopied: "Enlace copiado" }}
          onRegenerate={() => setExpiresAt(Date.now() + 15_000)}
        />
      </div>
    )
  },
}
