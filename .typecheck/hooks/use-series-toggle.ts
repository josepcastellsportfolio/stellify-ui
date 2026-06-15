import { useCallback, useMemo, useState } from "react"

export interface UseSeriesToggle {
  /** Keys currently hidden. */
  hidden: Set<string>
  /** Toggle a series key on/off. */
  toggle: (key: string) => void
  /** Whether a key is hidden. */
  isHidden: (key: string) => boolean
  /** Show everything again. */
  reset: () => void
  /** Keys still visible, in the original order. */
  visibleKeys: string[]
}

/**
 * Visibility state for an interactive chart legend: click a series to hide it,
 * click again to show. Stateless components (the chart primitive's legend) read
 * `hidden` and call `toggle`; the chart hides each `<Area/Bar/Line hide=… />`.
 */
export function useSeriesToggle(seriesKeys: string[]): UseSeriesToggle {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())

  const toggle = useCallback((key: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const isHidden = useCallback((key: string) => hidden.has(key), [hidden])
  const reset = useCallback(() => setHidden(new Set()), [])

  const visibleKeys = useMemo(
    () => seriesKeys.filter((k) => !hidden.has(k)),
    [seriesKeys, hidden]
  )

  return { hidden, toggle, isHidden, reset, visibleKeys }
}

export default useSeriesToggle
