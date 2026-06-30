import { forwardRef } from "react"
import { MessageSquareText } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InteluiPillProps {
  /** Localized label (also the title when collapsed). */
  label: string
  /** Localized aria-label for the trigger. */
  openLabel: string
  /** Sidebar expanded — controls the fading label (matches nav items). */
  expanded: boolean
  /** intelUI mode active — pill stays highlighted. */
  active: boolean
  /** Dropdown open. */
  open: boolean
  /** intelUI not available here — render muted/non-interactive. */
  disabled?: boolean
  /** Tooltip shown when disabled (e.g. "available only in Planner"). */
  disabledHint?: string
  onClick: () => void
}

/**
 * Bottom-of-sidebar assistant pill. Styled to match nav items (icon h-5 w-5 +
 * fading label). It opens the assistant dropdown; highlighted when intelUI is
 * active. Engine-agnostic — all state and copy come from props.
 */
const InteluiPill = forwardRef<HTMLButtonElement, InteluiPillProps>(
  (
    { label, openLabel, expanded, active, open, disabled = false, disabledHint, onClick },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={disabled ? (disabledHint ?? label) : openLabel}
      title={disabled ? disabledHint : expanded ? undefined : label}
      aria-haspopup={disabled ? undefined : "dialog"}
      aria-expanded={disabled ? undefined : open}
      className={cn(
        "flex h-10 w-full items-center gap-3 rounded-md border border-transparent px-2",
        "text-foreground transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        disabled
          ? "cursor-not-allowed opacity-40"
          : active
            ? "border-primary bg-primary text-primary-foreground"
            : "hover:border-primary hover:bg-primary hover:text-primary-foreground",
      )}
    >
      <MessageSquareText className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span
        className={cn(
          "whitespace-nowrap text-sm font-medium transition-opacity duration-150",
          expanded ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {label}
      </span>
    </button>
  ),
)

InteluiPill.displayName = "InteluiPill"

export default InteluiPill
export { InteluiPill }
