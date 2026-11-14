import type { Meta, StoryObj } from "@storybook/react-vite"
import { startTransition, useOptimistic, useState, type ReactNode } from "react"
import { Heart, MoreHorizontal } from "lucide-react"

import { Button } from "@stellify/button"
import { Checkbox } from "@stellify/checkbox"
import { Switch } from "@stellify/switch"
import { SegmentedControl } from "@stellify/segmented-control"
import { Popover, PopoverContent, PopoverTrigger } from "@stellify/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@stellify/dropdown-menu"
import { NumberInput } from "@stellify/number-input"
import { Stagger } from "@stellify/stagger"
import { useViewTransition } from "@stellify/use-view-transition"
import { Illustration, type IllustrationName } from "@stellify/illustration"

/**
 * The library's UX, motion and type principles, live. The full list (40, and
 * where each one is applied) is in `docs/principles.md`.
 */
const meta = {
  title: "Foundations/Principles",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj

function Demo({ title, note, children }: { title: string; note: ReactNode; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-b py-8 first:pt-0 md:grid-cols-[minmax(0,18rem)_1fr]">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">{note}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  )
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/* ---------------------------------------------------------------- Motion */

export const Motion: Story = {
  render: function Render() {
    const [range, setRange] = useState<"7d" | "30d" | "90d">("30d")
    const [on, setOn] = useState(true)
    return (
      <div>
        <Demo
          title="Squash & snappy timing"
          note="Press and hold: the button compresses to 97% in 120ms and springs back. Feedback is immediate, never animated for show."
        >
          <Button>Guardar</Button>
          <Button variant="secondary">Cancelar</Button>
        </Demo>
        <Demo
          title="Interruptible + follow-through"
          note="Click options quickly: the indicator retargets from where it is (never queues) and lands with a small overshoot (--ease-spring). Same for the switch thumb."
        >
          <SegmentedControl
            aria-label="Periodo"
            value={range}
            onValueChange={setRange}
            options={[
              { value: "7d", label: "7 días" },
              { value: "30d", label: "30 días" },
              { value: "90d", label: "90 días" },
            ]}
          />
          <Switch checked={on} onCheckedChange={setOn} aria-label="Avisos" />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox defaultChecked /> Secondary action: the check lands
          </label>
        </Demo>
        <Demo
          title="Origin-aware"
          note="Menus and popovers grow out of their trigger, wherever it is, instead of from their own center."
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">Popover</Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="text-sm">
              Crece desde el botón que lo abre.
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="base" size="icon" aria-label="Acciones">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicar</DropdownMenuItem>
              <DropdownMenuItem>Mover</DropdownMenuItem>
              <DropdownMenuItem>Archivar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Demo>
      </div>
    )
  },
}

/* --------------------------------------------------------------- Stagger */

const RESULTS = ["Informe trimestral", "Contrato marco", "Acta de reunión", "Presupuesto 2027", "Plan de medios", "Encuesta clientes"]

export const StaggerEntrance: Story = {
  name: "Stagger",
  render: function Render() {
    const [run, setRun] = useState(0)
    return (
      <Demo
        title="Stagger"
        note="Arriving results fade in 40ms apart, capped at 8 steps. Use it for content that arrives, never for what someone is acting on."
      >
        <div className="flex w-full max-w-md flex-col gap-3">
          <Button variant="secondary" className="self-start" onClick={() => setRun((n) => n + 1)}>
            Volver a buscar
          </Button>
          <ul className="flex flex-col gap-1">
            <Stagger replayKey={run}>
              {RESULTS.map((r) => (
                <li key={r} className="rounded-md bg-surface-2 px-3 py-2 text-sm">
                  {r}
                </li>
              ))}
            </Stagger>
          </ul>
        </div>
      </Demo>
    )
  },
}

/* ---------------------------------------------- Shared element transition */

const PLATES: { id: IllustrationName; name: string }[] = [
  { id: "nautilus", name: "Nautilus" },
  { id: "rose", name: "Rosa" },
  { id: "beetles", name: "Escarabajos" },
]

export const SharedElement: Story = {
  name: "Shared element transition",
  render: function Render() {
    const [open, setOpen] = useState<IllustrationName | null>(null)
    const start = useViewTransition()
    const plate = PLATES.find((p) => p.id === open)
    return (
      <Demo
        title="Shared element transition"
        note="One element grows into the next view: the card's plate becomes the detail's hero (View Transitions API; instant where unsupported or under reduced motion)."
      >
        {plate ? (
          <div className="flex w-full max-w-lg flex-col gap-4 rounded-lg bg-surface-2 p-6">
            <Illustration
              name={plate.id}
              className="w-40 self-center"
              style={{ viewTransitionName: `plate-${plate.id}` }}
            />
            <h4 className="text-lg font-semibold" style={{ viewTransitionName: `title-${plate.id}` }}>
              {plate.name}
            </h4>
            <Button variant="secondary" className="self-start" onClick={() => start(() => setOpen(null))}>
              Volver
            </Button>
          </div>
        ) : (
          <div className="grid w-full max-w-lg grid-cols-3 gap-3">
            {PLATES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => start(() => setOpen(p.id))}
                className="flex flex-col items-center gap-2 rounded-lg bg-surface-2 p-4 transition-colors duration-(--duration-fast) hover:bg-surface-3"
              >
                <Illustration name={p.id} className="w-16" style={{ viewTransitionName: `plate-${p.id}` }} />
                <span className="text-sm font-medium" style={{ viewTransitionName: `title-${p.id}` }}>
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </Demo>
    )
  },
}

/* ------------------------------------------------------------- UX laws */

export const UxLaws: Story = {
  name: "UX laws",
  render: function Render() {
    const [saving, setSaving] = useState<"fast" | "slow" | null>(null)
    const [liked, setLiked] = useState(false)
    const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked)
    const [fail, setFail] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [amount, setAmount] = useState<number | null>(1250)
    const [showHit, setShowHit] = useState(false)

    const save = async (kind: "fast" | "slow") => {
      setSaving(kind)
      await wait(kind === "fast" ? 100 : 1500)
      setSaving(null)
    }
    const toggleLike = () => {
      setError(null)
      startTransition(async () => {
        setOptimisticLiked(!liked)
        await wait(800)
        if (fail) setError("No se pudo guardar. Se ha deshecho el cambio.")
        else setLiked(!liked)
      })
    }

    return (
      <div>
        <Demo
          title="Doherty threshold + layout shift"
          note="A 100ms save shows no spinner at all (under --delay-feedback, 150ms). A slow one fades the spinner in over the label, which keeps its width: nothing around it moves."
        >
          <Button loading={saving === "fast"} onClick={() => save("fast")}>
            Guardar (rápido)
          </Button>
          <Button loading={saving === "slow"} onClick={() => save("slow")}>
            Guardar (lento)
          </Button>
        </Demo>
        <Demo
          title="Optimistic update"
          note="The heart changes at once; the request takes 800ms. If it fails, the change rolls back and says so (never a silent revert)."
        >
          <Button
            variant="secondary"
            aria-pressed={optimisticLiked}
            onClick={toggleLike}
            className={optimisticLiked ? "text-danger" : undefined}
          >
            <Heart className={optimisticLiked ? "fill-current" : undefined} />
            {optimisticLiked ? "Guardado" : "Guardar"}
          </Button>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={fail} onCheckedChange={(v) => setFail(v === true)} /> Simular error
          </label>
          {error && <p className="w-full text-sm text-danger">{error}</p>}
        </Demo>
        <Demo
          title="Postel's law"
          note={'Type "1.234,5", "1,234.5", "12,5 €" or "−3": all read. The range (0–5000) applies on blur, not while you type.'}
        >
          <div className="w-56">
            <NumberInput label="Importe" value={amount} onChange={setAmount} min={0} max={5000} />
          </div>
          <output className="font-mono text-sm text-muted-foreground">value = {String(amount)}</output>
        </Demo>
        <Demo
          title="Bigger hit areas"
          note="On touch screens small controls get an invisible area of at least 44px; the drawing doesn't grow. Toggle to see the areas (simulated here for a mouse)."
        >
          <div
            className={
              showHit
                ? "flex items-center gap-4 [&_[data-hit]]:relative [&_[data-hit]]:after:absolute [&_[data-hit]]:after:inset-[min(0px,calc((100%-44px)/2))] [&_[data-hit]]:after:bg-info/20"
                : "flex items-center gap-4"
            }
          >
            <Checkbox data-hit aria-label="Elegir" />
            <Switch data-hit aria-label="Activar" />
            <Button data-hit size="icon" variant="base" aria-label="Más">
              <MoreHorizontal />
            </Button>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowHit((v) => !v)}>
            {showHit ? "Ocultar áreas" : "Ver áreas"}
          </Button>
        </Demo>
      </div>
    )
  },
}

/* ------------------------------------------------------------------ Type */

const PRICES = [1111.11, 98.5, 20480, 7.07]

export const Type: Story = {
  render: () => (
    <div>
      <Demo
        title="Tabular numbers"
        note="Left: proportional figures, the columns drift. Right: tabular (default in tables, time, data, output), every digit is the same width."
      >
        {(["proportional-nums", "tabular-nums"] as const).map((c) => (
          <div key={c} className={`${c} flex flex-col items-end rounded-md bg-surface-2 px-4 py-2 text-sm`}>
            {PRICES.map((p) => (
              <span key={p}>{p.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €</span>
            ))}
          </div>
        ))}
      </Demo>
      <Demo
        title="Widows"
        note="Headings balance their lines; paragraphs avoid a lone last word. Both are on in the base layer (left shows the browser default)."
      >
        <h4 className="w-64 text-lg font-semibold [text-wrap:wrap]">Prepara la migración de tus productos al nuevo sistema</h4>
        <h4 className="w-64 text-lg font-semibold">Prepara la migración de tus productos al nuevo sistema</h4>
      </Demo>
      <Demo
        title="Line length"
        note="Running text stays near 60–75 characters (max-w-prose). Longer lines lose the reader at the line break."
      >
        <p className="max-w-prose text-sm leading-relaxed">
          Un párrafo a la medida justa se lee sin esfuerzo: el ojo vuelve al principio de la línea siguiente sin perderse,
          y el texto mantiene un ritmo cómodo aunque el contenedor sea muy ancho, como en una pantalla de escritorio
          grande o en un panel lateral desplegado.
        </p>
      </Demo>
    </div>
  ),
}
