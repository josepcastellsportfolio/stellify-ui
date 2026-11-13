import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axe from "axe-core"
import { describe, expect, it, vi } from "vitest"

import { MicButton, StopSpeakingButton, type MicButtonState } from "@stellify/mic-button"

const labels = { talk: "Hablar", transcribing: "Transcribiendo…" }

function renderMic(state: MicButtonState, props: { elapsedMs?: number; disabled?: boolean } = {}) {
  const onToggle = vi.fn()
  render(<MicButton state={state} onToggle={onToggle} labels={labels} keyShortcuts="Alt+M" {...props} />)
  return { onToggle, button: screen.getByRole("button", { name: "Hablar" }) }
}

async function violations() {
  const results = await axe.run(document.body, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    rules: { "color-contrast": { enabled: false } },
  })
  return results.violations.map((v) => v.id)
}

describe("MicButton", () => {
  it("idle: a toggle button, not pressed, with its shortcut", async () => {
    const { button, onToggle } = renderMic("idle")
    expect(button).toHaveAttribute("aria-pressed", "false")
    expect(button).toHaveAttribute("aria-keyshortcuts", "Alt+M")
    expect(await violations()).toEqual([])

    button.focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.keyboard(" ")
    expect(onToggle).toHaveBeenCalledTimes(2)
  })

  it("recording: pressed, shows the clock, keeps the same name", async () => {
    const { button, onToggle } = renderMic("recording", { elapsedMs: 67_000 })
    expect(button).toHaveAttribute("aria-pressed", "true")
    expect(button).toHaveTextContent("1:07")
    expect(button).toHaveAccessibleName("Hablar")
    expect(await violations()).toEqual([])

    await userEvent.click(button)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it("starting: pressed and busy while the browser asks for the mic", () => {
    const { button } = renderMic("starting")
    expect(button).toHaveAttribute("aria-pressed", "true")
    expect(button).toHaveAttribute("aria-busy", "true")
  })

  it("transcribing: busy, unavailable, ignores taps", async () => {
    const { button, onToggle } = renderMic("transcribing")
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).toHaveAttribute("aria-disabled", "true")
    expect(button).toHaveAttribute("aria-pressed", "false")
    expect(await violations()).toEqual([])
    await userEvent.click(button)
    expect(onToggle).not.toHaveBeenCalled()
  })

  it("disabled: stays focusable but does nothing", async () => {
    const { button, onToggle } = renderMic("idle", { disabled: true })
    expect(button).toHaveAttribute("aria-disabled", "true")
    await userEvent.click(button)
    expect(onToggle).not.toHaveBeenCalled()
  })
})

describe("StopSpeakingButton", () => {
  it("is a labelled button that stops the voice", async () => {
    const onStop = vi.fn()
    render(<StopSpeakingButton onStop={onStop} label="Dejar de leer" />)
    await userEvent.click(screen.getByRole("button", { name: "Dejar de leer" }))
    expect(onStop).toHaveBeenCalled()
    expect(await violations()).toEqual([])
  })
})
