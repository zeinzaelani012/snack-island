import { Star } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FocusColumn } from '../components/layout'
import { badgeById } from '../data/badges'
import { Button } from '../components/ui/button'
import { playStageClear, playStar } from '../lib/sound'
import { useGameStore } from '../store/gameStore'

export function StageResult({ title, stars, earnedXP, newBadges, braveVoice, epilogue, onRetry }: {
  title: string
  stars: 0 | 1 | 2 | 3
  earnedXP: number
  newBadges: string[]
  braveVoice: boolean
  epilogue: string
  onRetry: () => void
}) {
  const systemReducedMotion = useReducedMotion()
  const settingReducedMotion = useGameStore((state) => state.settings.reduceMotion)
  const reducedMotion = systemReducedMotion || settingReducedMotion
  const [displayXP, setDisplayXP] = useState(reducedMotion ? earnedXP : 0)
  const [reveal, setReveal] = useState(reducedMotion ? 3 : 0)

  useEffect(() => {
    playStageClear()
    if (stars > 0) {
      const chime = window.setTimeout(() => playStar(), 450)
      return () => window.clearTimeout(chime)
    }
  }, [])

  useEffect(() => {
    if (reducedMotion || typeof requestAnimationFrame !== 'function') {
      if (!reducedMotion) setReveal(3)
      return
    }
    let frame = 0
    const timers: number[] = []
    const start = performance.now()
    const count = (now: number) => {
      const progress = Math.min(1, (now - start) / 600)
      setDisplayXP(Math.round(earnedXP * progress))
      if (progress < 1) frame = requestAnimationFrame(count)
      else {
        if (newBadges.length > 0) {
          setReveal(1)
          timers.push(window.setTimeout(() => {
            setReveal(2)
            timers.push(window.setTimeout(() => setReveal(3), 400))
          }, 350))
        } else {
          setReveal(2)
          timers.push(window.setTimeout(() => setReveal(3), 400))
        }
      }
    }
    frame = requestAnimationFrame(count)
    return () => { cancelAnimationFrame(frame); timers.forEach(window.clearTimeout) }
  }, [earnedXP, newBadges, reducedMotion])

  return <main className="flex min-h-dvh items-center bg-parchment">
    <FocusColumn className="flex flex-col items-center text-center">
      <div className="flex w-full max-w-[30rem] flex-col items-center gap-5">
        <div>
          <p className="fs-option mb-1 font-semibold text-ocean-700">Trail complete</p>
          <h1 className="font-display text-4xl font-semibold text-ocean-900 sm:text-5xl">{title}</h1>
        </div>
        <div className="flex gap-2" aria-label={`${stars} stars`}>
          {[1, 2, 3].map((star) => <motion.span key={star} initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }} transition={{ delay: star * 0.12, duration: 0.2, ease: 'easeOut' }}>
            <Star aria-hidden="true" className={`size-12 sm:size-14 ${star <= stars ? 'fill-gold-500 text-gold-500' : 'fill-sand text-sand'}`} />
          </motion.span>)}
        </div>
        <p className="score-display font-display text-3xl font-semibold tabular-nums text-ocean-900">
          <span aria-hidden="true">+{reducedMotion ? earnedXP : displayXP} XP</span>
          <span className="sr-only">{earnedXP} XP earned</span>
        </p>
        <div className={`transition-opacity duration-200 ${newBadges.length > 0 && (reducedMotion || reveal >= 1) ? 'opacity-100' : 'invisible opacity-0'}`} role="status" aria-live="polite">
          {newBadges.map((id) => {
            const badge = badgeById(id)
            if (!badge) return null
            return <p key={id} className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-gold-500 bg-sand/50 px-4 py-3 font-semibold text-ocean-900">
              <img src={`/img/badges/${id}.svg`} alt="" className="size-9 shrink-0" />
              <span>New badge: {badge.name}!<span className="fs-sm block font-normal text-ink-muted">{badge.condition}</span></span>
            </p>
          })}
        </div>
        {!braveVoice && <p className="fs-body text-ink-muted">Brave Voice: not this time — you used a hint.</p>}
        <div className={`transition-opacity duration-300 ${reducedMotion || reveal >= 2 ? 'opacity-100' : 'invisible opacity-0'}`}>
          <p className="fs-h3 max-w-[var(--measure-instruction)] leading-relaxed">{epilogue}</p>
        </div>
        <div className={`flex w-full flex-col gap-3 transition-opacity duration-200 ${reducedMotion || reveal >= 3 ? 'opacity-100' : 'invisible pointer-events-none opacity-0'}`} aria-hidden={!reducedMotion && reveal < 3} inert={!reducedMotion && reveal < 3}>
          <Button size="large" asChild><Link to="/map">Back to the map</Link></Button>
          <Button variant="secondary" onClick={onRetry} tabIndex={reducedMotion || reveal >= 3 ? 0 : -1}>Retry</Button>
        </div>
      </div>
    </FocusColumn>
  </main>
}
