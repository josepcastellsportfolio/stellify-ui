import type { FC, ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { MetricCard } from "@/components/ui/metric-card"
import { cn } from "@/lib/utils"

export interface LongFormStat {
  label: string
  value: string
  unit?: string
}

export interface LongFormSection {
  /** Rendered as h2; each should make sense read in isolation. */
  heading: string
  /** Plain strings, not markup — nothing can inject HTML. */
  paragraphs: string[]
  /** Optional pull-out after the paragraphs. */
  callout?: string
}

export interface LongFormLink {
  href: string
  label: string
}

export interface LongFormContent {
  title: string
  intro: string
  /** Honest status line, rendered as a badge. */
  status?: string
  stats?: LongFormStat[]
  sections: LongFormSection[]
  /** Pull-out shown after all sections. */
  callout?: string
  stack?: string[]
  related?: LongFormLink[]
}

export interface LongFormArticleProps {
  content: LongFormContent
  /** Rendered above the title — usually a "back" link. */
  before?: ReactNode
  /**
   * Renders related links. Apps with a client router pass their own Link so
   * navigation stays client-side; the default is a plain anchor.
   */
  renderLink?: (link: LongFormLink, props: { className: string }) => ReactNode
  className?: string
}

const relatedLinkClass =
  "text-sm underline underline-offset-4 hover:no-underline focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

const calloutClass =
  "border-l-2 border-primary bg-muted/40 py-4 pl-6 pr-4 font-medium leading-body text-foreground"

/**
 * Renders a long-form page: intro, optional status and figures, the sections
 * with their pull-outs, the stack and the related links.
 *
 * Shared by the project write-ups and the standalone marketing pages so all of
 * them keep one heading structure — a single h1, sections as h2, no skips.
 */
export const LongFormArticle: FC<LongFormArticleProps> = ({
  content: page,
  before,
  renderLink,
  className,
}) => (
  <article className={cn("mx-auto w-full max-w-3xl px-[--container-pad] py-16", className)}>
    {before}

    <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-display md:text-5xl">
      {page.title}
    </h1>

    <p className="mt-6 text-lg leading-body text-muted-foreground">{page.intro}</p>

    {page.status ? (
      <Badge variant="secondary" className="mt-6">
        {page.status}
      </Badge>
    ) : null}

    {page.stats?.length ? (
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {page.stats.map(stat => (
          <MetricCard key={stat.label} label={stat.label} value={stat.value} unit={stat.unit} />
        ))}
      </div>
    ) : null}

    {page.sections.map(section => (
      <section key={section.heading} className="mt-14">
        <h2 className="text-2xl font-semibold tracking-display">{section.heading}</h2>

        {section.paragraphs.map(paragraph => (
          <p key={paragraph.slice(0, 48)} className="mt-5 leading-body text-muted-foreground">
            {paragraph}
          </p>
        ))}

        {section.callout ? <p className={`mt-8 ${calloutClass}`}>{section.callout}</p> : null}
      </section>
    ))}

    {page.callout ? <p className={`mt-14 ${calloutClass}`}>{page.callout}</p> : null}

    {page.stack?.length ? (
      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-display">Stack</h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {page.stack.map(item => (
            <li key={item}>
              <Badge variant="outline" className="font-mono text-xs">
                {item}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    ) : null}

    {page.related?.length ? (
      <nav className="mt-14 border-t border-border pt-8" aria-label="Enlaces relacionados">
        <ul className="flex flex-wrap gap-6">
          {page.related.map(link => (
            <li key={link.href}>
              {renderLink?.(link, { className: relatedLinkClass }) ?? (
                <a href={link.href} className={relatedLinkClass}>
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    ) : null}
  </article>
)

export default LongFormArticle
