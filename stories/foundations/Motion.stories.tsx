import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Page, Section } from "./Swatch"

/**
 * Every animation is interruptible: a new input never waits for the previous
 * one to finish. Prefer CSS transitions on `transform`: when the target
 * changes mid-flight the browser starts from the current position. With GSAP,
 * use `overwrite: "auto"`. Under prefers-reduced-motion, stellify-base cuts
 * durations to near zero.
 *
 * Focus is one solid 2px outline in ink, offset 2px. No translucent halo.
 */
const meta = {
  title: "Foundations/Motion & focus",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

const POSITIONS = ["Día", "Semana", "Mes"]

function InterruptibleDemo() {
  const [at, setAt] = useState(0)
  const [slow, setSlow] = useState(false)
  return (
    <div className="space-y-3">
      <div className="relative inline-grid grid-flow-col auto-cols-fr rounded-[var(--radius-pill)] bg-surface-2 p-[3px]">
        <span
          aria-hidden
          className="absolute inset-y-[3px] left-[3px] rounded-[var(--radius-pill)] bg-foreground transition-transform ease-[var(--ease-out)]"
          style={{
            width: `calc((100% - 6px) / ${POSITIONS.length})`,
            transform: `translateX(${at * 100}%)`,
            transitionDuration: slow ? "1600ms" : "var(--duration-base)",
          }}
        />
        {POSITIONS.map((p, i) => (
          <button
            key={p}
            type="button"
            onClick={() => setAt(i)}
            className={`relative z-10 rounded-[var(--radius-pill)] px-4 py-1.5 text-sm font-medium transition-colors duration-(--duration-base) ${
              at === i ? "text-background" : "text-muted-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} />
        Cámara lenta: pulsa otra opción a mitad de recorrido
      </label>
    </div>
  )
}

export const Interruptible: Story = {
  render: () => (
    <Page>
      <Section
        title="Interruptible transition"
        note="The indicator retargets from wherever it is. This is the behaviour the segmented-control (phase 2) is built on."
      >
        <InterruptibleDemo />
      </Section>
      <Section title="Durations & easing">
        <div className="divide-y divide-border font-mono text-xs">
          {[
            ["--duration-fast", "120ms", "hover, color"],
            ["--duration-base", "240ms", "indicators, small moves"],
            ["--duration-slow", "400ms", "panels, overlays"],
            ["--ease-out", "cubic-bezier(.2,.8,.25,1)", "default"],
            ["--ease-in-out", "cubic-bezier(.65,0,.35,1)", "things that leave and return"],
          ].map(([t, v, use]) => (
            <div key={t} className="grid grid-cols-3 gap-4 py-2">
              <span>{t}</span>
              <span className="text-muted-foreground">{v}</span>
              <span className="text-muted-foreground">{use}</span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}

export const Focus: Story = {
  render: () => (
    <Page>
      <Section title="Focus" note="Press Tab. The outline comes from stellify-base's base layer; components must not add a ring or halo of their own.">
        <div className="flex flex-wrap gap-3">
          {["Primero", "Segundo", "Tercero"].map((l) => (
            <button key={l} type="button" className="rounded-[var(--radius-control)] bg-surface-3 px-3.5 py-1.5 text-sm font-medium">
              {l}
            </button>
          ))}
          <input className="rounded-[var(--radius-control)] bg-field px-2.5 py-1.5 text-sm" placeholder="Campo relleno" />
        </div>
      </Section>
    </Page>
  ),
}
