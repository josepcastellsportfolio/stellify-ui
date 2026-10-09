import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Phone } from "lucide-react"
import { LongFormArticle } from "@stellify/long-form-article"
import { OfferCard } from "@stellify/offer-card"
import { ProcessSteps } from "@stellify/process-steps"
import { ProfileIntro } from "@stellify/profile-intro"
import { SiteChat, type SiteChatMessage } from "@stellify/site-chat"
import { SiteFooter } from "@stellify/site-footer"
import { SiteNav } from "@stellify/site-nav"

/** Public-site building blocks: real anchors, prerender-safe, copy via props. */
const meta = { title: "Marketing/Site", parameters: { layout: "padded" } } satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const LINKS = [
  { href: "/servicios", label: "Servicios" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/articulos", label: "Artículos" },
  { href: "/contacto", label: "Contacto" },
]

// Inline placeholder so the story needs no network.
const PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#94a3b8"/></svg>'
  )

export const Nav: Story = {
  name: "SiteNav (resize to mobile for the menu)",
  render: () => (
    <div className="relative">
      <SiteNav
        links={LINKS}
        brand={
          <a href="/" className="font-semibold">
            StellifyIT
          </a>
        }
        action={
          <a href="/contacto" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
            Hablemos
          </a>
        }
      />
    </div>
  ),
}

export const Footer: Story = {
  name: "SiteFooter",
  render: () => (
    <SiteFooter
      groups={[
        { title: "Servicios", links: [{ href: "/servicios/web", label: "Web a medida" }, { href: "/servicios/ia", label: "Agentes de IA" }] },
        { title: "Recursos", links: [{ href: "/articulos", label: "Artículos" }, { href: "/lecturas", label: "Lecturas" }] },
        { title: "Contacto", links: [{ href: "/contacto", label: "Escríbenos" }] },
        { title: "Código", links: [{ href: "https://github.com/josepcastellsportfolio", label: "GitHub", external: true }] },
      ]}
      legal="© 2026 StellifyIT · Aviso legal · Privacidad"
    />
  ),
}

export const Offers: Story = {
  name: "OfferCard grid",
  render: () => (
    <div className="grid gap-6 md:grid-cols-3">
      <OfferCard
        title="Reservas por WhatsApp"
        deliverable="Un flujo que confirma reservas en WhatsApp y las apunta en tu calendario."
        fit="Cuando las reservas llegan por mensaje y se pierden."
        proof={{ href: "/proyectos/reservas", label: "Ver el caso" }}
      />
      <OfferCard
        title="Agente telefónico"
        icon={<Phone className="h-5 w-5" />}
        deliverable="Un agente de voz que atiende y reserva fuera de horario."
        fit="Cuando el teléfono no para y nadie puede cogerlo."
        proof={{ href: "/proyectos/padelon", label: "Ver PádelOn" }}
      />
      <OfferCard title="Panel para varios locales" deliverable="Informes y agentes en un solo panel." fit="Cuando gestionas más de un local." />
    </div>
  ),
}

export const Steps: Story = {
  name: "ProcessSteps",
  render: () => (
    <ProcessSteps
      steps={[
        { title: "Diagnóstico", description: "Hablamos 30 minutos sobre cómo trabajas hoy." },
        { title: "Propuesta", description: "Te envío un plan cerrado con precio y plazos." },
        { title: "Construcción", description: "Entregas semanales que puedes probar." },
        { title: "Puesta en marcha", description: "Lo dejamos funcionando y te enseño a usarlo." },
      ]}
    />
  ),
}

export const Profile: Story = {
  name: "ProfileIntro",
  render: () => (
    <ProfileIntro name="Josep Castells" role="Ingeniero de software" photoSrc={PHOTO} photoAlt="Retrato" photoWidth={160} photoHeight={160}>
      <p>Diez años construyendo producto para empresas de logística y retail.</p>
      <p>Hoy ayudo a negocios locales a automatizar reservas y atención.</p>
    </ProfileIntro>
  ),
}

const FAQS = [
  { question: "¿Cuánto cuesta una web a medida?", answer: "Entre 1.500 € y 4.000 € según el contenido.", href: "/servicios/web", linkLabel: "Ver precios" },
  { question: "¿Cuánto tarda?", answer: "Entre dos y cuatro semanas.", href: "/servicios/web#plazos" },
]

export const ChatFaqOnly: Story = {
  name: "SiteChat · FAQ only (service off)",
  render: () => <SiteChat title="Preguntas frecuentes" description="Lo que más nos preguntan." faqs={FAQS} className="max-w-2xl" />,
}

export const ChatEnabled: Story = {
  name: "SiteChat · conversation",
  render: () => {
    const [messages, setMessages] = useState<SiteChatMessage[]>([])
    return (
      <SiteChat
        title="Pregúntame"
        faqs={FAQS}
        enabled
        className="max-w-2xl"
        messages={messages}
        turnsUsed={messages.filter((m) => m.role === "user").length}
        maxTurns={3}
        onSend={(text) =>
          setMessages((m) => [
            ...m,
            { role: "user", text },
            { role: "assistant", text: "Depende del contenido: entre dos y cuatro semanas.", citations: [{ label: "Plazos", href: "/servicios/web#plazos" }] },
          ])
        }
      />
    )
  },
}

export const ChatSearching: Story = {
  name: "SiteChat · searching",
  render: () => (
    <SiteChat title="Pregúntame" faqs={FAQS} enabled phase="searching" className="max-w-2xl" messages={[{ role: "user", text: "¿Hacéis mantenimiento?" }]} />
  ),
}

export const Article: Story = {
  name: "LongFormArticle",
  render: () => (
    <LongFormArticle
      before={<a href="/proyectos" className="text-sm underline">← Proyectos</a>}
      content={{
        title: "PádelOn: reservas por teléfono con un agente de voz",
        intro: "Un club con más de 600 reseñas atendía las reservas a mano. Montamos un agente que contesta y reserva.",
        status: "En producción",
        stats: [
          { label: "Llamadas atendidas", value: "1.240", unit: "/mes" },
          { label: "Tiempo de respuesta", value: "2", unit: "s" },
        ],
        sections: [
          { heading: "El problema", paragraphs: ["El teléfono sonaba durante las clases y nadie podía cogerlo."], callout: "Cada llamada perdida era una pista vacía." },
          { heading: "La solución", paragraphs: ["Un agente STT/TTS conectado al calendario del club mediante n8n."] },
        ],
        stack: ["n8n", "Whisper", "Postgres"],
        related: [{ href: "/proyectos/reservas", label: "Reservas por WhatsApp" }],
      }}
    />
  ),
}
