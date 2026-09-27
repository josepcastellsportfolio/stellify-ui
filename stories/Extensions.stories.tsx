import type { Meta, StoryObj } from "@storybook/react-vite"
import { Sparkles } from "lucide-react"
import { Badge } from "@stellify/badge"
import { Progress } from "@stellify/progress"
import { Textarea } from "@stellify/textarea"

const meta = { title: "Components/Extensions (progress, badge, textarea)", parameters: { layout: "padded" } } satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ProgressSizes: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <Progress value={87.5} aria-label="default" />
      <Progress value={87.5} size="sm" aria-label="sm" />
    </div>
  ),
}

export const BadgeTuVia: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge>Default</Badge>
      <Badge size="xs" uppercase>
        <Sparkles />
        Tu vía
      </Badge>
    </div>
  ),
}

export const TextareaAutoResize: Story = {
  render: () => <Textarea className="w-96" autoResize placeholder="Escribe varias líneas…" />,
}
