import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Button } from "@stellify/button"
import { KanbanBoard, KanbanCard, KanbanColumn } from "@stellify/kanban"
import { StatusBadge } from "@stellify/status-badge"

const COLUMNS = [
  { id: "new", title: "En seguimiento" },
  { id: "contacted", title: "Contactado" },
  { id: "replied", title: "Respondió" },
  { id: "meeting", title: "Reunión" },
]

interface Lead {
  id: string
  name: string
  where: string
  stage: string
  followup?: boolean
  review?: boolean
}

const LEADS: Lead[] = [
  { id: "1", name: "Club de Pàdel Ebre", where: "Tortosa · score 72", stage: "new" },
  { id: "2", name: "Clínica Dental Sant Pere", where: "Tarragona · score 64", stage: "contacted", followup: true },
  { id: "3", name: "Fisioteràpia Delta", where: "Amposta · score 58", stage: "contacted" },
  { id: "4", name: "Gimnàs Roquetes", where: "Roquetes · score 81", stage: "replied", review: true },
]

function Board({ leads: initial }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initial)
  return (
    <KanbanBoard
      columns={COLUMNS}
      label="Seguimiento"
      onMove={(id, to) => setLeads((all) => all.map((l) => (l.id === id ? { ...l, stage: to } : l)))}
    >
      {COLUMNS.map((c) => {
        const cards = leads.filter((l) => l.stage === c.id)
        return (
          <KanbanColumn key={c.id} id={c.id} count={cards.length} emptyText="Sin leads">
            {cards.map((l) => (
              <KanbanCard
                key={l.id}
                id={l.id}
                columnId={l.stage}
                title={l.name}
                subtitle={l.where}
                badges={
                  <>
                    {l.followup && <StatusBadge status="info">Follow-up 1 listo</StatusBadge>}
                    {l.review && <StatusBadge status="warning">Revisar</StatusBadge>}
                  </>
                }
                actions={
                  <Button type="button" size="sm" variant="base">
                    Ver mensaje
                  </Button>
                }
              />
            ))}
          </KanbanColumn>
        )
      })}
    </KanbanBoard>
  )
}

const meta: Meta<typeof Board> = {
  title: "Seguimiento/Kanban",
  component: Board,
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof Board>

/** Drag a card to another column, or use its «Mover a…» menu (keyboard and touch). */
export const Default: Story = { args: { leads: LEADS } }

/** Every column empty. */
export const Empty: Story = { args: { leads: [] } }
