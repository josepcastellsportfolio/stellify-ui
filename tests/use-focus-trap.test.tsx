import { useRef } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { getFocusables, useFocusTrap, type UseFocusTrapOptions } from "@stellify/use-focus-trap"

function Trap(props: UseFocusTrapOptions) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, props)
  return (
    <>
      <button type="button">antes</button>
      <div ref={ref}>
        <button type="button">primero</button>
        <div inert>
          <button type="button">inerte</button>
        </div>
        <a href="#x">último</a>
      </div>
    </>
  )
}

describe("useFocusTrap", () => {
  afterEach(() => {
    document.body.style.overflow = ""
  })

  it("focuses the first focusable and wraps Tab both ways, skipping inert subtrees", async () => {
    const user = userEvent.setup()
    render(<Trap />)
    expect(screen.getByRole("button", { name: "primero" })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole("link", { name: "último" })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole("button", { name: "primero" })).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole("link", { name: "último" })).toHaveFocus()
  })

  it("pulls escaped focus back on the next Tab", async () => {
    const user = userEvent.setup()
    render(<Trap />)
    screen.getByRole("button", { name: "antes" }).focus()
    await user.tab()
    expect(screen.getByRole("button", { name: "primero" })).toHaveFocus()
  })

  it("calls onEscape and locks/unlocks the body scroll", async () => {
    const user = userEvent.setup()
    const onEscape = vi.fn()
    const { rerender } = render(<Trap onEscape={onEscape} lockScroll />)
    expect(document.body.style.overflow).toBe("hidden")
    await user.keyboard("{Escape}")
    expect(onEscape).toHaveBeenCalledTimes(1)
    rerender(<Trap onEscape={onEscape} lockScroll active={false} />)
    expect(document.body.style.overflow).toBe("")
  })

  it("does nothing while inactive and restores focus when asked", () => {
    const outside = document.createElement("button")
    document.body.appendChild(outside)
    outside.focus()
    const { rerender } = render(<Trap active={false} restoreFocus />)
    expect(outside).toHaveFocus()
    rerender(<Trap active restoreFocus />)
    expect(screen.getByRole("button", { name: "primero" })).toHaveFocus()
    rerender(<Trap active={false} restoreFocus />)
    expect(outside).toHaveFocus()
    outside.remove()
  })

  it("getFocusables ignores hidden and inert subtrees", () => {
    const { container } = render(
      <div>
        <a href="#a">a</a>
        <div hidden>
          <a href="#b">b</a>
        </div>
        <button type="button" disabled>
          c
        </button>
      </div>,
    )
    expect(getFocusables(container).map(el => el.textContent)).toEqual(["a"])
  })
})
