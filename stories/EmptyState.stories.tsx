import type { Meta, StoryObj } from "@storybook/react-vite"
import { Receipt } from "lucide-react"
import { Button } from "@stellify/button"
import { EmptyState } from "@stellify/empty-state"

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    icon: Receipt,
    title: "No expenses this month",
    description: "Add your first expense to start tracking your finances.",
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithAction: Story = {
  args: {
    action: <Button mode="create">New expense</Button>,
  },
}
