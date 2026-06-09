import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "@stellify/button"

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "base",
        "destructive",
        "success",
        "warning",
        "info",
        "link",
      ],
    },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
    mode: { control: "select", options: [undefined, "create", "edit", "finish"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { children: "Button" },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Hierarchy: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="base">Base</Button>
    </div>
  ),
}

export const Semantic: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="info">Info</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const Modes: Story = {
  name: "CRUD modes",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button mode="create">New expense</Button>
      <Button mode="edit">Edit</Button>
      <Button mode="finish">Finish</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const Loading: Story = {
  args: { loading: true, children: "Saving…" },
}

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
}
