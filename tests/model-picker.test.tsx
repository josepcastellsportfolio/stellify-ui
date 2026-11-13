import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axe from "axe-core"
import { useState } from "react"
import { Cloud, Cpu } from "lucide-react"
import { ModelPicker, rankModels, type ModelGroup, type ModelOption } from "@stellify/model-picker"

const GROUPS: ModelGroup[] = [
  { id: "api", label: "API", icon: Cloud },
  { id: "local", label: "Servidor local", icon: Cpu, status: { state: "ok" } },
]

const MODELS: ModelOption[] = [
  { key: "sonnet", label: "Sonnet", group: "api", available: true, badges: ["voz"], context: 200_000, vision: true, tools: true, speedTps: 61 },
  { key: "haiku", label: "Haiku", group: "api", available: true, context: 200_000, tools: true, speedTps: null },
  { key: "qwen", label: "Qwen3 8B", group: "local", private: true, available: true, context: 16_384, tools: true, speedTps: 42 },
  { key: "gemma", label: "Gemma 4", group: "local", private: true, available: false, reason: "Servidor apagado" },
]

function Harness({
  groups = GROUPS,
  models = MODELS,
  initial = "sonnet",
  initialFavorites = [] as string[],
  onChange = (_: string) => {},
  onFavorite = (_: string) => {},
  presentation = "popover" as const,
}: {
  groups?: ModelGroup[]
  models?: ModelOption[]
  initial?: string
  initialFavorites?: string[]
  onChange?: (key: string) => void
  onFavorite?: (key: string) => void
  presentation?: "popover" | "sheet"
}) {
  const [value, setValue] = useState(initial)
  const [favorites, setFavorites] = useState(initialFavorites)
  return (
    <ModelPicker
      groups={groups}
      models={models}
      value={value}
      onValueChange={(key) => {
        setValue(key)
        onChange(key)
      }}
      favorites={favorites}
      onToggleFavorite={(key) => {
        setFavorites((f) => (f.includes(key) ? f.filter((k) => k !== key) : [...f, key]))
        onFavorite(key)
      }}
      presentation={presentation}
    />
  )
}

async function violations() {
  const results = await axe.run(document.body, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
    rules: { "color-contrast": { enabled: false } },
  })
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)
}

const trigger = () => screen.getByRole("button", { name: /^Modelo:/ })

describe("rankModels", () => {
  const models = [
    { key: "a", label: "Big Qwen", group: "x", available: true },
    { key: "b", label: "Megaqwen", group: "x", available: true },
    { key: "c", label: "Qwen3", group: "x", available: true },
    { key: "d", label: "Llama", group: "x", available: true },
  ]
  it("ranks prefix, then word start, then substring, and drops non-matches", () => {
    expect(rankModels(models, "qwen").map((m) => m.key)).toEqual(["c", "a", "b"])
  })
  it("matches every word, ignores case and accents, and searches the group label", () => {
    expect(rankModels(models, "QWÉN big").map((m) => m.key)).toEqual(["a"])
    expect(rankModels(models, "local", [{ id: "x", label: "Servidor local" }]).length).toBe(4)
  })
  it("returns the input unchanged for an empty query", () => {
    expect(rankModels(models, "  ")).toBe(models)
  })
})

