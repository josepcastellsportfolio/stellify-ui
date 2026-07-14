import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

export interface ActionableProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Merge the highlight attributes onto the single child instead of rendering
   * a wrapping <div>. Use this to avoid an extra DOM node / competing handlers
   * over components that own their own pointer capture (e.g. a draggable
   * calendar block).
   */
  asChild?: boolean
  /**
   * Domain entity kind (e.g. "evento", "tarea", "gasto"). Emitted as
   * `data-intelui-type` for optional per-type accents. The wrapper is
   * domain-agnostic — this is an opaque string.
   */
  type: string
  /** The entity is the current selection — reinforces the full halo. */
  selected?: boolean
  /**
   * The entity has at least one applicable assistant action. Only actionable
   * entities glow and open a quick-actions popover; when false the wrapper is
   * inert (no `data-intelui-actionable`, no highlight).
   */
  hasActions?: boolean
  /** Host-provided reduced-motion preference (CSS also guards via media query). */
  reducedMotion?: boolean
}

/**
 * Actionable — marks a domain entity as assistant-actionable.
 *
 * Presentational and engine-agnostic: it only paints the `data-*` markers the
 * `intelui-highlight` layer styles (`data-intelui-actionable`, `data-intelui-type`,
 * `data-selected`). The host owns which actions exist, selection state, and the
 * quick-actions popover, and drives them through `hasActions` / `selected` +
 * its own click wiring. Selection is NOT wired here so it can ride the host's
 * existing tap path without competing with pointer capture.
 *
 * With `asChild`, the markers are merged onto the child via Radix `Slot` (no
 * extra DOM node); otherwise a <div> wraps `children`.
 */
const Actionable = React.forwardRef<HTMLDivElement, ActionableProps>(
  (
    {
      asChild = false,
      type,
      selected = false,
      hasActions = false,
      reducedMotion,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        ref={ref}
        className={cn(className)}
        data-intelui-actionable={hasActions ? "true" : undefined}
        data-intelui-type={type}
        data-selected={selected ? "true" : undefined}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        {...props}
      >
        {children}
      </Comp>
    )
  },
)

Actionable.displayName = "Actionable"

export default Actionable
export { Actionable }
