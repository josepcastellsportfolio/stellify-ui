import type { Meta, StoryObj } from "@storybook/react-vite"
import { fn } from "storybook/test"
import { WeekGrid } from "@stellify/week-grid"
import { getWeekDates } from "@stellify/week-dates"

interface Ev {
  title: string
  color: string
}

// Anchor on a fixed date so the story is deterministic.
const ANCHOR = "2026-06-10"
const [MON, , WED, , FRI] = getWeekDates(ANCHOR)
const EVENTS: Record<string, Ev[]> = {
  [MON]: [{ title: "Standup", color: "bg-sky-500" }],
  [WED]: [
    { title: "Gym", color: "bg-emerald-500" },
    { title: "Review", color: "bg-amber-500" },
  ],
  [FRI]: [{ title: "Demo", color: "bg-violet-500" }],
}

const meta = {
  title: "Components/WeekGrid",
  component: WeekGrid,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    date: ANCHOR,
    eventsByDate: EVENTS,
    locale: "en-US",
    renderEvent: (ev) => (
      <div className={`rounded px-2 py-1 text-xs text-white ${ev.color}`}>{ev.title}</div>
    ),
    onClickEmpty: fn(),
  },
} satisfies Meta<typeof WeekGrid<Ev>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
