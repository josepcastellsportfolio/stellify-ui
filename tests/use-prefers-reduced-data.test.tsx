import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { usePrefersReducedData } from "../registry/stellify/use-prefers-reduced-data"

const setConnection = (value: unknown) =>
  Object.defineProperty(navigator, "connection", { value, configurable: true })

const setMatchMedia = (matches: boolean) =>
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))

describe("usePrefersReducedData", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    setConnection(undefined)
  })

  it("is false when the visitor asked for nothing", () => {
    setMatchMedia(false)
    const { result } = renderHook(() => usePrefersReducedData())
    expect(result.current).toBe(false)
  })

  it("is true with the browser's Data Saver on", () => {
    setMatchMedia(false)
    setConnection({ saveData: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const { result } = renderHook(() => usePrefersReducedData())
    expect(result.current).toBe(true)
  })

  it("is true with prefers-reduced-data: reduce", () => {
    setMatchMedia(true)
    const { result } = renderHook(() => usePrefersReducedData())
    expect(result.current).toBe(true)
  })
})
