import type { Meta, StoryObj } from "@storybook/react-vite"
import { fn } from "storybook/test"
import { Button } from "@stellify/button"
import { ConfirmDialog } from "@stellify/confirm-dialog"

const meta = {
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  args: {
    trigger: <Button variant="secondary">Open dialog</Button>,
    title: "Save changes?",
    description: "Your changes will be applied immediately.",
    confirmLabel: "Save",
    onConfirm: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Destructive: Story = {
  args: {
    trigger: <Button variant="destructive">Delete expense</Button>,
    title: "Delete this expense?",
    description: "This action cannot be undone.",
    confirmLabel: "Delete",
    destructive: true,
  },
}
