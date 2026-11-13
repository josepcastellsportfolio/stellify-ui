import type { FC, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  /** Level of the title in the page outline. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

/**
 * Centered placeholder for "no data" / "nothing here yet" states.
 * Copy and icon are passed in, keeping the component i18n-agnostic.
 */
const EmptyState: FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  headingLevel = 3,
}) => {
  const Heading = `h${headingLevel}` as const
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-surface-2 p-4 text-muted-foreground">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>
      <Heading className="mb-1 text-lg font-semibold">{title}</Heading>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}

export default EmptyState
export { EmptyState }
