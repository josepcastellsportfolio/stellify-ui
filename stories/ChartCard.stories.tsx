import type { Meta, StoryObj } from "@storybook/react-vite"
import { BarChart3 } from "lucide-react"
import { ChartCard } from "@stellify/chart-card"

const meta = {
  title: "Components/ChartCard",
  component: ChartCard,
  tags: ["autodocs"],
  args: { title: "Monthly spend" },
} satisfies Meta<typeof ChartCard>

export default meta
type Story = StoryObj<typeof meta>

// A trivial inline "chart" stand-in so the story has no chart-lib dependency.
const FakeChart = () => (
  <div className="flex h-[200px] items-end gap-2">
    {[40, 70, 55, 90, 60, 80].map((h, i) => (
      <div
        key={i}
        className="flex-1 rounded-t bg-primary/70"
        style={{ height: `${h}%` }}
      />
    ))}
  </div>
)

export const WithChart: Story = {
  render: (args) => (
    <ChartCard {...args}>
      <FakeChart />
    </ChartCard>
  ),
}

export const Loading: Story = { args: { loading: true } }

export const Empty: Story = {
  args: {
    empty: true,
    emptyIcon: BarChart3,
    emptyTitle: "No data yet",
    emptyDescription: "Add expenses to see this chart.",
  },
}

export const ErrorState: Story = {
  name: "Error",
  args: {
    error: true,
    errorTitle: "Could not load chart",
    errorDescription: "Something went wrong fetching the data.",
    onRetry: () => alert("retry"),
    retryLabel: "Retry",
  },
}
