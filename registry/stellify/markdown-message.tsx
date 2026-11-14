"use client"

import { memo, useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { Check, Copy } from "lucide-react"

import { useSmoothText } from "@/hooks/use-smooth-text"
import { cn } from "@/lib/utils"

export interface MarkdownMessageLabels {
  /** Copy button of a code block. */
  copyCode: string
  /** Shown (and announced) after copying. */
  copied: string
}

const DEFAULT_LABELS: MarkdownMessageLabels = { copyCode: "Copiar", copied: "Copiado" }

export interface MarkdownMessageProps {
  /** Markdown source. Raw HTML is dropped, links open in a new tab with `rel="noopener noreferrer"`. */
  content: string
  /** Defaults: copyCode "Copiar", copied "Copiado". */
  labels?: Partial<MarkdownMessageLabels>
  /** The answer is still being written: reveal it smoothly and show a caret at its end. */
  streaming?: boolean
  className?: string
}

interface HastNode {
  type: string
  value?: string
  tagName?: string
  properties?: { className?: unknown }
  children?: HastNode[]
}

function textOf(node: HastNode | undefined): string {
  if (!node) return ""
  if (node.type === "text") return node.value ?? ""
  return (node.children ?? []).map(textOf).join("")
}

function languageOf(node: HastNode | undefined): string | null {
  const code = node?.children?.find((c) => c.tagName === "code")
  const classes = code?.properties?.className
  const list = Array.isArray(classes) ? classes : []
  const lang = list.find((c): c is string => typeof c === "string" && c.startsWith("language-"))
  return lang ? lang.slice("language-".length) : null
}

function CodeBlock({
  code,
  language,
  labels,
  children,
}: {
  code: string
  language: string | null
  labels: MarkdownMessageLabels
  children: ReactNode
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code.replace(/\n$/, ""))
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked: the text is still selectable.
    }
  }

  return (
    <div data-slot="code-block" translate="no" className="my-3 overflow-hidden rounded-lg bg-surface-2">
      <div className="flex items-center justify-between gap-2 border-b pl-3">
        <span className="font-mono text-xs text-muted-foreground">{language ?? ""}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-foreground transition-colors duration-(--duration-fast) hover:bg-surface-3 [@media(pointer:coarse)]:min-h-11"
        >
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          <span aria-live="polite">{copied ? labels.copied : labels.copyCode}</span>
        </button>
      </div>
      {/* Focusable so a keyboard can scroll a long line sideways. */}
      <pre className="overflow-x-auto p-3 font-mono text-[0.8125rem] leading-relaxed" tabIndex={0}>
        {children}
      </pre>
    </div>
  )
}

function buildComponents(labels: MarkdownMessageLabels): Components {
  return {
    pre: ({ node, children }) => (
      <CodeBlock code={textOf(node as HastNode)} language={languageOf(node as HastNode)} labels={labels}>
        {children}
      </CodeBlock>
    ),
    code: ({ className, children }) => {
      // Inside a <pre> the block styles apply; inline code gets a chip.
      const block = typeof className === "string" && className.startsWith("language-")
      return block ? (
        <code className={className}>{children}</code>
      ) : (
        <code className="rounded-sm bg-surface-3 px-1 py-0.5 font-mono text-[0.875em] text-foreground [pre_&]:bg-transparent [pre_&]:p-0">
          {children}
        </code>
      )
    },
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline decoration-brand underline-offset-2">
        {children}
      </a>
    ),
    p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="my-2 list-disc pl-6 marker:text-muted-foreground">{children}</ul>,
    ol: ({ children }) => <ol className="my-2 list-decimal pl-6 marker:text-muted-foreground">{children}</ol>,
    li: ({ children }) => <li className="my-1 pl-1">{children}</li>,
    // Headings render as bold paragraphs: a reply never breaks the page outline.
    h1: ({ children }) => <p className="mb-2 mt-4 text-lg font-semibold first:mt-0">{children}</p>,
    h2: ({ children }) => <p className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</p>,
    h3: ({ children }) => <p className="mb-1 mt-3 font-semibold first:mt-0">{children}</p>,
    h4: ({ children }) => <p className="mb-1 mt-3 font-semibold first:mt-0">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="my-3 border-l-2 border-field-edge pl-3 text-muted-foreground">{children}</blockquote>
    ),
    table: ({ children }) => (
      <div className="my-3 overflow-x-auto" tabIndex={0}>
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border-b px-2 py-1 text-left font-semibold">{children}</th>,
    td: ({ children }) => <td className="border-b px-2 py-1 align-top">{children}</td>,
    hr: () => <hr className="my-4" />,
    // Nothing is fetched: an image becomes its alt text.
    img: ({ alt }) => <span className="text-muted-foreground">{alt ? `[${alt}]` : ""}</span>,
  }
}

