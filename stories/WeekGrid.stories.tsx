import type { Meta, StoryObj } from "@storybook/react-vite"
import { WeekGrid } from "@stellify/week-grid"
import { getWeekDates } from "@stellify/week-dates"

interface Ev {
  title: string
  color: string
}

const meta = {
  title: "Components/WeekGrid",
  component: WeekGrid,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof WeekGrid<Ev>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    // Anchor on a fixed date so the story is deterministic.
    const anchor = "2026-06-10"
    const [mon, , wed, , fri] = getWeekDates(anchor)
    const eventsByDate: Record<string, Ev[]> = {
      [mon]: [{ title: "Standup", color: "bg-sky-500" }],
      [wed]: [
        { title: "Gym", color: "bg-emerald-500" },
        { title: "Review", color: "bg-amber-500" },
      ],
      [fri]: [{ title: "Demo", color: "bg-violet-500" }],
    }

    return (
      <WeekGrid
        date={anchor}
        eventsByDate={eventsByDate}
        locale="en-US"
        renderEvent={(ev) => (
          <div className={`rounded px-2 py-1 text-xs text-white ${ev.color}`}>
            {ev.title}
          </div>
        )}
        onClickEmpty={(d) => alert(`empty click: ${d}`)}
      />
    )
  },
}
