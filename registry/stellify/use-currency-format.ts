import { useCallback, useMemo } from "react"

export interface UseCurrencyFormatOptions {
  /** BCP 47 locale, e.g. "es-ES". Defaults to the runtime locale. */
  locale?: string
  /** ISO 4217 currency code. Defaults to "EUR". */
  currency?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * Returns a memoized currency formatter for the given locale + currency.
 *
 * Sharing one Intl.NumberFormat instance is meaningfully cheaper than building
 * a new one per cell, so prefer this hook when formatting amounts in lists or
 * tables. Locale/currency are arguments — no language is hardcoded.
 */
export function useCurrencyFormat({
  locale,
  currency = "EUR",
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
}: UseCurrencyFormatOptions = {}) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
      }),
    [locale, currency, minimumFractionDigits, maximumFractionDigits]
  )

  const format = useCallback(
    (value: number) => formatter.format(value),
    [formatter]
  )

  return { format, formatter }
}

export default useCurrencyFormat
