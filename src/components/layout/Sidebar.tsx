import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  BadgeCheck,
  Settings,
  Users,
  Boxes,
  CalendarClock,
  FileSpreadsheet,
} from 'lucide-react'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/drivers', label: 'Drivers', icon: BadgeCheck },
  { to: '/riders', label: 'Riders', icon: Users },
  { to: '/trips', label: 'Trips', icon: CalendarClock },
  { to: '/online-drivers', label: 'Online Drivers', icon: Boxes },
  { to: '/reports', label: 'Reports / Export', icon: FileSpreadsheet },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="text-sm font-semibold tracking-wide text-[var(--accent)]">
          Akkar Go
        </div>
        <div className="text-lg font-semibold text-[var(--text-h)]">
          Operations
        </div>
        <div className="mt-1 text-xs text-[var(--muted)]">
          Manage drivers, riders, trips
        </div>
      </div>

      <nav className="space-y-1">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                  'border border-transparent',
                  'hover:bg-white/70',
                  isActive
                    ? 'bg-[var(--accent-bg)] text-[var(--text-h)] border-[var(--accent-border)]'
                    : 'text-[var(--text)]',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-[var(--border-color)] bg-white/50 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Status
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--leaf)]" />
          <span className="text-sm text-[var(--text-h)]">Mock mode</span>
        </div>
        <div className="mt-2 text-xs text-[var(--muted)]">
          Replace services/api.ts later with secure admin endpoints.
        </div>
      </div>
    </div>
  )
}
