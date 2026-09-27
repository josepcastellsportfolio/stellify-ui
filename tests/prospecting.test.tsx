import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { BusinessCard } from "@stellify/business-card"
import { Chip } from "@stellify/chip"
import { CollapseToggle } from "@stellify/collapse-toggle"
import { MapView } from "@stellify/map-view"
import { PageHeader } from "@stellify/page-header"
import { ScoreBadge } from "@stellify/score-badge"
import { SearchForm } from "@stellify/search-form"
import { StatusBadge } from "@stellify/status-badge"

describe("ScoreBadge", () => {
  it("shows the score with an accessible label", () => {
    render(<ScoreBadge score={78} label="Oportunidad" />)
    const badge = screen.getByText("78")
    expect(badge).toHaveAttribute("aria-label", "Oportunidad: 78 de 100")
    expect(badge).toHaveAttribute("data-slot", "score-badge")
  })
})

describe("Chip", () => {
  it("renders a small neutral tag", () => {
    render(<Chip>Sin página web</Chip>)
    expect(screen.getByText("Sin página web")).toHaveAttribute("data-slot", "chip")
  })
})

describe("CollapseToggle", () => {
  it("flips its label and aria-expanded", async () => {
    function Harness() {
      const [open, setOpen] = useState(true)
      return <CollapseToggle open={open} onOpenChange={setOpen} openLabel="Contraer la lista" closedLabel="Mostrar la lista" controls="list" />
    }
    render(<Harness />)
    const button = screen.getByRole("button", { name: "Contraer la lista" })
    expect(button).toHaveAttribute("aria-expanded", "true")
    expect(button).toHaveAttribute("aria-controls", "list")
    await userEvent.click(button)
    expect(screen.getByRole("button", { name: "Mostrar la lista" })).toHaveAttribute("aria-expanded", "false")
  })
})

describe("StatusBadge extension", () => {
  it("keeps the default look and adds a plain pill with an icon", () => {
    const { rerender } = render(<StatusBadge status="success">ok</StatusBadge>)
    expect(screen.getByText("ok")).toHaveClass("bg-success/15")
    rerender(
      <StatusBadge status="success" appearance="plain" icon={CheckCircle2}>
        20 negocios encontrados.
      </StatusBadge>
    )
    const pill = screen.getByText("20 negocios encontrados.")
    expect(pill).not.toHaveClass("bg-success/15")
    expect(pill.querySelector("svg")).not.toBeNull()
  })
})

describe("PageHeader eyebrow", () => {
  it("renders the eyebrow above the title and keeps the actions slot", () => {
    render(<PageHeader eyebrow="C3 · Búsqueda activa · Tiempo" title="Prospección manual" actions={<span>acción</span>} />)
    expect(screen.getByText("C3 · Búsqueda activa · Tiempo")).toHaveClass("uppercase")
    expect(screen.getByRole("heading", { level: 1, name: "Prospección manual" })).toBeInTheDocument()
    expect(screen.getByText("acción")).toBeInTheDocument()
  })
})

describe("SearchForm", () => {
  it("submits the trimmed values and blocks empty fields", async () => {
    const onSubmit = vi.fn()
    render(
      <SearchForm
        fields={[
          { name: "business_type", label: "Tipo de negocio", placeholder: "Club de pádel" },
          { name: "zone", label: "Zona", defaultValue: "Murcia" },
        ]}
        submitLabel="Buscar en Maps"
        onSubmit={onSubmit}
      />
    )
    const submit = screen.getByRole("button", { name: /Buscar en Maps/ })
    expect(submit).toBeDisabled()
    await userEvent.type(screen.getByLabelText("Tipo de negocio"), "  Club de pádel ")
    await userEvent.click(submit)
    expect(onSubmit).toHaveBeenCalledWith({ business_type: "Club de pádel", zone: "Murcia" })
  })

  it("shows the loading state", () => {
    render(<SearchForm fields={[{ name: "q", label: "Q", defaultValue: "x" }]} submitLabel="Buscar" onSubmit={() => {}} loading />)
    expect(screen.getByRole("button", { name: /Buscar/ })).toBeDisabled()
  })
})

describe("BusinessCard", () => {
  const props = {
    name: "PádelOn Murcia",
    score: 78,
    address: "Av. Silva Muñoz, Murcia",
    rating: 4.7,
    reviewCount: 219,
    phone: "621 18 81 88",
    website: null,
    chips: ["Sin página web", "Mucho volumen de clientes"],
  }

  it("shows every fact and the chips, and 'Sin página web' when there is no site", () => {
    render(<BusinessCard {...props} selected={false} onSelectedChange={() => {}} />)
    const card = screen.getByRole("article", { name: /PádelOn Murcia/ })
    expect(within(card).getByText("78")).toBeInTheDocument()
    expect(within(card).getByText("4,7 (219)")).toBeInTheDocument()
    expect(within(card).getByText("621 18 81 88")).toBeInTheDocument()
    expect(within(card).getAllByText("Sin página web")).toHaveLength(2)
    expect(card).toHaveAttribute("data-selected", "false")
  })

  it("toggles selection from its checkbox and marks the card", async () => {
    function Harness() {
      const [selected, setSelected] = useState(false)
      return <BusinessCard {...props} selected={selected} onSelectedChange={setSelected} />
    }
    render(<Harness />)
    await userEvent.click(screen.getByRole("checkbox", { name: /Seleccionar PádelOn Murcia/ }))
    expect(screen.getByRole("article", { name: /PádelOn Murcia/ })).toHaveAttribute("data-selected", "true")
  })

  it("links to the website when there is one and hides missing data", () => {
    render(<BusinessCard {...props} website="https://padelon.es/" rating={null} reviewCount={null} phone={null} selected onSelectedChange={() => {}} />)
    expect(screen.getByRole("link", { name: "padelon.es" })).toHaveAttribute("href", "https://padelon.es/")
    expect(screen.queryByText(/\(219\)/)).not.toBeInTheDocument()
  })
})

describe("MapView", () => {
  const markers = [
    { id: 1, lat: 37.98, lng: -1.13, label: "PádelOn" },
    { id: 2, lat: 37.99, lng: -1.12, label: "Santa Ana" },
  ]

  it("draws one marker per business, styled by selection", async () => {
    const { container } = render(<MapView markers={markers} selectedIds={new Set([2])} onMarkerClick={() => {}} />)
    await waitFor(() => expect(container.querySelectorAll("path.leaflet-interactive")).toHaveLength(2))
    expect(container.querySelectorAll("[data-selected='true'], .cc-marker-selected")).toHaveLength(1)
    expect(screen.getByText(/OpenStreetMap/)).toBeInTheDocument()
  })

  it("reports marker clicks", async () => {
    const onMarkerClick = vi.fn()
    const { container } = render(<MapView markers={markers} selectedIds={new Set()} onMarkerClick={onMarkerClick} />)
    await waitFor(() => expect(container.querySelectorAll("path.leaflet-interactive")).toHaveLength(2))
    fireEvent.click(container.querySelectorAll("path.leaflet-interactive")[1])
    expect(onMarkerClick).toHaveBeenCalledWith(2)
  })

  it("renders an empty map without markers", () => {
    const { container } = render(<MapView markers={[]} selectedIds={new Set()} onMarkerClick={() => {}} />)
    expect(container.querySelector("[data-slot='map-view']")).not.toBeNull()
  })
})
