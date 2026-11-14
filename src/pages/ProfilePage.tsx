import { Waves, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ContentColumn } from '../components/layout'
import { CreatureAvatar } from '../components/CreatureAvatar'
import { Button } from '../components/ui/button'
import { avatarIds, type AvatarId } from '../data/avatars'
import { stages } from '../data/stages'
import { masteryFor } from '../lib/mastery'
import { rank } from '../lib/scoring'
import { useGameStore } from '../store/gameStore'

function Stars({ count }: { count: number }) {
  return <span className="flex gap-0.5" aria-label={`${count} stars`}>
    {[1, 2, 3].map((star) => <Star key={star} aria-hidden="true" className={`size-4 ${star <= count ? 'fill-gold-500 text-gold-500' : 'fill-sand text-sand'}`} />)}
  </span>
}

export function ProfilePage() {
  const progress = useGameStore()
  const mastery = masteryFor(progress)
  const avatarId = (avatarIds as readonly string[]).includes(progress.avatarId) ? progress.avatarId as AvatarId : 'turtle'
  return (
    <main className="min-h-dvh bg-parchment">
      <ContentColumn className="py-[var(--gap-section)]">
        <header className="flex items-center gap-[var(--sp-4)]">
          <CreatureAvatar id={avatarId} />
          <div>
            <h1 className="fs-h2 font-display font-semibold text-ocean-900">{progress.learnerName || 'Explorer'}</h1>
            <span className="fs-sm rounded-full bg-sand px-2.5 py-1 font-semibold text-ocean-900">{rank(progress)}</span>
          </div>
          <strong className="fs-h3 score-display ml-auto font-semibold text-ocean-900" data-xp>{progress.xp} XP</strong>
        </header>

        <section className="mt-[var(--gap-section)]" aria-label="Mastery">
          <h2 className="fs-h3 font-display font-semibold text-ocean-900">Mastery</h2>
          <p className="fs-sm mt-1 text-ink-muted">Correct on the first try, per skill. Project comes from your tutor's summit rubric.</p>
          <div className="mt-[var(--sp-4)] grid grid-cols-1 gap-x-[var(--gap-section)] gap-y-[var(--sp-4)] xl:grid-cols-2">
            {mastery.map((row) => <div key={row.code}>
              <div className="fs-body flex items-center justify-between">
                <span className="font-semibold text-ocean-900">{row.name} <span className="fs-sm font-normal text-ink-muted">{row.code}</span></span>
                <span className="score-display font-semibold text-ocean-900" data-score>{row.pct}%</span>
              </div>
              <div className="mt-1 h-[var(--sp-2)] rounded-full bg-sand">
                <div className={`h-full rounded-full ${row.pct >= 60 ? 'bg-leaf-600' : 'bg-gold-500'}`} style={{ width: `${row.pct}%` }} />
              </div>
            </div>)}
          </div>
        </section>

        <section className="mt-[var(--gap-section)]" aria-label="Stages">
          <h2 className="fs-h3 font-display font-semibold text-ocean-900">Your trail</h2>
          <ul className="mt-[var(--sp-3)] flex flex-col gap-[var(--sp-2)]">
            {stages.map((stage) => {
              const stars = stage.isBoss ? progress.boss.stars : progress.stages[stage.id]?.stars ?? 0
              const attempts = stage.isBoss ? '—' : progress.stages[stage.id]?.attempts ?? 0
              return <li key={stage.id} className="fs-body flex min-h-12 items-center justify-between gap-[var(--sp-3)] rounded-[var(--radius-sm)] border border-sand bg-sand/40 px-[var(--sp-3)]">
                <span className="font-semibold text-ink">{stage.title}{stage.sideQuest ? <span className="fs-sm ml-2 font-normal text-ink-muted">side quest</span> : null}</span>
                <span className="flex items-center gap-[var(--sp-3)]">
                  <Stars count={stars} />
                  <span className="fs-sm text-ink-muted">{attempts === '—' ? 'tutor-assessed' : `${attempts} ${attempts === 1 ? 'try' : 'tries'}`}</span>
                </span>
              </li>
            })}
          </ul>
        </section>

        <section className="mt-[var(--gap-section)] rounded-[var(--radius)] border border-sand bg-sand/40 p-[var(--sp-4)]" aria-label="Dash record">
          <h2 className="fs-body flex items-center gap-2 font-semibold text-ocean-900"><Waves className="size-5 text-ocean-700" aria-hidden="true" />Tidepool Dash</h2>
          <p className="fs-body mt-1 text-ink-muted">
            Best <strong className="score-display text-ink">{progress.dash.bestFind}</strong> tiles cleared.
            This is a <strong className="text-ink">side record</strong> — it is not part of your island XP.
          </p>
          <Button asChild variant="secondary" className="mt-[var(--sp-3)]"><Link to="/dash">Play Tidepool Dash</Link></Button>
        </section>
      </ContentColumn>
    </main>
  )
}
