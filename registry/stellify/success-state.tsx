import type { FC, ReactNode } from "react"
import { Check } from "lucide-react"

import { Illustration, type IllustrationName } from "@/components/ui/illustration"
import { cn } from "@/lib/utils"

export interface SuccessStateProps {
  title: string
  /** The outcome in one figure ("240 € enviados", "Pedido #4821"). Large, tabular. */
  value?: ReactNode
  description?: ReactNode
  /** Next step: "Volver al inicio", "Ver recibo". */
  action?: ReactNode
  /**
   * A plate instead of the check, for the end of a longer journey (onboarding,
   * a first sale). `laurel` reads as a win. The check is the default.
   */
  illustration?: IllustrationName
  /** Level of the title in the page outline. Default 2: it usually replaces the page. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  className?: string
}

/**
 * Peak-end rule: people judge a flow by its best moment and its end, so the
 * end of a task (payment sent, form submitted, setup finished) gets a clear,
 * calm finish instead of a line of small text. The check lands with the spring
 * ease; reduced motion drops the animation. It sits in a `role="status"`
 * region, but screen readers announce a region reliably only when its content
 * changes after mount: when it replaces a form, move focus to its heading too.
 *
 * ```tsx
 * <SuccessState title="Pago completado" value="240 € enviados" description="A Sam Lee" action={<Button>Hecho</Button>} />
 * ```
 */
const SuccessState: FC<SuccessStateProps> = ({
  title,
  value,
  description,
  action,
  illustration,
  headingLevel = 2,
  className,
}) => {
  const Heading = `h${headingLevel}` as const
  return (
    <div
      data-slot="success-state"
      role="status"
      className={cn("flex flex-col items-center justify-center py-12 text-center", className)}
    >
      {illustration ? (
        <Illustration name={illustration} className="mb-5 w-28" />
      ) : (
        <div
          data-slot="success-state-mark"
          className="mb-5 flex size-16 items-center justify-center rounded-full bg-success text-success-foreground animate-in fade-in zoom-in-50 duration-(--duration-base) ease-(--ease-spring)"
        >
          <Check className="size-8" strokeWidth={2.5} aria-hidden />
        </div>
      )}
      <Heading className="text-lg font-semibold">{title}</Heading>
      {value != null && (
        <p data-slot="success-state-value" className="mt-1 font-mono text-3xl font-semibold tabular-nums text-foreground">
          {value}
        </p>
      )}
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export default SuccessState
export { SuccessState }
