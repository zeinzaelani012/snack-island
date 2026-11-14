import { Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { OptionStatus } from './gameUtils'

export function OptionButton({ children, status, onClick, className = '', label, disabled = false }: {
  children: React.ReactNode
  status: OptionStatus
  onClick: () => void
  className?: string
  label: string
  disabled?: boolean
}) {
  const isPicture = className.includes('picture-option')
  const isCrate = className.includes('shadow-none')
  return <motion.button type="button" aria-label={label} aria-pressed={status === 'selected'} disabled={disabled || status === 'removed'}
    onClick={onClick}
    animate={status === 'correct' ? { y: -2, scale: 1.03 } : status === 'wrong' ? { x: [0, -3, 3, -3, 3, 0], y: 0, scale: 1 } : { x: 0, y: 0, scale: 1 }}
    transition={{ duration: status === 'wrong' ? 0.24 : 0.16, ease: 'easeOut' }}
    className={`option-card relative flex cursor-pointer items-center gap-2 overflow-hidden border-2 font-semibold leading-snug shadow-[0_3px_0_#14282A] outline-none transition-colors focus-visible:ring-4 focus-visible:ring-gold-500 disabled:cursor-default ${isPicture ? 'picture-option mx-auto aspect-square h-full min-h-0 max-w-[11.25rem] w-full flex-col items-center justify-center p-2 text-center' : ''} ${status === 'correct' ? 'border-leaf-600 bg-leaf-600/15 text-ink' : status === 'wrong' ? 'border-danger-600 bg-danger-600/10 text-ink' : status === 'selected' ? 'border-ocean-700 bg-sky-300/25' : status === 'removed' ? 'border-sand bg-sand/20 opacity-25' : 'border-ink bg-parchment hover:bg-sand/60'} ${className}`}>
    {children}
    {!isCrate && (status === 'correct' || status === 'wrong') && <span className={`${isPicture ? 'absolute bottom-1 left-1 right-1 bg-parchment/95 fs-sm' : 'w-full fs-sm'} flex items-center justify-center gap-1 rounded-lg px-1 font-semibold`}>
      {status === 'correct' ? <Check className="size-5 shrink-0 text-leaf-600" aria-hidden="true" /> : <X className="size-5 shrink-0 text-danger-600" aria-hidden="true" />}
      {status === 'correct' ? 'Correct' : 'Not yet'}
    </span>}
    {isCrate && status !== 'idle' && status !== 'removed' && <span className={`absolute inset-x-2 bottom-0 flex items-center justify-center gap-1 rounded-lg border-2 bg-parchment px-1 py-1 fs-sm font-semibold ${status === 'correct' ? 'border-leaf-600 text-leaf-600' : status === 'wrong' ? 'border-danger-600 text-danger-600' : 'border-ocean-700 text-ocean-900'}`}>
      {status === 'correct' ? <Check className="size-4" aria-hidden="true" /> : status === 'wrong' ? <X className="size-4" aria-hidden="true" /> : null}
      {status === 'correct' ? 'Correct' : status === 'wrong' ? 'Not yet' : 'Selected'}
    </span>}
  </motion.button>
}
