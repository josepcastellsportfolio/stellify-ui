import type { FC } from "react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  /** Fill the viewport height (centered full-screen). Defaults to false. */
  fullScreen?: boolean
  /** Accessible label. Defaults to "Cargando". */
  label?: string
  className?: string
}

/**
 * `Spinner` centered in its container, or in the viewport with `fullScreen`
 * (route-level loading).
 */
const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = "lg", fullScreen = false, label = "Cargando", className }) => (
  <div
    data-slot="loading-spinner"
    className={cn(
      "flex items-center justify-center text-muted-foreground",
      fullScreen ? "h-screen" : "h-full w-full py-8",
      className
    )}
  >
    <Spinner size={size} label={label} />
  </div>
)

export default LoadingSpinner
export { LoadingSpinner }
