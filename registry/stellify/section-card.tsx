import type { FC, ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface SectionCardProps {
  /** Section title. */
  title: string
  /** Optional description under the title. */
  description?: string
  /** Slot on the right of the header (e.g. an "Add" button). */
  actions?: ReactNode
  /** Section body. */
  children?: ReactNode
  /** Drop the default CardContent padding (e.g. for tables that draw their own). */
  noContentPadding?: boolean
  className?: string
  contentClassName?: string
}

/**
 * Titled card used as a panel shell across StellifyIT (budgets, alerts, etc.):
 * a header with title/description and an actions slot, plus a content area.
 */
const SectionCard: FC<SectionCardProps> = ({
  title,
  description,
  actions,
  children,
  noContentPadding = false,
  className,
  contentClassName,
}) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-start justify-between space-y-0">
      <div className="space-y-1">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </CardHeader>
    <CardContent
      className={cn(noContentPadding && "p-0", contentClassName)}
    >
      {children}
    </CardContent>
  </Card>
)

export default SectionCard
export { SectionCard }
