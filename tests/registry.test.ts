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

describe("typed dependencies", () => {
  it("items that depend on leaflet also ship its types to consumers", () => {
    for (const item of items as (Item & { devDependencies?: string[] })[]) {
      if (item.dependencies?.includes("leaflet")) expect(item.devDependencies).toContain("@types/leaflet")
    }
  })
})

describe("component coverage", () => {
  // Every registry:component ships with a story and a test (README → Publishing).
  // "Reference" = an import from `@stellify/<file>` for each of the item's files.
  const read = (dir: string, suffix: string) =>
    fs
      .readdirSync(path.join(root, dir))
      .filter((f) => f.endsWith(suffix))
      .map((f) => fs.readFileSync(path.join(root, dir, f), "utf8"))
  const testSources = read("tests", ".test.tsx")
  const storySources = read("stories", ".stories.tsx")

  const importsItem = (sources: string[], item: Item) =>
    (item.files ?? []).length > 0 &&
    (item.files ?? []).every((file) => {
      const base = path.basename(file.path).replace(/\.tsx?$/, "")
      const specifier = new RegExp(`from\\s+["']@stellify/${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`)
      return sources.some((src) => specifier.test(src))
    })

  const components = items.filter((i) => i.type === "registry:component")

  it("there are components to check", () => {
    expect(components.length).toBeGreaterThan(0)
  })

  it.each(components.map((i) => [i.name, i] as const))("%s: has a test in tests/*.test.tsx", (_, item) => {
    expect(importsItem(testSources, item)).toBe(true)
  })

  it.each(components.map((i) => [i.name, i] as const))("%s: has a story in stories/*.stories.tsx", (_, item) => {
    expect(importsItem(storySources, item)).toBe(true)
  })
})
