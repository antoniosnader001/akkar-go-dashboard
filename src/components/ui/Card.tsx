import type { ReactNode } from 'react'

export function Card({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={[
        'rounded-2xl bg-white/80 backdrop-blur border border-border/70',
        'shadow-sm',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={['p-5 pb-3', className].join(' ')}>{children}</div>
}

export function CardTitle({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <h3 className={['text-sm font-bold text-forest', className].join(' ')}>{children}</h3>
}

export function CardContent({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={['p-5 pt-3', className].join(' ')}>{children}</div>
}

export function CardFooter({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={['p-5 pt-0', className].join(' ')}>{children}</div>
}
