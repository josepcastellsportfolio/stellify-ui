import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface AppShellProps {
  sidebar: ReactNode
  /** Top bar content (niche, API keys, sign out…). */
  topbar?: ReactNode
  children: ReactNode
  sidebarOpen?: boolean
  className?: string
}

/** Fixed left sidebar + optional top bar + scrollable content. */
function AppShell({ sidebar, topbar, children, sidebarOpen = true, className }: AppShellProps) {
  return (
    <div
      data-slot="app-shell"
      className={cn("flex h-screen overflow-hidden bg-background text-foreground", className)}
    >
      {sidebarOpen && (
        <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-border/60 md:block">
          {sidebar}
        </aside>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {topbar && (
          <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border/60 px-6">
            {topbar}
          </header>
        )}
        <main className="flex-1 overflow-y-auto px-6 py-8">{children}</main>
      </div>
    </div>
  )
}

export { AppShell }
