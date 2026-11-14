import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-[var(--h-control)] min-w-12 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-sm)] border-2 px-6 font-body fs-option font-semibold transition-[transform,background-color,box-shadow] duration-150 outline-none focus-visible:ring-4 focus-visible:ring-gold-500/60 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        primary: 'border-ink bg-coral-600 text-white shadow-[0_4px_0_#14282A] hover:bg-[#b83b18]',
        secondary: 'border-ink bg-parchment text-ink shadow-[0_3px_0_#14282A] hover:bg-sand',
        quiet: 'border-transparent bg-transparent text-ink hover:bg-sand',
      },
      size: {
        default: 'px-6 py-3',
        large: 'px-9 py-3 text-xl',
        icon: 'size-12 rounded-full border-sand bg-parchment p-0 shadow-none',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)

function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<'button'>
  & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button }
