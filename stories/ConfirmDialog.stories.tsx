import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "@stellify/button"
import { ConfirmDialog } from "@stellify/confirm-dialog"

const meta = {
  title: "UI/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
} satisfies Meta<typeof ConfirmDialog>

export default meta
// Stories render their own dialog, so they set no args.
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <ConfirmDialog
      trigger={<Button variant="secondary">Open dialog</Button>}
      title="Save changes?"
      description="Your changes will be applied immediately."
      labels={{ confirm: "Save" }}
      onConfirm={() => alert("confirmed")}
    />
  ),
}

export const Destructive: Story = {
  render: () => (
    <ConfirmDialog
      trigger={<Button variant="destructive">Delete expense</Button>}
      title="Delete this expense?"
      description="This action cannot be undone."
      labels={{ confirm: "Delete" }}
      destructive
      onConfirm={() => alert("deleted")}
    />
  ),
}
