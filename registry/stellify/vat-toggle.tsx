import * as React from "react"

import { cn } from "@/lib/utils"

export interface VatToggleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** true = amounts shown with VAT. */
  withVat: boolean
  onChange: (withVat: boolean) => void
  baseLabel?: string
  vatLabel?: string
}

/** Two-option switch between amounts without VAT (base) and with VAT. */
function VatToggle({
  withVat,
  onChange,
  baseLabel = "Base",
  vatLabel = "Con IVA",
  className,
  ...props
}: VatToggleProps) {
  const option = (active: boolean, label: string, value: boolean) => (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={() => onChange(value)}
      className={cn(
        "rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  )
  return (
    <div
      data-slot="vat-toggle"
      role="radiogroup"
      aria-label="Importes"
      className={cn("inline-flex items-center gap-1 rounded-lg bg-muted p-1", className)}
      {...props}
    >
      {option(!withVat, baseLabel, false)}
      {option(withVat, vatLabel, true)}
    </div>
  )
}

export default VatToggle
export { VatToggle }
