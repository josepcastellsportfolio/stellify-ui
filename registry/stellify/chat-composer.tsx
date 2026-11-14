"use client"

import { useId, type ComponentProps, type FormEvent, type KeyboardEvent, type PointerEvent, type ReactNode, type Ref } from "react"
import { Square } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface ChatComposerLabels {
  /** Accessible name of the text box. */
  input: string
  placeholder: string
  send: string
  stop: string
  /** Keyboard hint under the card, tied to the box with `aria-describedby` ("Intro envía · Mayús+Intro, nueva línea"). */
  hint?: string
}

const DEFAULT_LABELS: ChatComposerLabels = {
  input: "Mensaje",
  placeholder: "Escribe un mensaje",
  send: "Enviar",
  stop: "Detener",
}

export interface ChatComposerProps {
  value: string
  onValueChange: (value: string) => void
  /** Called with the trimmed text on Enter or the send button. */
  onSubmit: (text: string) => void
  /** Called by the stop button, and by Escape inside the box, while `state` is "streaming". */
  onStop: () => void
  /** "streaming" swaps send for stop; "blocked" keeps typing but disables sending. */
  state: "idle" | "streaming" | "blocked"
  /** Defaults in Spanish: input "Mensaje", placeholder "Escribe un mensaje", send "Enviar", stop "Detener". */
  labels?: Partial<ChatComposerLabels>
  /**
   * Left side of the card's footer: the settings of the next message, as
   * `ChatComposerControl`s or a `model-picker` (model, "don't save"…).
   */
  leading?: ReactNode
  /** Right side of the footer, before send: a mic button, a "stop reading" button. */
  controls?: ReactNode
  /** Line under the card: why the card is tinted, what is busy, what failed. */
  notice?: ReactNode
  /** "private" tints the card with the brand, paired with `notice` (never color alone). */
  tone?: "default" | "private"
  /** Above the box, inside the card: attachments, a quoted message. */
  header?: ReactNode
  textareaRef?: Ref<HTMLTextAreaElement>
  id?: string
  /** Tallest the box grows before it scrolls, in px. Default 240. */
  maxHeight?: number
  className?: string
}

const CONTROL =
  "relative inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 text-sm font-medium text-foreground/80 transition-colors duration-(--duration-fast) hover:bg-surface-3 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--focus) disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-surface-3 aria-pressed:text-foreground aria-expanded:bg-surface-3 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg:not([class*='text-'])]:text-muted-foreground [@media(pointer:coarse)]:after:absolute [@media(pointer:coarse)]:after:-inset-y-1.5 [@media(pointer:coarse)]:after:inset-x-0 [@media(pointer:coarse)]:after:min-h-11"

/** Classes of a footer control, for a trigger that is not a `ChatComposerControl` (e.g. `model-picker`'s `className`). */
export const chatComposerControlClassName = CONTROL

/**
 * Compact ghost button for the composer's footer: 32 px tall, 44 px hit area
 * on touch screens. Use `aria-pressed` for toggles ("No guardar"): the
 * pressed state gets a background as well as its name.
 */
export function ChatComposerControl({ className, type = "button", ...props }: ComponentProps<"button">) {
  return <button data-slot="chat-composer-control" type={type} className={cn(CONTROL, className)} {...props} />
}

/** Up arrow drawn at 14 px with a 1.8 stroke: reads as "send" at a small size better than an icon font. */
function SendGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 11.5V2.5M7 2.5L3 6.5M7 2.5L11 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Message box as one card: the text on top and a footer with the next
 * message's settings on the left and the voice and send buttons on the right.
 * The box grows with its content up to `maxHeight`; Enter sends, Shift+Enter
 * adds a line (IME composition is respected); a stop button replaces send
 * while a reply streams, and Escape inside the box stops it too.
 *
 * Focus inside the box strengthens the card's edge, so the box and its
 * buttons read as one control. A click on the card's empty space focuses the box.
 */
export function ChatComposer({
  value,
  onValueChange,
  onSubmit,
  onStop,
  state,
  labels,
  leading,
  controls,
  notice,
  tone = "default",
  header,
  textareaRef,
  id,
  maxHeight = 240,
  className,
}: ChatComposerProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const autoId = useId()
  const boxId = id ?? `chat-composer-${autoId}`
  const hintId = `${boxId}-hint`
  const streaming = state === "streaming"
  const canSend = state === "idle" && value.trim().length > 0

  const submit = () => {
    if (canSend) onSubmit(value.trim())
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      submit()
    } else if (event.key === "Escape" && streaming) {
      event.preventDefault()
      event.stopPropagation()
      onStop()
    }
  }

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  // Clicks on the card's padding (not on a control) put the caret in the box.
  const onCardPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    event.preventDefault()
    document.getElementById(boxId)?.focus()
  }

  return (
    <form data-slot="chat-composer" onSubmit={onFormSubmit} className={cn("flex flex-col gap-2", className)}>
      <div
        data-slot="chat-composer-card"
        data-tone={tone}
        onPointerDown={onCardPointerDown}
        className={cn(
          "flex cursor-text flex-col rounded-2xl border shadow-[0_1px_2px_rgb(0_0_0/4%),0_8px_24px_-12px_rgb(0_0_0/18%)] transition-[background-color,border-color] duration-(--duration-fast) dark:shadow-none",
          // Typing focus shows as a stronger edge (a text box always matches :focus-visible, so a
          // full outline would sit on the card the whole time); the caret marks the spot.
          tone === "private"
            ? "border-brand/40 bg-brand-subtle has-[textarea:focus]:border-brand"
            : "border-(--field-edge) bg-surface-1 has-[textarea:focus]:border-foreground/45"
        )}
      >
        {header}
        <Textarea
          ref={textareaRef}
          id={boxId}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          autoResize
          maxHeight={maxHeight}
          aria-label={l.input}
          aria-describedby={l.hint ? hintId : undefined}
          placeholder={l.placeholder}
          enterKeyHint="send"
          className="min-h-14 w-full resize-none rounded-none border-0 bg-transparent px-4 pb-1 pt-3.5 text-base leading-6 hover:bg-transparent focus-visible:outline-none md:text-[0.9375rem]"
        />
        <div
          data-slot="chat-composer-footer"
          className="flex min-w-0 cursor-default items-center gap-1 px-2 pb-2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">{leading}</div>
          <div className="flex shrink-0 items-center gap-1.5">
            {controls}
            {streaming ? (
              <button
                type="button"
                onClick={onStop}
                className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-(--duration-fast) hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus) sm:size-8 motion-reduce:hover:scale-100 [@media(pointer:coarse)]:after:absolute [@media(pointer:coarse)]:after:-inset-1"
              >
                <Square className="size-3 fill-current" aria-hidden />
                <span className="sr-only">{l.stop}</span>
              </button>
            ) : (
              <button
                type="submit"
                aria-disabled={!canSend || undefined}
                className={cn(
                  "relative inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color] duration-(--duration-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus) sm:size-8 [@media(pointer:coarse)]:after:absolute [@media(pointer:coarse)]:after:-inset-1",
                  canSend
                    ? "bg-primary text-primary-foreground hover:scale-105 motion-reduce:hover:scale-100"
                    : "cursor-not-allowed bg-foreground/12 text-muted-foreground"
                )}
              >
                <SendGlyph />
                <span className="sr-only">{l.send}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {notice || l.hint ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-2 text-xs text-muted-foreground">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">{notice}</div>
          {l.hint ? (
            <p id={hintId} className="ml-auto hidden sm:block">
              {l.hint}
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
