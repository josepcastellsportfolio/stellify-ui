import { useCallback, useEffect, useRef, useState } from "react"

type SetState<T> = T | ((prev: T) => T)

/**
 * useState that mirrors its value to localStorage (JSON-serialized).
 *
 * SSR-safe: the initial render always uses `defaultValue` (so server and
 * client markup match), then the stored value is hydrated in an effect after
 * mount. Reads/writes are wrapped in try/catch so a disabled or full storage
 * never crashes the app.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: SetState<T>) => void] {
  const [state, setState] = useState<T>(defaultValue)
  const hydrated = useRef(false)

  // Hydrate from storage once, after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        setState(JSON.parse(raw) as T)
      }
    } catch {
      // ignore malformed or inaccessible storage
    }
    hydrated.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Persist on change (but not before the initial hydration has run).
  useEffect(() => {
    if (!hydrated.current) return
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [key, state])

  const set = useCallback((value: SetState<T>) => {
    setState((prev) =>
      typeof value === "function"
        ? (value as (prev: T) => T)(prev)
        : value
    )
  }, [])

  return [state, set]
}

export default usePersistedState
