import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import DatePickerField from "@stellify/date-picker-field"
import DateRangePicker, { type DateRangeValue } from "@stellify/date-range-picker"
import TimePicker from "@stellify/time-picker"
import LoadingSpinner from "@stellify/loading-spinner"

const meta = {
  title: "UI/Pickers & spinner",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

export const DatePicker: Story = {
  render: () => {
    const [v, setV] = useState("")
    return <div className="max-w-xs"><DatePickerField value={v} onChange={setV} placeholder="Pick a date" /></div>
  },
}

export const DateRange: Story = {
  render: () => {
    const [v, setV] = useState<DateRangeValue>({ from: "", to: "" })
    return (
      <div className="max-w-md">
        <DateRangePicker value={v} onChange={setV} placeholder="Pick a range" />
      </div>
    )
  },
}

export const Time: Story = {
  render: () => {
    const [v12, set12] = useState("14:30")
    const [v24, set24] = useState("09:15")
    return (
      <div className="space-y-4">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">12h + AM/PM → {v12}</p>
          <TimePicker value={v12} onChange={set12} />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">24h → {v24}</p>
          <TimePicker value={v24} onChange={set24} use24Hour minuteStep={15} />
        </div>
      </div>
    )
  },
}

export const Spinner: Story = { render: () => <LoadingSpinner /> }
