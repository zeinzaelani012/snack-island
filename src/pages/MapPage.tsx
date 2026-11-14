import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { Award, Coins, Settings, UserRound, Waves } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StageNode } from '../components/StageNode'
import { Button } from '../components/ui/button'
import { badgeById } from '../data/badges'
import { stages } from '../data/stages'
import { currentStageId, stagePositions } from '../lib/map'
import { masteryFor } from '../lib/mastery'
import { ISLAND_MAX_XP, rank } from '../lib/scoring'
import { isStagePlayable } from '../lib/unlocks'
import { useGameStore } from '../store/gameStore'
import type { Progress } from '../types'

function CountUp({ value }: { value: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString('en-GB'))
  useEffect(() => {
    const controls = animate(count, value, { duration: .6 })
    return () => controls.stop()
  }, [count, value])
  return <motion.span data-xp>{rounded}</motion.span>
}

// Square map: node percentages and the trail overlay share one 0-100 space
// (viewBox 0 0 100 100, preserveAspectRatio="none"), so the dotted path
// stretches exactly with the artwork.
function curvedTrail(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy) || 1
  const ox = (-dy / length) * 2.5
  const oy = (dx / length) * 2.5
  return `M${a.x} ${a.y} Q${mx + ox} ${my + oy} ${b.x} ${b.y}`
}

