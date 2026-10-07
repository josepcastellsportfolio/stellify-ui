import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToStaticMarkup } from "react-dom/server"
import { ShareButton, buildShareLinks } from "@stellify/share-button"

const props = { url: "https://stellifyit.com/a?b=1&c=2", title: "Título & más", text: "Léelo" }

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  Reflect.deleteProperty(navigator, "share")
})

describe("buildShareLinks", () => {
  it("encodes every parameter", () => {
    const links = Object.fromEntries(buildShareLinks(props.url, props.title, props.text).map(l => [l.name, l.href]))
    const u = encodeURIComponent(props.url)
    expect(links.LinkedIn).toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${u}`)
    expect(links.WhatsApp).toBe(`https://wa.me/?text=${encodeURIComponent(`Léelo ${props.url}`)}`)
    expect(links.X).toBe(`https://x.com/intent/post?url=${u}&text=${encodeURIComponent("Léelo")}`)
    expect(links.Correo).toBe(
      `mailto:?subject=${encodeURIComponent(props.title)}&body=${encodeURIComponent(`Léelo\n\n${props.url}`)}`
    )
  })
})

describe("ShareButton", () => {
  it("prerenders without touching navigator", () => {
    vi.stubGlobal("navigator", undefined)
    expect(renderToStaticMarkup(<ShareButton {...props} />)).toContain("Compartir")
  })

  it("uses the native share sheet when available and swallows AbortError", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("cancel", "AbortError"))
    Object.defineProperty(navigator, "share", { value: share, configurable: true })
    render(<ShareButton {...props} />)
    await userEvent.click(screen.getByRole("button", { name: "Compartir" }))
    expect(share).toHaveBeenCalledWith({ url: props.url, title: props.title, text: props.text })
    await Promise.resolve()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("falls back to a menu with external links and copy feedback", async () => {
    // After setup(): user-event installs its own clipboard stub.
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    render(<ShareButton {...props} />)
    await user.click(screen.getByRole("button", { name: "Compartir" }))

    const menu = screen.getByRole("dialog", { name: "Compartir" })
    for (const name of ["LinkedIn", "WhatsApp", "X"]) {
      const link = screen.getByRole("link", { name: new RegExp(`^${name}`) })
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noopener noreferrer")
    }
    expect(screen.getByRole("link", { name: "Correo" })).not.toHaveAttribute("target")
    expect(menu).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Copiar enlace" }))
    expect(writeText).toHaveBeenCalledWith(props.url)
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Enlace copiado"))
  })
})
