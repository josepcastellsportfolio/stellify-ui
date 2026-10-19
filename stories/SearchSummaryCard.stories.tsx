import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { SearchSummaryCard } from "@stellify/search-summary-card"

const meta: Meta<typeof SearchSummaryCard> = {
  title: "Búsquedas/SearchSummaryCard",
  component: SearchSummaryCard,
  parameters: { layout: "padded" },
  render: (args) => {
    const [open, setOpen] = useState(args.open)
    return (
      <SearchSummaryCard {...args} open={open} onOpenChange={setOpen}>
        <ul className="divide-y divide-border text-sm">
          <li className="py-2">Clínica Dental Sant Pere · info@dentalsantpere.cat</li>
          <li className="py-2">Dentalia Serrallo · Sin buscar</li>
          <li className="py-2">Centre Odontològic Llevant · No encontrado en su web</li>
        </ul>
      </SearchSummaryCard>
    )
  },
}

export default meta
type Story = StoryObj<typeof SearchSummaryCard>

/** Ring = share of businesses with an email; the centre is the total found. */
export const Closed: Story = {
  args: {
    title: "Clínicas dentales · Tarragona",
    meta: "8 oct 2026 · Agente de reservas por WhatsApp · catalán",
    total: 20,
    withEmail: 9,
    summary: "9 con email · 4 borradores · 2 contactados",
    open: false,
  },
}

export const Open: Story = { args: { ...Closed.args, open: true } }

/** A search with no business found: empty ring. */
export const Empty: Story = {
  args: { ...Closed.args, title: "Talleres mecánicos · Vinaròs", total: 0, withEmail: 0, summary: "0 con email" },
}
