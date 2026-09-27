import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { registryFirst } from "./registry-resolver"

const dir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [registryFirst(dir), react()],
  resolve: { alias: { "@stellify": path.resolve(dir, "registry/stellify") } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
})
