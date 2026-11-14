"use client"

import { useEffect, useState } from "react"
import { Copy, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PairingQrLabels {
  /** Accessible name of the QR image. */
  qrAlt: string
  /** Label above the code text. */
  code: string
  /** "Caduca en 4:59". Receives the formatted remaining time. */
  expiresIn: (time: string) => string
  expired: string
  regenerate: string
  /** Shows a "copy link" button when set. */
  copyLink?: string
  linkCopied?: string
}

const DEFAULT_LABELS: PairingQrLabels = {
  qrAlt: "Código QR para vincular el dispositivo",
  code: "Código",
  expiresIn: (time) => `Caduca en ${time}`,
  expired: "El código ha caducado.",
  regenerate: "Generar otro código",
}

export interface PairingQrProps {
  /** What the QR encodes (the pairing link). */
  value: string
  /** The one-time code, also shown as text for devices without a camera. */
  code: string
  /** When the code stops working (ms since epoch). */
  expiresAt: number
  /** Defaults in Spanish; `copyLink` has none (no button unless you name it). */
  labels?: Partial<PairingQrLabels>
  /** Ask for a new code (offered once expired). */
  onRegenerate: () => void
  regenerating?: boolean
  className?: string
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

/** SVG path of the QR modules; `qrcode` is loaded only when a QR is shown. */
function useQrPath(value: string): { path: string; size: number } | null {
  const [qr, setQr] = useState<{ value: string; path: string; size: number } | null>(null)
  useEffect(() => {
    let alive = true
    import("qrcode").then(({ default: QRCode }) => {
      const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" })
      const size = modules.size
      let path = ""
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (modules.get(x, y)) path += `M${x} ${y}h1v1h-1z`
        }
      }
      if (alive) setQr({ value, path, size })
    })
    return () => {
      alive = false
    }
  }, [value])
  return qr && qr.value === value ? qr : null
}

/**
 * Pairing QR with the code as text and a live countdown. The QR is always
 * black on white with a quiet zone (cameras need it, even in dark mode). The
 * countdown is a `timer` (not announced every second); expiry is announced
 * once and offers a new code.
 */
export function PairingQr({ value, code, expiresAt, labels, onRegenerate, regenerating, className }: PairingQrProps) {
  const l = { ...DEFAULT_LABELS, ...labels }
  const qr = useQrPath(value)
  const [now, setNow] = useState(() => Date.now())
  const [copied, setCopied] = useState(false)
  const remaining = expiresAt - now
  const expired = remaining <= 0

  useEffect(() => {
    if (expired) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [expired, expiresAt])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Clipboard blocked: the code is still shown as text.
    }
  }

  const quiet = 4
  const box = qr ? qr.size + quiet * 2 : 0

  return (
    <div data-slot="pairing-qr" className={cn("flex flex-col items-center gap-4", className)}>
      {/* Literal white and black on purpose: a QR must stay dark-on-light in every theme. */}
      <div className={cn("rounded-lg bg-[#fff] p-2", expired && "opacity-25")}>
        {qr ? (
          <svg
            role="img"
            aria-label={l.qrAlt}
            viewBox={`${-quiet} ${-quiet} ${box} ${box}`}
            className="size-52"
            shapeRendering="crispEdges"
          >
            <rect x={-quiet} y={-quiet} width={box} height={box} fill="#fff" />
            <path d={qr.path} fill="#000" />
          </svg>
        ) : (
          <div className="size-52" aria-hidden />
        )}
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm text-muted-foreground">{l.code}</p>
        <p className="select-all break-all font-mono text-base font-semibold tracking-wide text-foreground">{code}</p>
      </div>
      <div role="status" className="text-sm empty:sr-only">
        {expired ? <span className="font-medium text-danger">{l.expired}</span> : null}
      </div>
      {!expired ? (
        <p role="timer" aria-live="off" className="font-mono text-sm tabular-nums text-muted-foreground">
          {l.expiresIn(formatRemaining(remaining))}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2">
        {expired ? (
          <Button type="button" size="lg" onClick={onRegenerate} loading={regenerating}>
            <RefreshCw aria-hidden />
            {l.regenerate}
          </Button>
        ) : l.copyLink ? (
          <Button type="button" variant="secondary" size="lg" onClick={copyLink}>
            <Copy aria-hidden />
            <span aria-live="polite">{copied && l.linkCopied ? l.linkCopied : l.copyLink}</span>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
