import type { Meta, StoryObj } from "@storybook/react-vite"
import { CurrencyDisplay } from "@stellify/currency-display"

const meta = {
  title: "Components/CurrencyDisplay",
  component: CurrencyDisplay,
  tags: ["autodocs"],
  args: { value: 1234.5, currency: "EUR", locale: "es-ES" },
} satisfies Meta<typeof CurrencyDisplay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Locales: Story = {
  render: () => (
    <div className="space-y-1 text-sm">
      <div><CurrencyDisplay value={1234.5} currency="EUR" locale="es-ES" /> — es-ES / EUR</div>
      <div><CurrencyDisplay value={1234.5} currency="USD" locale="en-US" /> — en-US / USD</div>
      <div><CurrencyDisplay value={1234.5} currency="GBP" locale="en-GB" /> — en-GB / GBP</div>
    </div>
  ),
}

export const ColorBySign: Story = {
  render: () => (
    <div className="space-x-4">
      <CurrencyDisplay value={420.5} colorBySign />
      <CurrencyDisplay value={-180.25} colorBySign />
    </div>
  ),
}
