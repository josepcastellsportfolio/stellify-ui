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
/** Cognitive load: each line is named where it ends, no legend to decode. */
export const LineDirectLabels: Story = {
  name: "Line, direct labels",
  render: () =>
    frame(
      <LineChart
        title="Visitas por plataforma"
        description="Últimos 6 meses"
        directLabels
        dashes={{ ios: "6 4", android: "2 3" }}
        data={[
          { month: "January", web: 186, ios: 80, android: 40 },
          { month: "February", web: 305, ios: 120, android: 70 },
          { month: "March", web: 237, ios: 150, android: 95 },
          { month: "April", web: 273, ios: 190, android: 110 },
          { month: "May", web: 309, ios: 210, android: 120 },
          { month: "June", web: 344, ios: 240, android: 132 },
        ]}
        config={{
          web: { label: "Web", color: "var(--chart-1)" },
          ios: { label: "iOS", color: "var(--chart-2)" },
          android: { label: "Android", color: "var(--chart-3)" },
        }}
      />
    ),
}
export const Pie: Story = { render: () => frame(<PieChart />) }
export const Radar: Story = { render: () => frame(<RadarChart />) }
export const Radial: Story = { render: () => frame(<RadialChart />) }
