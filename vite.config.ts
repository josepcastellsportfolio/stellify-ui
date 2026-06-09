import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { fileURLToPath } from "node:url"

const dir = path.dirname(fileURLToPath(import.meta.url))

// Used by Storybook (react-vite builder). The `@` alias points at the
// "consumer" tree (.storybook/shadcn) that materializes the shadcn primitives
// + cn, exactly like an app that ran `shadcn init`. `@stellify` maps to the
// registry sources so stories render the very code we publish.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(dir, "./.storybook/shadcn"),
      "@stellify": path.resolve(dir, "./registry/stellify"),
    },
  },
})
