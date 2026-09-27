import { cn } from "@/lib/utils"

export interface ScoreBadgeProps {
  score: number
  /** Accessible name prefix, e.g. "Oportunidad" → "Oportunidad: 78 de 100". */
  label?: string
  max?: number
  className?: string
}

/** Compact numeric pill (primary) for a 0–100 score. */
function ScoreBadge({ score, label = "Puntuación", max = 100, className }: ScoreBadgeProps) {
  return (
    <span
      data-slot="score-badge"
      aria-label={`${label}: ${score} de ${max}`}
      className={cn(
        "inline-flex h-5 min-w-7 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold tabular-nums text-primary-foreground",
        className
      )}
    >
      {score}
    </span>
  )
}

export { ScoreBadge }
