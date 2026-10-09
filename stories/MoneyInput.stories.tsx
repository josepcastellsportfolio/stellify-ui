import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { fn } from "storybook/test"
import { MoneyInput } from "@stellify/money-input"

const meta = {
  title: "Components/MoneyInput",
  component: MoneyInput,
  tags: ["autodocs"],
  args: { value: 42.5, onChange: fn() },
  // Controlled component: keep the typed value in local state, seeded from args.
  render: function Render(args) {
    const [value, setValue] = useState<number | null | undefined>(args.value)
    return (
      <div className="max-w-xs space-y-2">
        <MoneyInput
          {...args}
          value={value}
          onChange={(next) => {
            setValue(next)
            args.onChange(next)
          }}
        />
        <p className="text-sm text-muted-foreground">value: {String(value)}</p>
      </div>
    )
  },
} satisfies Meta<typeof MoneyInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TrailingSymbol: Story = {
  args: { value: null, symbol: "USD", symbolPosition: "trailing", placeholder: "0.00" },
}
