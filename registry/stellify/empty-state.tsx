import type { FC, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
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
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="mb-4 rounded-full bg-muted p-4">
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="mb-1 text-lg font-semibold">{title}</h3>
    <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
    {action}
  </div>
)

export default EmptyState
export { EmptyState }
