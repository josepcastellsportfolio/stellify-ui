import type { Meta, StoryObj } from "@storybook/react-vite"
import { AlertTriangle, Receipt, Target, TrendingDown, TrendingUp, Wallet } from "lucide-react"
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

export const CompactRow: Story = {
  name: "Compact (dense KPI row, hint + tone)",
  render: () => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <MetricCard size="compact" label="Saldo mínimo" value="−1.250 €" hint="mar 2027" tone="negative" accent="rose" icon={TrendingDown} />
      <MetricCard size="compact" label="Meses en negativo" value="3 / 24" tone="negative" accent="rose" icon={AlertTriangle} />
      <MetricCard size="compact" label="Facturación necesaria" value="2.400 €/mes" hint="para no bajar de 0" accent="slate" icon={Target} />
      <MetricCard size="compact" label="Saldo final" value="8.900 €" tone="positive" accent="emerald" icon={Wallet} />
    </div>
  ),
}
