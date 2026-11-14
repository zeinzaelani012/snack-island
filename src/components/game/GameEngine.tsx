import { Check, ChevronLeft, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Item } from '../../data/items'
import { itemXP } from '../../lib/scoring'
import { playCorrect, playIncorrect, playTap } from '../../lib/sound'
import { speak } from '../../lib/speech'
import { useGameStore } from '../../store/gameStore'
import type { Difficulty } from '../../types'
import { PlayScreen } from '../layout/PlayScreen'
import { Button } from '../ui/button'
import { FeedbackPanel } from './FeedbackPanel'
import { GameControls } from './GameControls'
import { ItemRenderer, Prompt } from './ItemRenderer'
import { TimerArc } from './TimerArc'
import { completeAnswer, correctValues, followUpFor, isCorrectAnswer, itemOptions, timeForDifficulty, type GameResult, type OptionStatus } from './gameUtils'

export function GameEngine({ stageId, item, position, total, difficulty, onResult, onComplete, onBack, onBraveVoiceChange }: {
  stageId: number
  item: Item
  position: number
  total: number
  difficulty: Difficulty
  onResult?: (result: GameResult) => void
  onComplete?: () => void
  onBack?: () => void
  onBraveVoiceChange?: (eligible: boolean) => void
}) {
  const navigate = useNavigate()
  const sound = useGameStore((state) => state.settings.sound)
  const [options] = useState(() => itemOptions(item))
  const [selected, setSelected] = useState<string[]>([])
  const [attempt, setAttempt] = useState(1)
  const [feedback, setFeedback] = useState<GameResult | null>(null)
  const [removed, setRemoved] = useState<string[]>([])
  const [hintVisible, setHintVisible] = useState(false)
  const [followUpChoice, setFollowUpChoice] = useState<string | null>(null)
  const [extraTime, setExtraTime] = useState(0)
  const hintUsed = useRef(false)
  const back = useCallback(() => { if (onBack) onBack(); else navigate('/map') }, [navigate, onBack])
  const replay = useCallback(() => speak(item.audioText ?? completeAnswer(item)), [item])
  const mountAudio = item.type === 'listenPick' || item.type === 'whatsMissing'
  const soundRef = useRef(sound)
  useEffect(() => { soundRef.current = sound })

  useEffect(() => {
    if (soundRef.current && mountAudio && item.audioText) speak(item.audioText)
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel() }
  }, [item, mountAudio])

  const check = useCallback(() => {
    if (feedback || selected.length === 0) return
    const correct = isCorrectAnswer(item, selected)
    const xp = correct ? item.alwaysCorrect ? 5 : itemXP(attempt) : 0
    const result = { item, attempt, correct, xp, answer: selected }
    setFeedback(result)
    if (correct) playCorrect(); else playIncorrect()
    if (!mountAudio && sound) speak(completeAnswer(item, item.alwaysCorrect ? selected[0] : item.correct))
    onResult?.(result)
  }, [attempt, feedback, item, mountAudio, onResult, selected, sound])

  const next = useCallback(() => {
    playTap()
    if (feedback && !feedback.correct && attempt < 3) {
      setAttempt((value) => value + 1); setSelected([]); setFeedback(null); setRemoved([]); setExtraTime(0)
    } else onComplete?.()
  }, [attempt, feedback, onComplete])

  const timeout = useCallback(() => {
    if (feedback) return
    const result = { item, attempt, correct: false, xp: 0, answer: [] }
    setFeedback(result)
    playIncorrect()
    onResult?.(result)
  }, [attempt, feedback, item, onResult])

  const select = useCallback((value: string) => {
    if (feedback || removed.includes(value)) return
    setSelected((current) => item.multiSelect
      ? current.includes(value) ? current.filter((answer) => answer !== value) : current.length < 3 ? [...current, value] : current
      : [value])
  }, [feedback, item.multiSelect, removed])

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); back(); return }
      if (event.key === 'Enter') { event.preventDefault(); if (feedback) next(); else check(); return }
      const index = Number(event.key) - 1
      if (index >= 0 && index < Math.min(4, options.length)) {
        event.preventDefault()
        select(options[index])
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [back, check, feedback, next, options, select])

  const statusFor = (value: string): OptionStatus => {
    if (feedback) {
      if (feedback.correct) return selected.includes(value) ? 'correct' : 'idle'
      if (selected.includes(value) || value === item.correct) return value === item.correct ? 'correct' : 'wrong'
      return 'idle'
    }
    if (removed.includes(value)) return 'removed'
    return selected.includes(value) ? 'selected' : 'idle'
  }
  const hint = () => {
    setHintVisible(true)
    if (!hintUsed.current) { hintUsed.current = true; onBraveVoiceChange?.(false) }
  }
  const tide = () => { setExtraTime((time) => time + 5) }
  const echo = () => speak(item.audioText ?? `${item.prompt} ${item.stimulus ?? ''}`)
  const coconut = () => {
    if (item.multiSelect || item.alwaysCorrect || options.filter((option) => !correctValues(item).includes(option)).length < 2) return
    setRemoved((current) => [...current, ...options.filter((option) => !correctValues(item).includes(option) && !current.includes(option) && !selected.includes(option)).slice(0, 2)])
  }
  const duration = timeForDifficulty(difficulty)
  const coconutAvailable = !item.multiSelect && !item.alwaysCorrect && options.filter((option) => !correctValues(item).includes(option) && !removed.includes(option) && !selected.includes(option)).length >= 2
  const progressLabel = `Item ${position} of ${total}`
  const dots = Array.from({ length: total }, (_, index) => <span key={index} className={`size-2 rounded-full ${index + 1 === position ? 'bg-coral-600' : index + 1 < position ? 'bg-leaf-600' : 'bg-sand'}`} />)

  return <PlayScreen as="main" className="bg-parchment text-ink"
    header={<header className="play-header flex items-center justify-between gap-2 border-b-2 border-sand px-2 sm:px-3">
      <Button variant="quiet" size="icon" onClick={back} aria-label="Back to map" className="shrink-0 [@media(max-height:500px)]:size-9 [@media(max-height:500px)]:min-h-9"><ChevronLeft /></Button>
      <div className="flex min-w-0 flex-1 flex-col items-center">
        <p className="fs-body shrink-0 font-display font-semibold leading-tight text-ocean-900">Stage {stageId} · {position}/{total}</p>
        {total <= 8
          ? <div className="mt-[var(--sp-1)] flex justify-center gap-1.5 [@media(max-height:500px)]:hidden" aria-label={progressLabel}>{dots}</div>
          : <>
            <div className="mt-[var(--sp-1)] hidden justify-center gap-1.5 sm:flex [@media(max-height:500px)]:hidden" aria-label={progressLabel}>{dots}</div>
            <div className="mt-[var(--sp-1)] flex w-28 items-center sm:hidden [@media(max-height:500px)]:hidden" aria-label={progressLabel}>
              <span className="h-[3px] w-full rounded-full bg-sand"><span className="block h-full rounded-full bg-coral-600" style={{ width: `${Math.round(position / total * 100)}%` }} /></span>
            </div>
          </>}
      </div>
      <TimerArc key={`${item.id}-${attempt}`} difficulty={difficulty} extraTime={extraTime} running={!feedback} onTimeout={timeout} />
    </header>}
    footer={<footer className="play-footer flex items-center justify-between border-t-2 border-sand px-[var(--sp-3)] sm:px-[var(--sp-4)]">
      <GameControls stageId={stageId} hintVisible={hintVisible} onHint={hint} onEcho={echo} onCoconut={coconut} coconutAvailable={coconutAvailable} onTide={tide} tideAvailable={Boolean(duration && !feedback)} disabled={Boolean(feedback)} />
    </footer>}
  >
    <div className="play-content">
      <section aria-label="Question" className="flex min-h-0 flex-col lg:sticky lg:top-[var(--gap-section)] lg:self-stretch lg:justify-center xl:max-w-[32.5rem]">
        <Prompt item={item} replay={replay} />
      </section>
      <section data-response-zone aria-label="Response zone" className="flex min-h-0 flex-col xl:mx-auto xl:w-full xl:max-w-[35rem]">
        {feedback && item.type === 'categorySort' && <>
          <div className="flex min-h-0 flex-1 flex-col">
            <ItemRenderer item={item} options={options} selected={selected} statusFor={statusFor} onSelect={select} />
            <p role="status" className={`fs-body mt-2 flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-sm)] border-2 px-2 py-1 font-semibold ${feedback.correct ? 'border-leaf-600 text-leaf-600' : 'border-danger-600 text-danger-600'}`}>
              {feedback.correct ? <Check className="size-5 shrink-0" aria-hidden="true" /> : <X className="size-5 shrink-0" aria-hidden="true" />}
              {feedback.correct ? 'Correct!' : 'Not yet.'} {feedback.xp > 0 ? `+${feedback.xp} XP` : '+0 XP'}
            </p>
          </div>
          <Button className="mt-2 shrink-0" onClick={next}>{!feedback.correct && attempt < 3 ? 'Try again' : 'Next'}</Button>
        </>}
        {feedback && item.type !== 'categorySort' ? <FeedbackPanel correct={feedback.correct} sentence={completeAnswer(item, item.alwaysCorrect ? feedback.answer[0] : item.correct)} xp={feedback.xp} attemptsLeft={attempt < 3} personal={Boolean(item.alwaysCorrect)} followUp={feedback.correct ? followUpFor(item) : null} followUpChoice={followUpChoice} onFollowUp={setFollowUpChoice} onContinue={next} />
          : !feedback && <>
            {item.multiSelect && <p className="fs-body mb-[var(--sp-2)] shrink-0 text-ink-muted">Choose three. {selected.length}/3 selected.</p>}
            <ItemRenderer item={item} options={options} selected={selected} statusFor={statusFor} onSelect={select} />
            {hintVisible && <p role="note" className="fs-body my-[var(--sp-2)] shrink-0 rounded-[var(--radius-sm)] border-2 border-gold-500 bg-sand/30 p-2">{item.hint}</p>}
            <Button className="mt-[var(--sp-3)] shrink-0" onClick={check} disabled={selected.length === 0 || Boolean(item.multiSelect && selected.length !== 3)}>Check</Button>
          </>}
      </section>
    </div>
  </PlayScreen>
}
