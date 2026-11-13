import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  /** Grow with the content instead of scrolling. */
  autoResize?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, onInput, ...props }, ref) => {
    const handleInput = (event: Parameters<NonNullable<TextareaProps["onInput"]>>[0]) => {
      if (autoResize) {
        const box = event.currentTarget
        box.style.height = "auto"
        box.style.height = `${box.scrollHeight}px`
      }
      onInput?.(event)
    }
    return (
      <textarea
        data-slot="textarea"
        className={cn(
          "flex min-h-[80px] w-full rounded-md bg-field px-3 py-2 text-base text-foreground transition-colors duration-(--duration-fast) hover:bg-field-hover placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:bg-danger-subtle md:text-sm",
          autoResize && "resize-none overflow-hidden field-sizing-content",
          className
        )}
        ref={ref}
        onInput={handleInput}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
