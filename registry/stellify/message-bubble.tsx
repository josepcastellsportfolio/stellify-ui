import { useId, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface MessageBubbleProps {
  role: "user" | "assistant"
  /** Visually hidden heading that names the message for screen readers ("Tú", "Respuesta"). */
  heading: string
  /** Level of that hidden heading in the page outline. Default 2. */
  headingLevel?: 2 | 3 | 4
  /** Small line above an assistant message (model name, privacy). */
  meta?: ReactNode
  /** Under the content: tool activity, status, message actions. */
  footer?: ReactNode
  /** While streaming: hide the changing text from assistive tech (announce it once when it ends). */
  hideFromAssistiveTech?: boolean
  children?: ReactNode
  className?: string
}

/**
 * One message of a conversation. User messages are a tonal bubble on the
 * right; assistant messages read like a document on the left, no box. Each
 * message is an `<article>` named by a hidden heading, so screen-reader users
 * can jump between messages with the heading or landmark keys. Add
 * `group/message` hover styles (e.g. `message-actions`) through `footer`.
 */
export function MessageBubble({
  role,
  heading,
  headingLevel = 2,
  meta,
  footer,
  hideFromAssistiveTech,
  children,
  className,
}: MessageBubbleProps) {
  const headingId = useId()
  const user = role === "user"
  const Heading = `h${headingLevel}` as const
  return (
    <article
      data-slot="message-bubble"
      data-role={role}
      aria-labelledby={headingId}
      className={cn("group/message flex flex-col gap-1.5", user ? "items-end" : "items-start", className)}
    >
      <Heading id={headingId} className="sr-only">
        {heading}
      </Heading>
      {meta && !user ? <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{meta}</div> : null}
      {children !== undefined && children !== null && children !== "" ? (
        <div
          aria-hidden={hideFromAssistiveTech || undefined}
          className={cn(
            "text-[0.9375rem]",
            user
              ? "max-w-[85%] whitespace-pre-wrap break-words rounded-lg bg-surface-3 px-4 py-2.5 text-foreground"
              : "w-full text-foreground"
          )}
        >
          {children}
        </div>
      ) : null}
      {footer ? <div className={cn("flex w-full flex-col gap-1.5", user && "items-end")}>{footer}</div> : null}
    </article>
  )
}
