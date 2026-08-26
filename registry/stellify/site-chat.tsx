import { useEffect, useRef, useState } from "react"
import type { FC, FormEvent, ReactNode } from "react"
import { Send } from "lucide-react"

import { cn } from "@/lib/utils"

export interface SiteChatFaq {
  question: string
  answer: string
  /** Page that develops the answer. Required: an answer with no source is not shown. */
  href: string
  linkLabel?: string
}

export interface SiteChatCitation {
  label: string
  href: string
}

export interface SiteChatMessage {
  role: "user" | "assistant"
  text: string
  /** Answers must cite a real section; uncited answers are not rendered. */
  citations?: SiteChatCitation[]
}

/** What the panel is doing, surfaced to the reader instead of a mute spinner. */
export type SiteChatPhase = "idle" | "searching" | "writing"

export interface SiteChatProps {
  title: string
  description?: string
  /** Always rendered. This is the default state and the fallback for every failure. */
  faqs: SiteChatFaq[]
  /**
   * Conversation is only offered when this is true. While the service does not
   * exist, the panel is the FAQ block and nothing else — no error, no
   * "unavailable" notice, no indefinite spinner.
   */
  enabled?: boolean
  messages?: SiteChatMessage[]
  phase?: SiteChatPhase
  /** Turns already spent, against maxTurns. */
  turnsUsed?: number
  maxTurns?: number
  maxMessageLength?: number
  onSend?: (text: string) => void
  /** Slot for the bot check (Turnstile) rendered before the first turn. */
  verification?: ReactNode
  className?: string
}

const PHASE_LABEL: Record<Exclude<SiteChatPhase, "idle">, string> = {
  searching: "Buscando en el contenido…",
  writing: "Redactando…",
}

/**
 * Public chat panel, built degraded-first.
 *
 * The default state — the one live while no assistant service exists — is a
 * block of frequently asked questions with real answers and links. That is
 * indexable content that stands on its own, not a placeholder.
 *
 * When `enabled` turns true the same block gains a composer and the questions
 * become first-turn suggestions. Same space, same component: connecting the
 * service must not require a redesign.
 *
 * It never renders a raw error, an "unavailable" message or an indefinite
 * spinner. Any failure resolves to the FAQ block.
 */
export const SiteChat: FC<SiteChatProps> = ({
  title,
  description,
  faqs,
  enabled = false,
  messages = [],
  phase = "idle",
  turnsUsed = 0,
  maxTurns = 8,
  maxMessageLength = 500,
  onSend,
  verification,
  className,
}) => {
  const [draft, setDraft] = useState("")
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [messages.length, phase])

  const exhausted = turnsUsed >= maxTurns
  const canSend = enabled && !exhausted && phase === "idle" && draft.trim().length > 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSend) return
    onSend?.(draft.trim().slice(0, maxMessageLength))
    setDraft("")
  }

  return (
    <section
      className={cn(
        "rounded-[--radius-card] border border-border bg-card p-8 shadow-[--shadow-card]",
        className,
      )}
    >
      <h2 className="text-2xl font-semibold tracking-[--tracking-display] text-card-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-prose text-muted-foreground">{description}</p>
      ) : null}

      {enabled && messages.length > 0 ? (
        <div
          ref={logRef}
          className="mt-6 max-h-80 space-y-4 overflow-y-auto"
          role="log"
          aria-live="polite"
          aria-label="Conversación"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "rounded-[--radius-icon] px-4 py-3 text-sm",
                message.role === "user"
                  ? "bg-muted text-foreground"
                  : "bg-accent text-accent-foreground",
              )}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              {message.citations?.length ? (
                <ul className="mt-2 flex flex-wrap gap-3">
                  {message.citations.map(citation => (
                    <li key={citation.href}>
                      <a
                        href={citation.href}
                        className="text-xs underline underline-offset-4 hover:no-underline"
                      >
                        {citation.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {/*
        The FAQ list. Always rendered, so it is present in the prerendered HTML
        and survives the panel's JS failing to load entirely.
      */}
      <ul className="mt-6 space-y-4">
        {faqs.map(faq => (
          <li
            key={faq.question}
            className="rounded-[--radius-icon] border border-border/60 p-4"
          >
            <p className="font-medium text-card-foreground">{faq.question}</p>
            <p className="mt-2 text-sm leading-[--leading-body] text-muted-foreground">
              {faq.answer}
            </p>
            <a
              href={faq.href}
              className="mt-3 inline-block text-sm underline underline-offset-4 hover:no-underline"
            >
              {faq.linkLabel ?? "Ver más"}
            </a>
          </li>
        ))}
      </ul>

      {enabled ? (
        <form onSubmit={handleSubmit} className="mt-6">
          {verification}

          <div className="flex gap-3">
            <label htmlFor="site-chat-input" className="sr-only">
              Escribe tu pregunta
            </label>
            <input
              id="site-chat-input"
              value={draft}
              onChange={event => setDraft(event.target.value)}
              maxLength={maxMessageLength}
              disabled={exhausted || phase !== "idle"}
              placeholder="Escribe tu pregunta…"
              className={cn(
                "flex-1 rounded-[--radius-pill] border border-input bg-background px-4 py-2.5 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            />
            <button
              type="submit"
              disabled={!canSend}
              className={cn(
                "inline-flex items-center gap-2 rounded-[--radius-pill] bg-primary px-5 py-2.5",
                "text-sm font-medium text-primary-foreground disabled:opacity-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Enviar
            </button>
          </div>

          {/* Progress is named, not mute: the model runs on a home GPU and queues. */}
          <p className="mt-3 min-h-5 text-xs text-muted-foreground" aria-live="polite">
            {phase !== "idle" ? PHASE_LABEL[phase] : null}
            {exhausted ? "Has alcanzado el máximo de preguntas de esta sesión." : null}
          </p>
        </form>
      ) : null}
    </section>
  )
}
