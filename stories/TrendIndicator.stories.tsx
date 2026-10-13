import type { Meta, StoryObj } from "@storybook/react-vite"
import { TrendIndicator } from "@stellify/trend-indicator"

const meta = {
  title: "Components/TrendIndicator",
  component: TrendIndicator,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { direction: "up", value: "+12%", label: "Trend: up 12%" },
} satisfies Meta<typeof TrendIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Up: Story = {}

export const Down: Story = {
  args: { direction: "down", value: "−8%", label: "Trend: down 8%" },
}

/** Direction derived from a numeric change: |change| ≤ flatThreshold is flat. */
export const FlatFromChange: Story = {
  args: { direction: undefined, change: 0.01, flatThreshold: 0.05, value: "+1%", label: "Trend: stable" },
}

/** For costs, going up is bad: `inverted` swaps the tones. */
export const InvertedCost: Story = {
  args: { direction: "up", inverted: true, value: "+20%", label: "Cost: up 20%" },
}

/** The three directions side by side, as in a ranking column. */
export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <TrendIndicator change={12} flatThreshold={2} value="+12%" label="Trend: up 12%" />
      <TrendIndicator change={-8} flatThreshold={2} value="−8%" label="Trend: down 8%" />
      <TrendIndicator change={1} flatThreshold={2} value="+1%" label="Trend: stable" />
    </div>
  ),
}
