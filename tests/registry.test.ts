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

// v2 personality: no glows, no outlined fields, and nothing that depends on the
// tokens v2 removed. Applies to every item that ships markup.
describe("no halos, outlined fields or removed tokens", () => {
  const FORBIDDEN = [
    /focus(?:-visible)?:ring/, // translucent focus halos: stellify-base draws the one outline
    /ring-offset/,
    /(?<![\w-])shadow-(?:xs|sm|md|lg|xl|2xl)(?![\w-])/, // only shadow-(--shadow-overlay)
    /shadow-primary/,
    /backdrop-blur/,
    /bg-gradient/,
    /(?<![\w-])border-input(?![\w-])/, // fields are filled
    /(?<![\w(-])(?:rounded-(?:card|icon|pill)|leading-body|shadow-card|shadow-button|tracking-display|duration-base|ease-out-soft)(?![\w-])/, // v1 marketing tokens
    /var\(--(?:radius-card|radius-icon|shadow-card|shadow-button|duration|space-[a-z-]+)\)/,
    // Raw palette colors bypass the tokens (and dark mode, and rebranding).
    /(?<![\w-])(?:bg|text|border|fill|stroke|ring|from|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
  ]
  const uiFiles = items
    .filter((i) => (i as Item & { categories?: string[] }).categories?.[0] !== "foundations")
    .flatMap((i) => i.files ?? [])
    .map((f) => f.path)
    .filter((p) => p.endsWith(".tsx"))

  it.each(uiFiles)("%s", (file) => {
    const src = fs.readFileSync(path.join(root, file), "utf8")
    for (const re of FORBIDDEN) expect(src, `${file} matches ${re}`).not.toMatch(re)
  })
})
