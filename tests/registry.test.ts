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
