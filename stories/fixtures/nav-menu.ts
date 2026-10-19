import type { MegaMenuCategory } from "@stellify/mega-menu-panel"

/** Demo content shared by the SiteNav and MegaMenuPanel stories. */
export const demoMenu: MegaMenuCategory[] = [
  {
    id: "servicios",
    label: "Servicios",
    groups: [
      {
        id: "web",
        label: "Presencia web",
        links: [
          { id: "landing", href: "#landing", label: "Landing pages", summary: "Una página rápida que explica qué haces y pide el contacto." },
          { id: "seo", href: "#seo", label: "SEO local", summary: "Que te encuentren en tu zona." },
        ],
      },
      {
        id: "ia",
        label: "Automatización",
        links: [
          { id: "agente", href: "#agente", label: "Agente de reservas", summary: "Atiende WhatsApp y teléfono." },
          { id: "flujos", href: "#flujos", label: "Flujos sin código" },
        ],
      },
    ],
    featured: [
      { id: "landing", href: "#landing", label: "Landing pages", summary: "Una página rápida que explica qué haces y pide el contacto." },
      { id: "agente", href: "#agente", label: "Agente de reservas" },
    ],
    cta: { href: "#servicios", label: "Todos los servicios" },
  },
  {
    id: "recursos",
    label: "Recursos",
    groups: [
      {
        id: "leer",
        label: "Para leer",
        links: [
          { id: "articulos", href: "#articulos", label: "Artículos" },
          { id: "lecturas", href: "#lecturas", label: "Lecturas recomendadas" },
        ],
      },
    ],
  },
]
