import { useEffect, useRef, useState } from 'react'
import type { Difficulty } from '../../types'
import { timeForDifficulty } from './gameUtils'

export function TimerArc({ difficulty, extraTime = 0, running, onTimeout }: {
  difficulty: Difficulty
  extraTime?: number
  running: boolean
  onTimeout: () => void
}) {
  const duration = timeForDifficulty(difficulty)
  const [remaining, setRemaining] = useState(duration ?? 0)
  const remainingRef = useRef(remaining)
  const deadlineRef = useRef<number | null>(null)
  const timeoutRef = useRef(onTimeout)
  const previousExtra = useRef(extraTime)
  useEffect(() => {
    const added = extraTime - previousExtra.current
    previousExtra.current = extraTime
    if (deadlineRef.current !== null) deadlineRef.current += added * 1000
    else remainingRef.current += added
    if (added && !running) setRemaining(remainingRef.current)
  }, [extraTime, running])
  useEffect(() => { timeoutRef.current = onTimeout })
  useEffect(() => {
    if (!duration || !running) return
    deadlineRef.current = performance.now() + remainingRef.current * 1000
    const interval = window.setInterval(() => {
      const next = Math.max(0, (deadlineRef.current! - performance.now()) / 1000)
      remainingRef.current = next
      setRemaining(next)
      if (next <= 0) {
        window.clearInterval(interval)
        timeoutRef.current()
      }
    }, 100)
    return () => window.clearInterval(interval)
  }, [duration, running])
  if (!duration) return null
  const urgent = remaining < 5
  return <span className="flex size-12 shrink-0 items-center justify-center [@media(max-height:500px)]:size-9" role="timer" aria-label={urgent ? 'Less than five seconds left' : 'Time left'}>
    <svg viewBox="0 0 48 48" className="size-12 -rotate-90 [@media(max-height:500px)]:size-9" aria-hidden="true">
      <circle cx="24" cy="24" r="19" fill="none" stroke="#F4E7D3" strokeWidth="3" />
      <circle cx="24" cy="24" r="19" fill="none" stroke={urgent ? '#B3392F' : '#F5B33C'} strokeWidth="3" strokeLinecap="round" pathLength="100" strokeDasharray={`${remaining / duration * 100} 100`} />
    </svg>
  </span>
}
