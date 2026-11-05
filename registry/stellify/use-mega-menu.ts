import { useCallback, useEffect, useRef, useState } from "react"

/** Grace period before a mouseleave closes the panel (diagonal mouse moves). */
export const MEGA_MENU_CLOSE_DELAY_MS = 120

/** DOM id of a category's panel; its trigger's `aria-controls` points here. */
export const megaMenuPanelId = (categoryId: string, prefix = "nav-panel") => `${prefix}-${categoryId}`

export interface MegaMenuState {
  /** The category whose panel is open (drives `aria-expanded`). */
  openId: string | null
  /** The panel shown right now: the open one, or the one animating out. */
  visibleId: string | null
  open: (id: string) => void
  /** Closes now. `animate: false` skips the exit animation (reduced motion, no motion). */
  close: (options?: { animate?: boolean }) => void
  /** Closes after `MEGA_MENU_CLOSE_DELAY_MS` unless `cancelClose` or `open` runs first. */
  scheduleClose: () => void
  cancelClose: () => void
  /** Called by the exit animation when it is done. */
  finishClosing: () => void
}

/**
 * Open/close state of a mega-menu. Opening is instant; closing with
 * `animate: true` keeps the panel visible (`visibleId`) until the exit
 * animation calls `finishClosing`, so it can animate out instead of vanishing.
 *
 * No animation library here: pair it with `useMegaMenuMotion`
 * (`@stellify/use-mega-menu-motion`) for the GSAP motion, or close with
 * `animate: false` for plain show/hide.
 */
export function useMegaMenu({ closeDelayMs = MEGA_MENU_CLOSE_DELAY_MS }: { closeDelayMs?: number } = {}): MegaMenuState {
  const [openId, setOpenId] = useState<string | null>(null)
  const [closingId, setClosingId] = useState<string | null>(null)
  const openRef = useRef<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cancelClose = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = undefined
  }, [])

  const open = useCallback(
    (id: string) => {
      cancelClose()
      openRef.current = id
      setClosingId(null)
      setOpenId(id)
    },
    [cancelClose],
  )

  const close = useCallback(
    ({ animate = true }: { animate?: boolean } = {}) => {
      cancelClose()
      const current = openRef.current
      if (!current) return
      openRef.current = null
      setClosingId(animate ? current : null)
      setOpenId(null)
    },
    [cancelClose],
  )

  const scheduleClose = useCallback(() => {
    if (!openRef.current) return
    cancelClose()
    timer.current = setTimeout(() => close(), closeDelayMs)
  }, [cancelClose, close, closeDelayMs])

  const finishClosing = useCallback(() => setClosingId(null), [])

  useEffect(() => cancelClose, [cancelClose])

  return {
    openId,
    visibleId: openId ?? closingId,
    open,
    close,
    scheduleClose,
    cancelClose,
    finishClosing,
  }
}
