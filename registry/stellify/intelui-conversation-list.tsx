import { type FC, type MouseEvent } from "react"
import { MessageSquare, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InteluiConversation } from "@/components/intelui/intelui-types"

export interface InteluiConversationListProps {
  conversations: InteluiConversation[]
  /** Localized empty-state text. */
  emptyLabel: string
  /** Localized aria-label for the per-row delete button. */
  deleteLabel: string
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
}

/**
 * History list of conversations. Each row is selectable; hovering reveals a
 * delete cross. Engine- and i18n-agnostic (copy via props).
 */
const InteluiConversationList: FC<InteluiConversationListProps> = ({
  conversations,
  emptyLabel,
  deleteLabel,
  onSelect,
  onDelete,
}) => {
  if (conversations.length === 0) {
    return <p className="px-1 py-2 text-xs text-muted-foreground">{emptyLabel}</p>
  }

  const handleDelete = (e: MouseEvent, id: string) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {conversations.map((conv) => (
        <li key={conv.id} className="group/item relative">
          <button
            type="button"
            onClick={() => onSelect?.(conv.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md py-1.5 pl-2 pr-8 text-left text-sm",
              "text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">{conv.title}</span>
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => handleDelete(e, conv.id)}
              aria-label={deleteLabel}
              className={cn(
                "absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md",
                "text-muted-foreground opacity-0 transition-opacity",
                "hover:bg-destructive hover:text-destructive-foreground",
                "group-hover/item:opacity-100 focus-visible:opacity-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

export default InteluiConversationList
export { InteluiConversationList }
