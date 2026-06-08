import type { ReactNode } from "react"

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
  /** Confirm button label. Defaults to "Confirm". */
  confirmLabel?: string
  /** Cancel button label. Defaults to "Cancel". */
  cancelLabel?: string
  /** Called when the user confirms. */
  onConfirm: () => void
  /** Style the confirm button as destructive (red). */
  destructive?: boolean
  /** Disable the confirm button (e.g. while a request is in flight). */
  loading?: boolean
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
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              destructive &&
                buttonVariants({ variant: "destructive" })
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmDialog }
