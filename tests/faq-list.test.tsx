import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToStaticMarkup } from "react-dom/server"
import { FaqList, faqPageJsonLd } from "@stellify/faq-list"

const items = [
  { question: "¿Cuánto tarda?", answer: "Unas dos semanas.", href: "/proceso", linkLabel: "Ver el proceso" },
  { question: "¿Hay permanencia?", answer: "No." },
]

describe("FaqList", () => {
  it("is a section named by its h2 with one details per question", () => {
    const { container } = render(<FaqList items={items} />)
    expect(screen.getByRole("region", { name: "Preguntas frecuentes" })).toBeInTheDocument()
    const details = container.querySelectorAll("details")
    expect(details).toHaveLength(2)
    const summary = details[0].querySelector("summary")!
    expect(summary).toHaveTextContent("¿Cuánto tarda?")
    expect(summary.querySelector("h1,h2,h3,h4,h5,h6")).toBeNull()
  })

  it("keeps closed answers in the prerendered HTML", () => {
    const html = renderToStaticMarkup(<FaqList items={items} />)
    expect(html).not.toContain("<details open")
    expect(html).toContain("Unas dos semanas.")
    expect(html).toContain('href="/proceso"')
  })

  it("opens natively when the summary is clicked", async () => {
    const { container } = render(<FaqList items={items} />)
    const first = container.querySelector("details")!
    await userEvent.click(screen.getByText("¿Cuánto tarda?"))
    expect(first.open).toBe(true)
  })

  it("uses the given heading id and renderLink", () => {
    render(
      <FaqList
        items={items}
        headingId="preguntas"
        renderLink={(link, props) => (
          <a data-router href={link.href} className={props.className}>
            {link.label}
          </a>
        )}
      />
    )
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "preguntas")
    expect(screen.getByRole("link", { name: "Ver el proceso" })).toHaveAttribute("data-router")
  })

  it("builds FAQPage JSON-LD without @context", () => {
    expect(faqPageJsonLd(items)).toEqual({
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "¿Cuánto tarda?", acceptedAnswer: { "@type": "Answer", text: "Unas dos semanas." } },
        { "@type": "Question", name: "¿Hay permanencia?", acceptedAnswer: { "@type": "Answer", text: "No." } },
      ],
    })
    expect(faqPageJsonLd(items)).not.toHaveProperty("@context")
  })
})
