import { useEffect, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// --- Field config types ---

interface BaseFieldConfig {
  name: string
  label: string
  required?: boolean
  colSpan?: "full" | "half"
}

interface TextFieldConfig extends BaseFieldConfig {
  type: "text"
  placeholder?: string
}

interface NumberFieldConfig extends BaseFieldConfig {
  type: "number"
  placeholder?: string
  step?: string
  min?: string
}

interface DateFieldConfig extends BaseFieldConfig {
  type: "date"
}

interface SelectFieldConfig extends BaseFieldConfig {
  type: "select"
  placeholder?: string
  options: { value: string; label: string }[]
  emptyMessage?: string
}

interface ColorFieldConfig extends BaseFieldConfig {
  type: "color"
}

interface SwitchFieldConfig extends BaseFieldConfig {
  type: "switch"
  activeLabel?: string
  inactiveLabel?: string
}

export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | DateFieldConfig
  | SelectFieldConfig
  | ColorFieldConfig
  | SwitchFieldConfig

export type FormValues = Record<string, string | boolean>

export interface FormModalProps<T> {
  open: boolean
  entity: T | null
  createTitle: string
  editTitle: string
  fields: FieldConfig[]
  defaultValues: FormValues
  schema: z.ZodObject<Record<string, z.ZodType>>
  entityToFormValues: (entity: T) => FormValues
  formValuesToPayload: (values: FormValues) => unknown
  onSave: (data: never) => Promise<T>
  onUpdate?: (id: number, data: never) => Promise<T>
  getId: (entity: T) => number
  onClose: () => void
  /** Optional notifier for save outcomes (wire to your toast). */
  onNotify?: (type: "success" | "error", message: string) => void
  /** Messages for the notifier (English defaults). */
  messages?: { created?: string; updated?: string; error?: string }
  /** Footer button labels (English defaults). */
  cancelLabel?: string
  saveLabel?: string
  savingLabel?: string
  maxWidth?: string
  afterSave?: (saved: T) => Promise<void>
  children?: (
    formValues: FormValues,
    setFormValues: (values: FormValues) => void
  ) => React.ReactNode
}

function groupFieldsIntoRows(fields: FieldConfig[]) {
  const rows: FieldConfig[][] = []
  let i = 0
  while (i < fields.length) {
    const field = fields[i]
    if (
      field.colSpan === "half" &&
      i + 1 < fields.length &&
      fields[i + 1].colSpan === "half"
    ) {
      rows.push([field, fields[i + 1]])
      i += 2
    } else {
      rows.push([field])
      i += 1
    }
  }
  return rows
}

/**
 * Reusable CRUD form modal (react-hook-form + zod). Configure with `fields`
 * (text/number/date/select/color/switch), a zod `schema`, and create/update
 * handlers. All copy is passed via props; save outcomes go through `onNotify`
 * so you wire your own toast.
 */
function FormModal<T>({
  open,
  entity,
  createTitle,
  editTitle,
  fields,
  defaultValues,
  schema,
  entityToFormValues,
  formValuesToPayload,
  onSave,
  onUpdate,
  getId,
  onClose,
  onNotify,
  messages,
  cancelLabel = "Cancel",
  saveLabel = "Save",
  savingLabel = "Saving…",
  maxWidth,
  afterSave,
  children,
}: FormModalProps<T>) {
  const [saving, setSaving] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(entity ? entityToFormValues(entity) : defaultValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entity])

  const onSubmit = async (values: FormValues) => {
    try {
      setSaving(true)
      const payload = formValuesToPayload(values)

      let saved: T
      if (entity && onUpdate) {
        saved = await onUpdate(getId(entity), payload as never)
        onNotify?.("success", messages?.updated ?? "Updated successfully")
      } else {
        saved = await onSave(payload as never)
        onNotify?.("success", messages?.created ?? "Created successfully")
      }

      if (afterSave) await afterSave(saved)
      onClose()
    } catch (error) {
      onNotify?.("error", messages?.error ?? "Could not save")
      console.error("FormModal save error:", error)
    } finally {
      setSaving(false)
    }
  }

  const rows = groupFieldsIntoRows(fields)

  const renderFieldControl = (fieldConfig: FieldConfig) => (
    <FormField
      key={fieldConfig.name}
      control={form.control}
      name={fieldConfig.name}
      render={({ field: formField }) => {
        switch (fieldConfig.type) {
          case "text":
            return (
              <FormItem>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required ? " *" : ""}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={fieldConfig.placeholder}
                    {...formField}
                    value={formField.value as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          case "number":
            return (
              <FormItem>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required ? " *" : ""}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step={fieldConfig.step}
                    min={fieldConfig.min}
                    placeholder={fieldConfig.placeholder}
                    {...formField}
                    value={formField.value as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          case "date":
            return (
              <FormItem>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required ? " *" : ""}
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...formField}
                    value={formField.value as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          case "select":
            return (
              <FormItem>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required ? " *" : ""}
                </FormLabel>
                <Select
                  value={formField.value as string}
                  onValueChange={formField.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={fieldConfig.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fieldConfig.options.length === 0 && fieldConfig.emptyMessage ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {fieldConfig.emptyMessage}
                      </div>
                    ) : (
                      fieldConfig.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )
          case "color":
            return (
              <FormItem>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required ? " *" : ""}
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formField.value as string}
                      onChange={formField.onChange}
                      className="h-10 w-14 cursor-pointer rounded border border-input"
                    />
                    <span className="text-sm text-muted-foreground">
                      {formField.value as string}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          case "switch":
            return (
              <FormItem>
                <div className="flex items-center gap-3">
                  <FormLabel>{fieldConfig.label}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={formField.value as boolean}
                      onCheckedChange={formField.onChange}
                    />
                  </FormControl>
                  <span className="text-sm text-muted-foreground">
                    {formField.value
                      ? (fieldConfig.activeLabel ?? "On")
                      : (fieldConfig.inactiveLabel ?? "Off")}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )
        }
      }}
    />
  )

  const formValues = form.watch()
  const setFormValues = (values: FormValues) => {
    for (const [key, value] of Object.entries(values)) {
      form.setValue(key, value)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent style={maxWidth ? { maxWidth } : undefined}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{entity ? editTitle : createTitle}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {rows.map((row, i) =>
                row.length === 2 ? (
                  <div key={i} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {renderFieldControl(row[0])}
                    {renderFieldControl(row[1])}
                  </div>
                ) : (
                  renderFieldControl(row[0])
                )
              )}
              {children?.(formValues, setFormValues)}
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button type="submit" loading={saving}>
                {saving ? savingLabel : saveLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default FormModal
export { FormModal }
