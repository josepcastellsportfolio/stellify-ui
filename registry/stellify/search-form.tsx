import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"

import { TextField } from "@/components/text-field"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SearchFormField {
  name: string
  label: string
  placeholder?: string
  defaultValue?: string
}

export interface SearchFormProps {
  fields: SearchFormField[]
  submitLabel: string
  onSubmit: (values: Record<string, string>) => void
  loading?: boolean
  className?: string
}

/** Inline text fields + primary search button; submits trimmed values, all required. */
function SearchForm({ fields, submitLabel, onSubmit, loading = false, className }: SearchFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""]))
  )
  const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]))
  const valid = fields.every((f) => trimmed[f.name])
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (valid && !loading) onSubmit(trimmed)
  }
  return (
    <form
      data-slot="search-form"
      onSubmit={submit}
      className={cn("grid items-end gap-4 sm:grid-flow-col sm:auto-cols-fr", className)}
    >
      {fields.map((f) => (
        <TextField
          key={f.name}
          label={f.label}
          placeholder={f.placeholder}
          value={values[f.name]}
          onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
        />
      ))}
      <Button type="submit" variant="primary" disabled={!valid} loading={loading}>
        <Search />
        {submitLabel}
      </Button>
    </form>
  )
}

export { SearchForm }
