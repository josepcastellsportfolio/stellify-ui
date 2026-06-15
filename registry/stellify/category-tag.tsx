import type { FC } from "react"

import { Badge } from "@/components/ui/badge"

export interface CategoryTagCategory {
  id: number
  name: string
  /** Optional background color (any CSS color). */
  color?: string
  /** Parent category id for "Parent / Child" labels. */
  parent_id?: number | null
}

export interface CategoryTagProps {
  categoryId: number
  /** All categories, used to resolve the name + parent hierarchy. */
  categories: CategoryTagCategory[]
  /** Label when the category isn't found. Defaults to "No category". */
  noLabel?: string
}

/**
 * Renders a category as a colored badge, resolving "Parent / Child" hierarchy
 * from the provided list. Copy via props (no hardcoded language).
 */
const CategoryTag: FC<CategoryTagProps> = ({
  categoryId,
  categories,
  noLabel = "No category",
}) => {
  const category = categories.find((c) => c.id === categoryId)

  if (!category) {
    return <Badge variant="secondary">{noLabel}</Badge>
  }

  const parent =
    category.parent_id != null
      ? categories.find((c) => c.id === category.parent_id)
      : null

  const label = parent ? `${parent.name} / ${category.name}` : category.name

  return (
    <Badge style={{ backgroundColor: category.color || undefined }} variant="secondary">
      {label}
    </Badge>
  )
}

export default CategoryTag
export { CategoryTag }
