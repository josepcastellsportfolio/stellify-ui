import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CarouselCardsPerView {
  base: number
  md: number
  lg: number
}

export interface CarouselProps<T> {
  /** Items to render as slides. */
  items: T[]
  /** Renders a single slide. */
  renderItem: (item: T, index: number) => ReactNode
  /** Stable key per item. Defaults to the index. */
  getItemKey?: (item: T, index: number) => string | number
  /** Autoplay interval in ms. Defaults to 5000. */
  autoPlayMs?: number
  /** Enable autoplay. Defaults to true. */
  autoPlay?: boolean
  /** Pause autoplay while hovered. Defaults to true. */
  pauseOnHover?: boolean
  /** Slides visible per breakpoint. Defaults to { base: 1, md: 2, lg: 3 }. */
  cardsPerView?: CarouselCardsPerView
  /** Show prev/next arrows (desktop). Defaults to true. */
  showArrows?: boolean
  /** Show position dots. Defaults to true. */
  showDots?: boolean
  className?: string
  ariaLabel?: string
}

const DEFAULT_CARDS_PER_VIEW: CarouselCardsPerView = { base: 1, md: 2, lg: 3 }

/** Self-contained autoplay/position state for the carousel. */
function useCarouselIndex(count: number, intervalMs: number, enabled: boolean) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<number | null>(null)

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return
      setIndex(((next % count) + count) % count)
    },
    [count]
  )
  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  // Clamp when the item count shrinks.
  useEffect(() => {
    if (index > count - 1) setIndex(Math.max(0, count - 1))
  }, [count, index])

  useEffect(() => {
    if (!enabled || paused || count <= 1) return
    timer.current = window.setTimeout(
      () => setIndex((i) => (i + 1) % count),
      intervalMs
    )
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [enabled, paused, count, intervalMs, index])

  return { index, setPaused, goTo, next, prev }
}

/**
 * Generic, accessible card carousel: autoplay, hover-pause, drag/swipe,
 * responsive slides-per-view, arrows and dots.
 *
 * Generalized from the StellifyIT dashboard slider: it takes `items` +
 * `renderItem` instead of a fixed set of card types, and carries no theme/
 * accent business logic (the wrapper is neutral — style it via `className`).
 */
export default function Carousel<T>({
  items,
  renderItem,
  getItemKey,
  autoPlayMs = 5000,
  autoPlay = true,
  pauseOnHover = true,
  cardsPerView = DEFAULT_CARDS_PER_VIEW,
  showArrows = true,
  showDots = true,
  className,
  ariaLabel = "Carousel",
}: CarouselProps<T>) {
  const [perView, setPerView] = useState(cardsPerView.base)

  useEffect(() => {
    const mqLg = window.matchMedia("(min-width: 1024px)")
    const mqMd = window.matchMedia("(min-width: 768px)")
    const compute = () => {
      if (mqLg.matches) setPerView(cardsPerView.lg)
      else if (mqMd.matches) setPerView(cardsPerView.md)
      else setPerView(cardsPerView.base)
    }
    compute()
    mqLg.addEventListener("change", compute)
    mqMd.addEventListener("change", compute)
    return () => {
      mqLg.removeEventListener("change", compute)
      mqMd.removeEventListener("change", compute)
    }
  }, [cardsPerView.base, cardsPerView.md, cardsPerView.lg])

  const pageCount = Math.max(1, items.length - perView + 1)
  const { index, setPaused, goTo, next, prev } = useCarouselIndex(
    pageCount,
    autoPlayMs,
    autoPlay
  )

  const dragStartX = useRef<number | null>(null)
  const dragDelta = useRef(0)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX
    dragDelta.current = 0
    setPaused(true)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return
    dragDelta.current = e.clientX - dragStartX.current
  }
  const onPointerUp = () => {
    if (dragStartX.current === null) return
    const threshold = 50
    if (dragDelta.current > threshold) prev()
    else if (dragDelta.current < -threshold) next()
    dragStartX.current = null
    dragDelta.current = 0
    if (!pauseOnHover) setPaused(false)
  }

  const slideStyle = useMemo<CSSProperties>(
    () => ({
      transform: `translateX(-${(index * 100) / perView}%)`,
      transition: "transform 500ms ease-out",
    }),
    [index, perView]
  )

  if (items.length === 0) return null

  return (
    <div
      className={cn("rounded-xl px-3 py-4 md:px-4 md:py-5", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <div className="relative">
        <div
          className="touch-pan-y overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="flex" style={slideStyle}>
            {items.map((item, i) => (
              <div
                key={getItemKey ? getItemKey(item, i) : i}
                className="shrink-0 px-2"
                style={{ flex: `0 0 ${100 / perView}%` }}
                aria-roledescription="slide"
              >
                {renderItem(item, i)}
              </div>
            ))}
          </div>
        </div>

        {showArrows && pageCount > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-0 top-1/2 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background shadow-md transition-colors hover:bg-accent md:inline-flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="absolute right-0 top-1/2 hidden h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border/60 bg-background shadow-md transition-colors hover:bg-accent md:inline-flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {showDots && pageCount > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index
                  ? "w-6 bg-foreground"
                  : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export { Carousel }
