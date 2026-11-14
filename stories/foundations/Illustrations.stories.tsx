import type { Meta, StoryObj } from "@storybook/react-vite"
import { Illustration, ILLUSTRATIONS, type IllustrationFamily } from "@stellify/illustration"

const FAMILIES: { id: IllustrationFamily; label: string }[] = [
  { id: "botanical", label: "Botánica" },
  { id: "fauna", label: "Fauna" },
  { id: "objects", label: "Objetos y patrones" },
]

function Gallery({ tone }: { tone: "brand" | "foreground" | "muted" }) {
  return (
    <div className="flex flex-col gap-10">
      <p className="max-w-prose text-sm text-pretty text-muted-foreground">
        Láminas de dominio público (Artvee) convertidas en máscaras de tinta: el color sale de un token, así que cada
        producto las ve en su <code className="font-mono">--brand</code>, en claro y en oscuro. Úsalas en pantallas
        vacías y de primera vez, una por pantalla y nunca como decoración de relleno.
      </p>
      {FAMILIES.map((f) => (
        <section key={f.id}>
          <h2 className="mb-4 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">{f.label}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-6">
            {ILLUSTRATIONS.filter((p) => p.family === f.id).map((p) => (
              <figure key={p.id} className="flex flex-col gap-2">
                <div className="flex h-40 items-center justify-center rounded-lg bg-surface-2 p-4">
                  <Illustration name={p.id} tone={tone} className="max-h-full w-full max-w-28" />
                </div>
                <figcaption className="text-xs leading-snug">
                  <span className="font-mono text-foreground">{p.id}</span>
                  <br />
                  <a href={p.source} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                    {p.artist}, {p.date}
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

const meta = {
  title: "Foundations/Illustrations",
  component: Gallery,
  args: { tone: "brand" },
  argTypes: { tone: { control: "inline-radio", options: ["brand", "foreground", "muted"] } },
} satisfies Meta<typeof Gallery>

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {}
