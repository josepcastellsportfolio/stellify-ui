import { useEffect, useRef, type FC } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import InteluiTabs from "@/components/intelui/intelui-tabs"
import type {
  InteluiAction,
  InteluiChatMessage,
  InteluiTab,
} from "@/components/intelui/intelui-types"

export interface InteluiChatPanelLabels {
  thinking: string
  you: string
  assistant: string
  emptyHint: string
  tabs: string
  closeTab: string
  newConversation: string
}

export interface InteluiChatPanelProps {
  expanded: boolean
  reducedMotion: boolean
  /** Context title — what the assistant can act on here (e.g. "Planner"). */
  contextTitle: string
  messages: InteluiChatMessage[]
  /** Suggested actions rendered as clickable chips; clicking sends one. */
  suggestions: InteluiAction[]
  onPickSuggestion: (id: string) => void
  // Tabs
  tabs: InteluiTab[]
  activeId: string | null
  onSelectTab: (id: string) => void
  onCloseTab: (id: string) => void
  onNewTab: () => void
  labels: InteluiChatPanelLabels
}

/**
 * Transcript panel that expands UPWARD from the floating bar. Header shows the
 * module context; below it a tab strip, suggestion chips, and the message log.
 * Uses a max-height transition (height:auto can't animate). Engine-agnostic:
 * all data + copy come from props.
 */
const InteluiChatPanel: FC<InteluiChatPanelProps> = ({
  expanded,
  reducedMotion,
  contextTitle,
  messages,
  suggestions,
  onPickSuggestion,
  tabs,
  activeId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  labels,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (expanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, expanded])

  return (
    <div
      id="intelui-chat-panel"
      aria-hidden={!expanded}
      className={cn(
        "absolute bottom-full left-0 right-0 mb-2 flex flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md",
        "transition-[max-height,opacity] duration-200 ease-out",
        reducedMotion && "transition-none",
        expanded ? "max-h-[60vh] opacity-100" : "pointer-events-none max-h-0 opacity-0",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="text-sm font-semibold text-foreground">{contextTitle}</span>
      </div>

      <InteluiTabs
        tabs={tabs}
        activeId={activeId}
        tabsLabel={labels.tabs}
        closeLabel={labels.closeTab}
        newLabel={labels.newConversation}
        onSelect={onSelectTab}
        onClose={onCloseTab}
        onNew={onNewTab}
      />

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onPickSuggestion(s.id)}
              className={cn(
                "rounded-full border border-border px-2.5 py-1 text-xs text-foreground",
                "transition-colors hover:border-primary hover:bg-primary/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="max-h-[50vh] overflow-y-auto p-3"
      >
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {labels.emptyHint}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "flex flex-col",
                  m.role === "user" ? "items-end" : "items-start",
                )}
              >
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {m.role === "user" ? labels.you : labels.assistant}
                </span>
                <span
                  className={cn(
                    "max-w-[85%] rounded-md px-2.5 py-1.5 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.pending ? (
                    <span className="text-muted-foreground">{labels.thinking}</span>
                  ) : (
                    m.text
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default InteluiChatPanel
export { InteluiChatPanel }
