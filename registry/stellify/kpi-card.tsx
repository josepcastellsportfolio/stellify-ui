import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const kpiCardVariants = cva(
  "flex flex-col gap-1 rounded-[var(--radius-card,var(--radius))] border bg-card p-4 text-card-foreground shadow-[var(--shadow-card,none)]",
  {
    variants: {
      tone: {
        default: "",
        success: "border-success/40",
        warning: "border-warning/50",
        danger: "border-destructive/50",
      },
    },
    defaultVariants: { tone: "default" },
  }
)

export interface KpiCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof kpiCardVariants> {
  /** What is measured, e.g. "Gastado este mes". */
  label: React.ReactNode
  /** The figure, already formatted by the caller (currency, percent…). */
  value: React.ReactNode
  /** Secondary line under the value, e.g. "de 10,00 € de tope". */
  hint?: React.ReactNode
  icon?: LucideIcon
  /** 0–100: shows a thin bar under the value (e.g. share of the monthly cap). */
  progress?: number
}

/**
 * One key figure: label, big value, optional hint and progress bar. The value is a node so
 * formatting (locale, currency, "no recupera") stays with the caller.
 */
function KpiCard({ className, tone, label, value, hint, icon: Icon, progress, ...props }: KpiCardProps) {
  const pct = progress === undefined ? undefined : Math.max(0, Math.min(100, progress))
  return (
    <div data-slot="kpi-card" className={cn(kpiCardVariants({ tone }), className)} {...props}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="size-4" aria-hidden />}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      {pct !== undefined && (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label={typeof label === "string" ? label : undefined}
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn(
              "h-full rounded-full",
              pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-warning" : "bg-primary"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}

export default KpiCard
export { KpiCard, kpiCardVariants }
