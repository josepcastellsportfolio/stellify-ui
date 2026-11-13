import fs from "node:fs"
import path from "node:path"
import { parseBase, expectedItemCss, expectedThemeVars } from "../scripts/tokens.mjs"

const root = path.resolve(__dirname, "..")
const { items } = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8")) as {
  items: { name: string; cssVars?: Record<string, Record<string, string>>; css?: Record<string, unknown> }[]
}
const base = items.find((i) => i.name === "stellify-base")!
const parsed = parseBase()

describe("stellify-base tokens", () => {
  it("registry.json matches stellify-base.css (run node scripts/tokens.mjs)", () => {
    expect(base.cssVars).toEqual({ theme: expectedThemeVars(), light: parsed.light, dark: parsed.dark })
    expect(base.css).toEqual(expectedItemCss(parsed))
  })

  it("every Tailwind theme entry points at a defined token", () => {
    // `.dark` only overrides what changes; everything must exist on :root.
    for (const value of Object.values(expectedThemeVars())) {
      const name = value.match(/^var\(--([\w-]+)\)$/)![1]
      expect(parsed.light, name).toHaveProperty(name)
    }
  })

  it("makes the hairline the default border color (Tailwind 4 defaults to currentColor)", () => {
    const base = parsed.extra["@layer base"] as Record<string, Record<string, string>>
    expect(base["*, ::before, ::after, ::backdrop"]).toEqual({ "border-color": "var(--border)" })
  })

  it("has no glow tokens left", () => {
    const names = [...Object.keys(parsed.light), ...Object.keys(parsed.dark)]
    expect(names.filter((n) => n.startsWith("shadow-"))).toEqual(["shadow-overlay", "shadow-overlay"])
  })
})

// --- WCAG contrast, computed from the oklch values --------------------------

function resolve(vars: Record<string, string>, value: string): string {
  const ref = value.match(/^var\(--([\w-]+)\)$/)
  return ref ? resolve(vars, vars[ref[1]]) : value
}

function oklchToLuminance(css: string): number {
  const m = css.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/)
  if (!m) throw new Error(`not an opaque oklch color: ${css}`)
  const [L, C, h] = m.slice(1).map(Number)
  const a = C * Math.cos((h * Math.PI) / 180)
  const b = C * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ].map((x) => Math.min(Math.max(x, 0), 1))
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

function contrast(vars: Record<string, string>, fg: string, bg: string): number {
  const [x, y] = [oklchToLuminance(resolve(vars, `var(--${fg})`)), oklchToLuminance(resolve(vars, `var(--${bg})`))].sort()
  return (y + 0.05) / (x + 0.05)
}

// Text pairs the components actually put on screen. AA body text: 4.5:1.
const TEXT_PAIRS: [string, string][] = [
  ["foreground", "surface-1"],
  ["foreground", "surface-3"],
  ["muted-foreground", "surface-1"],
  ["muted-foreground", "surface-2"],
  ["brand-foreground", "brand"],
  ["brand", "brand-subtle"],
  ...["success", "warning", "danger", "info"].flatMap((s): [string, string][] => [
    [s, `${s}-subtle`],
    [`${s}-foreground`, s],
  ]),
]

describe.each(["light", "dark"] as const)("%s mode contrast", (mode) => {
  const vars = mode === "light" ? parsed.light : parsed.dark
  it.each(TEXT_PAIRS)("%s on %s ≥ 4.5:1", (fg, bg) => {
    expect(contrast(vars, fg, bg)).toBeGreaterThanOrEqual(4.5)
  })
  it.each([1, 2, 3, 4, 5])("chart-%i ≥ 3:1 against the page", (n) => {
    expect(contrast(vars, `chart-${n}`, "surface-1")).toBeGreaterThanOrEqual(3)
  })
})
