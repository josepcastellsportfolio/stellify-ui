import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Cloud, Cpu, Terminal } from "lucide-react"
import { ModelPicker, type ModelGroup, type ModelOption } from "@stellify/model-picker"

/**
 * Pick a model by where it runs. Search ranks a name's prefix above a word
 * start above a substring; ← from an empty caret goes to the rail, ↑/↓ move
 * through groups, → comes back. Alt+1…9 jump to the first nine models you can
 * pick in the current view. Unavailable models stay in the list with their
 * reason. On a touch or narrow screen it opens as a bottom sheet.
 */
const meta = {
  title: "Blocks/Chat/ModelPicker",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

const GROUPS: ModelGroup[] = [
  { id: "api", label: "API en la nube", icon: Cloud, status: { state: "ok" } },
  { id: "cli", label: "Agente local", icon: Terminal },
  { id: "gpu", label: "Servidor con GPU", icon: Cpu, status: { state: "ok" } },
]

const MODELS: ModelOption[] = [
  { key: "sonnet", label: "Sonnet", group: "api", available: true, badges: ["voz"], context: 200_000, vision: true, tools: true, speedTps: 64 },
  { key: "haiku", label: "Haiku", group: "api", available: true, badges: ["voz"], context: 200_000, vision: true, tools: true, speedTps: 128 },
  { key: "agent", label: "Agente con repositorios", group: "cli", available: true, tools: true, speedTps: null },
  { key: "qwen", label: "Qwen3 8B", group: "gpu", private: true, available: true, context: 16_384, tools: true, speedTps: 41.6 },
  { key: "gemma", label: "Gemma 4 E4B", group: "gpu", private: true, available: true, context: 32_768, vision: true, speedTps: 23 },
]

function Picker({
  groups = GROUPS,
  models = MODELS,
  presentation,
  initialFavorites = ["qwen"],
}: {
  groups?: ModelGroup[]
  models?: ModelOption[]
  presentation?: "auto" | "popover" | "sheet"
  initialFavorites?: string[]
}) {
  const [value, setValue] = useState("sonnet")
  const [favorites, setFavorites] = useState(initialFavorites)
  return (
    <div className="flex max-w-xl items-center gap-2 rounded-lg bg-surface-2 p-2">
      <ModelPicker
        groups={groups}
        models={models}
        value={value}
        onValueChange={setValue}
        favorites={favorites}
        onToggleFavorite={(key) => setFavorites((f) => (f.includes(key) ? f.filter((k) => k !== key) : [...f, key]))}
        presentation={presentation}
      />
      <span className="text-xs text-muted-foreground">en el compositor</span>
    </div>
  )
}

export const Default: Story = { render: () => <Picker /> }

export const ServerOff: Story = {
  name: "Group off (models listed, not selectable)",
  render: () => (
    <Picker
      groups={GROUPS.map((g) => (g.id === "gpu" ? { ...g, status: { state: "off", reason: "El servidor no responde" } } : g))}
      models={MODELS.map((m) => (m.group === "gpu" ? { ...m, available: false, reason: "Servidor apagado", speedTps: null } : m))}
    />
  ),
}

export const ServerBusy: Story = {
  name: "Group busy (selectable, with a notice)",
  render: () => (
    <Picker
      groups={GROUPS.map((g) =>
        g.id === "gpu" ? { ...g, status: { state: "busy", reason: "Está respondiendo a otra aplicación" } } : g
      )}
    />
  ),
}

export const Limited: Story = {
  render: () => (
    <Picker
      groups={GROUPS.map((g) => (g.id === "api" ? { ...g, status: { state: "limited", reason: "Sin clave de API: solo modelos locales" } } : g))}
      models={MODELS.map((m) => (m.group === "api" ? { ...m, available: false, reason: "Falta la clave de API" } : m))}
    />
  ),
}

export const NoMeasurements: Story = {
  name: "No speed measured",
  render: () => <Picker models={MODELS.map((m) => ({ ...m, speedTps: null }))} initialFavorites={[]} />,
}

export const BottomSheet: Story = {
  name: "Bottom sheet (touch)",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <Picker presentation="sheet" />,
}
