import type { FC } from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

export interface LoadingSpinnerProps {
  /** Icon size in px. Defaults to 24. */
  size?: number
  /** Fill the viewport height (centered full-screen). Defaults to false. */
  fullScreen?: boolean
  /** Accessible label. Defaults to "Loading". */
  label?: string
  className?: string
}

/**
 * Centered spinner. `fullScreen` centers it in the viewport (route-level
 * loading); otherwise it centers within its container.
 */
const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = 24,
  fullScreen = false,
  label = "Loading",
  className,
}) => (
  <div
    className={cn(
      "flex items-center justify-center",
      fullScreen ? "h-screen" : "h-full w-full py-8",
      className
    )}
    role="status"
    aria-label={label}
  >
    <Loader2 className="animate-spin text-muted-foreground" style={{ width: size, height: size }} />
    <span className="sr-only">{label}</span>
  </div>
)

export default LoadingSpinner
export { LoadingSpinner }
