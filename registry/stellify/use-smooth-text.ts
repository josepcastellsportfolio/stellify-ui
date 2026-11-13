"use client"

import { useEffect, useRef, useState } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

/** Frames to drain whatever is pending: big chunks speed the reveal up, so it never lags far behind. */
const CATCH_UP_FRAMES = 10

/**
 * The text of a streamed answer, revealed a few characters per frame instead
 * of in the lumps the server sends (a local model writes ~8 tokens/s in
 * bursts). The reveal speeds up with the backlog, so it trails the stream by
 * a fraction of a second, and it finishes on its own after the stream ends.
 *
 * With reduced motion, outside `active`, or without `requestAnimationFrame`,
 * it returns `target` as is. If `target` stops extending what is shown (a new
 * answer, an edit), it jumps to it.
 */
export function useSmoothText(target: string, active: boolean): string {
  const reduced = usePrefersReducedMotion()
  const smooth = active && !reduced && typeof requestAnimationFrame === "function"
  const [shown, setShown] = useState(smooth ? "" : target)
  const shownRef = useRef(shown)
  const targetRef = useRef(target)
  useEffect(() => {
    targetRef.current = target
  }, [target])

  const running = smooth || shown.length < target.length
  useEffect(() => {
    if (!running || reduced || typeof requestAnimationFrame !== "function") return
    let frame = 0
    const tick = () => {
      const full = targetRef.current
      let next = shownRef.current
      if (!full.startsWith(next)) {
        next = full
      } else if (next.length < full.length) {
        const backlog = full.length - next.length
        next = full.slice(0, next.length + Math.max(1, Math.ceil(backlog / CATCH_UP_FRAMES)))
      }
      if (next !== shownRef.current) {
        shownRef.current = next
        setShown(next)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running, reduced])

  if (reduced || (!smooth && shown.length >= target.length) || !target.startsWith(shown)) return target
  return shown
}
