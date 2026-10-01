import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Wallet } from "lucide-react"
import { KpiCard } from "@stellify/kpi-card"
import { VatToggle } from "@stellify/vat-toggle"

const meta = { title: "Finance/KpiCard", component: KpiCard, args: { label: "Gastado este mes", value: "8,20 €" } } satisfies Meta<typeof KpiCard>

export default meta
type Story = StoryObj<typeof meta>

export const Plain: Story = {}

export const WithCapProgress: Story = {
  args: { icon: Wallet, hint: "de 10,00 € de tope", progress: 82, tone: "warning" },
}

export const Row: Story = {
  render: () => {
    const [withVat, setWithVat] = useState(false)
    return (
      <div className="flex flex-col gap-3">
        <VatToggle withVat={withVat} onChange={setWithVat} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Gastado este mes" value={withVat ? "9,92 €" : "8,20 €"} progress={82} />
          <KpiCard label="Coste medio por búsqueda" value="0,74 €" />
          <KpiCard label="CAC medio" value="41,10 €" />
          <KpiCard label="Payback" value="No recupera" tone="danger" />
        </div>
      </div>
    )
  },
}
