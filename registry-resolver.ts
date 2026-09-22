import fs from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"

/**
 * Registry sources import `@/components/ui/x`, `@/components/x`, `@/lib/x`,
 * `@/hooks/x` (the paths they get after `shadcn add`). Resolve those to
 * registry/stellify/x first, so Storybook and tests exercise the code we
 * publish, and only fall back to the consumer tree (.storybook/shadcn) for
 * files the registry doesn't ship. Replaces a plain `@` alias: Vite applies
 * `resolve.alias` before any plugin, so an alias would shadow this.
 */
export function registryFirst(root: string): Plugin {
  const registry = path.resolve(root, "registry/stellify")
  const consumer = path.resolve(root, ".storybook/shadcn")
  const exts = [".tsx", ".ts"]
  const find = (base: string, name: string) =>
    exts.map((e) => path.join(base, name + e)).find((f) => fs.existsSync(f))
  return {
    name: "registry-first",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!source.startsWith("@/")) return null
      const m = source.match(/^@\/(?:components\/ui|components|lib|hooks)\/(.+)$/)
      const hit = m ? find(registry, m[1]) : undefined
      if (hit) return hit
      // Anything else under `@/` (e.g. `@/components/ui/table` before it was
      // vendored, or a CSS file) comes from the consumer tree.
      return this.resolve(path.join(consumer, source.slice(2)), importer, { skipSelf: true })
    },
  }
}
