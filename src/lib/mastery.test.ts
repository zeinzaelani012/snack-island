import { describe, expect, it } from 'vitest'
import { masteryFor } from './mastery'
import { initialProgress } from '../store/gameStore'
import type { Progress } from '../types'

type MasteryProgress = Parameters<typeof masteryFor>[0]

function progressWith(
  itemResults: NonNullable<MasteryProgress['itemResults']>,
  rubric: Progress['boss']['rubric'],
): MasteryProgress {
  const progress = initialProgress()
  return { ...progress, itemResults, boss: { ...progress.boss, rubric } }
}

// s1-01 is an M1 item on stage 1; s6-01..s6-05 are M5 items on stage 6.
const recorded = (attempt: number, correct: boolean) => ({ attempt, correct, earned: false })

describe('mastery rows', () => {
  it('counts only first-attempt correct answers', () => {
    const progress = progressWith(
      { 1: { 's1-01': recorded(1, true) } },
      {},
    )
    const vocabulary = masteryFor(progress).find((row) => row.code === 'M1')!
    expect(vocabulary.pct).toBeGreaterThan(0)
  })

  it('ignores items that were only corrected on a later attempt', () => {
    const progress = progressWith(
      { 1: { 's1-01': recorded(2, true) } },
      {},
    )
    const vocabulary = masteryFor(progress).find((row) => row.code === 'M1')!
    expect(vocabulary.pct).toBe(0)
  })

  it('ignores first attempts that were wrong', () => {
    const progress = progressWith(
      { 1: { 's1-01': recorded(1, false) } },
      {},
    )
    const vocabulary = masteryFor(progress).find((row) => row.code === 'M1')!
    expect(vocabulary.pct).toBe(0)
  })

  it('derives Project from the boss rubric out of 15', () => {
    const full = masteryFor(progressWith({}, { courage: 3, vocabulary: 3, pattern: 3, agreeing: 3, clarity: 3 }))
    expect(full.find((row) => row.code === 'M6')!.pct).toBe(100)
    const half = masteryFor(progressWith({}, { courage: 3, vocabulary: 3, pattern: 2, agreeing: 1, clarity: 0 }))
    expect(half.find((row) => row.code === 'M6')!.pct).toBe(60)
    const empty = masteryFor(progressWith({}, {}))
    expect(empty.find((row) => row.code === 'M6')!.pct).toBe(0)
  })

  it('exposes the six named rows in order', () => {
    const rows = masteryFor(initialProgress())
    expect(rows.map((row) => row.name)).toEqual(['Vocabulary', 'Pattern', 'Reason', 'Agreement', 'Phonics', 'Project'])
  })
})
