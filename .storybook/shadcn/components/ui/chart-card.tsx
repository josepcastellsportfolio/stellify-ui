import type { ReactNode } from "react"
import { AlertTriangle, type LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export interface ChartCardProps {
  /** Card title. */
  title: string
  /** Show the loading skeleton. */
  loading?: boolean
  /** Show the empty state. */
  empty?: boolean
  /** Show the error state (distinct from empty so users can tell them apart). */
  error?: boolean
  /** Icon for the empty state. */
  emptyIcon?: LucideIcon
  /** Title for the empty state. */
  emptyTitle?: string
  /** Description for the empty state. */
  emptyDescription?: string
  /** Icon for the error state. Defaults to AlertTriangle. */
  errorIcon?: LucideIcon
  /** Title for the error state. */
  errorTitle?: string
  /** Description for the error state. */
  errorDescription?: string
  /** Retry handler; renders a button when provided alongside `error`. */
  onRetry?: () => void
  /** Label for the retry button. Defaults to "Retry". */
  retryLabel?: string
  /** Slot rendered on the right of the header (e.g. a range selector). */
  headerActions?: ReactNode
  /** Skeleton height in px while loading. Defaults to 240. */
  skeletonHeight?: number
  /** The chart itself. */
  children?: ReactNode
}

function CenteredState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      {title && <h3 className="mb-1 text-lg font-semibold">{title}</h3>}
      {description && (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}

/**
 * Card shell for charts with loading / empty / error states and a header
 * actions slot. Wrap any Recharts (or other) chart as `children`.
 *
 * Pure presentational: every piece of copy is passed via props, so the
 * consumer owns i18n. The error state is intentionally distinct from the
 * empty state — an API failure should not read as "you have no data yet".
 */
export default function ChartCard({
  title,
  loading = false,
  empty = false,
  error = false,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  errorIcon = AlertTriangle,
  errorTitle,
  errorDescription,
  onRetry,
  retryLabel = "Retry",
  headerActions,
  skeletonHeight = 240,
  children,
}: ChartCardProps) {
  const header = (
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {headerActions}
    </CardHeader>
  )

  let body: ReactNode = children

  if (loading) {
    body = (
      <div
        className="animate-pulse rounded bg-muted"
        style={{ height: skeletonHeight }}
      />
    )
  } else if (error) {
    body = (
      <CenteredState
        icon={errorIcon}
        title={errorTitle}
        description={errorDescription}
        action={
          onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : undefined
        }
      />
    )
  } else if (empty) {
    body = emptyIcon ? (
      <CenteredState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    ) : (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {emptyDescription}
      </p>
    )
  }

  return (
    <Card>
      {header}
      <CardContent>{body}</CardContent>
    </Card>
  )
}

export { ChartCard }
