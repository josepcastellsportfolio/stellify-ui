"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Check, Copy, GitBranch, RotateCw, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"

export interface MessageActionsLabels {
  /** Accessible name of the toolbar. */
  group: string
  copy: string
  copied: string
  regenerate: string
  /** Continue in a new conversation from this message. */
  fork: string
  delete: string
}

const DEFAULT_LABELS: MessageActionsLabels = {
  group: "Acciones del mensaje",
  copy: "Copiar",
  copied: "Copiado",
  regenerate: "Regenerar",
  fork: "Seguir en una conversación nueva",
  delete: "Borrar",
}

export interface MessageActionsProps {
  /** Text to copy (the Markdown source). */
  text: string
  /** Defaults in Spanish. */
  labels?: Partial<MessageActionsLabels>
  /** Shown only when set (usually only for the last answer). */
  onRegenerate?: () => void
  onFork?: () => void
  onDelete?: () => void
  /** A turn is running: actions that change the conversation wait. */
  busy?: boolean
  align?: "start" | "end"
  className?: string
}

function ActionButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-surface-3 hover:text-foreground disabled:pointer-events-none disabled:opacity-40 [@media(pointer:coarse)]:size-11 [&_svg]:size-4"
    >
      {children}
    </button>
  )
}

/**
 * The small toolbar under a message: copy, regenerate, continue in a new
 * conversation, delete. Quiet until the message (`group/message`, set by
 * `message-bubble`) is hovered or the toolbar holds focus on a pointer
 * device; always visible on touch screens.
 */
export function MessageActions({
  text,
  labels,
  onRegenerate,
  onFork,
  onDelete,
  busy,
  align = "start",
  className,
}: MessageActionsProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked: the text is still selectable.
    }
  }

  return (
    <div
      role="toolbar"
      aria-label={l.group}
      data-slot="message-actions"
      onKeyDown={(event) => {
        // Toolbar keys: arrows move between the actions, Home/End jump to the ends.
        const keys = ["ArrowLeft", "ArrowRight", "Home", "End"]
        if (!keys.includes(event.key)) return
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"))
        const i = buttons.indexOf(document.activeElement as HTMLButtonElement)
        if (i === -1 || buttons.length === 0) return
        event.preventDefault()
        const next =
          event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (i + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length
        buttons[next].focus()
      }}
      className={cn(
        "flex items-center gap-0.5 transition-opacity duration-(--duration-fast) [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/message:opacity-100 [@media(hover:hover)]:focus-within:opacity-100",
        align === "end" && "justify-end",
        className
      )}
    >
      <ActionButton label={copied ? l.copied : l.copy} onClick={copy}>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </ActionButton>
      {onRegenerate ? (
        <ActionButton label={l.regenerate} onClick={onRegenerate} disabled={busy}>
          <RotateCw aria-hidden />
        </ActionButton>
      ) : null}
      {onFork ? (
        <ActionButton label={l.fork} onClick={onFork} disabled={busy}>
          <GitBranch aria-hidden />
        </ActionButton>
      ) : null}
      {onDelete ? (
        <ActionButton label={l.delete} onClick={onDelete} disabled={busy}>
          <Trash2 aria-hidden />
        </ActionButton>
      ) : null}
      <span aria-live="polite" className="sr-only">
        {copied ? l.copied : ""}
      </span>
    </div>
  )
}
