import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Chip } from "@stellify/chip"

const meta = { title: "Components/Chip", component: Chip, args: { children: "Sin página web" } } satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const ReadOnly: Story = {}

export const Removable: Story = {
  render: () => {
    const [topics, setTopics] = useState(["Reservas por WhatsApp", "Atención fuera de horario", "Casos de uso"])
    return (
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <Chip key={t} onRemove={() => setTopics(topics.filter((x) => x !== t))}>
            {t}
          </Chip>
        ))}
      </div>
    )
  },
}
