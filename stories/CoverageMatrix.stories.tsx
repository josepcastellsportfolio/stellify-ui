import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { CoverageMatrix, type CoverageCell } from "@stellify/coverage-matrix"

const ZONES = [
  { key: "tortosa", label: "Tortosa", hint: "Català" },
  { key: "amposta", label: "Amposta", hint: "Català" },
  { key: "deltebre", label: "Deltebre", hint: "Català" },
  { key: "vinaros", label: "Vinaròs", hint: "Castellano" },
]
const TYPES = [
  { key: "peluqueria", label: "Peluquería" },
  { key: "club de padel", label: "Club de pádel" },
  { key: "clinica dental", label: "Clínica dental" },
]
const CELLS: Record<string, CoverageCell> = {
  "peluqueria|tortosa": { state: "done", label: "Hecha 29/09", description: "hecha el 29/09/2026" },
  "club de padel|tortosa": { state: "planned", label: "Día 1" },
  "club de padel|amposta": { state: "planned", label: "Día 1" },
  "clinica dental|tortosa": { state: "planned", label: "Día 3" },
  "clinica dental|vinaros": { state: "done", label: "Hecha 20/09" },
}
const getCell = (row: string, col: string) => CELLS[`${row}|${col}`]
const ACTIONS = { done: "Filtrar", planned: "Filtrar", empty: "Añadir al plan" }

const meta: Meta<typeof CoverageMatrix> = {
  title: "Búsquedas/CoverageMatrix",
  component: CoverageMatrix,
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof CoverageMatrix>

/** The three states: done (with its date), in the plan (with its "when") and untouched. */
export const ThreeStates: Story = {
  args: {
    "aria-label": "Mapa de cobertura",
    rows: TYPES,
    columns: ZONES,
    getCell,
    rowHeader: "Tipo de negocio",
    actionLabels: ACTIONS,
  },
}

/** A type filter is active: cells of other types fade out; the clicked cell is outlined. */
export const FilteredAndSelected: Story = {
  args: {
    ...ThreeStates.args,
    isDimmed: (row) => row !== "club de padel",
    selected: { row: "club de padel", column: "tortosa" },
  },
}

/** Clicking toggles the selection, as the page does with its filters. */
export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<{ row: string; column: string } | null>(null)
    return (
      <CoverageMatrix
        {...args}
        selected={selected}
        isDimmed={(row, col) => !!selected && (row !== selected.row || col !== selected.column)}
        onCellClick={(row, column) =>
          setSelected((s) => (s?.row === row && s.column === column ? null : { row, column }))
        }
      />
    )
  },
  args: ThreeStates.args,
}

/** No searches yet: only the configured zones and no rows. */
export const Empty: Story = {
  args: { ...ThreeStates.args, rows: [], getCell: () => undefined },
}
