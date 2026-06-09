import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "@stellify/button"
import { PageHeader } from "@stellify/page-header"

const meta = {
  title: "Components/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  args: {
    title: "Expenses",
    description: "Track and categorize your monthly spending.",
  },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithActions: Story = {
  args: {
    title: "Projects",
    description: "All your active projects.",
    actions: <Button mode="create">New project</Button>,
  },
}
