import type { Meta, StoryObj } from "@storybook/react-vite"
import { Page, Section } from "./Swatch"

/**
 * Inter for interface and headings (negative tracking on display sizes);
 * Geist Mono with tabular figures for numbers, metadata and code. Both are
 * self-hosted by the consumer (`@fontsource-variable/*`).
 */
const meta = {
  title: "Foundations/Typography",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

const SCALE = [
  { cls: "text-4xl font-semibold tracking-[var(--tracking-display)]", name: "Display · 36/600" },
  { cls: "text-2xl font-semibold tracking-[var(--tracking-display)]", name: "Title · 24/600" },
  { cls: "text-lg font-semibold tracking-tight", name: "Heading · 18/600" },
  { cls: "text-sm", name: "Body · 14/400" },
  { cls: "text-xs text-muted-foreground", name: "Caption · 12/400" },
]

export const Scale: Story = {
  render: () => (
    <Page>
      <Section title="Inter">
        <div className="divide-y divide-border">
          {SCALE.map((s) => (
            <div key={s.name} className="flex items-baseline justify-between gap-6 py-3">
              <p className={s.cls}>Datos claros, decisiones rápidas</p>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Geist Mono" note="Numbers line up because the figures are tabular. Use font-mono tabular-nums for any column of figures.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-container)] bg-surface-2 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[var(--tracking-mono-caps)] text-muted-foreground">Ingresos</p>
            <p className="mt-1 font-mono text-2xl font-medium tabular-nums tracking-tight">48.210,00 €</p>
            <p className="font-mono text-xs tabular-nums text-success">+12,4 %</p>
          </div>
          <pre className="rounded-[var(--radius-container)] bg-surface-2 p-4 font-mono text-xs leading-relaxed tabular-nums">
            {"1.204,50\n  311,08\n9.870,00"}
          </pre>
        </div>
      </Section>
    </Page>
  ),
}
