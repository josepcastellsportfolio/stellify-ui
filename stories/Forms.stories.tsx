import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { z } from "zod"

import { Button } from "@stellify/button"
import FormModal, { type FieldConfig } from "@stellify/form-modal"
import DatePickerField from "@stellify/date-picker-field"
import MonthYearPicker from "@stellify/month-year-picker"
import LoadingSpinner from "@stellify/loading-spinner"
import CategoryTag from "@stellify/category-tag"
import Logo from "@stellify/logo"

const meta = {
  title: "Forms & Utilities/Overview",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true, colSpan: "half" },
  { name: "amount", label: "Amount", type: "number", step: "0.01", colSpan: "half" },
  { name: "date", label: "Date", type: "date" },
  {
    name: "category",
    label: "Category",
    type: "select",
    placeholder: "Pick one",
    options: [
      { value: "food", label: "Food" },
      { value: "travel", label: "Travel" },
    ],
  },
  { name: "color", label: "Color", type: "color" },
  { name: "active", label: "Active", type: "switch" },
]

const SCHEMA = z.object({
  name: z.string().min(1, "Required"),
  amount: z.string().optional(),
  date: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  active: z.boolean().optional(),
})

function FormModalDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button mode="create" onClick={() => setOpen(true)}>
        New entry
      </Button>
      <FormModal
        open={open}
        entity={null}
        createTitle="New entry"
        editTitle="Edit entry"
        fields={FIELDS}
        defaultValues={{ name: "", amount: "", date: "", category: "", color: "#34d399", active: false }}
        schema={SCHEMA}
        entityToFormValues={(e) => e as never}
        formValuesToPayload={(v) => v}
        onSave={async (v) => { alert("saved: " + JSON.stringify(v)); return v as never }}
        getId={() => 1}
        onClose={() => setOpen(false)}
        onNotify={(t, m) => console.log(t, m)}
      />
    </>
  )
}

export const FormModalStory: Story = { name: "FormModal", render: () => <FormModalDemo /> }

export const DatePicker: Story = {
  render: () => {
    const [v, setV] = useState("")
    return <div className="max-w-xs"><DatePickerField value={v} onChange={setV} placeholder="Pick a date" /></div>
  },
}

export const MonthYear: Story = {
  render: () => {
    const [d, setD] = useState({ m: 6, y: 2026 })
    return <MonthYearPicker month={d.m} year={d.y} onChange={(m, y) => setD({ m, y })} />
  },
}

export const Spinner: Story = { render: () => <LoadingSpinner /> }

export const Categories: Story = {
  render: () => {
    const cats = [
      { id: 1, name: "Home" },
      { id: 2, name: "Food", parent_id: 1, color: "#34d399" },
      { id: 3, name: "Travel", color: "#38bdf8" },
    ]
    return (
      <div className="flex flex-wrap gap-2">
        <CategoryTag categoryId={2} categories={cats} />
        <CategoryTag categoryId={3} categories={cats} />
        <CategoryTag categoryId={99} categories={cats} />
      </div>
    )
  },
}

export const Brand: Story = {
  name: "Logo",
  render: () => (
    <div className="flex items-center gap-6 text-primary">
      <Logo height={32} />
      <Logo height={48} className="text-foreground" />
      <Logo height={40} className="text-emerald-500" />
    </div>
  ),
}
