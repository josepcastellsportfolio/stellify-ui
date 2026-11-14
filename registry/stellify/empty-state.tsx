import type { FC, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { Illustration, type IllustrationName } from "@/components/ui/illustration"

export interface EmptyStateProps {
  /** A plate from `illustration`. Takes precedence over `icon`; use it for first-run and empty screens. */
  illustration?: IllustrationName
  /** A small icon instead, for compact or repeated empty states (a table, a panel). */
  icon?: LucideIcon
  title: string
  description: string
  action?: ReactNode
  /** Level of the title in the page outline. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

/**
 * Centered placeholder for "no data" / "nothing here yet" states.
 * Copy and artwork are passed in, keeping the component i18n-agnostic.
 */
const EmptyState: FC<EmptyStateProps> = ({
  illustration,
  icon: Icon,
  title,
  description,
  action,
  headingLevel = 3,
}) => {
  const Heading = `h${headingLevel}` as const
  return (
    <div data-slot="empty-state" className="flex flex-col items-center justify-center py-12 text-center">
      {illustration ? (
        <Illustration name={illustration} className="mb-5 w-28" />
      ) : Icon ? (
        <div className="mb-4 rounded-full bg-surface-2 p-4">
          <Icon className="size-8 text-muted-foreground" aria-hidden />
        </div>
      ) : null}
      <Heading className="mb-1 text-lg font-semibold">{title}</Heading>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}

export default EmptyState
export { EmptyState }
