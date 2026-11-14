import type { ReactNode } from 'react'

/** Narrow, centred column for focused content (entry, onboarding, results).
 * Width: var(--w-focus), with var(--pad-page) inner padding. */
export function FocusColumn({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-[var(--w-focus)] px-[var(--pad-page)] ${className}`}>{children}</div>
}
