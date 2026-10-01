import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { NotificationBell, badgeText } from "@stellify/notification-bell"
import { NotificationItem } from "@stellify/notification-item"
import { TimerControl, formatElapsed } from "@stellify/timer-control"

function Bell({ count }: { count: number }) {
  const [open, setOpen] = useState(false)
  return (
    <NotificationBell count={count} open={open} onOpenChange={setOpen}>
      <NotificationItem severity="aviso" title="80 % del tope" time="hace 1 min" unread />
    </NotificationBell>
  )
}

describe("NotificationBell", () => {
  it("hides the badge at 0 and caps it at 9+", () => {
    expect(badgeText(0)).toBeNull()
    expect(badgeText(9)).toBe("9")
    expect(badgeText(10)).toBe("9+")
    const { rerender } = render(<Bell count={0} />)
    expect(screen.queryByTestId("notification-badge")).not.toBeInTheDocument()
    rerender(<Bell count={12} />)
    expect(screen.getByTestId("notification-badge")).toHaveTextContent("9+")
  })

  it("opens the panel and closes it with Escape", async () => {
    render(<Bell count={1} />)
    await userEvent.click(screen.getByRole("button", { name: "Notificaciones (1 sin leer)" }))
    expect(screen.getByRole("dialog", { name: "Notificaciones" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "No leída" })).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

describe("TimerControl", () => {
  it("formats elapsed time", () => {
    expect(formatElapsed(0)).toBe("00:00:00")
    expect(formatElapsed(4 * 3600 + 61)).toBe("04:01:01")
  })

  it("ticks from startedAt and stops", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const onStop = vi.fn()
    render(
      <TimerControl
        startedAt={new Date(Date.now() - 65_000).toISOString()}
        type="captacion"
        types={[{ value: "captacion", label: "Captación" }]}
        onTypeChange={() => {}}
        onStart={() => {}}
        onStop={onStop}
        overLimit
      />
    )
    expect(screen.getByRole("timer")).toHaveTextContent("00:01:05")
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByRole("timer")).toHaveTextContent("00:01:07")
    expect(screen.getByRole("alert")).toHaveTextContent("más de 4 h")
    vi.useRealTimers()
    await userEvent.click(screen.getByRole("button", { name: "Parar" }))
    expect(onStop).toHaveBeenCalledOnce()
  })
})
