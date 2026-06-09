import type { Meta, StoryObj } from "@storybook/react-vite"
import { ProgressRing } from "@stellify/progress-ring"

const meta = {
  title: "Components/ProgressRing",
  component: ProgressRing,
  tags: ["autodocs"],
  args: { value: 65, max: 100, size: 96, strokeWidth: 8 },
} satisfies Meta<typeof ProgressRing>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomContent: Story = {
  args: {
    value: 3,
    max: 5,
    children: (
      <span className="text-center text-xs leading-tight">
        3<br />of 5
      </span>
    ),
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <ProgressRing value={25} size={64} strokeWidth={6} />
      <ProgressRing value={50} size={96} strokeWidth={8} />
      <ProgressRing value={90} size={128} strokeWidth={10} />
    </div>
  ),
}
