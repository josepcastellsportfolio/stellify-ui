"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { Ellipsis, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface ConversationListItem {
  id: string
  title: string
  /** Section the item belongs to ("Hoy", "Ayer"…). Consecutive items with the same group share a heading. */
  group?: string
  /** Short tag after the title ("temporal"). */
  tag?: string
  /** Longer explanation of the tag, as its tooltip and accessible description. */
  tagDescription?: string
  /** Short time since the last message, shown at the row's end ("3 h", "ayer"). */
  time?: string
  /** Full date of `time`, as its tooltip and accessible text. */
  timeTitle?: string
}

export interface ConversationListLabels {
  /** Accessible name of the list. */
  list: string
  /** Shown when there are no items. */
  empty: string
  /** Name of the per-row menu button, given the title. */
  actions: (title: string) => string
  rename: string
  delete: string
  /** Accessible name of the rename box. */
  renameInput: string
  /** Shown when `query` matches nothing. */
  noResults: string
}

const DEFAULT_LABELS: ConversationListLabels = {
  list: "Conversaciones",
  empty: "Todavía no hay conversaciones.",
  actions: (title) => `Opciones de «${title}»`,
  rename: "Renombrar",
  delete: "Borrar",
  renameInput: "Nuevo nombre",
  noResults: "Ninguna conversación coincide.",
}

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()

export interface ConversationListProps {
  items: ConversationListItem[]
  activeId: string | null
  onSelect: (id: string) => void
  onRename: (id: string, title: string) => void
  /** Ask to delete (open your confirmation dialog; pass the row's menu button as its focus return). */
  onDelete: (id: string) => void
  /** Defaults in Spanish. */
  labels?: Partial<ConversationListLabels>
  /** Filters by title, ignoring case and accents (a search box above the list). */
  query?: string
  /** Level of the group headings ("Hoy", "Ayer"). Default 2. */
  headingLevel?: 2 | 3 | 4
  className?: string
}

function RenameBox({ initial, label, onDone }: { initial: string; label: string; onDone: (title: string | null) => void }) {
  const [value, setValue] = useState(initial)
  const ref = useRef<HTMLInputElement>(null)
  const settled = useRef(false)
  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])
  const finish = (title: string | null) => {
    if (settled.current) return
    settled.current = true
    onDone(title)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      finish(value.trim() || null)
    } else if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      finish(null)
    }
  }
  return (
    <Input
      ref={ref}
      value={value}
      maxLength={120}
      aria-label={label}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={() => finish(value.trim() && value.trim() !== initial ? value.trim() : null)}
      className="h-9 [@media(pointer:coarse)]:h-11"
    />
  )
}

/**
 * Conversation history for a sidebar, in compact rows: the title and, at the
 * end, the time since the last message. On hover or keyboard focus the time
 * gives way to the row's menu (rename, delete); on touch screens the menu is
 * always there. The current conversation is marked with `aria-current` plus
 * weight and a background (not color alone). Rename edits in place (Enter
 * saves, Escape cancels) and puts focus back on the row. `query` filters by
 * title, ignoring accents.
 */
export function ConversationList({
  items,
  activeId,
  onSelect,
  onRename,
  onDelete,
  labels,
  query = "",
  headingLevel = 2,
  className,
}: ConversationListProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const [renaming, setRenaming] = useState<string | null>(null)
  const rowRefs = useRef(new Map<string, HTMLButtonElement>())
  // The menu returns focus to its trigger on close (so a confirm dialog can return there too); not for rename.
  const keepFocus = useRef(false)
  const Heading = `h${headingLevel}` as const
  const uid = useId()

  if (items.length === 0) {
    return <p className={cn("px-2 py-3 text-sm text-muted-foreground", className)}>{l.empty}</p>
  }

  const needle = fold(query.trim())
  const shown = needle ? items.filter((item) => fold(item.title).includes(needle)) : items
  if (shown.length === 0) {
    return (
      <p role="status" className={cn("px-2 py-3 text-sm text-muted-foreground", className)}>
        {l.noResults}
      </p>
    )
  }

  const sections: { group: string | undefined; items: ConversationListItem[] }[] = []
  for (const item of shown) {
    const last = sections[sections.length - 1]
    if (last && last.group === item.group) last.items.push(item)
    else sections.push({ group: item.group, items: [item] })
  }

  const finishRename = (id: string, title: string | null) => {
    setRenaming(null)
    if (title) onRename(id, title)
    requestAnimationFrame(() => rowRefs.current.get(id)?.focus())
  }

  return (
    <div data-slot="conversation-list" className={cn("flex flex-col gap-3", className)}>
      {sections.map((section, index) => {
        const headingId = `${uid}-group-${index}`
        return (
          <section key={`${section.group ?? ""}-${index}`} aria-labelledby={section.group ? headingId : undefined}>
            {section.group ? (
              <Heading id={headingId} className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">
                {section.group}
              </Heading>
            ) : null}
            <ul aria-label={section.group ? undefined : l.list} className="flex flex-col gap-px">
              {section.items.map((item) => {
                const active = item.id === activeId
                return (
                  <li key={item.id} className="group/row relative flex items-center">
                    {renaming === item.id ? (
                      <RenameBox initial={item.title} label={l.renameInput} onDone={(title) => finishRename(item.id, title)} />
                    ) : (
                      <>
                        <button
                          ref={(node) => {
                            if (node) rowRefs.current.set(item.id, node)
                            else rowRefs.current.delete(item.id)
                          }}
                          type="button"
                          aria-current={active ? "page" : undefined}
                          onClick={() => onSelect(item.id)}
                          className={cn(
                            "flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 pl-2.5 pr-12 text-left [@media(pointer:coarse)]:pr-2 text-sm text-sidebar-foreground/80 transition-colors duration-(--duration-fast) hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus) [@media(pointer:coarse)]:min-h-11",
                            active && "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          {item.tag ? (
                            <Badge size="xs" tone="neutral" title={item.tagDescription} className="shrink-0">
                              {item.tag}
                              {item.tagDescription ? <span className="sr-only">: {item.tagDescription}</span> : null}
                            </Badge>
                          ) : null}
                          {item.time ? (
                            <span
                              title={item.timeTitle}
                              className="pointer-events-none absolute right-2.5 text-xs tabular-nums text-muted-foreground transition-opacity group-focus-within/row:opacity-0 group-hover/row:opacity-0 group-has-[[data-state=open]]/row:opacity-0 [@media(pointer:coarse)]:hidden"
                            >
                              <span className="sr-only">{", "}</span>
                              {item.time}
                            </span>
                          ) : null}
                        </button>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger
                            aria-label={l.actions(item.title)}
                            className="absolute right-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-[opacity,background-color] duration-(--duration-fast) hover:bg-surface-3 hover:text-foreground focus-visible:opacity-100 group-focus-within/row:opacity-100 group-hover/row:opacity-100 data-[state=open]:opacity-100 [@media(pointer:coarse)]:static [@media(pointer:coarse)]:size-11 [@media(pointer:coarse)]:opacity-100"
                          >
                            <Ellipsis className="size-4" aria-hidden />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            onCloseAutoFocus={(event) => {
                              if (keepFocus.current) event.preventDefault()
                              keepFocus.current = false
                            }}
                          >
                            <DropdownMenuItem
                              className="min-h-11"
                              onSelect={() => {
                                keepFocus.current = true
                                setRenaming(item.id)
                              }}
                            >
                              <Pencil aria-hidden />
                              {l.rename}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="min-h-11 text-danger focus:text-danger" onSelect={() => onDelete(item.id)}>
                              <Trash2 aria-hidden />
                              {l.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
