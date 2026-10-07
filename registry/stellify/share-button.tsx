"use client"

import { useEffect, useRef, useState } from "react"
import type { FC, MouseEvent } from "react"
import { Check, ExternalLink, Link2, Mail, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface ShareButtonProps {
  /** Absolute URL to share — the canonical one, not `location.href`. */
  url: string
  title: string
  /** Short blurb for channels that carry text (WhatsApp, X, email). */
  text?: string
  label?: string
  className?: string
}

export interface ShareTarget {
  name: string
  href: string
}

/**
 * Share-intent URLs for the fallback menu. Pure, so it can be tested and
 * reused (e.g. in a footer) without rendering the button.
 */
export function buildShareLinks(url: string, title: string, text?: string): ShareTarget[] {
  const u = encodeURIComponent(url)
  const blurb = text ?? title
  return [
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${blurb} ${url}`)}` },
    { name: "X", href: `https://x.com/intent/post?url=${u}&text=${encodeURIComponent(blurb)}` },
    {
      name: "Correo",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        text ? `${text}\n\n${url}` : url,
      )}`,
    },
  ]
}

type CopyState = "idle" | "copied" | "failed"

const itemClass =
  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-popover-foreground " +
  "transition-colors duration-base ease-out-soft hover:bg-accent hover:text-accent-foreground " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none " +
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"

/**
 * Share button: the OS share sheet where there is one, a small menu otherwise.
 *
 * `navigator.share` is checked at click time, never during render, so the
 * prerendered HTML is identical everywhere and nothing reads `navigator` on
 * the server. The fallback is plain share-intent links — no third-party
 * scripts, no tracking pixels. A cancelled share sheet (AbortError) is not an
 * error and is ignored; any other failure falls back to the menu.
 */
export const ShareButton: FC<ShareButtonProps> = ({
  url,
  title,
  text,
  label = "Compartir",
  className,
}) => {
  const [open, setOpen] = useState(false)
  const [copy, setCopy] = useState<CopyState>("idle")
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const handleTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") return
    // Native sheet available: stop the popover from toggling.
    event.preventDefault()
    navigator.share({ url, title, text }).catch((error: unknown) => {
      if ((error as { name?: string } | null)?.name === "AbortError") return
      setOpen(true)
    })
  }

  const handleCopy = async () => {
    clearTimeout(resetTimer.current)
    try {
      await navigator.clipboard.writeText(url)
      setCopy("copied")
    } catch {
      setCopy("failed")
    }
    resetTimer.current = setTimeout(() => setCopy("idle"), 2000)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={handleTriggerClick}>
        <Button
          variant="secondary"
          size="sm"
          data-slot="share-button"
          className={className}
        >
          <Share2 aria-hidden="true" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={label}
        data-slot="share-button-menu"
        className="w-60 p-1.5"
      >
        <ul className="flex flex-col">
          <li>
            <button type="button" className={itemClass} onClick={handleCopy}>
              {copy === "copied" ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
              Copiar enlace
            </button>
          </li>
          {buildShareLinks(url, title, text).map(target => {
            const isMail = target.href.startsWith("mailto:")
            return (
              <li key={target.name}>
                <a
                  href={target.href}
                  className={itemClass}
                  {...(isMail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {isMail ? <Mail aria-hidden="true" /> : <ExternalLink aria-hidden="true" />}
                  {target.name}
                  {isMail ? null : <span className="sr-only"> (se abre en una pestaña nueva)</span>}
                </a>
              </li>
            )
          })}
        </ul>
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "px-3 text-xs text-muted-foreground",
            copy === "idle" ? "sr-only" : "pb-1 pt-2",
          )}
        >
          {copy === "copied" ? "Enlace copiado" : null}
          {copy === "failed" ? "No se ha podido copiar. Copia la dirección desde el navegador." : null}
        </p>
      </PopoverContent>
    </Popover>
  )
}

export default ShareButton
