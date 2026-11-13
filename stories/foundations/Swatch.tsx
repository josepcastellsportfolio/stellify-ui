import type { ReactNode } from "react"

/** Shared bits for the Foundations pages. Not part of the registry. */

export function Section({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-mono text-[11px] uppercase tracking-[var(--tracking-mono-caps)] text-muted-foreground">{title}</h2>
        {note && <p className="mt-1 max-w-prose text-sm text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  )
}

export function Swatch({ token, label, ink = "foreground" }: { token: string; label?: string; ink?: string }) {
  return (
    <div className="min-w-0">
      <div
        className="flex h-14 items-end rounded-[var(--radius-control)] p-2 font-mono text-[11px]"
        style={{ background: `var(--${token})`, color: `var(--${ink})` }}
      >
        {label ?? "Aa"}
      </div>
      <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">--{token}</p>
    </div>
  )
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="max-w-4xl space-y-10">{children}</div>
}
