import { Check, X } from 'lucide-react'
import { Button } from '../ui/button'
import type { FollowUp } from './gameUtils'

export function FeedbackPanel({ correct, sentence, xp, attemptsLeft, personal, followUp, followUpChoice, onFollowUp, onContinue }: {
  correct: boolean
  sentence: string
  xp: number
  attemptsLeft: boolean
  personal: boolean
  followUp: FollowUp | null
  followUpChoice: string | null
  onFollowUp: (value: string) => void
  onContinue: () => void
}) {
  return <section aria-live="polite" aria-label="Answer feedback" className={`flex h-full min-h-0 flex-col items-center justify-center gap-[var(--sp-3)] overflow-y-auto rounded-[var(--radius)] border-2 p-[var(--sp-4)] text-center ${correct ? 'border-leaf-600 bg-leaf-600/10' : 'border-danger-600 bg-danger-600/10'}`}>
    <p className={`fs-h3 flex items-center gap-2 font-display font-semibold ${correct ? 'text-leaf-600' : 'text-danger-600'}`}>
      {correct ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
      {personal ? 'Thanks for sharing!' : correct ? 'Correct!' : 'Not yet.'}
    </p>
    <p className="fs-option font-semibold leading-snug">{sentence}</p>
    <p className="xp-display fs-body font-semibold text-ocean-900">{correct ? `+${xp} XP` : '+0 XP'}</p>
    {correct && followUp && <div className="w-full">
      <p className="fs-body mb-2 font-semibold">{followUp.prompt}</p>
      <div className="grid grid-cols-2 gap-2">{followUp.options.map((option) => <button type="button" key={option} onClick={() => onFollowUp(option)} aria-pressed={followUpChoice === option}
        className={`fs-body min-h-12 cursor-pointer rounded-[var(--radius-sm)] border-2 px-2 font-semibold ${followUpChoice === option ? 'border-ocean-700 bg-sky-300/30' : 'border-ink bg-parchment'}`}>{option}</button>)}</div>
    </div>}
    <Button onClick={onContinue} className="mt-auto shrink-0">{!correct && attemptsLeft ? 'Try again' : 'Next'}</Button>
  </section>
}
