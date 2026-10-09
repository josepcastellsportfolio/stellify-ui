import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { Inbox } from "lucide-react"
import { CategoryTag } from "@stellify/category-tag"
import { ChartCard } from "@stellify/chart-card"
import { ConfirmDialog } from "@stellify/confirm-dialog"
import { CurrencyDisplay } from "@stellify/currency-display"
import { MoneyInput } from "@stellify/money-input"
import { MonthYearPicker } from "@stellify/month-year-picker"
import { ProgressRing } from "@stellify/progress-ring"
import { SectionCard } from "@stellify/section-card"

describe("chart-card", () => {
  it("renders the chart when there is no special state", () => {
    render(
      <ChartCard title="Gasto" headerActions={<button type="button">7d</button>}>
        <div>chart</div>
      </ChartCard>
    )
    expect(screen.getByText("Gasto")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "7d" })).toBeInTheDocument()
    expect(screen.getByText("chart")).toBeInTheDocument()
  })

  it("loading replaces the chart with a skeleton", () => {
    const { container } = render(
      <ChartCard title="Gasto" loading skeletonHeight={120}>
        <div>chart</div>
      </ChartCard>
    )
    expect(screen.queryByText("chart")).not.toBeInTheDocument()
    expect(container.querySelector(".animate-pulse")).toHaveStyle({ height: "120px" })
  })

  it("error is distinct from empty and offers a retry", async () => {
    const onRetry = vi.fn()
    const { rerender } = render(
      <ChartCard title="Gasto" error empty errorTitle="No se pudo cargar" onRetry={onRetry} retryLabel="Reintentar" />
    )
    expect(screen.getByRole("heading", { name: "No se pudo cargar" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledTimes(1)

    rerender(<ChartCard title="Gasto" empty emptyIcon={Inbox} emptyTitle="Sin datos" emptyDescription="Añade un gasto." />)
    expect(screen.getByRole("heading", { name: "Sin datos" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument()
  })
})

describe("currency-display", () => {
  it("formats with the given currency and locale", () => {
    render(<CurrencyDisplay value={1234.5} currency="USD" locale="en-US" />)
    expect(screen.getByText("$1,234.50")).toBeInTheDocument()
  })

  it("colors by sign only when asked", () => {
    const { rerender } = render(<CurrencyDisplay value={-5} locale="en-US" colorBySign />)
    expect(screen.getByText(/5\.00/)).toHaveClass("text-rose-600")
    rerender(<CurrencyDisplay value={5} locale="en-US" colorBySign />)
    expect(screen.getByText(/5\.00/)).toHaveClass("text-emerald-600")
    rerender(<CurrencyDisplay value={5} locale="en-US" />)
    expect(screen.getByText(/5\.00/)).not.toHaveClass("text-emerald-600")
  })
})

describe("money-input", () => {
  function Controlled({ onValue }: { onValue: (v: number | null) => void }) {
    const [value, setValue] = useState<number | null>(10)
    return (
      <MoneyInput
        aria-label="Importe"
        symbol="EUR"
        value={value}
        onChange={(v) => {
          setValue(v)
          onValue(v)
        }}
      />
    )
  }

  it("emits a number, and null when cleared", () => {
    const onValue = vi.fn()
    render(<Controlled onValue={onValue} />)
    const input = screen.getByRole("spinbutton", { name: "Importe" })
    expect(input).toHaveValue(10)
    expect(screen.getByText("EUR")).toBeInTheDocument()
    fireEvent.change(input, { target: { value: "12.5" } })
    expect(onValue).toHaveBeenLastCalledWith(12.5)
    fireEvent.change(input, { target: { value: "" } })
    expect(onValue).toHaveBeenLastCalledWith(null)
    expect(input).toHaveValue(null)
  })
})

describe("month-year-picker", () => {
  it("shows YYYY-MM and emits month + year", () => {
    const onChange = vi.fn()
    const { container } = render(<MonthYearPicker month={3} year={2026} onChange={onChange} />)
    const input = container.querySelector('input[type="month"]') as HTMLInputElement
    expect(input.value).toBe("2026-03")
    fireEvent.change(input, { target: { value: "2027-11" } })
    expect(onChange).toHaveBeenCalledWith(11, 2027)
  })
})

describe("progress-ring", () => {
  it("is a progressbar that clamps its percentage", () => {
    const { rerender } = render(<ProgressRing value={30} max={60} />)
    expect(screen.getByRole("progressbar", { name: "50%" })).toHaveTextContent("50%")
    rerender(<ProgressRing value={150} label="Objetivo" />)
    expect(screen.getByRole("progressbar", { name: "Objetivo" })).toHaveTextContent("100%")
    rerender(<ProgressRing value={10}>{null}</ProgressRing>)
    expect(screen.getByRole("progressbar")).toHaveTextContent("")
  })
})

describe("section-card", () => {
  it("renders title, description, actions and body", () => {
    render(
      <SectionCard title="Presupuestos" description="Este mes" actions={<button type="button">Añadir</button>}>
        <p>contenido</p>
      </SectionCard>
    )
    expect(screen.getByText("Presupuestos")).toBeInTheDocument()
    expect(screen.getByText("Este mes")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Añadir" })).toBeInTheDocument()
    expect(screen.getByText("contenido")).toBeInTheDocument()
  })
})

describe("confirm-dialog", () => {
  it("opens from its trigger and confirms", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        trigger={<button type="button">Borrar</button>}
        title="¿Borrar el gasto?"
        description="No se puede deshacer."
        confirmLabel="Borrar definitivamente"
        cancelLabel="Cancelar"
        destructive
        onConfirm={onConfirm}
      />
    )
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Borrar" }))
    const dialog = screen.getByRole("alertdialog", { name: "¿Borrar el gasto?" })
    expect(dialog).toHaveTextContent("No se puede deshacer.")
    await userEvent.click(screen.getByRole("button", { name: "Borrar definitivamente" }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("disables both buttons while loading (controlled)", () => {
    render(<ConfirmDialog open title="Guardar" onConfirm={() => {}} loading confirmLabel="Guardar" cancelLabel="Cancelar" />)
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled()
  })
})

describe("category-tag", () => {
  const categories = [
    { id: 1, name: "Casa", color: "rgb(255, 0, 0)" },
    { id: 2, name: "Luz", parent_id: 1 },
  ]

  it("resolves the Parent / Child label and color", () => {
    const { rerender } = render(<CategoryTag categoryId={2} categories={categories} />)
    expect(screen.getByText("Casa / Luz")).toBeInTheDocument()
    rerender(<CategoryTag categoryId={1} categories={categories} />)
    expect(screen.getByText("Casa")).toHaveStyle({ backgroundColor: "rgb(255, 0, 0)" })
  })

  it("falls back to the no-category label", () => {
    render(<CategoryTag categoryId={99} categories={categories} noLabel="Sin categoría" />)
    expect(screen.getByText("Sin categoría")).toBeInTheDocument()
  })
})
