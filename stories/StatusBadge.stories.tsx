import type { Meta, StoryObj } from "@storybook/react-vite"
import { StatusBadge } from "@stellify/status-badge"

const meta = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["success", "warning", "danger", "info", "neutral"],
    },
    withDot: { control: "boolean" },
  },
  args: { children: "Active", status: "success" },
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status="success" withDot>Paid</StatusBadge>
      <StatusBadge status="warning" withDot>Pending</StatusBadge>
      <StatusBadge status="danger" withDot>Overdue</StatusBadge>
      <StatusBadge status="info" withDot>Scheduled</StatusBadge>
      <StatusBadge status="neutral" withDot>Draft</StatusBadge>
    </div>
  ),
}
