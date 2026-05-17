import type { ReactNode } from 'react'
import { useEffect } from 'react'

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative z-10 mx-auto mt-10 w-[min(900px,calc(100%-2rem))] rounded-2xl border border-border/70 bg-white/95 shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="text-sm font-bold text-forest">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-muted hover:bg-forest/5 hover:text-forest focus-visible:ring-2 focus-visible:ring-forest"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="px-5 py-4 border-t border-border/60">{footer}</div> : null}
      </div>
    </div>
  )
}
