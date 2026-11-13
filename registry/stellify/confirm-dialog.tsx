"use client"

import type { ReactNode, RefObject } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ConfirmDialogLabels {
  confirm: string
  cancel: string
}

const DEFAULT_LABELS: ConfirmDialogLabels = { confirm: "Confirmar", cancel: "Cancelar" }

export interface ConfirmDialogProps {
  /** Controlled open state. Omit (with `trigger`) for uncontrolled usage. */
  open?: boolean
  /** Open-state change handler for controlled usage. */
  onOpenChange?: (open: boolean) => void
  /** Element that opens the dialog (uncontrolled usage). */
  trigger?: ReactNode
  /** Dialog title. */
  title: string
  /** Dialog description / body copy. */
  description?: ReactNode
  /** Button copy. Defaults: "Confirmar", "Cancelar". */
  labels?: Partial<ConfirmDialogLabels>
  /** Called when the user confirms. */
  onConfirm: () => void
  /** Style the confirm button as destructive (red). */
  destructive?: boolean
  /** Disable the confirm button (e.g. while a request is in flight). */
  loading?: boolean
  /**
   * Where focus goes when the dialog closes. Radix returns it to the
   * `trigger`; a controlled dialog opened from a menu item (whose element is
   * gone by then) needs somewhere to land, usually the menu's own button.
   */
  returnFocusRef?: RefObject<HTMLElement | null>
}

/**
 * Confirmation dialog built on shadcn's AlertDialog.
 *
 * Works controlled (`open` + `onOpenChange`) or uncontrolled (pass a
 * `trigger`). All copy is passed via props. Use `destructive` for dangerous
 * actions like delete.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  labels,
  onConfirm,
  destructive = false,
  loading = false,
  returnFocusRef,
}: ConfirmDialogProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          const target = returnFocusRef?.current
          if (!target?.isConnected) return
          event.preventDefault()
          target.focus()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {l.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              destructive &&
                buttonVariants({ variant: "destructive" })
            )}
          >
            {l.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDialog }
