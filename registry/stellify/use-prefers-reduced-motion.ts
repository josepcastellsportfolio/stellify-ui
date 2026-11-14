"use client"

import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {}
  const mq = window.matchMedia(QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

const getSnapshot = () =>
  typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(QUERY).matches

const getServerSnapshot = () => false

/**
 * The user's reduced-motion preference, reactively.
 *
 * Prerender-safe: `false` on the server and during hydration (and wherever
 * `matchMedia` is missing), then the real value. Use it to decide whether to
 * run an animation, never to choose different markup, or the server and
 * client renders will disagree.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
