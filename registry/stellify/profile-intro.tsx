import type { FC, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface ProfileIntroProps {
  name: string
  /** One-line role, under the name. */
  role: string
  photoSrc: string
  photoAlt: string
  /**
   * Explicit intrinsic size. Required, not optional: an image without
   * width/height is the usual source of layout shift.
   */
  photoWidth: number
  photoHeight: number
  children?: ReactNode
  className?: string
}

/**
 * "Who" block: photo, name, role and a short track record.
 *
 * Exists to answer the objection that every listed project is the author's
 * own — without it a portfolio reads like someone just starting out.
 */
export const ProfileIntro: FC<ProfileIntroProps> = ({
  name,
  role,
  photoSrc,
  photoAlt,
  photoWidth,
  photoHeight,
  children,
  className,
}) => (
  <div className={cn("flex flex-col gap-8 sm:flex-row sm:items-start", className)}>
    <img
      src={photoSrc}
      alt={photoAlt}
      width={photoWidth}
      height={photoHeight}
      loading="lazy"
      decoding="async"
      className="h-40 w-40 shrink-0 rounded-[--radius-card] object-cover shadow-[--shadow-card]"
    />
    <div className="min-w-0">
      <h2 className="text-3xl font-semibold tracking-[--tracking-display]">{name}</h2>
      <p className="mt-2 text-muted-foreground">{role}</p>
      <div className="mt-6 space-y-4 leading-[--leading-body] text-muted-foreground">
        {children}
      </div>
    </div>
  </div>
)
