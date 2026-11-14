import type { ReactNode } from 'react'

/** Broadest centred column (map page shell). Width: var(--w-content). */
export function ContentColumn({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-[var(--w-content)] ${className}`}>{children}</div>
}
