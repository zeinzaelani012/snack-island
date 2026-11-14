import { useEffect, useRef, useState } from 'react'

export function useDashClock(mode: 'find' | 'name', onEnd: () => void) {
  const [seconds, setSeconds] = useState(mode === 'find' ? 60 : 0)
  const [progress, setProgress] = useState(mode === 'find' ? 1 : 0)
  const endRef = useRef(onEnd)
  useEffect(() => { endRef.current = onEnd })
  useEffect(() => {
    const started = performance.now()
    const interval = window.setInterval(() => {
      const elapsed = Math.min(60, (performance.now() - started) / 1000)
      setProgress(mode === 'find' ? 1 - elapsed / 60 : elapsed / 60)
      setSeconds(mode === 'find' ? Math.ceil(60 - elapsed) : Math.floor(elapsed))
      if (elapsed >= 60) {
        window.clearInterval(interval)
        endRef.current()
      }
    }, 100)
    return () => window.clearInterval(interval)
  }, [mode])
  return { seconds, progress }
}
