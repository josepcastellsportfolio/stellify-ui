import type { Meta, StoryObj } from "@storybook/react-vite"
import { ShareButton } from "@stellify/share-button"

const meta = {
  title: "Marketing/ShareButton",
  component: ShareButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Opens the OS share sheet where `navigator.share` exists (most mobile browsers); otherwise the fallback menu shown here.",
      },
    },
  },
  args: {
    url: "https://stellifyit.com/articles/web-a-medida",
    title: "Cuándo merece la pena una web a medida",
    text: "Una guía corta para decidir entre plantilla y desarrollo propio.",
  },
} satisfies Meta<typeof ShareButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomLabel: Story = { args: { label: "Compartir artículo" } }
