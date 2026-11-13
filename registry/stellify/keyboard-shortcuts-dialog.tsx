"use client"

import type { ReactNode } from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export interface KeyboardShortcut {
  /** Key combinations, each a list of keys (["Ctrl", "Mayús", "O"]). Alternatives are separate entries. */
  keys: string[][]
  label: string
}

export interface KeyboardShortcutsDialogLabels {
  title: string
  /** Word between alternative combinations ("o"). */
  or: string
  /** Name of the corner close button. */
  close: string
}

const DEFAULT_LABELS: KeyboardShortcutsDialogLabels = {
  title: "Atajos de teclado",
  or: "o",
  close: "Cerrar",
}

export interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortcuts: KeyboardShortcut[]
  description?: string
  /** Defaults: title "Atajos de teclado", or "o", close "Cerrar". */
  labels?: Partial<KeyboardShortcutsDialogLabels>
  /** Extra settings under the list (e.g. a switch for single-key shortcuts). */
  footer?: ReactNode
}

/** The "?" dialog: every shortcut in a description list with `<kbd>` keys. */
export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  shortcuts,
  description,
  labels,
  footer,
}: KeyboardShortcutsDialogProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" labels={{ close: l.close }}>
        <DialogHeader>
          <DialogTitle>{l.title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <dl data-slot="keyboard-shortcuts" className="flex flex-col divide-y">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-sm text-foreground">{shortcut.label}</dt>
              <dd className="flex shrink-0 flex-wrap items-center justify-end gap-1 text-xs text-muted-foreground">
                {shortcut.keys.map((combo, i) => (
                  <span key={combo.join("+")} className="inline-flex items-center gap-1">
                    {i > 0 ? <span className="px-0.5">{l.or}</span> : null}
                    {combo.map((key) => (
                      <kbd
                        key={key}
                        className="min-w-6 rounded-sm border-b border-field-edge bg-surface-3 px-1.5 py-0.5 text-center font-mono font-medium text-foreground"
                      >
                        {key}
                      </kbd>
                    ))}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
        {footer}
      </DialogContent>
    </Dialog>
  )
}
