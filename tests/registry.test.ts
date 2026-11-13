import fs from "node:fs"
import path from "node:path"

type Item = {
  name: string
  type: string
  dependencies?: string[]
  registryDependencies?: string[]
  css?: Record<string, unknown>
  files?: { path: string }[]
}

const root = path.resolve(__dirname, "..")
const registryPath = process.env.REGISTRY_JSON ?? path.join(root, "registry.json")
const { items } = JSON.parse(fs.readFileSync(registryPath, "utf8")) as { items: Item[] }
const names = new Set(items.map((i) => i.name))

describe("registry.json integrity", () => {
  it.each(items.map((i) => [i.name, i] as const))(
    "%s: every registryDependency is a namespaced @stellify item that exists",
    (_, item) => {
      for (const dep of item.registryDependencies ?? []) {
        // A bare name ("button", "utils") resolves against shadcn's upstream
        // registry and silently installs a different component.
        expect(dep).toMatch(/^@stellify\//)
        expect(names).toContain(dep.replace(/^@stellify\//, ""))
      }
    }
  )

  it.each(items.map((i) => [i.name, i] as const))("%s: every file exists", (_, item) => {
    for (const file of item.files ?? []) {
      expect(fs.existsSync(path.join(root, file.path))).toBe(true)
    }
  })

  it("stellify-base ships Tailwind 4 animations, not the Tailwind 3 plugin", () => {
    const base = items.find((i) => i.name === "stellify-base")!
    expect(base.dependencies).not.toContain("tailwindcss-animate")
    expect(base.dependencies).toContain("tw-animate-css")
    expect(Object.keys(base.css ?? {})).toContain('@import "tw-animate-css"')
  })
})

// v2 personality: no glows, no outlined boxes in the ui core. Phase 3 extends
// this to charts, data-table, blocks and motion.
describe("ui core has no halos or box borders", () => {
  const FORBIDDEN = [
    /focus(?:-visible)?:ring/, // translucent focus halos: stellify-base draws the one outline
    /ring-offset/,
    /(?<![\w-])shadow-(?:xs|sm|md|lg|xl|2xl)(?![\w-])/, // only shadow-(--shadow-overlay)
    /shadow-primary/,
    /backdrop-blur/,
    /bg-gradient/,
    /(?<![\w-])border-input(?![\w-])/, // fields are filled
  ]
  const uiFiles = items
    .filter((i) => (i as Item & { categories?: string[] }).categories?.[0] === "ui")
    .flatMap((i) => i.files ?? [])
    .map((f) => f.path)
    .filter((p) => p.endsWith(".tsx"))

  it.each(uiFiles)("%s", (file) => {
    const src = fs.readFileSync(path.join(root, file), "utf8")
    for (const re of FORBIDDEN) expect(src, `${file} matches ${re}`).not.toMatch(re)
  })
})
