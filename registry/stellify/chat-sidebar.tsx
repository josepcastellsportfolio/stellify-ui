"use client"

import { useId, type ReactNode, type Ref } from "react"
import { PanelLeftClose, Search, SquarePen, X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ChatSidebarLabels {
  /** Accessible name of the sidebar landmark ("Conversaciones"). */
  region: string
  /** "Nueva conversación": the new-chat button's visible text and name. */
  newChat: string
  /** Accessible name of the search box ("Buscar conversaciones"). */
  search: string
  searchPlaceholder: string
  /** Clears the search box ("Borrar búsqueda"). */
  clearSearch: string
  /** Name of the collapse button ("Ocultar la barra lateral"). */
  collapse: string
}

const DEFAULT_LABELS: ChatSidebarLabels = {
  region: "Conversaciones",
  newChat: "Nueva conversación",
  search: "Buscar conversaciones",
  searchPlaceholder: "Buscar",
  clearSearch: "Borrar búsqueda",
  collapse: "Ocultar la barra lateral",
}

export interface ChatSidebarProps {
  /** Logo or product name at the top left. */
  brand?: ReactNode
  onNewChat: () => void
  /** `aria-keyshortcuts` of the new-chat button ("Control+Shift+O"), also shown as a hint. */
  newChatShortcut?: string
  /** Shown at the end of the new-chat button ("Ctrl ⇧ O"). */
  newChatHint?: ReactNode
  search: string
  onSearchChange: (value: string) => void
  /** `aria-keyshortcuts` of the search box ("Control+K"). */
  searchShortcut?: string
  searchRef?: Ref<HTMLInputElement>
  /** Shown on wide screens: hides the sidebar. Leave out in a drawer (it has its own close). */
  onCollapse?: () => void
  /** Shown in a drawer instead of collapse: closes it. */
  onClose?: () => void
  /** Name of the close button when `onClose` is set ("Cerrar el menú"). */
  closeLabel?: string
  /** Defaults in Spanish. */
  labels?: Partial<ChatSidebarLabels>
  /** The list: a `conversation-list` fed with `search` as its `query`. */
  children: ReactNode
  /** Bottom: settings, help, account. */
  footer?: ReactNode
  className?: string
}

const ICON_BUTTON =
  "relative inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus) [&_svg]:size-4 [@media(pointer:coarse)]:size-11"

/**
 * A chat app's left column, in the shape of a desktop agent client: brand and
 * a collapse button on top, a "new conversation" row, a search box that
 * filters the list as you type (Escape clears it), the list, and a footer.
 * It is a `<nav>` landmark named by `labels.region`. Works the same inside a
 * `side-drawer` on small screens (pass `onClose` instead of `onCollapse`).
 */
export function ChatSidebar({
  brand,
  onNewChat,
  newChatShortcut,
  newChatHint,
  search,
  onSearchChange,
  searchShortcut,
  searchRef,
  onCollapse,
  onClose,
  closeLabel = "Cerrar",
  labels,
  children,
  footer,
  className,
}: ChatSidebarProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const searchId = useId()
  return (
    <nav
      data-slot="chat-sidebar"
      aria-label={l.region}
      className={cn("flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground", className)}
    >
      <div className="flex h-12 shrink-0 items-center gap-2 pl-3 pr-2">
        <div className="flex min-w-0 flex-1 items-center">{brand}</div>
        {onCollapse ? (
          <button type="button" onClick={onCollapse} className={ICON_BUTTON} title={l.collapse} aria-keyshortcuts="Control+B">
            <PanelLeftClose aria-hidden />
            <span className="sr-only">{l.collapse}</span>
          </button>
        ) : null}
        {onClose ? (
          <button type="button" onClick={onClose} className={ICON_BUTTON}>
            <X aria-hidden />
            <span className="sr-only">{closeLabel}</span>
          </button>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col gap-1 px-2 pb-2">
        <button
          type="button"
          onClick={onNewChat}
          aria-keyshortcuts={newChatShortcut}
          className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-sidebar-foreground transition-colors duration-(--duration-fast) hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus) [@media(pointer:coarse)]:min-h-11"
        >
          <SquarePen className="size-4 shrink-0" aria-hidden />
          <span className="flex-1 text-left">{l.newChat}</span>
          {newChatHint ? (
            <span aria-hidden className="text-xs font-normal text-muted-foreground [@media(pointer:coarse)]:hidden">
              {newChatHint}
            </span>
          ) : null}
        </button>
        <div
          role="search"
          className="flex h-9 items-center gap-2 rounded-md bg-sidebar-accent/60 px-2.5 text-sm has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-(--focus) [@media(pointer:coarse)]:min-h-11"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <label htmlFor={searchId} className="sr-only">
            {l.search}
          </label>
          <input
            ref={searchRef}
            id={searchId}
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && search) {
                e.preventDefault()
                e.stopPropagation()
                onSearchChange("")
              }
            }}
            aria-keyshortcuts={searchShortcut}
            placeholder={l.searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent text-base text-sidebar-foreground placeholder:text-muted-foreground focus-visible:outline-none sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="-mr-1 inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-sidebar-foreground [@media(pointer:coarse)]:size-9"
            >
              <X className="size-3.5" aria-hidden />
              <span className="sr-only">{l.clearSearch}</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3 [scrollbar-gutter:stable]">{children}</div>

      {footer ? <div className="shrink-0 border-t border-sidebar-border p-2">{footer}</div> : null}
    </nav>
  )
}
