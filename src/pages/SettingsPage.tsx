import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ContentColumn } from '../components/layout'
import { Button } from '../components/ui/button'
import { useGameStore } from '../store/gameStore'

function Toggle({ label, description, checked, onToggle }: {
  label: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return <button type="button" role="switch" aria-checked={checked} onClick={onToggle}
    className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-[var(--sp-4)] rounded-[var(--radius-sm)] border-2 border-sand bg-parchment px-[var(--sp-4)] py-[var(--sp-3)] text-left focus-visible:ring-4 focus-visible:ring-gold-500/60">
    <span>
      <span className="fs-body block font-semibold text-ink">{label}</span>
      <span className="fs-sm block text-ink-muted">{description}</span>
    </span>
    <span className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-ink transition-colors ${checked ? 'bg-leaf-600' : 'bg-sand'}`} aria-hidden="true">
      <span className={`absolute size-5 rounded-full border-2 border-ink bg-parchment transition-all ${checked ? 'left-[calc(100%-1.5rem)]' : 'left-0.5'}`} />
    </span>
  </button>
}

export function SettingsPage() {
  const settings = useGameStore((state) => state.settings)
  const setSettings = useGameStore((state) => state.setSettings)
  const resetAll = useGameStore((state) => state.resetAll)
  const [confirming, setConfirming] = useState(false)

  return (
    <main className="min-h-dvh bg-parchment">
      <header className="border-b-2 border-sand">
        <ContentColumn className="flex min-h-16 items-center gap-3 py-2">
          <Button asChild variant="quiet" size="icon" aria-label="Back to map"><Link to="/map"><ChevronLeft /></Link></Button>
          <h1 className="fs-h3 font-display font-semibold text-ocean-900">Settings</h1>
        </ContentColumn>
      </header>
      <ContentColumn className="flex flex-col gap-[var(--sp-4)] py-[var(--gap-section)]">
        <Toggle label="Sound" description="Read words and play effects aloud" checked={settings.sound}
          onToggle={() => setSettings({ sound: !settings.sound })} />
        <Toggle label="Reduce motion" description="Calmer animations everywhere" checked={settings.reduceMotion}
          onToggle={() => setSettings({ reduceMotion: !settings.reduceMotion })} />
        <Toggle label="Dyslexia-friendly text" description="Wider letter and word spacing" checked={settings.dyslexia}
          onToggle={() => setSettings({ dyslexia: !settings.dyslexia })} />

        <fieldset className="mt-[var(--sp-2)]">
          <legend className="fs-body font-semibold text-ink">Text size</legend>
          <div className="mt-[var(--sp-2)] grid grid-cols-3 gap-[var(--sp-3)]">
            {([1, 1.15, 1.3] as const).map((scale, index) => (
              <button key={scale} type="button" aria-pressed={settings.textScale === scale}
                onClick={() => setSettings({ textScale: scale })}
                className={`fs-body flex min-h-12 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border-2 font-semibold focus-visible:ring-4 focus-visible:ring-gold-500/60 ${settings.textScale === scale ? 'border-ink bg-sand text-ink shadow-[0_3px_0_#14282A]' : 'border-sand bg-parchment text-ink-muted hover:border-ink/40'}`}>
                {['Default', 'Large', 'Largest'][index]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-[var(--gap-section)] rounded-[var(--radius)] border-2 border-danger-600/50 bg-danger-600/5 p-[var(--sp-4)]">
          <h2 className="fs-body font-semibold text-danger-600">Start over</h2>
          <p className="fs-sm mt-1 text-ink-muted">Erases every star, XP point, badge and note on this device.</p>
          <Button className="mt-[var(--sp-3)]" onClick={() => setConfirming(true)}>Reset progress</Button>
        </div>

        <p className="fs-sm mt-auto pt-[var(--gap-section)] text-ink-muted">
          <Link to="/teacher" className="underline focus-visible:ring-4 focus-visible:ring-gold-500/60">Teacher</Link>
        </p>
      </ContentColumn>
      <ConfirmDialog open={confirming} title="Reset everything?"
        body="All stars, XP, badges, notes and recordings on this device will be erased. This cannot be undone."
        confirmLabel="Yes, reset" onConfirm={() => { resetAll(); setConfirming(false) }}
        onCancel={() => setConfirming(false)} />
    </main>
  )
}
