import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { registryFirst } from "./registry-resolver"

const dir = path.dirname(fileURLToPath(import.meta.url))

// Used by Storybook (react-vite builder). `@/…` imports resolve to the registry
// sources first (registry-resolver.ts) and fall back to the "consumer" tree
// (.storybook/shadcn) for anything the registry doesn't ship. `@stellify` maps
// to the registry sources so stories render the very code we publish.
export default defineConfig({
  plugins: [registryFirst(dir), react(), tailwindcss()],
  resolve: {
    alias: {
      "@stellify": path.resolve(dir, "./registry/stellify"),
    },
  },
})
