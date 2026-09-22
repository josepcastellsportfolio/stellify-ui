import type { Meta, StoryObj } from "@storybook/react-vite"
import { MapPin, Megaphone, PenLine, Rocket } from "lucide-react"
import { QuadrantCell } from "@stellify/quadrant-cell"
import { QuadrantGrid } from "@stellify/quadrant-grid"
import { ReasonList } from "@stellify/reason-list"

type Args = { active: "none" | "C1" | "C2" | "C3" | "C4" }

const meta: Meta<Args> = {
  title: "Components/QuadrantGrid",
  parameters: { layout: "padded" },
  args: { active: "C3" },
  argTypes: { active: { control: "inline-radio", options: ["none", "C1", "C2", "C3", "C4"] } },
}

export default meta
type Story = StoryObj<Args>

const Grid = ({ active }: Args) => (
  <div className="mx-auto max-w-[620px] space-y-8">
    <QuadrantGrid
      aria-label="Cuadrante de captación"
      columns={["Atracción · Vienen a ti", "Búsqueda activa · Vas tú"]}
      rows={["Tiempo", "Inversión"]}
    >
      <QuadrantCell icon={PenLine} code="C1 · Atracción · Tiempo" title="Contenido orgánico" description="Que vengan a ti invirtiendo tiempo" active={active === "C1"} />
      <QuadrantCell icon={MapPin} code="C3 · Búsqueda activa · Tiempo" title="Prospección manual" description="Ir tú a por ellos invirtiendo tiempo" active={active === "C3"} />
      <QuadrantCell icon={Megaphone} code="C2 · Atracción · Inversión" title="Publicidad y embudo" description="Que vengan a ti invirtiendo presupuesto" active={active === "C2"} />
      <QuadrantCell icon={Rocket} code="C4 · Búsqueda activa · Inversión" title="Captación a escala" description="Ir a por ellos a escala" active={active === "C4"} />
    </QuadrantGrid>
    {active !== "none" && (
      <ReasonList
        reasons={[
          "Dispones de tiempo y todavía no de presupuesto: la vía coherente es invertir horas.",
          "Prefieres no aparecer en cámara: la búsqueda activa no lo requiere, encaja contigo.",
        ]}
      />
    )}
  </div>
)

export const Result: Story = { render: Grid }
export const Explainer: Story = { args: { active: "none" }, render: Grid }
