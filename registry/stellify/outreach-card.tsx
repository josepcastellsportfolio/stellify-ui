import { useEffect, useId, useState } from "react"
import { AlertCircle, AlertTriangle, Check, Clock, Copy, Loader2, SquareKanban } from "lucide-react"

import { TextField } from "@/components/text-field"
import { TextareaField } from "@/components/textarea-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface OutreachCardProps {
  name: string
  status: "pending" | "generating" | "queued" | "ready" | "failed" | "sent"
  diagnosis?: string | null
  /** Tab label for the channel: "Correo en frío", "Llamada", "WhatsApp"… */
  channelLabel?: string
  subject?: string | null
  body?: string | null
  objections?: { objecion: string; respuesta: string }[]
  error?: string | null
  /** Short tags next to the name (e.g. the language: "ES", "CA"). */
  badges?: string[]
  /** Something to check before sending a ready draft; always visible. */
  warning?: string | null
  /** Extra buttons for this message (e.g. "Regenerar en català"). */
  actions?: { label: string; onClick: () => void; disabled?: boolean }[]
  retryLabel?: string
  onSave: (edit: { subject: string | null; body: string }) => void
  saving?: boolean
  /** "Guardar en seguimiento": shown on a ready message only when given. */
  onTrack?: () => void
  tracking?: boolean
  /** The business is already in the pipeline: the button turns into a disabled "En seguimiento". */
  tracked?: boolean
  labels?: Partial<
    Record<"subject" | "body" | "save" | "copy" | "copied" | "objections" | "generating" | "track" | "tracked", string>
  >
  className?: string
}

const DEFAULT_LABELS = {
  subject: "Asunto",
  body: "Mensaje",
  save: "Guardar cambios",
  copy: "Copiar",
  copied: "Copiado",
  objections: "Objeciones",
  generating: "Redactando…",
  track: "Guardar en seguimiento",
  tracked: "En seguimiento",
}

/** One generated message: diagnosis, channel tab, editable subject/body, copy; P2 objections tab. */
function OutreachCard({
  name,
  status,
  diagnosis,
  channelLabel = "Mensaje",
  subject = null,
  body = "",
  objections,
  error,
  badges = [],
  warning,
  actions = [],
  retryLabel,
  onSave,
  saving = false,
  onTrack,
  tracking = false,
  tracked = false,
  labels,
  className,
}: OutreachCardProps) {
  const t = { ...DEFAULT_LABELS, ...labels }
  const titleId = useId()
  const [draftSubject, setDraftSubject] = useState(subject ?? "")
  const [draftBody, setDraftBody] = useState(body ?? "")
  const [copied, setCopied] = useState(false)
  useEffect(() => setDraftSubject(subject ?? ""), [subject])
  useEffect(() => setDraftBody(body ?? ""), [body])
  const dirty = draftBody !== (body ?? "") || (subject !== null && draftSubject !== subject)
  const hasSubject = subject !== null

  const copy = async () => {
    await navigator.clipboard.writeText(hasSubject ? `${draftSubject}\n\n${draftBody}` : draftBody)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <article data-slot="outreach-card" data-status={status} aria-labelledby={titleId} className={cn("space-y-3 py-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={titleId} className="text-base font-semibold text-foreground">
          {name}
        </h3>
        {badges.map((b) => (
          <Badge key={b} variant="outline" size="xs" uppercase>
            {b}
          </Badge>
        ))}
        {actions.length > 0 && (
          <div className="ml-auto flex flex-wrap gap-2">
            {actions.map((a) => (
              <Button key={a.label} type="button" variant="base" size="sm" disabled={a.disabled} onClick={a.onClick}>
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      {diagnosis && <p className="text-sm text-muted-foreground">{diagnosis}</p>}
      {warning && (
        <p
          role="note"
          data-slot="outreach-card-warning"
          className="flex items-start gap-2 rounded-md bg-warning/15 px-3 py-2 text-sm text-foreground dark:bg-warning/20"
        >
          {/* text-warning on white is ~2:1, so the colour only marks the icon; the text stays text-foreground. */}
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <span>{warning}</span>
        </p>
      )}

      {(status === "pending" || status === "generating") && (
        <p role="status" aria-label={t.generating} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
          {t.generating}
        </p>
      )}
      {status === "queued" && (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4 text-warning" aria-hidden />
          {retryLabel ?? "En cola"}
        </p>
      )}
      {status === "failed" && (
        <p role="alert" className="inline-flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" aria-hidden />
          {error}
        </p>
      )}

      {(status === "ready" || status === "sent") && (
        <Tabs defaultValue="message">
          <div className="flex items-center gap-4">
            <TabsList variant="plain">
              <TabsTrigger value="message">{channelLabel}</TabsTrigger>
              {objections && objections.length > 0 && <TabsTrigger value="objections">{t.objections}</TabsTrigger>}
            </TabsList>
            <Button type="button" variant="base" size="sm" onClick={copy}>
              {copied ? <Check /> : <Copy />}
              {copied ? t.copied : t.copy}
            </Button>
            {onTrack && status === "ready" && (
              <Button type="button" variant="base" size="sm" disabled={tracked} loading={tracking} onClick={onTrack}>
                {tracked ? <Check /> : <SquareKanban />}
                {tracked ? t.tracked : t.track}
              </Button>
            )}
          </div>
          <TabsContent value="message" className="space-y-3">
            {hasSubject && <TextField label={t.subject} value={draftSubject} onChange={(e) => setDraftSubject(e.target.value)} />}
            <TextareaField label={t.body} autoResize value={draftBody} onChange={(e) => setDraftBody(e.target.value)} />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!dirty}
              loading={saving}
              onClick={() => onSave({ subject: hasSubject ? draftSubject : null, body: draftBody })}
            >
              {t.save}
            </Button>
          </TabsContent>
          {objections && objections.length > 0 && (
            <TabsContent value="objections">
              <dl className="space-y-3 text-sm">
                {objections.map((o) => (
                  <div key={o.objecion}>
                    <dt className="font-medium text-foreground">{o.objecion}</dt>
                    <dd className="text-muted-foreground">{o.respuesta}</dd>
                  </div>
                ))}
              </dl>
            </TabsContent>
          )}
        </Tabs>
      )}
    </article>
  )
}

export { OutreachCard }