// While streaming, the last paragraph (or last list item) ends in a soft caret.
// Written out in full so Tailwind's scanner sees every class.
const STREAMING_CARET = [
  "[&[data-streaming]>:not(ul,ol,pre,table,div):last-child]:after:inline-block [&[data-streaming]>:not(ul,ol,pre,table,div):last-child]:after:h-[1.05em] [&[data-streaming]>:not(ul,ol,pre,table,div):last-child]:after:w-[0.45em] [&[data-streaming]>:not(ul,ol,pre,table,div):last-child]:after:ml-[0.15em] [&[data-streaming]>:not(ul,ol,pre,table,div):last-child]:after:align-[-0.15em] [&[data-streaming]>:not(ul,ol,pre,table,div):last-child]:after:rounded-[2px] [&[data-streaming]>:not(ul,ol,pre,table,div):last-child]:after:bg-current [&[data-streaming]>:not(ul,ol,pre,table,div):last-child]:after:opacity-45 [&[data-streaming]>:not(ul,ol,pre,table,div):last-child]:after:content-[''] [&[data-streaming]>:not(ul,ol,pre,table,div):last-child]:after:motion-safe:animate-pulse",
  "[&[data-streaming]>:is(ul,ol):last-child>li:last-child]:after:inline-block [&[data-streaming]>:is(ul,ol):last-child>li:last-child]:after:h-[1.05em] [&[data-streaming]>:is(ul,ol):last-child>li:last-child]:after:w-[0.45em] [&[data-streaming]>:is(ul,ol):last-child>li:last-child]:after:ml-[0.15em] [&[data-streaming]>:is(ul,ol):last-child>li:last-child]:after:align-[-0.15em] [&[data-streaming]>:is(ul,ol):last-child>li:last-child]:after:rounded-[2px] [&[data-streaming]>:is(ul,ol):last-child>li:last-child]:after:bg-current [&[data-streaming]>:is(ul,ol):last-child>li:last-child]:after:opacity-45 [&[data-streaming]>:is(ul,ol):last-child>li:last-child]:after:content-[''] [&[data-streaming]>:is(ul,ol):last-child>li:last-child]:after:motion-safe:animate-pulse",
].join(" ")

/**
 * An assistant message rendered from Markdown: GFM lists, tables and code
 * blocks with a copy button. Raw HTML is skipped and images are reduced to
 * their alt text. Headings render as bold paragraphs so a reply never breaks
 * the page's heading outline.
 *
 * Re-parses on each change but defers it, so streaming stays responsive.
 * While `streaming`, the text is revealed a few characters per frame instead
 * of in the server's lumps (instant with reduced motion).
 */
function MarkdownMessageImpl({ content, labels, className, streaming = false }: MarkdownMessageProps) {
  const smooth = useSmoothText(content, streaming)
  const deferred = useDeferredValue(smooth)
  const copyCode = labels?.copyCode ?? DEFAULT_LABELS.copyCode
  const copied = labels?.copied ?? DEFAULT_LABELS.copied
  const components = useMemo(() => buildComponents({ copyCode, copied }), [copyCode, copied])
  return (
    <div
      data-slot="markdown-message"
      data-streaming={streaming || smooth.length < content.length ? "" : undefined}
      className={cn("break-words leading-[1.65]", STREAMING_CARET, className)}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={components}>
        {deferred}
      </ReactMarkdown>
    </div>
  )
}

export const MarkdownMessage = memo(MarkdownMessageImpl)
