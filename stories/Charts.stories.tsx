import type { Meta, StoryObj } from "@storybook/react-vite"
import AreaChart from "@stellify/chart-area"
import BarChart from "@stellify/chart-bar"
import LineChart from "@stellify/chart-line"
import PieChart from "@stellify/chart-pie"
import RadarChart from "@stellify/chart-radar"
import RadialChart from "@stellify/chart-radial"

/**
 * Charts vendored from shadcn/ui, re-themed with the stellify-base `--chart-*`
 * tokens. Each ships demo data inside its file — edit freely. Add `radial-stacked`,
 * `pie-interactive`, etc. as more items when needed.
 */
const meta = {
  title: "Charts/Gallery",
  parameters: { layout: "centered" },
} satisfies Meta

export default meta
type Story = StoryObj

const frame = (node: React.ReactNode) => <div className="w-[440px]">{node}</div>

export const Area: Story = { render: () => frame(<AreaChart />) }
export const Bar: Story = { render: () => frame(<BarChart />) }
export const Line: Story = { render: () => frame(<LineChart />) }
export const Pie: Story = { render: () => frame(<PieChart />) }
export const Radar: Story = { render: () => frame(<RadarChart />) }
export const Radial: Story = { render: () => frame(<RadialChart />) }
