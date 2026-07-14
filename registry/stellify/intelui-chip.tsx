import { forwardRef } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface InteluiChipProps {
  /** Selected entity's human-readable label. */
  label: string
  /** Remove the selection (the trailing ✕). */
  onRemove: () => void
  /** Localized aria-label for the remove button. */
  removeLabel: string
  /**
   * Domain entity kind (e.g. "evento", "tarea"). Emitted as `data-intelui-type`
   * for optional per-type accents. Opaque to this component.
   */
  type?: string
  /** Host reduced-motion preference — drops the color transition. */
  reducedMotion?: boolean
}

/**
 * InteluiChip — the selected-entity chip shown in the assistant input.
 *
 * Clicking a selectable entity attaches it here so the assistant resolves
 * "muévela / esto" against it. Presentational and engine-agnostic: label and
 * handlers come from props; the border uses `--intelui-accent` to match the
 * highlight layer.
 */
const InteluiChip = forwardRef<HTMLSpanElement, InteluiChipProps>(
  ({ label, onRemove, removeLabel, type, reducedMotion }, ref) => (
    <span
      ref={ref}
      data-intelui-type={type}
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2",
        "bg-accent/40 text-xs font-medium text-foreground",
        "max-w-[10rem]",
      )}
      style={{ borderColor: "var(--intelui-accent)" }}
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        title={removeLabel}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground",
          "hover:bg-accent hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !reducedMotion && "transition-colors",
        )}
      >
        <X className="h-3 w-3" aria-hidden />
      </button>
    </span>
  ),
)

InteluiChip.displayName = "InteluiChip"

export default InteluiChip
export { InteluiChip }
