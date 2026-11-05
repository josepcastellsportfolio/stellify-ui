import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { AnimatedText } from "@stellify/animated-text"
import { ClipReveal } from "@stellify/clip-reveal"
import { Marquee } from "@stellify/marquee"
import { ScrollReveal } from "@stellify/scroll-reveal"
import { ScrubWords } from "@stellify/scrub-words"

/** Scroll-driven pieces need room above and below to show their motion. */
const Scroller = ({ children }: { children: ReactNode }) => (
  <div>
    <div className="flex h-[80vh] items-center justify-center text-muted-foreground">Desplázate ↓</div>
    {children}
    <div className="h-[80vh]" />
  </div>
)

const meta = {
  title: "Motion/Overview",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "GSAP (ScrollTrigger, SplitText) except Marquee (Web Animations API). All render their final state as markup and stay still under reduced motion." } },
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const ClipRevealPanel: Story = {
  render: () => (
    <Scroller>
      <ClipReveal className="bg-[oklch(0.16_0.02_265)] text-white">
        <div className="flex h-[70vh] items-center justify-center text-4xl tracking-display">Panel que se abre</div>
      </ClipReveal>
    </Scroller>
  ),
}

export const ScrollRevealSection: Story = {
  render: () => (
    <Scroller>
      <ScrollReveal surface="bg-muted">
        <div className="mx-auto max-w-3xl px-6 py-32 text-3xl tracking-display">El fondo se ensancha hasta el borde.</div>
      </ScrollReveal>
    </Scroller>
  ),
}

export const ScrubWordsStatement: Story = {
  render: () => (
    <Scroller>
      <ScrubWords className="mx-auto max-w-4xl px-6 text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-display">
        Cada palabra se ilumina a medida que la frase atraviesa la pantalla.
      </ScrubWords>
    </Scroller>
  ),
}

export const AnimatedTextReveal: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-16">
      <AnimatedText as="h2" split="words" immediate className="text-5xl font-semibold tracking-display">
        Titular palabra a palabra
      </AnimatedText>
      <AnimatedText immediate delay={0.2} className="text-lg leading-body text-muted-foreground">
        Y un párrafo que sube línea a línea desde una máscara, la primera vez que entra en pantalla.
      </AnimatedText>
    </div>
  ),
}

export const MarqueeLoop: Story = {
  render: () => (
    <div className="space-y-10 py-12">
      <Marquee label="Tecnologías" items={["React", "TypeScript", "FastAPI", "Django", "PostgreSQL", "Redis", "GSAP"]} />
      <div className="bg-[oklch(0.16_0.02_265)] py-8 text-white">
        <Marquee
          label="Clientes"
          items={["Clínica Sol", "Pádel Norte", "Taller Ebre", "Café Central"]}
          direction="right"
          duration={24}
          itemClassName="text-white/70"
        />
      </div>
    </div>
  ),
}
