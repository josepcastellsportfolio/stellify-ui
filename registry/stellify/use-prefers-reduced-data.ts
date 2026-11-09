import { useEffect, useState } from "react"

const QUERY = "(prefers-reduced-data: reduce)"

interface NetworkInformationLike {
  saveData?: boolean
  addEventListener?: (type: "change", listener: () => void) => void
  removeEventListener?: (type: "change", listener: () => void) => void
}

const connection = (): NetworkInformationLike | undefined =>
  typeof navigator === "undefined"
    ? undefined
    : (navigator as Navigator & { connection?: NetworkInformationLike }).connection

function readPreference(): boolean {
  if (typeof window === "undefined") return false
  if (connection()?.saveData) return true
  return Boolean(window.matchMedia?.(QUERY).matches)
}

/**
 * Whether the visitor asked to save data: the browser's Data Saver
 * (`navigator.connection.saveData`) or `prefers-reduced-data`.
 *
 * Prerender-safe like usePrefersReducedMotion: `false` on the server, then
 * re-evaluated on the client. Use it to skip a heavy download, never to
 * choose different markup.
 */
export function usePrefersReducedData(): boolean {
  const [reduced, setReduced] = useState<boolean>(readPreference)

  useEffect(() => {
    const update = () => setReduced(readPreference())
    update()
    const net = connection()
    net?.addEventListener?.("change", update)
    const mq = typeof window !== "undefined" ? window.matchMedia?.(QUERY) : undefined
    mq?.addEventListener?.("change", update)
    return () => {
      net?.removeEventListener?.("change", update)
      mq?.removeEventListener?.("change", update)
    }
  }, [])

  return reduced
}
