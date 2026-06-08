import type { FC, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface ProgressRingProps {
  /** Current value. */
  value: number
  /** Maximum value. Defaults to 100. */
  max?: number
  /** Diameter in px. Defaults to 96. */
  size?: number
  /** Stroke width in px. Defaults to 8. */
  strokeWidth?: number
  /**
   * Content rendered in the center. When omitted, shows the rounded
   * percentage. Pass `null` to render nothing.
   */
  children?: ReactNode
  /** Accessible label. Falls back to "{percent}%". */
  label?: string
  className?: string
}

/**
 * Circular progress indicator drawn with SVG.
 *
 * Themed via the design tokens: the track uses `text-muted` and the progress
 * arc uses `text-primary` (both through `currentColor`), so it inherits the
 * StellifyIT palette automatically. Override by passing a `text-*` class.
 */
const ProgressRing: FC<ProgressRingProps> = ({
  value,
  max = 100,
  size = 96,
  strokeWidth = 8,
  children,
  label,
  className,
}) => {
  const safeMax = max <= 0 ? 1 : max
  const ratio = Math.min(Math.max(value / safeMax, 0), 1)
  const percent = Math.round(ratio * 100)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - ratio)
  const center = size / 2

  return (
    <div
      className={cn("relative inline-flex text-primary", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-label={label ?? `${percent}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          className="text-muted"
          stroke="currentColor"
          fill="none"
          strokeWidth={strokeWidth}
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          stroke="currentColor"
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          r={radius}
          cx={center}
          cy={center}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-foreground">
        {children === undefined ? `${percent}%` : children}
      </div>
    </div>
  )
}

export default ProgressRing
export { ProgressRing }
