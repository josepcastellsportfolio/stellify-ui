import type { Meta, StoryObj } from "@storybook/react-vite"
import { Wallet, TrendingUp, Receipt, PiggyBank, CreditCard } from "lucide-react"
import { Carousel } from "@stellify/carousel"
import { MetricCard } from "@stellify/metric-card"

interface Kpi {
  id: number
  label: string
  value: string
  unit: string
  accent: "emerald" | "teal" | "rose" | "sky" | "violet"
  icon: typeof Wallet
}

const KPIS: Kpi[] = [
  { id: 1, label: "Balance", value: "1.234", unit: "EUR", accent: "emerald", icon: Wallet },
  { id: 2, label: "Revenue", value: "8.420", unit: "EUR", accent: "teal", icon: TrendingUp },
  { id: 3, label: "Spend", value: "2.310", unit: "EUR", accent: "rose", icon: Receipt },
  { id: 4, label: "Savings", value: "640", unit: "EUR", accent: "sky", icon: PiggyBank },
  { id: 5, label: "Cards", value: "3", unit: "", accent: "violet", icon: CreditCard },
]

const meta = {
  title: "Components/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Carousel<Kpi>>

export default meta
type Story = StoryObj<typeof meta>

export const KpiCards: Story = {
  name: "KPI cards (autoplay)",
  render: () => (
    <Carousel
      items={KPIS}
      getItemKey={(k) => k.id}
      cardsPerView={{ base: 1, md: 2, lg: 3 }}
      ariaLabel="KPI carousel"
      renderItem={(k) => (
        <MetricCard label={k.label} value={k.value} unit={k.unit} accent={k.accent} icon={k.icon} />
      )}
    />
  ),
}

export const NoAutoplay: Story = {
  render: () => (
    <Carousel
      items={KPIS}
      getItemKey={(k) => k.id}
      autoPlay={false}
      cardsPerView={{ base: 1, md: 2, lg: 2 }}
      renderItem={(k) => (
        <MetricCard label={k.label} value={k.value} unit={k.unit} accent={k.accent} icon={k.icon} />
      )}
    />
  ),
}
