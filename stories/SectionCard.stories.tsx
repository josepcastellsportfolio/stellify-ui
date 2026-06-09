import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "@stellify/button"
import { SectionCard } from "@stellify/section-card"

const meta = {
  title: "Components/SectionCard",
  component: SectionCard,
  tags: ["autodocs"],
  args: {
    title: "Budgets",
    description: "Your monthly budget allocation.",
    children: (
      <p className="text-sm text-muted-foreground">
        Budget content goes here.
      </p>
    ),
  },
} satisfies Meta<typeof SectionCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithActions: Story = {
  args: {
    title: "Recurring expenses",
    actions: <Button mode="create" size="sm">Add</Button>,
    children: (
      <p className="text-sm text-muted-foreground">List of recurring items…</p>
    ),
  },
}
