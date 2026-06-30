import {
  useEffect,
  useRef,
  useState,
  type FC,
  type FormEvent,
  type KeyboardEvent,
} from "react"
import { createPortal } from "react-dom"
import { ChevronUp, Loader2, Send, Sparkles, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import InteluiChatPanel, {
  type InteluiChatPanelLabels,
} from "@/components/intelui/intelui-chat-panel"
import type {
  InteluiAction,
  InteluiChatMessage,
  InteluiTab,
} from "@/components/intelui/intelui-types"

export interface InteluiFloatingBarLabels extends InteluiChatPanelLabels {
  region: string
  disable: string
  inputPlaceholder: string
  inputLabel: string
  send: string
  stop: string
  expandChat: string
  collapseChat: string
  suggestionsTitle: string
}

export interface InteluiFloatingBarProps {
  /** Portal target — typically the app layout root (escapes sidebar overflow). */
  portalTarget: HTMLElement | null
  /** Whether the bar is shown (intelUI mode on). */
  active: boolean
  reducedMotion: boolean
  contextTitle: string
  messages: InteluiChatMessage[]
  sending: boolean
  chatExpanded: boolean
  onChatExpandedChange: (expanded: boolean) => void
  /** Suggested actions; clicking sends one (collapsed dropdown + in-chat chips). */
  suggestions: InteluiAction[]
  onPickSuggestion: (id: string) => void
  onSend: (text: string) => void
  onCancel: () => void
  onDisable: () => void
  /** Called once when the bar activates (e.g. reopen last conversation). */
  onActivate?: () => void
  // Tabs (forwarded to the chat panel)
  tabs: InteluiTab[]
  activeId: string | null
  onSelectTab: (id: string) => void
  onCloseTab: (id: string) => void
  onNewTab: () => void
  labels: InteluiFloatingBarLabels
}

/**
 * Floating assistant input bar. Portaled to `portalTarget` so it escapes a
 * clipped sidebar; anchored to the sidebar edge via the `--intelui-sidebar-w`
 * CSS var (set by the host on the portal root) and grows from the icon.
 * Engine-agnostic — all state, handlers and copy come from props.
 */
const InteluiFloatingBar: FC<InteluiFloatingBarProps> = ({
  portalTarget,
  active,
  reducedMotion,
  contextTitle,
  messages,
  sending,
  chatExpanded,
  onChatExpandedChange,
  suggestions,
  onPickSuggestion,
  onSend,
  onCancel,
  onDisable,
  onActivate,
  tabs,
  activeId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  labels,
}) => {
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)
  const [entered, setEntered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!active) {
      setEntered(false)
      onChatExpandedChange(false)
      setFocused(false)
      return
    }
    onActivate?.()
    const id = requestAnimationFrame(() => {
      setEntered(true)
      inputRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  if (!portalTarget || !active) return null

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setValue("")
    onSend(trimmed)
    if (!chatExpanded) onChatExpandedChange(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit(value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && chatExpanded) {
      e.preventDefault()
      onChatExpandedChange(false)
    }
  }

  const showFocusSuggestions =
    focused && !chatExpanded && value.trim() === "" && suggestions.length > 0

  return createPortal(
    <div
      role="region"
      aria-label={labels.region}
      className="fixed bottom-2 z-40"
      style={{
        left: "calc(var(--intelui-sidebar-w, 3.5rem) + 0.5rem)",
        transition: reducedMotion ? "none" : "left 200ms ease-out",
      }}
    >
      <div className="relative">
        <InteluiChatPanel
          expanded={chatExpanded}
          reducedMotion={reducedMotion}
          contextTitle={contextTitle}
          messages={messages}
          suggestions={suggestions}
          onPickSuggestion={onPickSuggestion}
          tabs={tabs}
          activeId={activeId}
          onSelectTab={onSelectTab}
          onCloseTab={onCloseTab}
          onNewTab={onNewTab}
          labels={labels}
        />

        {showFocusSuggestions && (
          <div
            className="absolute bottom-full left-0 mb-2 w-64 rounded-lg border border-border bg-popover p-2 shadow-md"
            role="listbox"
            aria-label={labels.suggestionsTitle}
          >
            <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {labels.suggestionsTitle}
            </p>
            <ul className="flex flex-col gap-0.5">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      submit(s.label)
                    }}
                    className={cn(
                      "w-full rounded-md px-2 py-1.5 text-left text-sm text-foreground",
                      "transition-colors hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex h-10 origin-left items-center gap-1.5 overflow-hidden rounded-md border border-border bg-popover px-2 shadow-md"
          style={{
            width: entered
              ? "min(28rem, calc(100vw - var(--intelui-sidebar-w, 3.5rem) - 2.5rem))"
              : "2.5rem",
            opacity: entered ? 1 : 0,
            transition: reducedMotion
              ? "none"
              : "width 200ms ease-out, opacity 200ms ease-out",
          }}
        >
          <button
            type="button"
            onClick={onDisable}
            aria-label={labels.disable}
            title={labels.disable}
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-primary",
              "transition-colors hover:bg-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={labels.inputPlaceholder}
            aria-label={labels.inputLabel}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {sending ? (
            <button
              type="button"
              onClick={onCancel}
              aria-label={labels.stop}
              className={cn(
                "group/stop flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary",
                "transition-colors hover:bg-accent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <Loader2
                className={cn("h-4 w-4 group-hover/stop:hidden", !reducedMotion && "animate-spin")}
                aria-hidden
              />
              <Square
                className="hidden h-3.5 w-3.5 fill-current group-hover/stop:block"
                aria-hidden
              />
            </button>
          ) : (
            <button
              type="submit"
              disabled={value.trim() === ""}
              aria-label={labels.send}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary",
                "transition-colors hover:bg-accent disabled:opacity-40",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <Send className="h-4 w-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            onClick={() => onChatExpandedChange(!chatExpanded)}
            aria-expanded={chatExpanded}
            aria-controls="intelui-chat-panel"
            aria-label={chatExpanded ? labels.collapseChat : labels.expandChat}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground",
              "transition-[background-color,transform] hover:bg-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              chatExpanded && "rotate-180",
              reducedMotion && "transition-none",
            )}
          >
            <ChevronUp className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </div>
    </div>,
    portalTarget,
  )
}

export default InteluiFloatingBar
export { InteluiFloatingBar }
