import { ArrowLeft, Eye, Search, Volume2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FoodPicture } from '../components/FoodPicture'
import { FocusColumn } from '../components/layout'
import { Button } from '../components/ui/button'
import { badgeById } from '../data/badges'
import { words, type Word } from '../data/words'
import { nextWord, shuffle } from '../lib/dash'
import { useDashClock } from '../lib/useDashClock'
import { speak } from '../lib/speech'
import { playTap } from '../lib/sound'
import { useGameStore } from '../store/gameStore'

type Mode = 'find' | 'name'
type Screen = 'choose' | 'play' | 'end'
type DashEnd = { score: number; previousBest: number; bonus: number; newBadges: string[] }

export function DashPage() {
  const [screen, setScreen] = useState<Screen>('choose')
  const [mode, setMode] = useState<Mode>('find')
  const [result, setResult] = useState<DashEnd>({ score: 0, previousBest: 0, bonus: 0, newBadges: [] })
  return (
    <main className="flex min-h-dvh flex-col bg-parchment">
      <header className="flex min-h-16 items-center gap-3 border-b-2 border-sand px-[var(--pad-page)]">
        <Button asChild variant="quiet" size="icon" aria-label="Back to map"><Link to="/map"><ArrowLeft /></Link></Button>
        <h1 className="fs-h3 font-display font-semibold text-ocean-900">Tidepool Dash</h1>
      </header>
      <FocusColumn className="flex flex-1 flex-col overflow-hidden">
        {screen === 'choose' && <div className="grid flex-1 grid-cols-1 content-center gap-[var(--gap-section)] py-[var(--sp-5)] sm:grid-cols-2">
          {(['find', 'name'] as const).map((choice) => <button key={choice} onClick={() => { playTap(); setMode(choice); setScreen('play') }}
            className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[var(--radius)] border-2 border-ink bg-sand/55 p-[var(--sp-4)] text-center shadow-[0_4px_0_#14282A] transition-transform active:translate-y-1">
            {choice === 'find' ? <Search className="size-11 text-coral-600" aria-hidden="true" /> : <Volume2 className="size-11 text-ocean-700" aria-hidden="true" />}
            <span className="fs-h3 mt-2 font-display font-semibold text-ocean-900">{choice === 'find' ? 'Find it' : 'Name it'}</span>
            <span aria-hidden="true" className="fs-sm mt-1 text-ink-muted">{choice === 'find' ? '60 seconds, beat your best' : 'Quiet practice, say it aloud'}</span>
          </button>)}
        </div>}
        {screen === 'play' && <DashGame key={mode} mode={mode} onEnd={(score, previousBest, bonus, newBadges) => { setResult({ score, previousBest, bonus, newBadges }); setScreen('end') }} />}
        {screen === 'end' && <section className="flex flex-1 flex-col items-center justify-center gap-5 py-[var(--sp-6)] text-center">
          <img src="/img/island-mark.svg" alt="" className="w-40" />
          <h2 className="fs-h2 font-display font-semibold text-ocean-900">{result.score > result.previousBest ? 'New best!' : 'Nice splash!'}</h2>
          <p className="fs-body"><strong className="score-display">{result.score}</strong> {mode === 'find' ? 'tiles cleared' : 'words practiced'}</p>
          <p className="fs-body text-ink-muted">Previous best: <strong className="score-display">{result.previousBest}</strong></p>
          {mode === 'find' && result.bonus > 0 && <p className="fs-body rounded-full bg-gold-500/30 px-[var(--sp-4)] py-2 font-semibold text-ocean-900" data-xp>+{result.bonus} bonus XP</p>}
          {result.newBadges.map((id) => {
            const badge = badgeById(id)
            if (!badge) return null
            return <p key={id} role="status" className="fs-body flex items-center gap-[var(--sp-3)] rounded-[var(--radius)] border-2 border-gold-500 bg-sand/50 px-[var(--sp-4)] py-[var(--sp-3)] font-semibold text-ocean-900">
              <img src={`/img/badges/${id}.svg`} alt="" className="size-9 shrink-0" />
              <span>New badge: {badge.name}!<span className="fs-sm block font-normal text-ink-muted">{badge.condition}</span></span>
            </p>
          })}
          <Button size="large" onClick={() => { playTap(); setScreen('play') }}>Play again</Button>
          <Button variant="secondary" onClick={() => { playTap(); setScreen('choose') }}>Choose a game</Button>
          <Button asChild variant="quiet"><Link to="/map">Back to map</Link></Button>
        </section>}
      </FocusColumn>
    </main>
  )
}

function DashGame({ mode, onEnd }: { mode: Mode; onEnd: (score: number, previousBest: number, bonus: number, newBadges: string[]) => void }) {
  const bestFind = useGameStore((state) => state.dash.bestFind)
  const bestName = useGameStore((state) => state.dash.bestName)
  const previousBest = mode === 'find' ? bestFind : bestName
  const recordDashRun = useGameStore((state) => state.recordDashRun)
  const scoreRef = useRef(0)
  const finished = useRef(false)
  const [score, setScore] = useState(0)
  const [pool, setPool] = useState(() => shuffle(words))
  const [index, setIndex] = useState(0)
  const word = pool[index]
  const choices = useMemo(() => {
    const others = shuffle(words.filter((candidate) => candidate.id !== word.id)).slice(0, 3)
    return shuffle([word, ...others])
  }, [word])
  const [flash, setFlash] = useState<{ id: string; correct: boolean } | null>(null)
  const [revealed, setRevealed] = useState(false)
  const sound = useGameStore((state) => state.settings.sound)

  function finish() {
    if (finished.current) return
    finished.current = true
    const badgesBefore = useGameStore.getState().badges.map((badge) => badge.id)
    recordDashRun(scoreRef.current, mode)
    const newBadges = useGameStore.getState().badges.filter((badge) => !badgesBefore.includes(badge.id)).map((badge) => badge.id)
    const bonus = mode === 'find' && scoreRef.current > previousBest ? (scoreRef.current - previousBest) * 5 : 0
    onEnd(scoreRef.current, previousBest, bonus, newBadges)
  }
  const clock = useDashClock(mode, finish)

  function answer(choice: Word) {
    if (flash || finished.current) return
    const correct = choice.id === word.id
    if (correct) { scoreRef.current += 1; setScore(scoreRef.current) }
    setFlash({ id: choice.id, correct })
    window.setTimeout(() => {
      setFlash(null)
      if (finished.current) return
      const next = nextWord(pool, index + 1)
      setPool(next.pool)
      setIndex(next.index)
    }, 200)
  }

  return <section className="relative flex flex-1 flex-col pb-[var(--sp-5)]">
    <button className="fs-body absolute right-[var(--sp-4)] top-[var(--sp-3)] z-10 min-h-12 cursor-pointer rounded-full px-[var(--sp-3)] py-2 font-semibold text-ink-muted hover:bg-sand" onClick={finish}>End</button>
    <svg className="h-14 w-full" viewBox="0 0 400 60" aria-hidden="true">
      <path d="M20 52A180 180 0 0 1 380 52" fill="none" stroke="#F4E7D3" strokeWidth="9" strokeLinecap="round" pathLength="100" />
      <path d="M20 52A180 180 0 0 1 380 52" fill="none" stroke={mode === 'find' ? '#12726E' : '#F5B33C'} strokeWidth="9" strokeLinecap="round" pathLength="100" strokeDasharray={`${clock.progress * 100} 100`} />
    </svg>
    {mode === 'find' ? <>
      <h2 className="fs-h2 my-[var(--sp-3)] text-center font-display font-semibold text-ocean-900">{word.en}</h2>
      <div className="grid flex-1 grid-cols-2 gap-[var(--sp-3)] md:grid-cols-4 md:gap-[var(--sp-4)]">
        {choices.map((choice) => <motion.button layout key={`${index}-${choice.id}`} onClick={() => answer(choice)} aria-label={choice.en}
          className={`relative aspect-square cursor-pointer overflow-hidden rounded-[var(--radius)] border-2 bg-sand/45 p-[var(--sp-3)] transition-colors duration-200 ${flash?.id === choice.id ? flash.correct ? 'border-leaf-600 bg-leaf-600/30' : 'border-danger-600 bg-danger-600/30' : 'border-sand hover:border-ocean-700'}`}>
          <FoodPicture word={choice.en} image={choice.image} className="block size-full" />
        </motion.button>)}
      </div>
      <p className="fs-body mt-[var(--sp-3)] text-center text-ink-muted">Tiles cleared: <strong className="score-display text-ink">{score}</strong></p>
    </> : <div className="flex flex-1 flex-col items-center">
      <div className="relative mx-auto flex w-full max-w-[26.25rem] flex-1 items-center justify-center overflow-hidden rounded-[var(--radius)] border-2 border-sand bg-sand/35 p-[var(--sp-6)]">
        <AnimatePresence mode="wait"><motion.div key={word.id} className="size-full" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
          <FoodPicture word={revealed ? word.en : 'A food picture'} image={word.image} className="block size-full" />
        </motion.div></AnimatePresence>
        {revealed && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="fs-h3 absolute bottom-[var(--sp-5)] rounded-full bg-parchment px-[var(--sp-5)] py-2 font-display font-semibold text-ocean-900 shadow-sm">{word.en}</motion.p>}
      </div>
      <p className="timer-display fs-body mt-[var(--sp-3)] text-ink-muted" aria-label={`${clock.seconds} seconds elapsed`}>{clock.seconds} seconds</p>
      {!revealed ? <Button className="mt-[var(--sp-3)] w-full" size="large" onClick={() => { setRevealed(true); if (sound) speak(word.en) }}><Eye /> Show me</Button>
        : <Button className="mt-[var(--sp-3)] w-full" size="large" onClick={() => { setRevealed(false); scoreRef.current += 1; setScore(scoreRef.current); const next = nextWord(pool, index + 1); setPool(next.pool); setIndex(next.index) }}>Next</Button>}
    </div>}
  </section>
}
