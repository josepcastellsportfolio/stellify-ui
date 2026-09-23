import { Loader2 } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface LoadingStateProps {
  title: string
  description?: string
  progress?: { done: number; total: number }
  className?: string
}

/** Long-running work in progress: title + explanation + spinner, optional "n de N" progress. */
function LoadingState({ title, description, progress, className }: LoadingStateProps) {
  const pct = progress && progress.total > 0 ? (progress.done / progress.total) * 100 : undefined
  return (
    <div data-slot="loading-state" role="status" aria-live="polite" className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {progress && (
        <div className="flex max-w-sm items-center gap-3">
          <Progress size="sm" value={pct} aria-label={title} />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{`${progress.done} de ${progress.total}`}</span>
        </div>
      )}
    </div>
  )
}

export { LoadingState }
