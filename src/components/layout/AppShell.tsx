import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { DevBanner } from './DevBanner'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <DevBanner />
      <div className="flex min-h-screen">
        <aside className="hidden lg:block w-72 border-r border-[var(--border-color)] bg-white/60 backdrop-blur">
          <Sidebar />
        </aside>

        <main className="flex-1 flex flex-col">
          <Topbar />
          <div className="p-4 sm:p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
