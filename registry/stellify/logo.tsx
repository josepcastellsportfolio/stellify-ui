import { type FC } from "react"

export interface LogoProps {
  /** Height in px. Defaults to 32. */
  height?: number
  /** Optional width; if larger than the natural width the mark stretches. */
  width?: number
  className?: string
  /** Accessible title (and brand name). Defaults to "StellifyIT". */
  title?: string
  /** Hide from a11y tree (decorative use). Defaults to false. */
  ariaHidden?: boolean
}

/**
 * StellifyIT wordmark — a stylized "Z" monogram drawn in `currentColor`, so it
 * inherits text color (theme it with `text-primary`, etc.). Pure SVG.
 */
const Logo: FC<LogoProps> = ({
  height = 32,
  width,
  className,
  title = "StellifyIT",
  ariaHidden = false,
}) => {
  const unit = height / 100
  const naturalWidth = 100 * unit
  const totalWidth =
    typeof width === "number" && width > naturalWidth ? width : naturalWidth
  const ext = totalWidth / unit - 100

  const topArc = `0,29.3 29.3,0 ${70.7 + ext},0 ${100 + ext},29.3 ${88.6 + ext},34 ${66 + ext},11.4 34,11.4 11.4,34`
  const connectorZ = `0,29.3 11.4,29.3 11.4,44.3 ${100 + ext},44.3 ${100 + ext},70.7 ${88.6 + ext},70.7 ${88.6 + ext},55.7 0,55.7`
  const bottomArc = `${100 + ext},70.7 ${70.7 + ext},100 29.3,100 0,70.7 11.4,65.7 34,88.6 ${66 + ext},88.6 ${88.6 + ext},65.7`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${100 + ext} 100`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden={ariaHidden || undefined}
      role={ariaHidden ? undefined : "img"}
      style={{ display: "block" }}
    >
      {!ariaHidden && <title>{title}</title>}
      <polygon fill="currentColor" points={topArc} />
      <polygon fill="currentColor" points={connectorZ} />
      <polygon fill="currentColor" points={bottomArc} />
    </svg>
  )
}

export default Logo
export { Logo }