describe("ModelPicker", () => {
  it("trigger names the setting and the current model, with the private word", () => {
    render(<Harness initial="qwen" />)
    expect(trigger()).toHaveAccessibleName("Modelo: Qwen3 8B privado")
  })

  it("keyboard only: open, type “qwen”, choose it, and hear the choice", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    await user.tab()
    expect(trigger()).toHaveFocus()
    await user.keyboard("{Enter}")

    const search = await screen.findByRole("searchbox", { name: "Buscar modelos" })
    expect(search).toHaveFocus()
    await user.keyboard("qwen")
    expect(screen.getByText("Resultados")).toBeInTheDocument()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: /^Qwen3 8B/ })).toHaveFocus()
    await user.keyboard("{Enter}")

    expect(onChange).toHaveBeenCalledWith("qwen")
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Modelo elegido: Qwen3 8B")
    expect(trigger()).toHaveFocus()
  })

  it("Enter in the search box picks the best available match", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    await user.click(trigger())
    await user.keyboard("hai{Enter}")
    expect(onChange).toHaveBeenCalledWith("haiku")
  })

  it("toggles a favorite with the keyboard and lists it under Favorites", async () => {
    const user = userEvent.setup()
    const onFavorite = vi.fn()
    render(<Harness onFavorite={onFavorite} />)
    await user.click(trigger())
    await user.keyboard("qwen{ArrowDown}{ArrowRight}")
    const star = screen.getByRole("button", { name: "Favorito: Qwen3 8B" })
    expect(star).toHaveFocus()
    expect(star).toHaveAttribute("aria-pressed", "false")
    await user.keyboard(" ")
    expect(onFavorite).toHaveBeenCalledWith("qwen")
    expect(star).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("searchbox")).toBeInTheDocument() // still open

    await user.clear(screen.getByRole("searchbox"))
    await user.click(screen.getByRole("button", { name: "Favoritos" }))
    const list = screen.getByRole("list", { name: "Favoritos" })
    expect(within(list).getByRole("button", { name: /^Qwen3 8B/ })).toBeInTheDocument()
  })

  it("shows an empty Favorites tab with a hint", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(trigger())
    await user.click(screen.getByRole("button", { name: "Favoritos" }))
    expect(screen.getByText("Marca un modelo con la estrella para tenerlo aquí.")).toBeInTheDocument()
  })

  it("lists unavailable models with their reason and does not select them", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    await user.click(trigger())
    await user.click(screen.getByRole("button", { name: /^Servidor local/ }))
    const gemma = screen.getByRole("button", { name: /^Gemma 4/ })
    expect(gemma).toHaveAttribute("aria-disabled", "true")
    expect(gemma).toHaveTextContent("Servidor apagado")
    await user.click(gemma)
    gemma.focus()
    await user.keyboard("{Enter}")
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole("searchbox")).toBeInTheDocument()
  })

  it("shows speed only when it is a measured number", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(trigger())
    expect(screen.getByRole("button", { name: /^Sonnet/ })).toHaveTextContent("61 t/s")
    expect(screen.getByRole("button", { name: /^Haiku/ })).not.toHaveTextContent("t/s")
    expect(screen.getByRole("button", { name: /^Sonnet/ })).toHaveTextContent("195k ctx")
    expect(screen.getByRole("button", { name: /^Sonnet/ })).toHaveAccessibleName(/Entiende imágenes/)
  })

  it("a busy group says so in the rail and as a notice above its models", async () => {
    const user = userEvent.setup()
    const groups: ModelGroup[] = [
      GROUPS[0],
      { ...GROUPS[1], status: { state: "busy", reason: "Está respondiendo a otra aplicación" } },
    ]
    render(<Harness groups={groups} />)
    await user.click(trigger())
    const tab = screen.getByRole("button", { name: "Servidor local: Ocupado. Está respondiendo a otra aplicación" })
    await user.click(tab)
    const notice = document.querySelector('[data-slot="model-group-notice"]')!
    expect(notice).toHaveAttribute("data-state", "busy")
    expect(notice).toHaveTextContent("Ocupado. Está respondiendo a otra aplicación")
    // Busy is not off: its available models can still be chosen.
    expect(screen.getByRole("button", { name: /^Qwen3 8B/ })).not.toHaveAttribute("aria-disabled")
  })

  it("←/→ move between the search box and the rail; arrows in the rail switch groups", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(trigger())
    await user.keyboard("{ArrowLeft}")
    const api = screen.getByRole("button", { name: "API" })
    expect(api).toHaveFocus()
    await user.keyboard("{ArrowDown}")
    const local = screen.getByRole("button", { name: "Servidor local" })
    expect(local).toHaveFocus()
    expect(local).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("Servidor local", { selector: "p" })).toBeInTheDocument()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("searchbox")).toHaveFocus()
  })

  it("Alt+n jumps to the n-th available model of the view", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    await user.click(trigger())
    expect(screen.getByRole("button", { name: /^Haiku/ })).toHaveAttribute("aria-keyshortcuts", "Alt+2")
    await user.keyboard("{Alt>}2{/Alt}")
    expect(onChange).toHaveBeenCalledWith("haiku")
  })

  it("has no axe violations open, as a popover and as a sheet", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Harness />)
    await user.click(trigger())
    expect(await violations()).toEqual([])
    unmount()

    render(<Harness presentation="sheet" />)
    await user.click(trigger())
    expect(screen.getByRole("dialog", { name: "Modelo" })).toBeInTheDocument()
    // On touch the chosen row takes focus, not the search box (no keyboard popping up).
    expect(screen.getByRole("button", { name: /^Sonnet/ })).toHaveFocus()
    expect(await violations()).toEqual([])
  })
})
