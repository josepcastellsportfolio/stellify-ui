import { useEffect, useLayoutEffect, useRef, type RefObject } from "react"
import gsap from "gsap"

import { megaMenuPanelId } from "@/hooks/use-mega-menu"

export interface MegaMenuMotionOptions {
  /** `useMegaMenu().openId`. */
  openId: string | null
  /** Under reduced motion nothing tweens: panels just show and hide. */
  reducedMotion: boolean
  /** `useMegaMenu().finishClosing`: called when the exit animation is done. */
  onClosed: () => void
  /** Maps a category id to its panel's DOM id. Defaults to `megaMenuPanelId`. */
  panelId?: (categoryId: string) => string
}

const CLIP_OPEN = "inset(0% 0% 0% 0%)"
const CLIP_SHUT = "inset(0% 0% 100% 0%)"

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

/**
 * GSAP motion for `MegaMenuPanel`s under `rootRef`, keyed on their
 * `data-nav-bg` / `data-nav-content` / `data-nav-item` hooks:
 * - open: the background grows down (scaleY from the top), the content
 *   unclips top to bottom and the items rise in with a short stagger;
 * - switch category while open: the background stays, only the items re-stagger;
 * - close: content fades and the background folds up, quicker than the open,
 *   then `onClosed` runs.
 *
 * Items animate opacity and y only (never visibility), so a panel opened from
 * the keyboard can take focus on its first link straight away.
 */
export function useMegaMenuMotion(
  rootRef: RefObject<HTMLElement | null>,
  { openId, reducedMotion, onClosed, panelId = megaMenuPanelId }: MegaMenuMotionOptions,
): void {
  const prevOpen = useRef<string | null>(null)
  const closingRef = useRef<string | null>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const onClosedRef = useRef(onClosed)
  const panelIdRef = useRef(panelId)

  useEffect(() => {
    onClosedRef.current = onClosed
    panelIdRef.current = panelId
  }, [onClosed, panelId])

  useIsoLayoutEffect(() => {
    const prev = prevOpen.current
    prevOpen.current = openId
    const root = rootRef.current
    if (!root || prev === openId) return

    const wasRunning = timeline.current?.isActive() ?? false
    timeline.current?.kill()
    timeline.current = null

    const parts = (id: string) => {
      const panel = root.querySelector<HTMLElement>(`[id="${panelIdRef.current(id)}"]`)
      return {
        bg: panel?.querySelector<HTMLElement>("[data-nav-bg]") ?? null,
        content: panel?.querySelector<HTMLElement>("[data-nav-content]") ?? null,
        items: panel ? Array.from(panel.querySelectorAll<HTMLElement>("[data-nav-item]")) : [],
      }
    }

    if (reducedMotion) {
      for (const id of [prev, openId]) {
        if (!id) continue
        const { bg, content, items } = parts(id)
        const targets = [bg, content, ...items].filter((el): el is HTMLElement => el !== null)
        if (targets.length) gsap.set(targets, { clearProps: "all" })
      }
      if (!openId) onClosedRef.current()
      return
    }

    if (!openId) {
      if (!prev) return
      const { bg, content } = parts(prev)
      closingRef.current = prev
      timeline.current = gsap
        .timeline({
          onComplete: () => {
            closingRef.current = null
            onClosedRef.current()
          },
        })
        .to(content, { opacity: 0, duration: 0.12, ease: "power1.out" }, 0)
        .to(bg, { scaleY: 0, duration: 0.2, ease: "power3.in" }, 0)
      return
    }

    const { bg, content, items } = parts(openId)
    const tl = gsap.timeline()
    timeline.current = tl

    if (prev) {
      // Switching category: background and clip are already open.
      gsap.set(bg, { scaleY: 1, transformOrigin: "top" })
      gsap.set(content, { clipPath: CLIP_OPEN, opacity: 1 })
      tl.fromTo(items, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.22, stagger: 0.025, ease: "power2.out" })
      return
    }

    // Re-opening the panel that is still folding up continues from where it is.
    const resume = wasRunning && closingRef.current === openId
    closingRef.current = null
    if (!resume) gsap.set(bg, { scaleY: 0 })
    gsap.set(bg, { transformOrigin: "top" })
    gsap.set(content, { opacity: 1 })
    tl.to(bg, { scaleY: 1, duration: 0.32, ease: "expo.out" }, 0)
      .fromTo(content, { clipPath: CLIP_SHUT }, { clipPath: CLIP_OPEN, duration: 0.28, ease: "expo.out" }, 0)
      .fromTo(items, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: "power2.out" }, 0.04)
  }, [openId, reducedMotion, rootRef])

  useEffect(
    () => () => {
      timeline.current?.kill()
    },
    [],
  )
}

export interface MegaMenuMotionProps extends MegaMenuMotionOptions {
  rootRef: RefObject<HTMLElement | null>
}

/**
 * `useMegaMenuMotion` as a render-nothing component, so a component that owns
 * the menu (e.g. `SiteNav`'s `menuMotion` prop) can opt into the GSAP motion
 * without depending on GSAP itself.
 */
export function MegaMenuMotion({ rootRef, ...options }: MegaMenuMotionProps): null {
  useMegaMenuMotion(rootRef, options)
  return null
}
