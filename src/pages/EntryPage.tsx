import { useNavigate } from 'react-router-dom'
import { FocusColumn } from '../components/layout'
import { Button } from '../components/ui/button'
import { playTap } from '../lib/sound'
import { useGameStore } from '../store/gameStore'

export function EntryPage() {
  const navigate = useNavigate()
  const saved = useGameStore((state) => state.learnerName.trim().length > 0)
  return (
    <main className="flex min-h-dvh items-center bg-parchment">
      <FocusColumn className="md:w-[var(--w-content)]">
        <div className="md:grid md:grid-cols-[45fr_55fr] md:items-center md:gap-[var(--gap-section)]">
          <img src="/img/island-mark.svg" alt="A little tropical island with a palm tree"
            className="mx-auto w-full max-w-[20rem] md:max-w-none" />
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h1 className="fs-display font-display font-semibold leading-tight tracking-[-0.02em] text-ocean-900">Snack Island</h1>
            <Button className="mt-[var(--gap-section)] w-full max-w-[22.5rem] md:mt-[var(--sp-6)] md:w-auto md:max-w-[20rem]"
              size="large" onClick={() => { playTap(); navigate(saved ? '/map' : '/start') }}>
              {saved ? 'Continue' : 'Start'}
            </Button>
          </div>
        </div>
      </FocusColumn>
    </main>
  )
}
