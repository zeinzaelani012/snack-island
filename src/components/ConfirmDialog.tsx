import { X } from 'lucide-react'
import { Button } from './ui/button'

export function ConfirmDialog({ open, title, body, confirmLabel = 'Yes, do it', onConfirm, onCancel }: {
  open: boolean
  title: string
  body: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-[var(--pad-page)]" role="dialog" aria-modal="true" aria-label={title}>
    <div className="w-full max-w-[26.25rem] rounded-[var(--radius)] border-2 border-ink bg-parchment p-[var(--sp-5)] text-center shadow-[0_6px_0_#14282A]">
      <h2 className="fs-h3 font-display font-semibold text-ocean-900">{title}</h2>
      <p className="fs-body mt-[var(--sp-2)] text-ink-muted">{body}</p>
      <div className="mt-[var(--sp-4)] flex justify-center gap-[var(--sp-3)]">
        <Button variant="secondary" onClick={onCancel}><X aria-hidden="true" /> Cancel</Button>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  </div>
}
