import { type FC, type MouseEvent } from "react"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InteluiTab } from "@/components/intelui/intelui-types"

export interface InteluiTabsProps {
  tabs: InteluiTab[]
  activeId: string | null
  /** Localized aria-labels. */
  tabsLabel: string
  closeLabel: string
  newLabel: string
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onNew: () => void
}

/**
 * Horizontal, scrollable tab strip for open conversations. Each tab has a
 * close cross; a trailing button opens a new conversation. Closing a tab does
 * not delete the conversation (the host decides that). Engine-/i18n-agnostic.
 */
const InteluiTabs: FC<InteluiTabsProps> = ({
  tabs,
  activeId,
  tabsLabel,
  closeLabel,
  newLabel,
  onSelect,
  onClose,
  onNew,
}) => {
  const handleClose = (e: MouseEvent, id: string) => {
    e.stopPropagation()
    onClose(id)
  }

  return (
    <div className="flex items-center gap-1 border-b border-border px-2 py-1">
      <div
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
        role="tablist"
        aria-label={tabsLabel}
      >
        {tabs.map((tab) => {
          const active = tab.id === activeId
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={active}
              tabIndex={0}
              onClick={() => onSelect(tab.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onSelect(tab.id)
                }
              }}
              className={cn(
                "group/tab flex shrink-0 cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs",
                "max-w-[10rem] transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <span className="truncate">{tab.title}</span>
              <button
                type="button"
                onClick={(e) => handleClose(e, tab.id)}
                aria-label={closeLabel}
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded",
                  "text-muted-foreground hover:bg-destructive hover:text-destructive-foreground",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                )}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
      <button
        type="button"
        onClick={onNew}
        aria-label={newLabel}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
          "text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}

export default InteluiTabs
export { InteluiTabs }
