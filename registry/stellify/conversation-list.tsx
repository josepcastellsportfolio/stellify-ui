"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"

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
}

const DEFAULT_LABELS: ConversationListLabels = {
  list: "Conversaciones",
  empty: "Todavía no hay conversaciones.",
  actions: (title) => `Opciones de «${title}»`,
  rename: "Renombrar",
  delete: "Borrar",
  renameInput: "Nuevo nombre",
}

export interface ConversationListProps {
  items: ConversationListItem[]
  activeId: string | null
  onSelect: (id: string) => void
  onRename: (id: string, title: string) => void
  /** Ask to delete (open your confirmation dialog; pass the row's menu button as its focus return). */
  onDelete: (id: string) => void
  /** Defaults in Spanish. */
  labels?: Partial<ConversationListLabels>
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
      className="h-11"
    />
  )
}

/**
 * Conversation history for a sidebar. The current conversation is marked
 * with `aria-current` plus weight and a brand edge (not color alone). Each row
 * has an always-visible menu (rename, delete), so it works on touch and with
 * the keyboard; rename edits in place (Enter saves, Escape cancels) and puts
 * focus back on the row.
 */
export function ConversationList({
  items,
  activeId,
  onSelect,
  onRename,
  onDelete,
  labels,
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

  const sections: { group: string | undefined; items: ConversationListItem[] }[] = []
  for (const item of items) {
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
    <div data-slot="conversation-list" className={cn("flex flex-col gap-4", className)}>
      {sections.map((section, index) => {
        const headingId = `${uid}-group-${index}`
        return (
          <section key={`${section.group ?? ""}-${index}`} aria-labelledby={section.group ? headingId : undefined}>
            {section.group ? (
              <Heading id={headingId} className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                {section.group}
              </Heading>
            ) : null}
            <ul aria-label={section.group ? undefined : l.list} className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = item.id === activeId
                return (
                  <li key={item.id} className="relative flex items-center">
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
                            "relative flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-md py-2 pl-3 pr-1 text-left text-sm text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-surface-3 hover:text-foreground",
                            active &&
                              "bg-surface-3 font-semibold text-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-brand"
                          )}
                        >
                          <span className="truncate">{item.title}</span>{" "}
                          {item.tag ? (
                            <Badge size="xs" tone="neutral" title={item.tagDescription} className="shrink-0">
                              {item.tag}
                              {item.tagDescription ? <span className="sr-only">: {item.tagDescription}</span> : null}
                            </Badge>
                          ) : null}
                        </button>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger
                            aria-label={l.actions(item.title)}
                            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-surface-3 hover:text-foreground"
                          >
                            <EllipsisVertical className="size-4" aria-hidden />
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
