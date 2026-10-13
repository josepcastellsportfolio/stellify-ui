import type { Meta, StoryObj } from "@storybook/react-vite"
import { FaqList } from "@stellify/faq-list"

const meta = {
  title: "Marketing/FaqList",
  component: FaqList,
  tags: ["autodocs"],
  args: {
    className: "max-w-2xl",
    items: [
      {
        question: "¿Cuánto cuesta una web a medida?",
        answer: "Depende del número de páginas y de si necesitas un panel de gestión. Te damos un precio cerrado antes de empezar.",
        href: "#precios",
        linkLabel: "Ver precios orientativos",
      },
      {
        question: "¿Puedo editar los textos yo mismo?",
        answer: "Sí. Si lo necesitas, añadimos un editor sencillo para que cambies textos e imágenes sin tocar código.",
      },
      {
        question: "¿Qué pasa cuando termina el proyecto?",
        answer: "Te entregamos el código y los accesos. Si quieres, seguimos con mantenimiento mensual, pero no es obligatorio.",
      },
    ],
  },
} satisfies Meta<typeof FaqList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomTitle: Story = { args: { title: "Dudas habituales", headingId: "dudas" } }
