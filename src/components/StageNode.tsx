import { motion } from 'framer-motion'
import { LockKeyhole, Star } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { stagePositions } from '../lib/map'
import type { StageDef } from '../types'

export function StageNode({ stage, unlocked, current, stars }: { stage: StageDef; unlocked: boolean; current: boolean; stars: number }) {
  const navigate = useNavigate()
  const cleared = stars > 0
  const position = stagePositions[stage.id]
  const wasUnlocked = useRef(unlocked)
  const [unlockCount, setUnlockCount] = useState(0)
  useEffect(() => {
    if (unlocked && !wasUnlocked.current) setUnlockCount((count) => count + 1)
    wasUnlocked.current = unlocked
  }, [unlocked])
  const content = !unlocked ? <LockKeyhole className="size-6" aria-hidden="true" />
    : cleared ? <span className="flex items-center justify-center gap-0.5">{Array.from({ length: stars }, (_, index) => <Star key={index} className="size-4 fill-white text-white" aria-hidden="true" />)}</span>
      : <span className="fs-h3 font-display font-semibold">{stage.id + 1}</span>
  const label = <span className={`map-label absolute left-1/2 top-[calc(100%+0.25rem)] w-max -translate-x-1/2 rounded-full border border-ink/10 bg-parchment px-2 py-0.5 text-center font-semibold leading-[1.35] text-ink shadow-[0_2px_0_rgba(20,40,42,.12)]`}>{stage.title}</span>
  const style: CSSProperties = { left: `${position.x}%`, top: `${position.y}%` }
  return (
    <div className="map-node absolute z-10 -translate-x-1/2 -translate-y-1/2" style={style}>
      <motion.div key={unlockCount} initial={unlockCount > 0 ? { scale: 0.85 } : false} animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }} className="relative">
        {unlockCount > 0 && <motion.span initial={{ opacity: 0.9, scale: 0.9 }} animate={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.4, ease: 'easeOut' }} aria-hidden="true"
          className="pointer-events-none absolute -inset-1 rounded-full ring-4 ring-gold-500" />}
        <motion.div animate={current && unlocked ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          {unlocked ? <button className={`relative flex aspect-square cursor-pointer items-center justify-center border-2 border-ink shadow-[0_3px_0_rgba(20,40,42,.3)] outline-none focus-visible:ring-4 focus-visible:ring-gold-500 ${stage.sideQuest ? 'rotate-45 rounded-xl' : 'rounded-full'} ${cleared ? 'bg-leaf-600 text-white' : 'bg-sand text-ink'} ${current ? 'ring-4 ring-gold-500' : ''}`}
            aria-label={`${stage.title}${cleared ? `, ${stars} stars` : current ? ', current stage' : ', available'}`}
            onClick={() => navigate(`/stage/${stage.id}`)}>
            <span className={stage.sideQuest ? '-rotate-45' : ''}>{content}</span>
            <span className={stage.sideQuest ? '-rotate-45' : ''}>{label}</span>
          </button> : <div className={`relative flex aspect-square items-center justify-center border-2 border-ink/50 bg-sand text-ink opacity-45 ${stage.sideQuest ? 'rotate-45 rounded-xl' : 'rounded-full'}`} aria-label={`${stage.title}, locked`} aria-disabled="true">
            <span className={stage.sideQuest ? '-rotate-45' : ''}>{content}</span><span className={stage.sideQuest ? '-rotate-45' : ''}>{label}</span>
          </div>}
        </motion.div>
      </motion.div>
    </div>
  )
}
