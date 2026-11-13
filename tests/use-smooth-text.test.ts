import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useSmoothText } from "@stellify/use-smooth-text"

describe("useSmoothText", () => {
  let frames: FrameRequestCallback[] = []
  const flush = (n: number) => {
    for (let i = 0; i < n; i++) {
      const pending = frames
      frames = []
      act(() => pending.forEach((cb) => cb(performance.now())))
    }
  }

  beforeEach(() => {
    frames = []
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal("cancelAnimationFrame", () => {})
  })
  afterEach(() => vi.unstubAllGlobals())

  it("reveals a streamed answer a few characters per frame and catches up", () => {
    const text = "Hola, esta es una respuesta que llega de golpe del servidor."
    const { result, rerender } = renderHook(({ t, on }) => useSmoothText(t, on), {
      initialProps: { t: "", on: true },
    })
    rerender({ t: text, on: true })
    flush(1)
    expect(result.current.length).toBeGreaterThan(0)
    expect(result.current.length).toBeLessThan(text.length)
    expect(text.startsWith(result.current)).toBe(true)
    flush(60)
    expect(result.current).toBe(text)
  })

  it("finishes the reveal after the stream ends", () => {
    const { result, rerender } = renderHook(({ t, on }) => useSmoothText(t, on), {
      initialProps: { t: "", on: true },
    })
    rerender({ t: "Respuesta completa", on: true })
    flush(1)
    rerender({ t: "Respuesta completa", on: false })
    flush(60)
    expect(result.current).toBe("Respuesta completa")
  })

  it("shows settled text as is", () => {
    const { result } = renderHook(() => useSmoothText("Mensaje guardado", false))
    expect(result.current).toBe("Mensaje guardado")
  })

  it("jumps when the text is replaced instead of extended", () => {
    const { result, rerender } = renderHook(({ t }) => useSmoothText(t, true), { initialProps: { t: "" } })
    rerender({ t: "Primera respuesta larga" })
    flush(60)
    rerender({ t: "Otra" })
    expect(result.current).toBe("Otra")
  })
})
