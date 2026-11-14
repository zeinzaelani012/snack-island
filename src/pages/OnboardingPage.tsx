import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CreatureAvatar } from '../components/CreatureAvatar'
import { avatarIds, type AvatarId } from '../data/avatars'
import { FocusColumn } from '../components/layout'
import { Button } from '../components/ui/button'
import { useGameStore } from '../store/gameStore'

export function OnboardingPage() {
  const navigate = useNavigate()
  const savedName = useGameStore((state) => state.learnerName)
  const savedAvatar = useGameStore((state) => state.avatarId)
  const setName = useGameStore((state) => state.setName)
  const setAvatar = useGameStore((state) => state.setAvatar)
  const [name, setLocalName] = useState(savedName)
  const [avatar, setLocalAvatar] = useState<AvatarId>(avatarIds.includes(savedAvatar as AvatarId) ? savedAvatar as AvatarId : 'turtle')
  const ready = name.trim().length > 0

  if (savedName.trim()) return <Navigate to="/map" replace />

  function start() {
    if (!ready) return
    setName(name.trim())
    setAvatar(avatar)
    navigate('/map')
  }

  return (
    <main className="flex min-h-dvh items-center bg-parchment">
      <FocusColumn className="md:w-[var(--w-focus-lg)]">
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-[var(--gap-section)]">
          <div>
            <h1 className="fs-h2 font-display font-semibold text-ocean-900">Who's exploring?</h1>
            <form onSubmit={(event) => { event.preventDefault(); start() }}>
              <label className="fs-body mt-[var(--sp-5)] block font-semibold" htmlFor="learner-name">Your name</label>
              <input id="learner-name"
                className="fs-option mt-[var(--sp-2)] h-[var(--h-control)] w-full rounded-[var(--radius)] border-2 border-ink bg-white/65 px-[var(--sp-4)] text-ink outline-none placeholder:text-ink-muted/60 focus:ring-4 focus:ring-gold-500/50"
                autoComplete="name" maxLength={30} autoFocus value={name} onChange={(event) => setLocalName(event.target.value)} />
              <p className="fs-sm mt-[var(--sp-2)] text-ink-muted">One island, one explorer. Pick who you will be.</p>
              <Button className="mt-[var(--sp-6)] w-full sm:w-auto" size="large" type="submit" disabled={!ready}>
                Let's go <ArrowRight aria-hidden="true" />
              </Button>
            </form>
          </div>
          <fieldset className="mt-[var(--sp-5)] md:mt-0">
            <legend className="fs-body font-semibold md:sr-only">Pick your island friend</legend>
            <div className="mt-[var(--sp-3)] grid grid-cols-2 gap-[var(--sp-3)] md:mt-0 md:grid-cols-3">
              {avatarIds.map((id) => (
                <button key={id} type="button" aria-label={`Choose ${id}`} aria-pressed={avatar === id}
                  onClick={() => setLocalAvatar(id)}
                  className={`flex aspect-square w-[clamp(5.5rem,12vw,8.25rem)] cursor-pointer items-center justify-center rounded-[var(--radius)] border-2 bg-sand/60 transition-colors ${avatar === id ? 'border-ink bg-sand shadow-[0_3px_0_#14282A]' : 'border-transparent hover:border-ink/25'}`}>
                  <CreatureAvatar id={id} />
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </FocusColumn>
    </main>
  )
}
