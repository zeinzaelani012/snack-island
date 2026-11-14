import type { ReactNode } from 'react'

/** Full-viewport shell for every stage and boss screen: header and footer
 * pinned, content centred and allowed to shrink. Uses 100dvh (never vh) so
 * mobile browser chrome cannot cut off the footer. At 1280x720 the item
 * screen must fit with no vertical scrolling: header <= 64px,
 * footer <= 72px, content = the remaining space, centred. */
export function PlayScreen({ header, footer, children, className = '', as = 'div' }: {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  as?: 'div' | 'main'
}) {
  const Tag = as
  return (
    <Tag className={`flex h-dvh flex-col overflow-hidden ${className}`}>
      {header ? <div className="shrink-0">{header}</div> : null}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">{children}</div>
      {footer ? <div className="shrink-0">{footer}</div> : null}
    </Tag>
  )
}
