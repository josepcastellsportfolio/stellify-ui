import type { Meta, StoryObj } from "@storybook/react-vite"
import { Page, Section } from "./Swatch"

/**
 * Two radii and one shadow. Controls are 4px, containers 8px; the pill is
 * reserved for chips and the segmented control. Nothing in the page flow casts
 * a shadow: only things that float over it (popover, menu, dialog, tooltip).
 */
const meta = {
  title: "Foundations/Shape & elevation",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

export const Radii: Story = {
  render: () => (
    <Page>
      <Section title="Radius" note="Tailwind's rounded-sm / rounded-md map to 4px, rounded-lg / rounded-xl to 8px.">
        <div className="flex flex-wrap items-end gap-6">
          {[
            ["--radius-control", "4px · controls", "h-10 w-24 rounded-[var(--radius-control)]"],
            ["--radius-container", "8px · containers", "h-20 w-32 rounded-[var(--radius-container)]"],
            ["--radius-pill", "pill · chip, segmented", "h-8 w-28 rounded-[var(--radius-pill)]"],
          ].map(([token, label, cls]) => (
            <div key={token}>
              <div className={`bg-surface-3 ${cls}`} />
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">{token}</p>
              <p className="text-xs">{label}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Hairline" note="1px of low-contrast ink, only between rows and sections. Never around a box.">
        <div className="divide-y divide-border rounded-[var(--radius-container)] bg-surface-2 px-4 text-sm">
          {["Fila uno", "Fila dos", "Fila tres"].map((r) => (
            <div key={r} className="py-2.5">{r}</div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}

export const Overlay: Story = {
  render: () => (
    <Page>
      <Section title="--shadow-overlay" note="The only shadow. Overlays sit on surface-overlay: the page tone in light mode, one step up in dark.">
        <div className="relative h-48 rounded-[var(--radius-container)] bg-surface-2 p-4">
          <div className="absolute left-8 top-10 w-56 rounded-[var(--radius-container)] bg-popover p-1 text-sm text-popover-foreground shadow-(--shadow-overlay)">
            {["Editar", "Duplicar", "Archivar"].map((item, i) => (
              <div key={item} className={`flex justify-between rounded-[var(--radius-control)] px-2.5 py-1.5 ${i === 0 ? "bg-accent" : ""}`}>
                {item}
                <kbd className="font-mono text-[11px] text-muted-foreground">⌘{i + 1}</kbd>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </Page>
  ),
}
