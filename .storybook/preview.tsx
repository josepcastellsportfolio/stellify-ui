import type { Preview, Decorator } from "@storybook/react-vite"
import { useEffect } from "react"

import "./shadcn/theme.css"

/**
 * Toggles the `.dark` class on <html> (and the preview root) so the
 * stellify-base dark tokens apply, matching how consumers switch themes.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? "light"
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
  }, [theme])

  return (
    <div className="bg-background text-foreground" data-theme={theme}>
      <div className="min-h-[200px] p-8">
        <Story />
      </div>
    </div>
  )
}

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "StellifyIT theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    docs: { toc: true },
  },
}

export default preview
