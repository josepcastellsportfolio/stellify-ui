import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { ChoiceCard, ChoiceCardGroup } from "@stellify/choice-card"

/**
 * Block options for a single choice. `featured` is Von Restorff: among similar
 * options, the one that differs is the one people notice. Use it once per
 * group, for the option you recommend, and pair it with a sensible default
 * selection (default effect).
 */
const meta = {
  title: "UI/ChoiceCard",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

export const Default: Story = {
  render: function Render() {
    const [v, setV] = useState("no")
    return (
      <ChoiceCardGroup aria-label="Cámara" value={v} onValueChange={setV} className="max-w-md">
        <ChoiceCard value="yes" title="Sí, sin problema" description="Vídeo a cámara." />
        <ChoiceCard value="no" title="Prefiero no aparecer" description="Voz en off y texto." />
      </ChoiceCardGroup>
    )
  },
}

export const FeaturedPlan: Story = {
  name: "Featured (Von Restorff)",
  render: function Render() {
    const [v, setV] = useState("pro")
    return (
      <ChoiceCardGroup aria-label="Plan" value={v} onValueChange={setV} className="max-w-2xl sm:grid-cols-3">
        <ChoiceCard value="basic" title="Básico" description="9 € / mes" />
        <ChoiceCard value="pro" title="Pro" description="19 € / mes" featured badge="Recomendado" />
        <ChoiceCard value="team" title="Equipo" description="49 € / mes" />
      </ChoiceCardGroup>
    )
  },
}
