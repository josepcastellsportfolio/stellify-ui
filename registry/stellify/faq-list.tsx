import { useId } from "react"
import type { FC, ReactNode } from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export interface FaqItem {
  /** Rendered as the `<summary>` text; phrase it the way people search. */
  question: string
  /** Plain string, not markup — it is also copied verbatim into the JSON-LD. */
  answer: string
  /** Optional deeper link shown under the answer. */
  href?: string
  /** Label for `href`. Defaults to "Más información". */
  linkLabel?: string
}

export interface FaqLink {
  href: string
  label: string
}

export interface FaqListProps {
  items: FaqItem[]
  title?: string
  /**
   * Id for the h2. Pass a stable one when the page links to the section
   * (`#preguntas`); otherwise one is generated.
   */
  headingId?: string
  /**
   * Renders the per-answer link. Apps with a client router pass their own
   * Link so navigation stays client-side; the default is a plain anchor.
   */
  renderLink?: (link: FaqLink, props: { className: string }) => ReactNode
  className?: string
}

const linkClass =
  "mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline " +
  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2"

/**
 * Frequently asked questions as native `<details>`/`<summary>` disclosures.
 *
 * Native elements on purpose: they open and close with zero JavaScript (the
 * page is prerendered), keyboard and screen-reader support is built in, and
 * the answer text is in the HTML even while collapsed, so crawlers index it.
 * The question sits directly in `<summary>` — headings inside a summary lose
 * their semantics in several screen readers.
 *
 * Pair with `faqPageJsonLd(items)` to emit matching structured data.
 */
export const FaqList: FC<FaqListProps> = ({
  items,
  title = "Preguntas frecuentes",
  headingId,
  renderLink,
  className,
}) => {
  const generatedId = useId()
  const id = headingId ?? generatedId

  if (items.length === 0) return null

  return (
    <section data-slot="faq-list" aria-labelledby={id} className={className}>
      <h2 id={id} className="text-2xl font-semibold tracking-display">
        {title}
      </h2>

      <div className="mt-6 divide-y divide-border border-y border-border">
        {items.map(item => {
          const link = item.href
            ? { href: item.href, label: item.linkLabel ?? "Más información" }
            : null

          return (
            <details key={item.question} data-slot="faq-item" className="group">
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-start justify-between gap-4 py-4",
                  "text-left font-medium leading-body text-foreground",
                  "[&::-webkit-details-marker]:hidden",
                  "rounded-sm focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
              >
                {item.question}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "mt-1 size-4 shrink-0 text-muted-foreground",
                    "transition-transform duration-base ease-out-soft group-open:rotate-180",
                    "motion-reduce:transition-none",
                  )}
                />
              </summary>

              <div data-slot="faq-answer" className="pb-5 pr-8">
                <p className="leading-body text-muted-foreground">{item.answer}</p>
                {link
                  ? renderLink?.(link, { className: linkClass }) ?? (
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    )
                  : null}
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}

/**
 * schema.org FAQPage for the same items `FaqList` renders.
 *
 * No `@context`: apps usually merge several nodes into one `@graph` that
 * carries the context once. Wrap it yourself when emitting it standalone.
 */
export function faqPageJsonLd(items: Pick<FaqItem, "question" | "answer">[]) {
  return {
    "@type": "FAQPage" as const,
    mainEntity: items.map(item => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: { "@type": "Answer" as const, text: item.answer },
    })),
  }
}

export default FaqList
