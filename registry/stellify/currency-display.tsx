import type { FC } from "react"

import { cn } from "@/lib/utils"

export interface CurrencyDisplayProps {
  /** The numeric amount to format. */
  value: number
  /** ISO 4217 currency code, e.g. "EUR", "USD". Defaults to "EUR". */
  currency?: string
  /**
   * BCP 47 locale for formatting, e.g. "es-ES", "en-US".
   * Defaults to the runtime locale (undefined -> Intl default).
   */
  locale?: string
  /** Minimum fraction digits. Defaults to 2. */
  minimumFractionDigits?: number
  /** Maximum fraction digits. Defaults to 2. */
  maximumFractionDigits?: number
  /** Color the value by sign (positive emerald, negative rose). */
  colorBySign?: boolean
  className?: string
}

/**
 * Renders a number as a localized currency string via Intl.NumberFormat.
 *
 * Currency and locale come from props so no language is hardcoded; the same
 * component serves es/en/ca consumers. For repeated formatting in lists,
 * prefer the `useCurrencyFormat` hook to share one formatter instance.
 */
const CurrencyDisplay: FC<CurrencyDisplayProps> = ({
  value,
  currency = "EUR",
  locale,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  colorBySign = false,
  className,
}) => {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value)

  return (
    <span
      className={cn(
        "tabular-nums",
        colorBySign &&
          (value < 0
            ? "text-rose-600 dark:text-rose-400"
            : "text-emerald-600 dark:text-emerald-400"),
        className
      )}
    >
      {formatted}
    </span>
  )
}

export default CurrencyDisplay
export { CurrencyDisplay }
