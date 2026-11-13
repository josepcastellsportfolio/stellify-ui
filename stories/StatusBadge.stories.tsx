import type { Meta, StoryObj } from "@storybook/react-vite"
import { Check } from "lucide-react"
import { StatusBadge } from "@stellify/status-badge"
import { Badge } from "@stellify/badge"

const meta = {
  title: "UI/Badge & status",
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

const TONES = ["neutral", "brand", "success", "warning", "danger", "info"] as const

/** `Badge` is the one component: tone x appearance. StatusBadge is a Badge whose tone is a status. */
export const ToneByAppearance: Story = {
  name: "Badge: tone x appearance",
  render: () => (
    <div className="space-y-3">
      {(["subtle", "solid", "plain"] as const).map((appearance) => (
        <div key={appearance} className="flex flex-wrap items-center gap-2">
          <span className="w-14 font-mono text-[11px] text-muted-foreground">{appearance}</span>
          {TONES.map((tone) => (
            <Badge key={tone} tone={tone} appearance={appearance} icon={appearance === "plain" ? Check : undefined}>
              {tone}
            </Badge>
          ))}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="w-14 font-mono text-[11px] text-muted-foreground">xs caps</span>
        <Badge size="xs" uppercase tone="brand">Tu vía</Badge>
        <Badge size="xs" uppercase>Beta</Badge>
      </div>
    </div>
  ),
}
