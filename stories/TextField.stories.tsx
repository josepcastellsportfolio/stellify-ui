import type { Meta, StoryObj } from "@storybook/react-vite"
import { Mail, Search } from "lucide-react"
import { TextField } from "@stellify/text-field"

const meta = {
  title: "Components/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: { label: "Email", placeholder: "you@example.com" },
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Required: Story = {
  args: { label: "Email", required: true, helperText: "We'll never share it." },
}

export const WithError: Story = {
  args: { label: "Email", defaultValue: "nope", error: "Invalid email address" },
}

export const WithIcons: Story = {
  render: () => (
    <div className="max-w-sm space-y-4">
      <TextField label="Email" leadingIcon={Mail} placeholder="you@example.com" />
      <TextField label="Search" trailingIcon={Search} placeholder="Search…" />
    </div>
  ),
}
