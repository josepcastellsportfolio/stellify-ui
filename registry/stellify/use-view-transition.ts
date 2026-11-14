import * as React from "react"
import { flushSync } from "react-dom"

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

/**
 * Shared element transition with the View Transitions API: give the element
 * the same `viewTransitionName` in both views (e.g. a card's image and the
 * detail's hero) and run the state change through `start`. The browser
 * morphs one into the other.
 *
 * Falls back to an instant update where the API is missing and under reduced
 * motion. Names must be unique on the page at the moment of the transition.
 *
 * ```tsx
 * const start = useViewTransition()
 * <Card style={{ viewTransitionName: `doc-${id}` }} onClick={() => start(() => setOpen(id))} />
 * ```
 */
export function useViewTransition() {
  return React.useCallback((update: () => void) => {
    const doc = typeof document === "undefined" ? undefined : (document as ViewTransitionDocument)
    const reduced =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (!doc?.startViewTransition || reduced) {
      update()
      return
    }
    doc.startViewTransition(() => flushSync(update))
  }, [])
}
