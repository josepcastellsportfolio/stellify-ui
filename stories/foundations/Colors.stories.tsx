import type { Meta, StoryObj } from "@storybook/react-vite"
import { Page, Section, Swatch } from "./Swatch"

/**
 * Color tokens from `stellify-base`. Containers are told apart by tone, not by
 * borders: surface-1 is the page, surface-2 a raised area (card, field),
 * surface-3 its hover or selected state. Status hues are their own, separate
 * from the brand, and always ship with an icon or a label.
 */
const meta = {
  title: "Foundations/Colors",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

const STATUS = ["success", "warning", "danger", "info"] as const

export const Surfaces: Story = {
  render: () => (
    <Page>
      <Section title="Surfaces" note="Each layer is one step of tone. Nest at most two: a field on a card uses surface-3.">
        <div className="rounded-[var(--radius-container)] bg-surface-1 p-4">
          <p className="mb-3 font-mono text-[11px] text-muted-foreground">surface-1 · page</p>
          <div className="rounded-[var(--radius-container)] bg-surface-2 p-4">
            <p className="mb-3 font-mono text-[11px] text-muted-foreground">surface-2 · card, field</p>
            <div className="rounded-[var(--radius-control)] bg-surface-3 p-3 font-mono text-[11px] text-muted-foreground">
              surface-3 · hover, selected
            </div>
          </div>
        </div>
      </Section>
      <Section title="Ink">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Swatch token="surface-2" label="foreground" ink="foreground" />
          <Swatch token="surface-2" label="muted-foreground" ink="muted-foreground" />
          <Swatch token="hairline" label="hairline" />
          <Swatch token="focus" label="focus" ink="background" />
        </div>
      </Section>
    </Page>
  ),
}

export const BrandAndStatus: Story = {
  name: "Brand & status",
  render: () => (
    <Page>
      <Section title="Brand" note="The one token a product overrides. Set --brand, --brand-foreground and --brand-subtle in both :root and .dark.">
        <div className="grid grid-cols-3 gap-3">
          <Swatch token="brand" ink="brand-foreground" />
          <Swatch token="brand-subtle" ink="brand" />
          <Swatch token="brand-foreground" ink="brand" />
        </div>
      </Section>
      <Section title="Status" note="X is the strong tone: text on X-subtle, or a solid fill under X-foreground. All pairs clear 4.5:1 (tests/tokens.test.ts).">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS.map((s) => (
            <div key={s} className="space-y-2">
              <Swatch token={s} label={s} ink={`${s}-foreground`} />
              <Swatch token={`${s}-subtle`} label={s} ink={s} />
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}

function ChartRow() {
  return (
    <div className="grid grid-cols-5 gap-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <Swatch key={n} token={`chart-${n}`} label={String(n)} ink="surface-1" />
      ))}
    </div>
  )
}

export const Charts: Story = {
  render: () => (
    <Page>
      <Section
        title="Categorical"
        note="Assign in this order, never cycled; slot 1 is the brand hue. A sixth series folds into “Other”. Validated for colour-blind separation and 3:1 against the page in both modes."
      >
        <ChartRow />
      </Section>
      <Section title="Monochrome" note={<>Set <code className="font-mono">data-chart-palette="mono"</code> on any ancestor for a single brand ramp.</>}>
        <div data-chart-palette="mono">
          <ChartRow />
        </div>
      </Section>
    </Page>
  ),
}
