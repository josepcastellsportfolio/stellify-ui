"use client"

import type { Ref } from "react"
import { LoaderCircle, Mic, VolumeX } from "lucide-react"

import { cn } from "@/lib/utils"

export type MicButtonState = "idle" | "starting" | "recording" | "transcribing"

export interface MicButtonLabels {
  /** Accessible name; stays the same while pressed (the state is `aria-pressed`). */
  talk: string
  /** Shown next to the spinner while the recording is turned into text. */
  transcribing: string
}

const DEFAULT_LABELS: MicButtonLabels = { talk: "Hablar", transcribing: "Transcribiendo…" }

export interface MicButtonProps {
  state: MicButtonState
  /** Time recorded so far, shown as m:ss while recording. */
  elapsedMs?: number
  /** Tap to start, tap again to stop. */
  onToggle: () => void
  disabled?: boolean
  /** Defaults: talk "Hablar", transcribing "Transcribiendo…". */
  labels?: Partial<MicButtonLabels>
  /** Value for `aria-keyshortcuts` (e.g. "Alt+M"); also shown in the tooltip. */
  keyShortcuts?: string
  ref?: Ref<HTMLButtonElement>
  className?: string
}

function clock(ms: number): string {
  const total = Math.floor(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

const BASE =
  "inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-(--duration-fast) [&_svg]:size-5"

/**
 * Push-to-talk toggle for a chat composer's `controls`. While recording it
 * fills with the danger tone and shows a running clock (and a pulsing dot:
 * shape, not only color); while the audio is transcribed it shows a spinner
 * and ignores taps. Disabled stays focusable (`aria-disabled`). Announce state
 * changes through a live region of your own.
 */
export function MicButton({ state, elapsedMs = 0, onToggle, disabled, labels, keyShortcuts, ref, className }: MicButtonProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const pressed = state === "recording" || state === "starting"
  const busy = state === "transcribing"
  const inert = disabled || busy

  return (
    <button
      ref={ref}
      type="button"
      data-slot="mic-button"
      data-state={state}
      onClick={() => {
        if (!inert) onToggle()
      }}
      aria-pressed={pressed}
      aria-disabled={inert || undefined}
      aria-busy={busy || state === "starting" || undefined}
      aria-keyshortcuts={keyShortcuts}
      title={keyShortcuts ? `${l.talk} (${keyShortcuts})` : l.talk}
      className={cn(
        BASE,
        pressed
          ? "bg-danger px-3 text-danger-foreground hover:bg-danger/90"
          : "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary)_88%,var(--foreground))]",
        busy && "px-3",
        inert && "cursor-not-allowed",
        disabled && "opacity-50",
        className
      )}
    >
      {busy ? (
        <>
          <LoaderCircle className="motion-safe:animate-spin" aria-hidden />
          <span className="hidden sm:inline" aria-hidden>
            {l.transcribing}
          </span>
        </>
      ) : pressed ? (
        <>
          <span className="size-2.5 rounded-full bg-current motion-safe:animate-pulse" aria-hidden />
          {/* The clock changes every second: kept out of the name so it isn't re-read. */}
          <span className="font-mono tabular-nums" aria-hidden>
            {clock(elapsedMs)}
          </span>
        </>
      ) : (
        <Mic aria-hidden />
      )}
      <span className="sr-only">{l.talk}</span>
    </button>
  )
}

export interface StopSpeakingButtonProps {
  onStop: () => void
  /** Name and (from `sm` up) visible text ("Dejar de leer"). */
  label: string
  className?: string
}

/** Visible while an answer is read aloud; stops the voice, not the chat. */
export function StopSpeakingButton({ onStop, label, className }: StopSpeakingButtonProps) {
  return (
    <button
      type="button"
      data-slot="stop-speaking"
      onClick={onStop}
      title={label}
      className={cn(BASE, "bg-brand-subtle px-3 text-foreground hover:bg-surface-3", className)}
    >
      <VolumeX className="text-brand motion-safe:animate-pulse" aria-hidden />
      <span className="sr-only sm:not-sr-only">{label}</span>
    </button>
  )
}
