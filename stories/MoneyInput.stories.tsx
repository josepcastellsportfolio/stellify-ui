import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { MoneyInput } from "@stellify/money-input"

const meta = {
  title: "Components/MoneyInput",
  component: MoneyInput,
  tags: ["autodocs"],
} satisfies Meta<typeof MoneyInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(42.5)
    return (
      <div className="max-w-xs space-y-2">
        <MoneyInput value={value} onChange={setValue} />
        <p className="text-sm text-muted-foreground">value: {String(value)}</p>
      </div>
    )
  },
}

export const TrailingSymbol: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(null)
    return (
      <div className="max-w-xs">
        <MoneyInput
          value={value}
          onChange={setValue}
          symbol="USD"
          symbolPosition="trailing"
          placeholder="0.00"
        />
      </div>
    )
  },
}
