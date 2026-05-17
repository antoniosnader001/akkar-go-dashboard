import type { ReactNode } from 'react'

type BadgeVariant =
  | 'approval_pending'
  | 'approval_approved'
  | 'approval_rejected'
  | 'online_online'
  | 'online_offline'
  | 'online_busy'

const variantToClasses: Record<BadgeVariant, string> = {
  approval_pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  approval_approved: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  approval_rejected: 'bg-rose-50 text-rose-800 ring-rose-200',

  online_online: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  online_offline: 'bg-slate-50 text-slate-700 ring-slate-200',
  online_busy: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
}

export function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant
  children: ReactNode
}) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
        variantToClasses[variant],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
