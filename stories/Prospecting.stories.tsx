import type { Meta, StoryObj } from "@storybook/react-vite"
import { CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { BusinessCard } from "@stellify/business-card"
import { CollapseToggle } from "@stellify/collapse-toggle"
import { MapView } from "@stellify/map-view"
import { PageHeader } from "@stellify/page-header"
import { SearchForm } from "@stellify/search-form"
import { StatusBadge } from "@stellify/status-badge"

const BUSINESSES = [
  { id: 1, name: "PádelOn Murcia", score: 94, address: "Calle Ejemplo 1, Murcia", rating: 4.7, reviewCount: 219, phone: "968 100 200", website: null, lat: 37.98, lng: -1.13,
    chips: ["Sin página web", "Mucho volumen de clientes", "Buen negocio, mala presencia digital", "Teléfono directo disponible"] },
  { id: 2, name: "Club Pádel Santa Ana", score: 91, address: "Calle Ejemplo 2, Murcia", rating: 4.3, reviewCount: 617, phone: "968 101 201", website: null, lat: 37.992, lng: -1.13,
    chips: ["Sin página web", "Mucho volumen de clientes", "Buen negocio, mala presencia digital", "Teléfono directo disponible"] },
  { id: 3, name: "Pádel Indoor La Flota", score: 71, address: "Calle Ejemplo 3, Murcia", rating: 4.5, reviewCount: 1240, phone: "968 102 202", website: "https://example-padel-02.es/", lat: 38.004, lng: -1.145,
    chips: ["Mucho volumen de clientes", "Teléfono directo disponible"] },
]

const meta = { title: "Components/Prospecting (C3)", parameters: { layout: "padded" } } satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SearchAndResults: Story = {
  render: () => {
    const [selected, setSelected] = useState<Set<number>>(new Set([1, 2]))
    const [open, setOpen] = useState(true)
    const toggle = (id: number, on?: boolean) =>
      setSelected((s) => {
        const next = new Set(s)
        if (on ?? !next.has(id)) next.add(id)
        else next.delete(id)
        return next
      })
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeader
          eyebrow="C3 · Búsqueda activa · Tiempo"
          title="Prospección manual"
          description="Busca negocios reales en Google Maps, la herramienta detecta quién tiene un problema evidente y redacta el mensaje personalizado de cada uno."
          actions={<StatusBadge status="success" appearance="plain" icon={CheckCircle2}>3 negocios encontrados.</StatusBadge>}
        />
        <SearchForm
          fields={[
            { name: "business_type", label: "Tipo de negocio", defaultValue: "Club de pádel" },
            { name: "zone", label: "Zona", defaultValue: "Murcia" },
          ]}
          submitLabel="Buscar en Maps"
          onSubmit={() => {}}
        />
        <MapView
          markers={BUSINESSES.map((b) => ({ id: b.id, lat: b.lat, lng: b.lng, label: b.name }))}
          selectedIds={selected}
          onMarkerClick={(id) => toggle(Number(id))}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{BUSINESSES.length} negocios encontrados</span>
          <CollapseToggle open={open} onOpenChange={setOpen} openLabel="Contraer la lista" closedLabel="Mostrar la lista" controls="list" />
        </div>
        {open && (
          <div id="list" className="space-y-3">
            {BUSINESSES.map((b) => (
              <BusinessCard key={b.id} {...b} selected={selected.has(b.id)} onSelectedChange={(on) => toggle(b.id, on)} />
            ))}
          </div>
        )}
      </div>
    )
  },
}

export const LimitReached: Story = {
  render: () => (
    <StatusBadge status="danger" appearance="plain">
      Has alcanzado el límite diario de llamadas a Google Places (100). Se reinicia el 24/09/2026 a las 00:00 (hora de Madrid).
    </StatusBadge>
  ),
}
