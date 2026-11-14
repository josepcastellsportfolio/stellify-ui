import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export interface LoadingStateLabels {
  /** "n de N" under the progress bar. */
  progress: (done: number, total: number) => string
}

const DEFAULT_LABELS: LoadingStateLabels = {
  progress: (done, total) => `${done} de ${total}`,
}

export interface LoadingStateProps {
  title: string
  description?: string
  progress?: { done: number; total: number }
  labels?: Partial<LoadingStateLabels>
  /** Level of the title in the page outline. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  className?: string
}

/** Long-running work in progress: title + explanation + spinner, optional "n de N" progress. */
function LoadingState({ title, description, progress, labels, headingLevel = 3, className }: LoadingStateProps) {
  const Heading = `h${headingLevel}` as const
  const l = { ...DEFAULT_LABELS, ...labels }
  const pct = progress && progress.total > 0 ? (progress.done / progress.total) * 100 : undefined
  return (
    <div data-slot="loading-state" role="status" aria-live="polite" className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Spinner size="sm" decorative className="text-brand" />
        <Heading className="text-lg font-semibold text-foreground">{title}</Heading>
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {progress && (
        <div className="flex max-w-sm items-center gap-3">
          <Progress size="sm" value={pct} aria-label={title} />
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{l.progress(progress.done, progress.total)}</span>
        </div>
      )}
    </div>
  )
}

export { LoadingState }
