import type { Meta, StoryObj } from "@storybook/react-vite"
import { Wallet, TrendingUp, Receipt } from "lucide-react"
import { MetricCard } from "@stellify/metric-card"

const meta = {
  title: "Components/MetricCard",
  component: MetricCard,
  tags: ["autodocs"],
  args: {
    label: "Total balance",
    value: "1.234,50",
    unit: "EUR",
    accent: "emerald",
    icon: Wallet,
  },
} satisfies Meta<typeof MetricCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const PositiveDelta: Story = {
  args: {
    label: "Revenue",
    value: "8.420",
    unit: "EUR",
    icon: TrendingUp,
    delta: { value: "+12%", positive: true },
  },
}

export const InvertedDelta: Story = {
  name: "Inverted delta (expenses)",
  args: {
    label: "Monthly spend",
    value: "2.310",
    unit: "EUR",
    icon: Receipt,
    accent: "rose",
    invertDelta: true,
    delta: { value: "+8%", positive: true },
  },
}

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard label="Balance" value="1.234" unit="EUR" accent="emerald" icon={Wallet} delta={{ value: "+5%", positive: true }} />
      <MetricCard label="Spend" value="980" unit="EUR" accent="rose" icon={Receipt} invertDelta delta={{ value: "+3%", positive: true }} />
      <MetricCard label="Revenue" value="8.420" unit="EUR" accent="teal" icon={TrendingUp} delta={{ value: "-2%", positive: false }} />
    </div>
  ),
}
