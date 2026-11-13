"use client"

import { useId, type FormEvent, type KeyboardEvent, type ReactNode, type Ref } from "react"
import { ArrowUp, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface ChatComposerLabels {
  /** Accessible name of the text box. */
  input: string
  placeholder: string
  send: string
  stop: string
  /** Keyboard hint under the box, tied to it with `aria-describedby` ("Intro envía · Mayús+Intro, nueva línea"). */
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
  /** Controls before the send button, inside the frame: a model picker, a mic button. */
  controls?: ReactNode
  /** Row under the box: per-message options such as a "don't save" switch. */
  options?: ReactNode
  /** Line under the box that explains the frame's tone (e.g. "Modelo privado: nada sale de tu red"). */
  notice?: ReactNode
  /** "private" tints the frame with the brand, paired with `notice` (never color alone). */
  tone?: "default" | "private"
  textareaRef?: Ref<HTMLTextAreaElement>
  id?: string
  /** Tallest the box grows before it scrolls, in px. Default 240. */
  maxHeight?: number
  className?: string
}

/**
 * Message box: grows with its content up to `maxHeight` and shrinks back when
 * cleared, Enter sends, Shift+Enter adds a line (IME composition is
 * respected), and a stop button replaces send while a reply streams. The
 * focus outline is drawn on the whole frame, so the box and its buttons read
 * as one control.
 */
export function ChatComposer({
  value,
  onValueChange,
  onSubmit,
  onStop,
  state,
  labels,
  controls,
  options,
  notice,
  tone = "default",
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

  return (
    <form data-slot="chat-composer" onSubmit={onFormSubmit} className={cn("flex flex-col gap-2", className)}>
      <div
        data-tone={tone}
        className={cn(
          "flex items-end gap-2 rounded-lg p-2 pl-4 transition-colors duration-(--duration-fast)",
          "has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-(--focus)",
          tone === "private" ? "bg-brand-subtle" : "bg-surface-2"
        )}
      >
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
          className="min-h-11 flex-1 self-center rounded-none border-0 bg-transparent px-0 py-2.5 text-base leading-6 hover:bg-transparent focus-visible:outline-none md:text-base"
        />
        {controls}
        {streaming ? (
          <Button type="button" variant="secondary" onClick={onStop} className="h-11 shrink-0">
            <Square className="fill-current" aria-hidden />
            {l.stop}
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            aria-disabled={!canSend || undefined}
            className={cn("size-11 shrink-0", !canSend && "cursor-not-allowed opacity-50 hover:bg-primary")}
          >
            <ArrowUp aria-hidden />
            <span className="sr-only">{l.send}</span>
          </Button>
        )}
      </div>
      {notice || options || l.hint ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {notice}
            {options}
          </div>
          {l.hint ? (
            <p id={hintId} className="hidden sm:block">
              {l.hint}
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
