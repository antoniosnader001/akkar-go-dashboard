import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-forest text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-forest',
  secondary:
    'bg-white/70 text-forest ring-1 ring-border hover:bg-white focus-visible:ring-2 focus-visible:ring-forest',
  ghost: 'bg-transparent text-forest hover:bg-forest/5 focus-visible:ring-2 focus-visible:ring-forest',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-600',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
