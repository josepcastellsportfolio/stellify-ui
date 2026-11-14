"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Public-domain plates (Artvee), cleaned into ink-only alpha masks: the image
 * is the shape, the color comes from a token. So every product sees them in
 * its own `--brand`, and they work on any surface in light and dark.
 *
 * The WebP files are not part of the registry JSON (it only carries text).
 * By default they load from jsDelivr, from this repo's `public/illustrations`;
 * for production copy that folder into your app and point
 * `<IllustrationProvider baseUrl="/illustrations/">` at it.
 */
export const ILLUSTRATIONS = [
  { id: "laurel", family: "botanical", title: "Laurus II", artist: "Georg Dionysius Ehret", date: "1750-1773", source: "https://artvee.com/dl/laurus-ii/", width: 472, height: 734 },
  { id: "balsam", family: "botanical", title: "Cenchramidea Arbor saxis adnascens &c., The Balsam-Tree.", artist: "Mark Catesby", date: "1754", source: "https://artvee.com/dl/cenchramidea-arbor-saxis-adnascens-c-the-balsam-tree/", width: 400, height: 524 },
  { id: "phacelia", family: "botanical", title: "Phacelia (Phacelia parryi)", artist: "Mary Vaux Walcott", date: "1935", source: "https://artvee.com/dl/phacelia-phacelia-parryi/", width: 354, height: 490 },
  { id: "dipodium", family: "botanical", title: "Dotted Dipodium", artist: "Sydenham Edwards", date: "1815-1819", source: "https://artvee.com/dl/dotted-dipodium/", width: 454, height: 776 },
  { id: "aster", family: "botanical", title: "Dwarf Blue Aster", artist: "Sydenham Edwards", date: "1815-1819", source: "https://artvee.com/dl/dwarf-blue-aster/", width: 467, height: 792 },
  { id: "bouquet", family: "botanical", title: "Album de botanique Pl.198", artist: "Constant Amable Prevost-Hersant", date: "1856", source: "https://artvee.com/dl/album-de-botanique-pl-198/", width: 351, height: 520 },
  { id: "rose", family: "botanical", title: "Rosa bullata", artist: "Gaetano Savi", date: "1818-1824", source: "https://artvee.com/dl/rosa-bullata-2/", width: 373, height: 529 },
  { id: "passionflower", family: "botanical", title: "Passiflora caerulea", artist: "Jean Baptiste Louis Letellier", date: "1848-1849", source: "https://artvee.com/dl/passiflora-caerulea/", width: 369, height: 512 },
  { id: "tetratheca", family: "botanical", title: "Hairy Tetratheca", artist: "Sydenham Edwards", date: "1815-1819", source: "https://artvee.com/dl/hairy-tetratheca/", width: 428, height: 711 },
  { id: "parrot", family: "fauna", title: "Vasa Parrot", artist: "Alexander Francis Lydon", date: "1884-1887", source: "https://artvee.com/dl/vasa-parrot/", width: 371, height: 595 },
  { id: "towhee", family: "fauna", title: "Towhe bunting", artist: "John James Audubon", date: "1827–1838", source: "https://artvee.com/dl/towhe-bunting/", width: 431, height: 712 },
  { id: "perched-bird", family: "fauna", title: "Centurie zoologique Pl.38", artist: "René-Primevère Lesson", date: "1830-1832", source: "https://artvee.com/dl/centurie-zoologique-pl-38/", width: 311, height: 606 },
  { id: "thrushes", family: "fauna", title: "Merula Reevi", artist: "Henry Seebohm", date: "1899-1902", source: "https://artvee.com/dl/merula-reevi/", width: 446, height: 531 },
  { id: "beetles", family: "fauna", title: "Insecta Coleoptera Pl 113", artist: "Frederick DuCane Godman", date: "1879-1915", source: "https://artvee.com/dl/insecta-coleoptera-pl-113/", width: 444, height: 665 },
  { id: "nautilus", family: "fauna", title: "Nodose paper nautilus (Argonauta nodosa)", artist: "Wenceslaus Hollar", date: "1644-1652", source: "https://artvee.com/dl/nodose-paper-nautilus-argonauta-nodosa/", width: 292, height: 247 },
  { id: "quoll", family: "fauna", title: "The mammals of Australia Pl.029", artist: "John Gould", date: "1845-1863", source: "https://artvee.com/dl/the-mammals-of-australia-pl-029/", width: 485, height: 257 },
  { id: "insects", family: "fauna", title: "Diversae Insectarum Volatilium Pl.09", artist: "Jacob Hoefnagel", date: "1630", source: "https://artvee.com/dl/diversae-insectarum-volatilium-pl-09/", width: 440, height: 308 },
  { id: "guild-arms", family: "objects", title: "Illustration Page from ‘De ambachten en neringen van Brugge’ by Gailliard; The Coats of Arms of the Guilds Plate 6.", artist: "Auguste Ancot", date: "1854", source: "https://artvee.com/dl/illustration-page-from-de-ambachten-en-neringen-van-brugge-by-gailliard-the-coats-of-arms-of-the-guilds-plate-6/", width: 391, height: 654 },
  { id: "ornament", family: "objects", title: "Objets mobiliers, objets usuels", artist: "Auguste Racinet", date: "1876-1888", source: "https://artvee.com/dl/objets-mobiliers-objets-usuels/", width: 412, height: 389 },
  { id: "mushrooms", family: "objects", title: "Boletus luteus Linné.", artist: "Hans Walty", date: "1915-1945", source: "https://artvee.com/dl/boletus-luteus-linne/", width: 460, height: 671 },
  { id: "coins", family: "objects", title: "Sheet of Six Antique Coins", artist: "Eugène Delacroix", date: "1825", source: "https://artvee.com/dl/sheet-of-six-antique-coins/", width: 486, height: 367 },] as const

export type IllustrationName = (typeof ILLUSTRATIONS)[number]["id"]
export type IllustrationFamily = (typeof ILLUSTRATIONS)[number]["family"]

export const ILLUSTRATION_CDN =
  "https://cdn.jsdelivr.net/gh/josepcastellsportfolio/stellify-ui@main/public/illustrations/"

const BaseUrl = React.createContext<string>(ILLUSTRATION_CDN)

/** Where the `.webp` files live. Ends with a slash. */
export function IllustrationProvider({ baseUrl, children }: { baseUrl: string; children: React.ReactNode }) {
  return <BaseUrl.Provider value={baseUrl}>{children}</BaseUrl.Provider>
}

const TONE = {
  brand: "bg-brand",
  foreground: "bg-foreground",
  muted: "bg-muted-foreground",
} as const

export interface IllustrationProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  name: IllustrationName
  /** Ink color. `brand` by default. */
  tone?: keyof typeof TONE
  /** Accessible description. Without it the plate is decorative (hidden from screen readers). */
  alt?: string
}

/**
 * One plate, drawn in a token color. Size it with a width class (`w-32`);
 * the height follows the plate's own aspect ratio, so nothing shifts while it loads.
 */
function Illustration({ name, tone = "brand", alt, className, style, ...props }: IllustrationProps) {
  const base = React.useContext(BaseUrl)
  const plate = ILLUSTRATIONS.find((p) => p.id === name)
  if (!plate) return null
  const mask = `url("${base}${plate.id}.webp")`
  return (
    <span
      data-slot="illustration"
      data-name={plate.id}
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      className={cn("block shrink-0", TONE[tone], className)}
      style={{
        aspectRatio: `${plate.width} / ${plate.height}`,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        ...style,
      }}
      {...props}
    />
  )
}

export { Illustration }
