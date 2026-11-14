import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import fs from "node:fs"
import path from "node:path"

import { Illustration, IllustrationProvider, ILLUSTRATIONS } from "@stellify/illustration"
import { EmptyState } from "@stellify/empty-state"

const dir = path.resolve(__dirname, "../public/illustrations")

describe("illustration manifest", () => {
  it("has a file under 60 KB for every plate, and no stray files", () => {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".webp"))
    expect(files.sort()).toEqual(ILLUSTRATIONS.map((p) => `${p.id}.webp`).sort())
    for (const f of files) expect(fs.statSync(path.join(dir, f)).size).toBeLessThan(60 * 1024)
  })

  it("credits every plate", () => {
    for (const p of ILLUSTRATIONS) {
      expect(p.title && p.artist && p.date).toBeTruthy()
      expect(p.source).toMatch(/^https:\/\/artvee\.com\/dl\//)
    }
  })
})

describe("Illustration", () => {
  it("is decorative without alt and an image with it", () => {
    const { container, rerender } = render(<Illustration name="nautilus" />)
    const el = container.querySelector('[data-slot="illustration"]') as HTMLElement
    expect(el.getAttribute("aria-hidden")).toBe("true")
    rerender(<Illustration name="nautilus" alt="Nautilus" />)
    expect(el.getAttribute("role")).toBe("img")
    expect(el.getAttribute("aria-label")).toBe("Nautilus")
  })

  it("draws in a token and loads from the provider's base URL", () => {
    const { container } = render(
      <IllustrationProvider baseUrl="/illustrations/">
        <Illustration name="rose" tone="muted" />
      </IllustrationProvider>
    )
    const el = container.querySelector('[data-slot="illustration"]') as HTMLElement
    expect(el.className).toContain("bg-muted-foreground")
    expect(el.getAttribute("style")).toContain("/illustrations/rose.webp")
  })
})

describe("EmptyState", () => {
  it("prefers the plate over the icon", () => {
    const { container } = render(<EmptyState illustration="coins" title="Vacío" description="Nada aún." />)
    expect(container.querySelector('[data-name="coins"]')).not.toBeNull()
  })
})