function badgeLabel(id: string): string {
  return id.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function BadgeList({ progress }: { progress: Progress }) {
  return <div className="flex flex-wrap gap-[var(--sp-2)]">
    {progress.badges.length === 0 ? <span className="fs-sm text-ink-muted">No badges yet</span>
      : progress.badges.map((badge) => {
        const def = badgeById(badge.id)
        return <span key={badge.id} className="fs-sm flex items-center gap-1 rounded-full border border-gold-500 bg-parchment px-2 py-0.5 font-semibold text-ocean-900" title={def?.condition}>
          <img src={`/img/badges/${badge.id}.svg`} alt="" className="size-5 shrink-0" />{def?.name ?? badgeLabel(badge.id)}
        </span>
      })}
  </div>
}

function RankChip({ progress }: { progress: Progress }) {
  return <span className="fs-sm self-start rounded-full bg-sand px-2.5 py-1 font-semibold text-ocean-900">{rank(progress)}</span>
}

function XpBadge({ progress }: { progress: Progress }) {
  return <strong className="flex items-center gap-1 text-ocean-900">
    <Coins className="size-5" aria-hidden="true" />
    <CountUp value={progress.xp} />
    <span className="hidden sm:inline"> XP</span>
  </strong>
}

function DashEntry({ progress }: { progress: Progress }) {
  if ((progress.stages[2]?.stars ?? 0) === 0) return null
  return <Link to="/dash" className="fs-body flex items-center gap-[var(--sp-3)] rounded-[var(--radius)] border-2 border-sand bg-parchment p-[var(--sp-3)] font-semibold text-ocean-900 shadow-[0_3px_0_rgba(20,40,42,.15)]">
    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sky-300 text-ocean-900"><Waves className="size-6" aria-hidden="true" /></span>
    <span>Tidepool Dash<span className="fs-sm block font-normal text-ink-muted">Speed games with food words</span></span>
  </Link>
}

export function MapPage() {
  const progress = useGameStore()
  const unlocked = (id: number) => isStagePlayable(id, progress)
  const current = currentStageId(progress)
  const xpPct = Math.min(100, Math.round(progress.xp / ISLAND_MAX_XP * 100))
  const navigate = useNavigate()
  const pressTimer = useRef<number | null>(null)
  const startLongPress = () => { pressTimer.current = window.setTimeout(() => navigate('/teacher'), 2000) }
  const cancelLongPress = () => { if (pressTimer.current !== null) { window.clearTimeout(pressTimer.current); pressTimer.current = null } }
  return (
    <main className="min-h-dvh bg-parchment">
      <header className="sticky top-0 z-40 h-16 border-b-2 border-sand bg-parchment/95 backdrop-blur-sm md:h-18">
        <div className="mx-auto flex h-full max-w-[80rem] items-center justify-between gap-2 px-2 sm:gap-3 sm:px-[var(--pad-page)]">
          <h1 className="fs-h3 shrink-0 cursor-default select-none whitespace-nowrap font-display font-semibold text-ocean-900"
            title="Snack Island"
            onPointerDown={startLongPress} onPointerUp={cancelLongPress} onPointerLeave={cancelLongPress} onContextMenu={(event) => event.preventDefault()}>
            Snack Island
          </h1>
          <div className="flex items-center gap-2">
            <XpBadge progress={progress} />
            <span className="hidden sm:block"><RankChip progress={progress} /></span>
            <div className="flex items-center gap-1">
              <Button asChild variant="quiet" size="icon" aria-label="Badges" title="Badges" className="size-11 min-h-11 sm:size-12 sm:min-h-12"><Link to="/badges"><Award /></Link></Button>
              <Button asChild variant="quiet" size="icon" aria-label="Profile" title="Profile" className="size-11 min-h-11 sm:size-12 sm:min-h-12"><Link to="/profile"><UserRound /></Link></Button>
              <Button asChild variant="quiet" size="icon" aria-label="Settings" title="Settings" className="size-11 min-h-11 sm:size-12 sm:min-h-12"><Link to="/settings"><Settings /></Link></Button>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[80rem] px-[var(--pad-page)] py-[var(--gap-section)]">
        {/* lg only: stats strip above the centred map */}
        <div className="mb-[var(--gap-section)] hidden flex-wrap items-center justify-between gap-[var(--sp-4)] rounded-[var(--radius)] border border-sand bg-sand/60 px-[var(--sp-5)] py-[var(--sp-3)] lg:flex xl:hidden">
          <XpBadge progress={progress} />
          <RankChip progress={progress} />
          <BadgeList progress={progress} />
          <div className="max-w-[16rem]"><DashEntry progress={progress} /></div>
        </div>
        <div className="grid gap-[var(--gap-section)] lg:grid-cols-[minmax(0,42.5rem)] lg:justify-center xl:grid-cols-[232px_minmax(560px,720px)_272px] xl:items-start">
          <aside className="hidden flex-col gap-[var(--sp-4)] rounded-[var(--radius)] border border-sand bg-sand/60 p-[var(--sp-4)] xl:flex">
            <RankChip progress={progress} />
            <div>
              <div className="fs-sm flex items-center justify-between text-ink-muted">
                <span className="flex items-center gap-1"><Coins className="size-4" aria-hidden="true" />Island XP</span>
                <span className="score-display">{progress.xp} / {ISLAND_MAX_XP}</span>
              </div>
              <div className="mt-1 h-[var(--sp-2)] rounded-full bg-parchment">
                <div className="h-full rounded-full bg-gold-500" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
            <div>
              <h2 className="fs-sm font-semibold text-ink-muted">Badges</h2>
              <div className="mt-[var(--sp-2)]"><BadgeList progress={progress} /></div>
            </div>
            <div className="mt-auto flex flex-col gap-[var(--sp-2)]">
              <Button variant="quiet" className="justify-start px-[var(--sp-3)]" aria-label="Profile"><UserRound aria-hidden="true" /> Profile</Button>
              <Button variant="quiet" className="justify-start px-[var(--sp-3)]" aria-label="Settings"><Settings aria-hidden="true" /> Settings</Button>
            </div>
          </aside>
          <div className="map-frame relative mx-auto aspect-square w-full overflow-hidden lg:max-w-[min(42.5rem,calc(100dvh-16rem))] xl:max-w-[min(100%,calc(100dvh-12rem))]">
            <img className="absolute inset-0 size-full" src="/img/snack-island-map-square.svg" alt="A square treasure map of Snack Island: a dotted path climbs from a wooden dock at the bottom to a flat mountain summit with a flag at the top" />
            <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {stages.filter((stage) => !stage.sideQuest).slice(0, -1).map((stage, index, route) => {
                const next = route[index + 1]
                if (!next) return null
                const a = stagePositions[stage.id]; const b = stagePositions[next.id]
                return <path key={stage.id} d={curvedTrail(a, b)} fill="none" stroke="#0B3D3B" strokeWidth="3" strokeDasharray="1 13" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              })}
              <path d={curvedTrail(stagePositions[2], stagePositions[6])} fill="none" stroke="#0B3D3B" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            {stages.map((stage) => <StageNode key={stage.id} stage={stage} unlocked={unlocked(stage.id)} current={current === stage.id}
              stars={stage.isBoss ? progress.boss.stars : progress.stages[stage.id]?.stars ?? 0} />)}
            {(progress.stages[2]?.stars ?? 0) > 0 && (
              <Link to="/dash" aria-label="Tidepool Dash" className="absolute bottom-[var(--sp-4)] right-[var(--sp-4)] z-20 flex flex-col items-center gap-1 lg:hidden">
                <span className="flex size-14 items-center justify-center rounded-full border-2 border-ink bg-sky-300 text-ocean-900 shadow-[0_4px_0_#14282A]"><Waves className="size-7" aria-hidden="true" /></span>
                <span className="fs-sm rounded-full bg-parchment px-2 py-0.5 font-semibold text-ink shadow-[0_2px_0_rgba(20,40,42,.12)]">Tidepool Dash</span>
              </Link>
            )}
          </div>
          <aside className="hidden flex-col gap-[var(--sp-4)] rounded-[var(--radius)] border border-sand bg-sand/60 p-[var(--sp-4)] xl:flex">
            <h2 className="fs-body font-semibold text-ocean-900">Mastery</h2>
            {masteryFor(progress).map((row) => <div key={row.code}>
              <div className="fs-sm flex items-center justify-between text-ink-muted">
                <span>{row.name}</span><span className="score-display">{row.pct}%</span>
              </div>
              <div className="mt-1 h-[var(--sp-2)] rounded-full bg-parchment">
                <div className="h-full rounded-full bg-leaf-600" style={{ width: `${row.pct}%` }} />
              </div>
            </div>)}
            <DashEntry progress={progress} />
          </aside>
        </div>
      </div>
    </main>
  )
}
