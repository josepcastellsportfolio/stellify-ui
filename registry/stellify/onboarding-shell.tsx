import type { ReactNode } from "react"

import { Logo } from "@/components/logo"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface OnboardingShellProps {
  step: number
  totalSteps: number
  children: ReactNode
  /** Brand mark on the left. Defaults to the StellifyIT logo. */
  logo?: ReactNode
  /** Step counter copy; defaults to Spanish ("Paso n de N"). */
  stepLabel?: (step: number, total: number) => string
  className?: string
}

/**
 * Full-page frame for a multi-step onboarding: logo + "Paso n de N" header, a
 * thin progress bar, and a centered content column (~580 px).
 */
function OnboardingShell({
  step,
  totalSteps,
  children,
  logo,
  stepLabel = (s, t) => `Paso ${s} de ${t}`,
  className,
}: OnboardingShellProps) {
  const label = stepLabel(step, totalSteps)
  return (
    <div
      data-slot="onboarding-shell"
      className={cn("min-h-screen bg-background text-foreground", className)}
    >
      <header className="mx-auto w-full max-w-[640px] px-4 pt-10">
        <div className="flex items-center justify-between pb-4">
          {logo ?? <Logo height={28} className="text-foreground" />}
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        </div>
        <Progress size="sm" value={(step / totalSteps) * 100} aria-label={label} />
      </header>
      <main className="mx-auto w-full max-w-[580px] px-4 py-10">{children}</main>
    </div>
  )
}

export { OnboardingShell }
