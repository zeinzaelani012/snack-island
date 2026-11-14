import { ArrowLeft, Check, Mic, Square, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FocusColumn } from '../components/layout'
import { Button } from '../components/ui/button'
import { stageItems } from '../data/items'
import type { Item } from '../data/items'
import type { StageDef } from '../types'
import { isCorrectAnswer, itemOptions } from '../components/game/gameUtils'
import { setRecordingUrl } from '../lib/recordingCache'
import { playBossClear, playCorrect, playIncorrect, playTap } from '../lib/sound'
import { useGameStore } from '../store/gameStore'
import { useRecorder } from '../lib/useRecorder'

// The assessment-validity constraint that governs every boss step: the
// learner must not be helped into his sentences. Plan notes and the
// checklist are the learner's own words and are never rendered during the
// record step; at most three keyword chips are visible there.
const PLAN_PROMPTS = [
  'Introduce yourself',
  'Two or more foods you enjoy',
  'One or more foods you avoid',
  'One reason',
  'A contrast or detail',
  'A question for your tutor',
] as const

const NOTE_KEYS = ['intro', 'enjoy', 'avoid', 'reason', 'detail', 'question'] as const

const REHEARSE_ITEMS = [
  'Say who you are',
  'Name foods you enjoy',
  'Name foods you avoid',
  'Give a reason',
  'Add a contrast or detail',
  'Ask your tutor a question',
] as const

type Step = 'intro' | 'plan' | 'rehearse' | 'record' | 'respond' | 'done'

function useElapsed(active: boolean) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!active) return
    const started = performance.now()
    const id = window.setInterval(() => setSeconds(Math.floor((performance.now() - started) / 1000)), 500)
    return () => window.clearInterval(id)
  }, [active])
  return seconds
}

function formatClock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function Stars({ filled }: { filled: number }) {
  return <div className="flex gap-2" aria-label={`${filled} stars`}>
    {[1, 2, 3].map((star) => <span key={star} className={`size-12 rounded-full border-2 ${star <= filled ? 'border-gold-500 bg-gold-500' : 'border-sand bg-sand'}`} aria-hidden="true" />)}
  </div>
}

/** One gold burst, once, on the boss completion — and confetti nowhere else. */
function GoldBurst() {
  const rays = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2
    return { x: Math.cos(angle) * 90, y: Math.sin(angle) * 90 }
  })
  return <motion.div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
    {rays.map((ray, index) => <motion.span key={index} initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x: ray.x, y: ray.y, opacity: 0, scale: 0.35 }} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
      className="absolute size-2.5 rounded-full bg-gold-500" />)}
    <motion.span initial={{ opacity: 0.8, scale: 0.6 }} animate={{ opacity: 0, scale: 1.6 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }} className="absolute size-24 rounded-full border-4 border-gold-500" />
  </motion.div>
}

function RecorderPanel({ showSave = false, onSave }: { showSave?: boolean; onSave?: (audioUrl: string) => void }) {
  const { supported, phase, error, elapsed, audioUrl, start, stop, reset, limitSeconds } = useRecorder(90)
  const amber = elapsed >= 75
  return <div className="flex flex-col items-center gap-[var(--sp-4)]">
    {!supported && <p className="fs-body text-danger-600">This browser cannot record audio. The tutor can still hear you live.</p>}
    {error && <p role="alert" className="fs-body text-danger-600">{error}</p>}
    <div className="fs-h2 score-display tabular-nums font-semibold text-ocean-900" role="timer" aria-label={`${Math.floor(elapsed)} seconds recorded`}>{formatClock(elapsed)}</div>
    <div className="relative h-[var(--sp-2)] w-full max-w-[24rem] rounded-full bg-sand" aria-hidden="true">
      <div className={`h-full rounded-full ${amber ? 'bg-coral-600' : 'bg-ocean-700'}`} style={{ width: `${Math.min(100, elapsed / limitSeconds * 100)}%` }} />
      <span className="absolute top-[-4px] bottom-[-4px] w-[3px] rounded bg-gold-500" style={{ left: '83.3%' }} title="75 seconds" />
    </div>
    {phase !== 'recording' && !audioUrl && (
      <Button size="large" onClick={() => { playTap(); start() }} disabled={!supported} className="size-24 rounded-full px-0" aria-label="Record">
        <Mic className="size-10" aria-hidden="true" />
      </Button>
    )}
    {phase === 'recording' && (
      <Button size="large" variant="secondary" onClick={() => { playTap(); stop() }} className="size-24 rounded-full px-0" aria-label="Stop recording">
        <Square className="size-10 fill-danger-600 text-danger-600" aria-hidden="true" />
      </Button>
    )}
    {phase === 'done' && audioUrl && <>
      <audio controls src={audioUrl} aria-label="Your recording" className="w-full max-w-[24rem]" />
      <div className="flex gap-[var(--sp-3)]">
        <Button variant="secondary" onClick={() => { reset(); start() }}>Record again</Button>
        {showSave && onSave && <Button onClick={() => { playTap(); if (audioUrl) onSave(audioUrl) }}>Save</Button>}
      </div>
    </>}
    {phase === 'recording' && <p className="fs-sm text-ink-muted">Recording — the circle turns red after 75 seconds. Stop when you are finished.</p>}
  </div>
}

