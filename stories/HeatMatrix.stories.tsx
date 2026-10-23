import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Badge } from "@stellify/badge"
import { HeatMatrix, type HeatMatrixCell } from "@stellify/heat-matrix"

const SIZES = [
  { key: "N", label: "Negocio local", hint: "3 de 4 pasan" },
  { key: "V", label: "Varios locales", hint: "4 de 4 pasan" },
  { key: "E", label: "Empresa", hint: "2 de 4 pasan" },
  { key: "A", label: "Administración", hint: "1 de 4 pasan" },
]
const INDUSTRIES = [
  { key: "restauracion", label: "Restauración" },
  { key: "salud", label: "Salud" },
  { key: "logistica", label: "Logística y transporte" },
  { key: "turismo", label: "Turismo y alojamiento", tag: <Badge size="xs" variant="outline">candidata</Badge> },
]
const TOTALS: Record<string, number[]> = {
  restauracion: [18, 22, 19, 12],
  salud: [20, 21, 17, 16],
  logistica: [14, 19, 23, 15],
  turismo: [17, 20, 13, 11],
}
const tier = (t: number) => (t < 15 ? null : t >= 21 ? 1 : t >= 19 ? 2 : 3)

const getCell = (row: string, col: string): HeatMatrixCell | undefined => {
  const total = TOTALS[row]?.[SIZES.findIndex((s) => s.key === col)]
  if (total === undefined) return undefined
  const t = tier(total)
  return {
    value: total,
    muted: t === null,
    description: t === null ? `total ${total}, no pasa` : `total ${total}, nivel ${t}`,
    children: (
      <>
        <span>{t === null ? "no pasa" : `Nivel ${t}`}</span>
        {row === "restauracion" && col === "V" && <span>5 contactadas, 2 resp.</span>}
      </>
    ),
  }
}

const meta: Meta<typeof HeatMatrix> = {
  title: "Estudio/HeatMatrix",
  component: HeatMatrix,
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof HeatMatrix>

/** Industry × size: colour by total (15–25), cells that do not pass are greyed out. */
export const Study: Story = {
  args: {
    "aria-label": "Matriz industria por tamaño",
    rows: INDUSTRIES,
    columns: SIZES,
    getCell,
    min: 15,
    max: 25,
    rowHeader: "Industria",
    emptyLabel: "Sin datos",
    legend: { label: "Leyenda", low: "15", high: "25", muted: "No pasa" },
  },
}

/** Clicking selects a cell, as the Estudio page does to open its panel. */
export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<{ row: string; column: string } | null>(null)
    return (
      <HeatMatrix
        {...args}
        selected={selected}
        onCellClick={(row, column) => setSelected((s) => (s?.row === row && s.column === column ? null : { row, column }))}
      />
    )
  },
  args: { ...Study.args, actionLabel: "Ver detalle" },
}

/** One row, read-only: the summary of a single industry. */
export const SingleRow: Story = {
  args: { ...Study.args, rows: INDUSTRIES.slice(0, 1), legend: undefined },
}

/** A cell without data shows the empty label instead of a figure. */
export const MissingCell: Story = {
  args: { ...Study.args, getCell: (row, col) => (row === "salud" && col === "A" ? undefined : getCell(row, col)) },
}
