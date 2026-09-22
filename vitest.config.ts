import { defineConfig, type Plugin } from "vitest/config"
import react from "@vitejs/plugin-react"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const dir = path.dirname(fileURLToPath(import.meta.url))
const registry = path.resolve(dir, "registry/stellify")
const consumer = path.resolve(dir, ".storybook/shadcn")

// Tests must exercise the code we publish. Registry sources import
// `@/components/ui/x`, `@/components/x`, `@/lib/x`, `@/hooks/x` (the paths they
// get after `shadcn add`); resolve those to registry/stellify/x first and only
// fall back to the Storybook consumer tree for files the registry doesn't ship.
function registryFirst(): Plugin {
  const exts = [".tsx", ".ts"]
  const find = (base: string, name: string) =>
    exts.map((e) => path.join(base, name + e)).find((f) => fs.existsSync(f))
  return {
    name: "registry-first",
    enforce: "pre",
    resolveId(source) {
      const m = source.match(/^@\/(?:components\/ui|components|lib|hooks)\/(.+)$/)
      if (!m) return null
      return find(registry, m[1]) ?? find(consumer, source.slice(2)) ?? null
    },
  }
}

export default defineConfig({
  plugins: [registryFirst(), react()],
  resolve: { alias: { "@stellify": registry } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
})
