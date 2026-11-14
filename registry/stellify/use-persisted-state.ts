"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"

type SetState<T> = T | ((prev: T) => T)

// Listeners per key, so every hook on the same key (in this tab) re-renders
// together; other tabs arrive through the `storage` event.
const listeners = new Map<string, Set<() => void>>()
// Values that could not be written (storage full, blocked, private mode):
// the state still works for this page load.
const memory = new Map<string, string>()

function read(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, raw: string): void {
  try {
    window.localStorage.setItem(key, raw)
    memory.delete(key)
  } catch {
    memory.set(key, raw)
  }
  listeners.get(key)?.forEach((notify) => notify())
}

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/**
 * useState that mirrors its value to localStorage (JSON-serialized).
 *
 * SSR-safe: the server render and hydration use `defaultValue` (so markup
 * matches), then the stored value takes over. Built on
 * `useSyncExternalStore`, so there is no extra render from an effect, hooks
 * sharing a key stay in step, and other tabs' writes arrive live. A disabled,
 * full or malformed storage never throws: the value lives in memory instead.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: SetState<T>) => void] {
  const subscribe = useCallback(
    (notify: () => void) => {
      let set = listeners.get(key)
      if (!set) listeners.set(key, (set = new Set()))
      set.add(notify)
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) notify()
      }
      window.addEventListener("storage", onStorage)
      return () => {
        set.delete(notify)
        window.removeEventListener("storage", onStorage)
      }
    },
    [key]
  )
  // The snapshot is the raw string: stable between renders, cheap to compare.
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null
  )
  // `defaultValue` is read only when nothing is stored, like useState's initial value.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const state = useMemo(() => parse(raw, defaultValue), [raw])

  const set = useCallback(
    (value: SetState<T>) => {
      const prev = parse(read(key), defaultValue)
      const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value
      write(key, JSON.stringify(next))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  )

  return [state, set]
}

export default usePersistedState
