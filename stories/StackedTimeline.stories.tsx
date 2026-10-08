import type { Meta, StoryObj } from "@storybook/react-vite"
import { StackedTimeline } from "@stellify/stacked-timeline"

const SERIES = [
  { key: "api", label: "API", color: "var(--chart-1)" },
  { key: "infra", label: "Infra", color: "var(--chart-2)" },
  { key: "fijo", label: "Fijos", color: "var(--chart-3)" },
  { key: "tiempo", label: "Tiempo", color: "var(--muted-foreground)", countsTowardsCap: false },
]

const days = Array.from({ length: 30 }, (_, i) => ({
  label: String(i + 1).padStart(2, "0"),
  fullLabel: `${String(i + 1).padStart(2, "0")}/09/2026`,
  values: { api: (i % 5) * 0.08, infra: 0.21, fijo: i === 0 ? 12 : 0, tiempo: i % 7 === 2 ? 0.9 : 0 },
}))

const meta = {
  title: "Finance/StackedTimeline",
  component: StackedTimeline,
  args: {
    title: "Gasto de septiembre",
    series: SERIES,
    data: days,
    capLine: 0.5,
    capLabel: "Tope (ritmo diario)",
    formatValue: (v: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v),
  },
} satisfies Meta<typeof StackedTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const Month: Story = {}

export const Year: Story = {
  args: {
    data: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep"].map((label, i) => ({
      label,
      values: { api: 1 + i * 0.4, infra: 6.2, fijo: 12, tiempo: i * 2 },
    })),
    capLine: 25,
    capLabel: "Tope mensual",
  },
}

export const Empty: Story = { args: { data: [] } }
