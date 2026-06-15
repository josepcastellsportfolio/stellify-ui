/**
 * Formatters for chart tooltips, legends and axis ticks. Pure functions over
 * `Intl` — no React, no hardcoded locale/currency. Mirrors the approach of
 * `use-currency-format`, but usable outside components (e.g. axis tickFormatter).
 */

export type ChartFormat =
  | { kind: "number"; locale?: string; options?: Intl.NumberFormatOptions }
  | {
      kind: "currency"
      locale?: string
      currency: string
      options?: Intl.NumberFormatOptions
    }
  | { kind: "date"; locale?: string; options?: Intl.DateTimeFormatOptions }
  | { kind: "custom"; format: (value: unknown) => string }

export type ChartFormatter = (value: unknown) => string

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim() !== "" && !isNaN(Number(value)))
    return Number(value)
  return null
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value
  if (typeof value === "number") return new Date(value)
  if (typeof value === "string") {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

/**
 * Build a value formatter from a `ChartFormat` spec. With no spec, numbers get
 * `toLocaleString()` and everything else is stringified.
 */
export function makeFormatter(fmt?: ChartFormat): ChartFormatter {
  if (!fmt) {
    return (value) => {
      const n = toNumber(value)
      return n !== null ? n.toLocaleString() : String(value ?? "")
    }
  }

  switch (fmt.kind) {
    case "number": {
      const nf = new Intl.NumberFormat(fmt.locale, fmt.options)
      return (value) => {
        const n = toNumber(value)
        return n !== null ? nf.format(n) : String(value ?? "")
      }
    }
    case "currency": {
      const nf = new Intl.NumberFormat(fmt.locale, {
        style: "currency",
        currency: fmt.currency,
        ...fmt.options,
      })
      return (value) => {
        const n = toNumber(value)
        return n !== null ? nf.format(n) : String(value ?? "")
      }
    }
    case "date": {
      const df = new Intl.DateTimeFormat(fmt.locale, fmt.options)
      return (value) => {
        const d = toDate(value)
        return d ? df.format(d) : String(value ?? "")
      }
    }
    case "custom":
      return (value) => fmt.format(value)
  }
}

/**
 * Same as `makeFormatter` but typed for Recharts `tickFormatter`
 * (`(value: any, index: number) => string`).
 */
export function makeAxisTickFormatter(
  fmt?: ChartFormat
): (value: unknown, index?: number) => string {
  const f = makeFormatter(fmt)
  return (value) => f(value)
}
