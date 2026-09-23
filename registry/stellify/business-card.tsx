import { useId } from "react"
import { Globe, MapPin, Phone, Star } from "lucide-react"

import { Chip } from "@/components/chip"
import { ScoreBadge } from "@/components/score-badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export interface BusinessCardProps {
  name: string
  score: number
  address?: string | null
  rating?: number | null
  reviewCount?: number | null
  phone?: string | null
  website?: string | null
  chips?: string[]
  selected: boolean
  onSelectedChange: (selected: boolean) => void
  noWebsiteLabel?: string
  selectLabel?: string
  scoreLabel?: string
  className?: string
}

const displayHost = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "")
  } catch {
    return url
  }
}

/** Selectable business row: checkbox, name + score, address, rating · phone · web, signal chips. */
function BusinessCard({
  name,
  score,
  address,
  rating,
  reviewCount,
  phone,
  website,
  chips = [],
  selected,
  onSelectedChange,
  noWebsiteLabel = "Sin página web",
  selectLabel = "Seleccionar",
  scoreLabel = "Oportunidad",
  className,
}: BusinessCardProps) {
  const titleId = useId()
  const fact = "inline-flex items-center gap-1 [&_svg]:size-3.5 [&_svg]:shrink-0"
  return (
    <article
      data-slot="business-card"
      data-selected={selected}
      aria-labelledby={titleId}
      className={cn(
        "flex gap-3 rounded-lg border bg-background p-4 transition-colors",
        selected ? "border-primary/60" : "border-border hover:border-primary/30",
        className
      )}
    >
      <Checkbox
        className="mt-0.5"
        checked={selected}
        onCheckedChange={(v) => onSelectedChange(v === true)}
        aria-label={`${selectLabel} ${name}`}
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <h3 id={titleId} className="truncate text-base font-semibold text-foreground">
            {name}
          </h3>
          <ScoreBadge score={score} label={scoreLabel} />
        </div>
        {address && (
          <p className={cn(fact, "text-sm text-muted-foreground")}>
            <MapPin aria-hidden />
            {address}
          </p>
        )}
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {rating != null && (
            <span className={fact}>
              <Star aria-hidden />
              {`${rating.toLocaleString("es-ES")} (${reviewCount ?? 0})`}
            </span>
          )}
          {phone && (
            <span className={fact}>
              <Phone aria-hidden />
              {phone}
            </span>
          )}
          <span className={fact}>
            <Globe aria-hidden />
            {website ? (
              <a href={website} target="_blank" rel="noreferrer noopener" className="hover:text-foreground hover:underline">
                {displayHost(website)}
              </a>
            ) : (
              noWebsiteLabel
            )}
          </span>
        </p>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {chips.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export { BusinessCard }
