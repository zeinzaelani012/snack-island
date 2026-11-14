import type { ReactNode } from 'react'

/** Wide, centred column (dash, teacher views). Width: var(--w-focus-lg). */
export function WideColumn({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-[var(--w-focus-lg)] ${className}`}>{children}</div>
}
