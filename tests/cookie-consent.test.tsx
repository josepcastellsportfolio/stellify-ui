import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CookieConsent } from "@stellify/cookie-consent"

const base = {
  description: "Usamos analítica sin cookies de terceros.",
  policyHref: "/cookies",
  onAccept: () => {},
  onReject: () => {},
}

describe("CookieConsent", () => {
  it("is a named, non-modal region with the policy link", () => {
    render(<CookieConsent open {...base} />)
    const region = screen.getByRole("region", { name: "Cookies de analítica" })
    expect(region).not.toHaveAttribute("aria-modal")
    expect(region).toHaveClass("z-50")
    expect(screen.getByRole("link", { name: "Política de cookies" })).toHaveAttribute("href", "/cookies")
  })

  it("gives accept and reject the same visual weight and no close button", () => {
    render(<CookieConsent open {...base} />)
    const accept = screen.getByRole("button", { name: "Aceptar" })
    const reject = screen.getByRole("button", { name: "Rechazar" })
    expect(accept.className).toBe(reject.className)
    expect(screen.getAllByRole("button")).toHaveLength(2)
  })

  it("calls the matching handler", async () => {
    const onAccept = vi.fn()
    const onReject = vi.fn()
    render(<CookieConsent open {...base} onAccept={onAccept} onReject={onReject} />)
    await userEvent.click(screen.getByRole("button", { name: "Rechazar" }))
    expect(onReject).toHaveBeenCalledOnce()
    expect(onAccept).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: "Aceptar" }))
    expect(onAccept).toHaveBeenCalledOnce()
  })

  it("renders nothing when closed", () => {
    const { container } = render(<CookieConsent open={false} {...base} />)
    expect(container).toBeEmptyDOMElement()
  })
})
