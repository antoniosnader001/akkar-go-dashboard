import { Search, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useMemo, useState } from 'react'

export function Topbar() {
  const [query, setQuery] = useState('')

  const status = useMemo(() => {
    // Mock: later can be wired to /api/admin/health
    return {
      label: 'API: Mock connected',
      tone: 'text-[var(--leaf)]',
      icon: ShieldCheck,
    } as const
  }, [])

  const StatusIcon = status.icon

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border-color)] bg-white/70 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-[var(--accent-bg)] flex items-center justify-center border border-[var(--accent-border)]">
              <AlertTriangle className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--text-h)]">
                Akkar Go Admin
              </div>
              <div className="text-xs text-[var(--muted)]">
                Manage drivers, riders, trips, and local Tuk Tuk operations.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-white px-3 py-2 w-[320px]">
            <Search className="h-4 w-4 text-[var(--muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drivers, riders, trips..."
              className="w-full outline-none bg-transparent text-sm text-[var(--text-h)] placeholder:text-[var(--muted)]"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-white px-3 py-2">
            <StatusIcon className={`h-4 w-4 ${status.tone}`} />
            <span className={`text-xs font-semibold ${status.tone}`}>{status.label}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
