import { useEffect, useRef, type RefObject } from "react"

/** What counts as focusable inside a trap. */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Focusable elements under `root`, in DOM order, skipping anything inside an
 * `inert` or `hidden` subtree (an off-screen drill-down pane, a closed panel).
 */
export function getFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    el => !el.closest("[inert], [hidden]"),
  )
}

export interface UseFocusTrapOptions {
  /** The trap only runs while true. Defaults to true. */
  active?: boolean
  /** Called on Escape (the trap calls `preventDefault`). */
  onEscape?: () => void
  /**
   * Where focus goes when the trap activates: `"first"` (default) is the first
   * focusable, a selector picks one under the root, `false` leaves focus alone.
   */
  initialFocus?: "first" | string | false
  /** Lock `document.body` scrolling while active (modal sheets). */
  lockScroll?: boolean
  /**
   * Put focus back on the element that had it before the trap activated.
   * Off by default: most callers know better where focus should land.
   */
  restoreFocus?: boolean
}

/**
 * Keeps keyboard focus inside `ref` while `active`: Tab and Shift+Tab move
 * through its focusables in DOM order and wrap around, focus that escaped the root (a click on the page behind) is pulled
 * back on the next Tab, and Escape calls `onEscape`. The listener sits on the
 * document, so it works wherever focus currently is.
 *
 * Focus moves use `preventScroll`, so a trap inside a translating or
 * overflow-hidden track does not make the layout jump.
 */
export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { active = true, onEscape, initialFocus = "first", lockScroll = false, restoreFocus = false }: UseFocusTrapOptions = {},
): void {
  const onEscapeRef = useRef(onEscape)
  useEffect(() => {
    onEscapeRef.current = onEscape
  }, [onEscape])

  // Initial focus, scroll lock and focus restore: once per activation.
  useEffect(() => {
    if (!active) return
    const previous = document.activeElement as HTMLElement | null
    const root = ref.current
    if (root && initialFocus !== false) {
      const target =
        initialFocus === "first"
          ? getFocusables(root)[0]
          : root.querySelector<HTMLElement>(initialFocus) ?? getFocusables(root)[0]
      target?.focus({ preventScroll: true })
    }

    let overflow: string | undefined
    if (lockScroll) {
      overflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
    }

    return () => {
      if (lockScroll) document.body.style.overflow = overflow ?? ""
      if (restoreFocus && previous?.isConnected) previous.focus({ preventScroll: true })
    }
    // initialFocus is read once per activation on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, lockScroll, restoreFocus, ref])

  useEffect(() => {
    if (!active) return

    const onKeyDown = (event: KeyboardEvent) => {
      const root = ref.current
      if (!root) return
      if (event.key === "Escape") {
        if (!onEscapeRef.current) return
        event.preventDefault()
        onEscapeRef.current()
        return
      }
      if (event.key !== "Tab") return

      // Move focus ourselves, in DOM order, so elements under `inert` or
      // `hidden` are skipped even where the browser would not skip them.
      const items = getFocusables(root)
      if (!items.length) return
      event.preventDefault()
      const index = items.indexOf(document.activeElement as HTMLElement)
      const next =
        index === -1
          ? event.shiftKey ? items[items.length - 1] : items[0]
          : items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length]
      next.focus({ preventScroll: true })
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [active, ref])
}
