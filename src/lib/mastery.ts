import { items } from '../data/items'
import type { Progress } from '../types'

export interface MasteryRow {
  code: 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6'
  name: string
  pct: number
}

type ItemResultEntry = { attempt: number; correct: boolean }
type MasteryInput = Progress & { itemResults?: Record<number, Record<string, ItemResultEntry | undefined>> }

/** Percentage of a target's items answered correctly on the FIRST attempt. */
function firstAttemptPct(progress: MasteryInput, code: 'M1' | 'M2' | 'M3' | 'M4' | 'M5'): number {
  const pool = items.filter((item) => item.targets.includes(code))
  if (pool.length === 0) return 0
  const firstTry = pool.filter((item) => {
    const result = Object.values(progress.itemResults ?? {})
      .map((stageResults) => stageResults[item.id])
      .find((entry) => entry !== undefined)
    return result?.attempt === 1 && result.correct
  }).length
  return Math.round(firstTry / pool.length * 100)
}

/** The six profile mastery rows. M6 (Project) comes from the teacher's boss
 * rubric — five rows out of three stars each, so out of 15. */
export function masteryFor(progress: MasteryInput): MasteryRow[] {
  const rubricSum = Object.values(progress.boss.rubric).reduce<number>((sum, stars) => sum + stars, 0)
  return [
    { code: 'M1', name: 'Vocabulary', pct: firstAttemptPct(progress, 'M1') },
    { code: 'M2', name: 'Pattern', pct: firstAttemptPct(progress, 'M2') },
    { code: 'M3', name: 'Reason', pct: firstAttemptPct(progress, 'M3') },
    { code: 'M4', name: 'Agreement', pct: firstAttemptPct(progress, 'M4') },
    { code: 'M5', name: 'Phonics', pct: firstAttemptPct(progress, 'M5') },
    { code: 'M6', name: 'Project', pct: Math.round(rubricSum / 15 * 100) },
  ]
}
