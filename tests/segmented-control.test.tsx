import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { SegmentedControl } from "@stellify/segmented-control"
import { TimeRangeSelector, type TimeRange } from "@stellify/time-range-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@stellify/tabs"

const OPTIONS = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes", disabled: false },
] as const

function Controlled({ initial = "day" as string, onChange = (_: string) => {} }) {
  const [v, setV] = useState(initial)
  return (
    <SegmentedControl
      aria-label="Vista"
      options={OPTIONS}
      value={v}
      onValueChange={(next) => {
        setV(next)
        onChange(next)
      }}
    />
  )
}

describe("SegmentedControl", () => {
  it("is a named radiogroup with one checked radio", () => {
    render(<Controlled />)
    expect(screen.getByRole("radiogroup", { name: "Vista" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Día" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "Semana" })).toHaveAttribute("aria-checked", "false")
  })

  it("selects on click, and a second click mid-move retargets at once (never queued)", async () => {
    const seen: string[] = []
    render(<Controlled onChange={(v) => seen.push(v)} />)
    await userEvent.click(screen.getByRole("radio", { name: "Mes" }))
    await userEvent.click(screen.getByRole("radio", { name: "Semana" }))
    expect(seen).toEqual(["month", "week"])
    expect(screen.getByRole("radio", { name: "Semana" })).toHaveAttribute("aria-checked", "true")
  })

  it("has a single tab stop and moves with arrows, Home and End (wrapping)", () => {
    render(<Controlled />)
    const day = screen.getByRole("radio", { name: "Día" })
    expect(day).toHaveAttribute("tabindex", "0")
    expect(screen.getByRole("radio", { name: "Mes" })).toHaveAttribute("tabindex", "-1")
    fireEvent.keyDown(day, { key: "ArrowLeft" })
    expect(screen.getByRole("radio", { name: "Mes" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "Mes" })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole("radio", { name: "Mes" }), { key: "Home" })
    expect(day).toHaveAttribute("aria-checked", "true")
    fireEvent.keyDown(day, { key: "End" })
    expect(screen.getByRole("radio", { name: "Mes" })).toHaveAttribute("aria-checked", "true")
  })

  it("skips disabled options", () => {
    const onValueChange = vi.fn()
    render(
      <SegmentedControl
        aria-label="Vista"
        value="a"
        onValueChange={onValueChange}
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B", disabled: true },
          { value: "c", label: "C" },
        ]}
      />
    )
    fireEvent.keyDown(screen.getByRole("radio", { name: "A" }), { key: "ArrowRight" })
    expect(onValueChange).toHaveBeenCalledWith("c")
  })

  it("keeps a tab stop when the value matches no option", () => {
    render(<SegmentedControl aria-label="Vista" value="x" onValueChange={() => {}} options={OPTIONS} />)
    expect(screen.getByRole("radio", { name: "Día" })).toHaveAttribute("tabindex", "0")
  })
})

describe("TimeRangeSelector on SegmentedControl", () => {
  it("uses Spanish defaults and accepts labels", async () => {
    function Demo() {
      const [v, setV] = useState<TimeRange>("30d")
      return <TimeRangeSelector value={v} onChange={setV} labels={{ "7d": "7 días" }} />
    }
    render(<Demo />)
    expect(screen.getByRole("radiogroup", { name: "Periodo" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Todo" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("radio", { name: "7 días" }))
    expect(screen.getByRole("radio", { name: "7 días" })).toHaveAttribute("aria-checked", "true")
  })
})

describe("Tabs indicator", () => {
  it("renders one decorative indicator and keeps tab semantics", async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Uno</TabsTrigger>
          <TabsTrigger value="b">Dos</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel uno</TabsContent>
        <TabsContent value="b">Panel dos</TabsContent>
      </Tabs>
    )
    const list = screen.getByRole("tablist")
    expect(list.querySelectorAll("[data-slot='tabs-indicator'][aria-hidden]")).toHaveLength(1)
    await userEvent.click(screen.getByRole("tab", { name: "Dos" }))
    expect(screen.getByText("Panel dos")).toBeVisible()
  })
})
