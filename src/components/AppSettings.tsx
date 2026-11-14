import { MotionConfig } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { useGameStore } from '../store/gameStore'

export function AppSettings({ children }: { children: ReactNode }) {
  const settings = useGameStore((state) => state.settings)
  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(settings.textScale))
  }, [settings.textScale])

  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'user'}>
      <div className={`${settings.dyslexia ? 'dyslexia-text ' : ''}${settings.reduceMotion ? 'reduce-motion ' : ''}min-h-screen bg-parchment`}>
        {children}
      </div>
    </MotionConfig>
  )
}