export function BossPage({ definition }: { definition: StageDef }) {
  const savedNotes = useGameStore((state) => state.boss.notes)
  const setBossNotes = useGameStore((state) => state.setBossNotes)
  const setBossKeywords = useGameStore((state) => state.setBossKeywords)
  const markBossRecorded = useGameStore((state) => state.markBossRecorded)
  const recordItemResult = useGameStore((state) => state.recordItemResult)
  const bossStars = useGameStore((state) => state.boss.stars)

  const [step, setStep] = useState<Step>('intro')
  const [notes, setNotes] = useState<Record<string, string>>(savedNotes)
  const [keywords, setKeywords] = useState<string[]>(() => {
    const saved = useGameStore.getState().boss.keywords
    return [saved[0] ?? '', saved[1] ?? '', saved[2] ?? '']
  })
  const [checked, setChecked] = useState<boolean[]>(() => REHEARSE_ITEMS.map(() => false))
  const [respondIndex, setRespondIndex] = useState(0)
  const [respondFeedback, setRespondFeedback] = useState<boolean | null>(null)
  const [respondSeconds, setRespondSeconds] = useState(5)
  const planElapsed = useElapsed(step === 'plan')
  const rehearseElapsed = useElapsed(step === 'rehearse')

  const agreeItems = useMemo(() => stageItems[9].filter((item) => item.type === 'agree').slice(0, 2), [])
  const currentItem: Item | undefined = agreeItems[respondIndex]

  const commitNotes = useCallback(() => {
    setBossNotes({ ...useGameStore.getState().boss.notes, ...notes })
  }, [notes, setBossNotes])

  function saveRecording(recordingUrl: string) {
    setRecordingUrl(recordingUrl)
    setBossKeywords(keywords.map((keyword) => keyword.trim()).filter(Boolean).slice(0, 3))
    markBossRecorded(true)
    setStep('respond')
  }

  const submitAnswer = useCallback((choice: string | null) => {
    const item = agreeItems[respondIndex]
    if (!item) return
    const correct = choice !== null && isCorrectAnswer(item, [choice])
    recordItemResult(9, item.id, 1, correct)
    if (correct) playCorrect(); else playIncorrect()
    setRespondFeedback(correct)
  }, [agreeItems, recordItemResult, respondIndex])

  useEffect(() => {
    if (step === 'done') playBossClear()
  }, [step])

  useEffect(() => {
    if (step !== 'respond' || respondFeedback !== null || !currentItem) return
    const id = window.setInterval(() => setRespondSeconds((value) => Math.max(0, Math.round((value - 0.1) * 10) / 10)), 100)
    return () => window.clearInterval(id)
  }, [step, respondFeedback, currentItem])

  useEffect(() => {
    if (step !== 'respond' || respondFeedback !== null || !currentItem) return
    if (respondSeconds <= 0) submitAnswer(null)
  }, [step, respondFeedback, currentItem, respondSeconds, submitAnswer])

  useEffect(() => {
    if (respondFeedback === null) return
    const id = window.setTimeout(() => {
      setRespondFeedback(null)
      setRespondSeconds(5)
      setRespondIndex((index) => (index + 1 >= agreeItems.length ? agreeItems.length : index + 1))
      if (respondIndex + 1 >= agreeItems.length) setStep('done')
    }, 1400)
    return () => window.clearTimeout(id)
  }, [respondFeedback, agreeItems.length, respondIndex])

  const back = <Button asChild variant="quiet" size="icon" aria-label="Back to map"><Link to="/map"><ArrowLeft /></Link></Button>
  const stepNames: Record<Step, string> = { intro: 'Snack Summit', plan: 'Plan', rehearse: 'Rehearse', record: 'Record', respond: 'Respond', done: 'Snack Summit' }

  return <main className="flex min-h-dvh flex-col bg-parchment">
    <header className="sticky top-0 z-40 flex min-h-16 items-center gap-3 border-b-2 border-sand bg-parchment/95 px-[var(--pad-page)] backdrop-blur-sm">
      {back}
      <h1 className="fs-h3 font-display font-semibold text-ocean-900">Snack Summit</h1>
      <span className="fs-sm ml-auto rounded-full bg-sand px-2.5 py-1 font-semibold text-ocean-900">{stepNames[step]}</span>
    </header>
    <FocusColumn className="flex min-h-0 flex-1 flex-col py-[var(--sp-5)]">

      {step === 'intro' && <section className="flex flex-1 flex-col items-center justify-center gap-[var(--gap-section)] text-center">
        <img src="/img/snack-summit.svg" alt="A flat rock summit with a flag pole and a view of the whole tropical island below" className="w-full max-w-[26.25rem]" />
        <p className="fs-body max-w-[var(--measure-instruction)] leading-relaxed">{definition.prologue}</p>
        <Button size="large" onClick={() => { playTap(); setStep('plan') }}>Climb to the summit</Button>
      </section>}

      {step === 'plan' && <section className="flex flex-col gap-[var(--sp-4)]">
        <div className="flex items-center justify-between">
          <h2 className="fs-h3 font-display font-semibold text-ocean-900">Plan it. Your words.</h2>
          <span className={`fs-body score-display tabular-nums font-semibold ${planElapsed >= 360 ? 'text-coral-600' : 'text-ink-muted'}`} role="timer" aria-label={`${formatClock(planElapsed)} elapsed`}>{formatClock(planElapsed)}</span>
        </div>
        {PLAN_PROMPTS.map((prompt, index) => <div key={prompt} className="rounded-[var(--radius)] border-2 border-sand bg-sand/40 p-[var(--sp-4)]">
          <label className="fs-body block font-semibold text-ocean-900" htmlFor={`boss-note-${index}`}>{prompt}</label>
          <textarea id={`boss-note-${index}`} aria-label={prompt} rows={3} maxLength={200}
            className="fs-body mt-[var(--sp-2)] w-full resize-y rounded-[var(--radius-sm)] border-2 border-ink bg-white/65 p-[var(--sp-3)] text-ink outline-none focus:ring-4 focus:ring-gold-500/50"
            value={notes[NOTE_KEYS[index]] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [NOTE_KEYS[index]]: event.target.value }))} />
        </div>)}
        <p className="fs-sm text-ink-muted">Six minutes. Type or use your keyboard's microphone button. No sentences are given — your notes are your own.</p>
        <Button size="large" onClick={() => { playTap(); commitNotes(); setStep('rehearse') }}>Go to rehearse</Button>
      </section>}

      {step === 'rehearse' && <section className="flex flex-col gap-[var(--sp-4)]">
        <div className="flex items-center justify-between">
          <h2 className="fs-h3 font-display font-semibold text-ocean-900">Rehearse. As many times as you like.</h2>
          <span className="fs-body score-display tabular-nums font-semibold text-ink-muted" role="timer" aria-label={`${formatClock(rehearseElapsed)} elapsed`}>{formatClock(rehearseElapsed)}</span>
        </div>
        <ul className="flex flex-col gap-[var(--sp-2)]">
          {REHEARSE_ITEMS.map((line, index) => <li key={line}>
            <label className={`flex min-h-12 cursor-pointer items-center gap-[var(--sp-3)] rounded-[var(--radius-sm)] border-2 px-[var(--sp-3)] py-2 ${checked[index] ? 'border-leaf-600 bg-leaf-600/10 text-ink' : 'border-sand bg-parchment text-ink'}`}>
              <input type="checkbox" className="size-5 accent-[#2F9E68]" checked={checked[index]} aria-label={line}
                onChange={(event) => setChecked((current) => current.map((value, i) => i === index ? event.target.checked : value))} />
              <span className="fs-body font-semibold">{line}</span>
              {checked[index] && <Check className="size-5 shrink-0 text-leaf-600" aria-hidden="true" />}
            </label>
          </li>)}
        </ul>
        <RecorderPanel />
        <Button size="large" onClick={() => { playTap(); setStep('record') }}>Ready to record</Button>
      </section>}

      {step === 'record' && <section className="flex flex-col gap-[var(--sp-5)]">
        <h2 className="fs-h3 font-display font-semibold text-ocean-900">Three words. Then speak.</h2>
        <div className="grid grid-cols-1 gap-[var(--sp-3)] sm:grid-cols-3">
          {[0, 1, 2].map((slot) => <div key={slot} className="rounded-[var(--radius)] border-2 border-gold-500 bg-sand/40 p-[var(--sp-3)]">
            <label className="fs-sm block font-semibold text-ink-muted" htmlFor={`boss-keyword-${slot}`}>Keyword {slot + 1}</label>
            <input id={`boss-keyword-${slot}`} aria-label={`Keyword ${slot + 1}`} maxLength={24}
              className="fs-body mt-[var(--sp-2)] h-[var(--h-control)] w-full rounded-[var(--radius-sm)] border-2 border-ink bg-parchment px-[var(--sp-3)] text-ink outline-none focus:ring-4 focus:ring-gold-500/50"
              value={keywords[slot] ?? ''} onChange={(event) => setKeywords((current) => current.map((value, i) => i === slot ? event.target.value : value))} />
          </div>)}
        </div>
        <RecorderPanel showSave onSave={saveRecording} />
        <p className="fs-sm text-ink-muted">Only these three words are with you. Everything else is yours to say.</p>
      </section>}


      {step === 'respond' && currentItem && <section className="flex flex-1 flex-col items-center justify-center gap-[var(--sp-5)] text-center">
        <p className="fs-h3 max-w-[var(--measure-instruction)] font-semibold leading-relaxed">{currentItem.stimulus}</p>
        <div className="relative h-[var(--sp-2)] w-56 rounded-full bg-sand" aria-hidden="true">
          <div className="h-full rounded-full bg-coral-600" style={{ width: `${respondSeconds / 5 * 100}%` }} />
        </div>
        {respondFeedback === null ? <div className="flex flex-col items-center gap-[var(--sp-3)]">
          {itemOptions(currentItem).map((option) => <Button key={option} variant="secondary" className="min-w-[14rem]" onClick={() => submitAnswer(option)}>{option}</Button>)}
        </div> : <p role="status" className={`fs-h3 flex items-center gap-2 font-display font-semibold ${respondFeedback ? 'text-leaf-600' : 'text-danger-600'}`}>
          {respondFeedback ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
          {respondFeedback ? 'Correct!' : 'Not yet.'}
        </p>}
        <p className="fs-sm text-ink-muted">Five seconds. No hints here.</p>
      </section>}

      {step === 'done' && <section className="relative flex flex-1 flex-col items-center justify-center gap-[var(--sp-5)] text-center">
        <GoldBurst />
        <Stars filled={bossStars} />
        <h2 className="fs-h2 font-display font-semibold text-ocean-900">Your tutor will give your stars.</h2>
        <p className="fs-body max-w-[var(--measure-instruction)] leading-relaxed">{definition.epilogue}</p>
        <Button size="large" asChild><Link to="/map">Back to the map</Link></Button>
      </section>}

    </FocusColumn>
  </main>
}
