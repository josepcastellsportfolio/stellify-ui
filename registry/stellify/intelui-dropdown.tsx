import { type FC } from "react"
import { Clock, Plus, Sparkles, Zap } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import InteluiConversationList from "@/components/intelui/intelui-conversation-list"
import type {
  InteluiAction,
  InteluiConversation,
} from "@/components/intelui/intelui-types"

export interface InteluiDropdownLabels {
  modeLabel: string
  modeDescription: string
  actions: string
  conversations: string
  newConversation: string
  emptyHistory: string
  deleteConversation: string
}

export interface InteluiDropdownProps {
  active: boolean
  onToggle: (on: boolean) => void
  /** Module quick actions (already localized labels). */
  actions: InteluiAction[]
  onRunAction: (id: string) => void
  history: InteluiConversation[]
  onOpenConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onNewConversation: () => void
  labels: InteluiDropdownLabels
}

/**
 * Assistant popover content, in two labelled groups: Actions (Sparkles header,
 * Zap rows) and Conversations (Clock header, deletable history rows), plus the
 * intelUI switch. Engine-/i18n-agnostic — data + copy via props.
 */
const InteluiDropdown: FC<InteluiDropdownProps> = ({
  active,
  onToggle,
  actions,
  onRunAction,
  history,
  onOpenConversation,
  onDeleteConversation,
  onNewConversation,
  labels,
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col">
        <label htmlFor="intelui-mode-switch" className="text-sm font-medium text-foreground">
          {labels.modeLabel}
        </label>
        <span className="text-xs text-muted-foreground">{labels.modeDescription}</span>
      </div>
      <Switch
        id="intelui-mode-switch"
        checked={active}
        onCheckedChange={onToggle}
        aria-label={labels.modeLabel}
      />
    </div>

    {actions.length > 0 && (
      <div className="border-t border-border pt-2">
        <p className="flex items-center gap-1.5 px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {labels.actions}
        </p>
        <ul className="flex flex-col gap-0.5">
          {actions.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onRunAction(a.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                  "text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <Zap className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="truncate">{a.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )}

    <div className="border-t border-border pt-2">
      <div className="flex items-center justify-between gap-2 px-1 pb-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {labels.conversations}
        </p>
        <button
          type="button"
          onClick={onNewConversation}
          aria-label={labels.newConversation}
          title={labels.newConversation}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            "text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <InteluiConversationList
        conversations={history}
        emptyLabel={labels.emptyHistory}
        deleteLabel={labels.deleteConversation}
        onSelect={onOpenConversation}
        onDelete={onDeleteConversation}
      />
    </div>
  </div>
)

export default InteluiDropdown
export { InteluiDropdown }
