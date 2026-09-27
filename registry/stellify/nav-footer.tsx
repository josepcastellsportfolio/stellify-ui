import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface NavFooterProps {
  /** Omit on the first step to hide "Atrás". */
  onBack?: () => void
  onNext?: () => void
  backLabel?: string
  nextLabel?: string
  nextDisabled?: boolean
  nextLoading?: boolean
  /** Use "submit" when the footer lives inside a <form>. */
  nextType?: "button" | "submit"
  className?: string
}

/** "← Atrás" link on the left, primary "Siguiente →" on the right. */
function NavFooter({
  onBack,
  onNext,
  backLabel = "Atrás",
  nextLabel = "Siguiente",
  nextDisabled = false,
  nextLoading = false,
  nextType = "button",
  className,
}: NavFooterProps) {
  return (
    <div data-slot="nav-footer" className={cn("flex items-center justify-between pt-6", className)}>
      {onBack ? (
        <Button type="button" variant="base" onClick={onBack}>
          <ArrowLeft />
          {backLabel}
        </Button>
      ) : (
        <span />
      )}
      <Button
        type={nextType}
        variant="primary"
        onClick={onNext}
        disabled={nextDisabled}
        loading={nextLoading}
      >
        {nextLabel}
        <ArrowRight />
      </Button>
    </div>
  )
}

export { NavFooter }
