import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { ContentColumn } from '../components/layout'
import { Button } from '../components/ui/button'
import { BADGES } from '../data/badges'
import { useGameStore } from '../store/gameStore'

export function BadgesPage() {
  const earned = useGameStore((state) => state.badges)
  return (
    <main className="min-h-dvh bg-parchment">
      <header className="border-b-2 border-sand">
        <ContentColumn className="flex min-h-16 items-center gap-3 py-2">
          <Button asChild variant="quiet" size="icon" aria-label="Back to map"><Link to="/map"><ChevronLeft /></Link></Button>
          <h1 className="fs-h3 font-display font-semibold text-ocean-900">Badges</h1>
          <span className="fs-sm ml-auto rounded-full bg-sand px-2.5 py-1 font-semibold text-ocean-900">{earned.length} of {BADGES.length}</span>
        </ContentColumn>
      </header>
      <ContentColumn className="py-[var(--gap-section)]">
        <div className="grid grid-cols-2 gap-[var(--gap-section)] md:grid-cols-3 xl:grid-cols-4">
          {BADGES.map((badge) => {
            const record = earned.find((entry) => entry.id === badge.id)
            return <div key={badge.id}
              className={`flex flex-col items-center gap-[var(--sp-3)] rounded-[var(--radius)] border-2 p-[var(--sp-4)] text-center ${record ? 'border-gold-500 bg-sand/50' : 'border-sand bg-parchment'}`}>
              <img src={`/img/badges/${badge.id}.svg`} alt={record ? badge.name : ''}
                className={`size-20 ${record ? '' : 'opacity-30 grayscale'}`} />
              <div>
                <p className={`fs-body font-semibold ${record ? 'text-ocean-900' : 'text-ink-muted'}`}>{badge.name}</p>
                {record
                  ? <p className="fs-sm mt-1 text-ink-muted">Earned {new Date(record.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  : <p className="fs-sm mt-1 text-ink-muted">{badge.condition}</p>}
              </div>
            </div>
          })}
        </div>
      </ContentColumn>
    </main>
  )
}
