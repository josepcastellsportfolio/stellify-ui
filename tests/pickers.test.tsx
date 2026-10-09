import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Carousel } from "@stellify/carousel"
import { DatePickerField } from "@stellify/date-picker-field"
import { DateRangePicker } from "@stellify/date-range-picker"
import { EMPTY_NUMBER_COMPARE, NumberCompare } from "@stellify/number-compare"
import { TimePicker } from "@stellify/time-picker"
import { WeekGrid } from "@stellify/week-grid"

describe("date-picker-field", () => {
  it("shows the placeholder, then emits the picked day as ISO and closes", async () => {
    const onChange = vi.fn()
    const { rerender } = render(<DatePickerField value="" onChange={onChange} placeholder="Elige fecha" />)
    expect(screen.getByRole("button", { name: "Elige fecha" })).toBeInTheDocument()

    rerender(<DatePickerField value="2026-06-10" onChange={onChange} locale="en-US" />)
    const trigger = screen.getByRole("button", { name: /June 10, 2026/ })
    await userEvent.click(trigger)
    const dialog = await screen.findByRole("dialog")
    await userEvent.click(within(dialog).getByRole("button", { name: /June 15/ }))
    expect(onChange).toHaveBeenCalledWith("2026-06-15")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

describe("date-range-picker", () => {
  const presets = [
    { label: "Primera semana", getRange: () => ({ from: "2026-06-01", to: "2026-06-07" }) },
  ]

  it("keeps edits as a draft until Apply", async () => {
    const onChange = vi.fn()
    render(
      <DateRangePicker
        value={{ from: "", to: "" }}
        onChange={onChange}
        presets={presets}
        placeholder="Rango"
        applyLabel="Aplicar"
        cancelLabel="Cancelar"
        hideTimeToggle
      />
    )
    await userEvent.click(screen.getByRole("button", { name: "Rango" }))
    await userEvent.click(await screen.findByRole("button", { name: "Primera semana" }))
    expect(onChange).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: "Aplicar" }))
    expect(onChange).toHaveBeenCalledWith({ from: "2026-06-01", to: "2026-06-07" })
  })

  it("adds the times when the time switch is on", async () => {
    const onChange = vi.fn()
    render(
      <DateRangePicker
        value={{ from: "2026-06-01T09:30", to: "2026-06-07T18:00" }}
        onChange={onChange}
        presets={[]}
        locale="en-US"
        use24Hour
      />
    )
    expect(screen.getByRole("button", { name: /Jun 1, 2026 09:30 – Jun 7, 2026 18:00/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /Jun 1, 2026/ }))
    expect(await screen.findByRole("switch", { name: "Include time" })).toBeChecked()
    await userEvent.click(screen.getByRole("button", { name: "Apply" }))
    expect(onChange).toHaveBeenCalledWith({ from: "2026-06-01T09:30", to: "2026-06-07T18:00" })
  })
})

describe("time-picker", () => {
  it("always emits 24h HH:mm, also from the AM/PM select", async () => {
    const onChange = vi.fn()
    render(<TimePicker value="09:15" onChange={onChange} />)
    const [hour, minute, meridiem] = screen.getAllByRole("combobox")
    expect(hour).toHaveTextContent("9")
    expect(minute).toHaveTextContent("15")
    expect(meridiem).toHaveTextContent("AM")
    await userEvent.click(meridiem)
    await userEvent.click(await screen.findByRole("option", { name: "PM" }))
    expect(onChange).toHaveBeenCalledWith("21:15")
  })

  it("has no meridiem select in 24h mode", () => {
    render(<TimePicker value="21:15" onChange={() => {}} use24Hour />)
    const selects = screen.getAllByRole("combobox")
    expect(selects).toHaveLength(2)
    expect(selects[0]).toHaveTextContent("21")
  })
})

describe("number-compare", () => {
  it("emits both bounds, null for a cleared side", () => {
    const onChange = vi.fn()
    render(
      <NumberCompare
        value={{ ...EMPTY_NUMBER_COMPARE, upper: { operator: "lte", value: 10 } }}
        onChange={onChange}
        conjunction="y"
      />
    )
    expect(screen.getByText("y")).toBeInTheDocument()
    fireEvent.change(screen.getByRole("spinbutton", { name: "lower value" }), { target: { value: "2" } })
    expect(onChange).toHaveBeenLastCalledWith({
      lower: { operator: "gt", value: 2 },
      upper: { operator: "lte", value: 10 },
    })
    fireEvent.change(screen.getByRole("spinbutton", { name: "upper value" }), { target: { value: "" } })
    expect(onChange).toHaveBeenLastCalledWith({
      lower: { operator: "gt", value: null },
      upper: { operator: "lte", value: null },
    })
  })
})

describe("week-grid", () => {
  it("lays out Monday..Sunday with events and reports empty-cell clicks", async () => {
    const onClickEmpty = vi.fn()
    const { container } = render(
      <WeekGrid
        date="2026-06-10"
        locale="en-US"
        eventsByDate={{ "2026-06-10": [{ title: "Gym" }] }}
        renderEvent={(ev) => <span>{ev.title}</span>}
        onClickEmpty={onClickEmpty}
      />
    )
    const grid = container.firstElementChild as HTMLElement
    expect(grid.children).toHaveLength(7)
    expect(grid.children[0]).toHaveTextContent(/Mon\s*8/)
    expect(grid.children[6]).toHaveTextContent(/Sun\s*14/)
    await userEvent.click(screen.getByText("Gym"))
    expect(onClickEmpty).not.toHaveBeenCalled()
    const tuesdayBody = grid.children[1].lastElementChild as HTMLElement
    await userEvent.click(tuesdayBody)
    expect(onClickEmpty).toHaveBeenCalledWith("2026-06-09")
  })
})

describe("carousel", () => {
  const matchMedia = window.matchMedia
  beforeAll(() => {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia
  })
  afterAll(() => {
    window.matchMedia = matchMedia
  })

  const items = ["Uno", "Dos", "Tres"]

  it("is a labelled carousel region with one dot per page", async () => {
    render(<Carousel items={items} renderItem={(i) => <p>{i}</p>} autoPlay={false} ariaLabel="KPIs" />)
    const region = screen.getByRole("region", { name: "KPIs" })
    expect(region).toHaveAttribute("aria-roledescription", "carousel")
    expect(screen.getAllByRole("button", { name: /Go to slide/ })).toHaveLength(3)
    expect(screen.getByRole("button", { name: "Go to slide 1" })).toHaveAttribute("aria-current", "true")
    await userEvent.click(screen.getByRole("button", { name: "Next slide" }))
    expect(screen.getByRole("button", { name: "Go to slide 2" })).toHaveAttribute("aria-current", "true")
    await userEvent.click(screen.getByRole("button", { name: "Previous slide" }))
    await userEvent.click(screen.getByRole("button", { name: "Previous slide" }))
    expect(screen.getByRole("button", { name: "Go to slide 3" })).toHaveAttribute("aria-current", "true")
  })

  it("autoplays to the next slide", () => {
    vi.useFakeTimers()
    try {
      render(<Carousel items={items} renderItem={(i) => <p>{i}</p>} autoPlayMs={1000} />)
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(screen.getByRole("button", { name: "Go to slide 2" })).toHaveAttribute("aria-current", "true")
    } finally {
      vi.useRealTimers()
    }
  })

  it("renders nothing without items", () => {
    const { container } = render(<Carousel items={[]} renderItem={() => null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
