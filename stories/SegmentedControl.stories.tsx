import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { SegmentedControl } from "@stellify/segmented-control"
import { TimeRangeSelector, type TimeRange as Range } from "@stellify/time-range-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@stellify/tabs"

/**
 * Pick one of 2-5 options. The indicator slides with a CSS transition, so a
 * new click mid-move changes its course from wherever it is. Turn on slow
 * motion and click quickly between the ends to see it.
 */
const meta = {
  title: "UI/SegmentedControl",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

const VIEWS = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
] as const

export const Default: Story = {
  render: function Render() {
    const [v, setV] = useState<string>("day")
    const [slow, setSlow] = useState(false)
    return (
      <div className="space-y-4" style={slow ? ({ "--duration-base": "1600ms" } as React.CSSProperties) : undefined}>
        <SegmentedControl aria-label="Vista" options={VIEWS} value={v} onValueChange={setV} />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} />
          Cámara lenta
        </label>
      </div>
    )
  },
}

export const SizesAndWidth: Story = {
  name: "Sizes & full width",
  render: function Render() {
    const [v, setV] = useState<string>("week")
    return (
      <div className="max-w-sm space-y-4">
        <SegmentedControl aria-label="Vista" size="sm" options={VIEWS} value={v} onValueChange={setV} />
        <SegmentedControl aria-label="Vista" fullWidth options={VIEWS} value={v} onValueChange={setV} />
        <SegmentedControl
          aria-label="Vista"
          options={[...VIEWS, { value: "year", label: "Año", disabled: true }]}
          value={v}
          onValueChange={setV}
        />
      </div>
    )
  },
}

export const TimeRange: Story = {
  name: "TimeRangeSelector",
  render: function Render() {
    const [r, setR] = useState<Range>("30d")
    return <TimeRangeSelector value={r} onChange={setR} />
  },
}

export const TabsOnTheSameIndicator: Story = {
  name: "Tabs (same indicator)",
  render: () => (
    <div className="space-y-8">
      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
          <TabsTrigger value="ajustes">Ajustes</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen" className="text-sm text-muted-foreground">Panel de resumen.</TabsContent>
        <TabsContent value="actividad" className="text-sm text-muted-foreground">Panel de actividad.</TabsContent>
        <TabsContent value="ajustes" className="text-sm text-muted-foreground">Panel de ajustes.</TabsContent>
      </Tabs>
      <Tabs defaultValue="a">
        <TabsList variant="plain">
          <TabsTrigger value="a">Clientes</TabsTrigger>
          <TabsTrigger value="b">Facturas</TabsTrigger>
          <TabsTrigger value="c">Informes trimestrales</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  ),
}
